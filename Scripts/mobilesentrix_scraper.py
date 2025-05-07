import asyncio
import aiohttp
from bs4 import BeautifulSoup
import pandas as pd
from urllib.parse import urljoin
import re
import logging
from typing import Dict, List
import platform
import os
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MobileSentrixScraper:
    def __init__(self):
        self.base_url = "https://www.mobilesentrix.com/"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }
        self.products_data = []
        self.max_pages_per_category = 2  # Limited for demo, increase for production
        self.rate_limit_delay = 1.0  # Seconds between requests

    async def fetch_page(self, session: aiohttp.ClientSession, url: str) -> str:
        """Fetch page content with rate limiting."""
        try:
            async with session.get(url, headers=self.headers) as response:
                if response.status == 200:
                    return await response.text()
                logger.error(f"Failed to fetch {url}: Status {response.status}")
                return None
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None

    async def get_category_links(self, session: aiohttp.ClientSession) -> List[str]:
        """Extract category links from the homepage."""
        homepage = await self.fetch_page(session, self.base_url)
        if not homepage:
            return []

        soup = BeautifulSoup(homepage, 'html.parser')
        category_links = []

        # Try different selectors for navigation menu
        nav_selectors = [
            "ul.nav-menu li.nav-item a",
            "nav ul li a",
            ".navigation a",
            ".menu a",
            ".categories a"
        ]

        for selector in nav_selectors:
            nav_menu = soup.select(selector)
            if nav_menu:
                logger.info(f"Found navigation menu with selector: {selector}")
                break

        # If no predefined selector works, try to find links with category in URL
        if not nav_menu:
            nav_menu = [a for a in soup.find_all('a') if 'category' in a.get('href', '').lower()]

        for link in nav_menu:
            href = link.get('href', '')
            if href and not href.startswith('#') and ('category' in href.lower() or 'product' in href.lower()):
                full_url = urljoin(self.base_url, href)
                category_links.append(full_url)

        logger.info(f"Found {len(category_links)} category links")
        return list(set(category_links))  # Remove duplicates

    async def scrape_category(self, session: aiohttp.ClientSession, category_url: str):
        """Scrape products from a category across its pages."""
        page = 1
        while page <= self.max_pages_per_category:
            # Try different pagination formats
            pagination_formats = [
                f"{category_url}?page={page}",
                f"{category_url}/page/{page}",
                f"{category_url}&page={page}"
            ]

            page_url = pagination_formats[0] if page > 1 else category_url
            logger.info(f"Scraping category page: {page_url}")

            html = await self.fetch_page(session, page_url)
            if not html:
                break

            soup = BeautifulSoup(html, 'html.parser')

            # Try different product grid selectors
            product_selectors = [
                "div.product-card",
                ".product-item",
                ".product",
                "li.product",
                ".item.product"
            ]

            products = []
            for selector in product_selectors:
                products = soup.select(selector)
                if products:
                    logger.info(f"Found products with selector: {selector}")
                    break

            if not products:
                logger.info(f"No products found in {category_url} at page {page}")
                break

            for product in products:
                try:
                    product_data = await self.parse_product(product, session)
                    if product_data:
                        self.products_data.append(product_data)
                except Exception as e:
                    logger.error(f"Error parsing product: {e}")

            page += 1
            await asyncio.sleep(self.rate_limit_delay)  # Respect rate limiting

    async def parse_product(self, product: BeautifulSoup, session: aiohttp.ClientSession) -> Dict:
        """Parse individual product data."""
        try:
            # Try different selectors for product name
            name_selectors = [
                "h2.product-title a",
                "a.product-link",
                ".product-name a",
                "h3 a",
                ".item-title a",
                ".product-item-link",
                ".product-title",
                "h2 a",
                ".item-name"
            ]

            name_elem = None
            for selector in name_selectors:
                name_elem = product.select_one(selector)
                if name_elem:
                    logger.info(f"Found product name with selector: {selector}")
                    break

            name = name_elem.get_text(strip=True) if name_elem else "N/A"
            product_url = urljoin(self.base_url, name_elem['href']) if name_elem and name_elem.get('href') else None

            # If we couldn't find a name, try to extract it from the URL
            if name == "N/A" and product_url:
                url_parts = product_url.split('/')
                if url_parts and len(url_parts) > 0:
                    last_part = url_parts[-1]
                    if last_part:
                        name = last_part.replace('-', ' ').title()

            # Try different selectors for price
            price_selectors = [
                "span.price--main",
                "span.price",
                ".product-price",
                ".price-box",
                ".amount",
                ".price-container",
                ".special-price",
                "[data-price-type=finalPrice]"
            ]

            price_elem = None
            for selector in price_selectors:
                price_elem = product.select_one(selector)
                if price_elem:
                    logger.info(f"Found price with selector: {selector}")
                    break

            price = price_elem.get_text(strip=True) if price_elem else "N/A"

            # Clean up price - extract only numbers and decimal point
            if price != "N/A":
                # First, try to find a pattern like $XX.XX
                price_match = re.search(r'\$?\s*(\d+\.?\d*)', price)
                if price_match:
                    price = price_match.group(1)
                else:
                    # If no match, just remove all non-numeric characters except decimal point
                    price = re.sub(r'[^\d.]', '', price)

                # Ensure we have a valid number
                try:
                    price = float(price)
                except ValueError:
                    price = None
            else:
                price = None

            # Try different selectors for image
            img_selectors = [
                "img.product-img",
                "img.primary-image",
                ".product-image img",
                ".product-photo img",
                "img.main-image",
                ".product-item-photo img",
                ".product img",
                "img[data-role=product-image]",
                "img"
            ]

            img_elem = None
            for selector in img_selectors:
                img_elem = product.select_one(selector)
                if img_elem:
                    logger.info(f"Found image with selector: {selector}")
                    break

            # Try different image attributes (src, data-src, etc.)
            img_url = None
            if img_elem:
                for attr in ['src', 'data-src', 'data-original', 'data-lazy-src']:
                    if img_elem.get(attr):
                        img_url = urljoin(self.base_url, img_elem[attr])
                        break

            # If still no image, try to find it in the product page
            if not img_url and product_url:
                try:
                    product_html = await self.fetch_page(session, product_url)
                    if product_html:
                        product_soup = BeautifulSoup(product_html, 'html.parser')
                        for selector in img_selectors:
                            img_elem = product_soup.select_one(selector)
                            if img_elem:
                                for attr in ['src', 'data-src', 'data-original', 'data-lazy-src']:
                                    if img_elem.get(attr):
                                        img_url = urljoin(self.base_url, img_elem[attr])
                                        break
                                if img_url:
                                    break
                except Exception as e:
                    logger.error(f"Error fetching product page for image: {e}")

            # Extract category from URL or breadcrumbs
            category = "Unknown"
            if product_url:
                url_parts = product_url.split('/')
                for part in url_parts:
                    if part and part not in ['www.mobilesentrix.com', 'https:', '', 'product']:
                        category = part.replace('-', ' ').title()
                        break

            # Fetch product page for specs
            specs = "N/A"
            if product_url:
                product_html = await self.fetch_page(session, product_url)
                if product_html:
                    product_soup = BeautifulSoup(product_html, 'html.parser')

                    # Try different selectors for product description/specs
                    specs_selectors = [
                        "div.product-description",
                        "div.specs-table",
                        ".product-details",
                        ".product-info",
                        "#product-details"
                    ]

                    specs_elem = None
                    for selector in specs_selectors:
                        specs_elem = product_soup.select_one(selector)
                        if specs_elem:
                            break

                    specs = specs_elem.get_text(strip=True) if specs_elem else "N/A"

            # Create product data dictionary
            product_data = {
                "name": name,
                "price": price,  # Already converted to float in the price extraction section
                "image_url": img_url,
                "specifications": specs,
                "product_url": product_url,
                "category": category
            }

            # Log the extracted product data
            logger.info(f"Extracted product: {name}, Price: {price}, Category: {category}")

            return product_data
        except Exception as e:
            logger.error(f"Error parsing product: {e}")
            return None

    async def save_to_csv(self, filename: str = "mobilesentrix_products.csv"):
        """Save scraped data to CSV and other formats."""
        if not self.products_data:
            logger.warning("No data to save")
            return None

        # Create a directory for output if it doesn't exist
        os.makedirs('output', exist_ok=True)
        filepath = os.path.join('output', filename)

        # Clean up the data - ensure all required fields are present
        cleaned_data = []
        for product in self.products_data:
            if product and isinstance(product, dict):
                # Ensure all required fields have values
                cleaned_product = {
                    "name": product.get("name", "Unknown Product"),
                    "price": product.get("price"),
                    "image_url": product.get("image_url", ""),
                    "specifications": product.get("specifications", "N/A"),
                    "product_url": product.get("product_url", ""),
                    "category": product.get("category", "Unknown")
                }
                cleaned_data.append(cleaned_product)

        # Create DataFrame and save to CSV
        df = pd.DataFrame(cleaned_data)
        df.to_csv(filepath, index=False, encoding='utf-8')
        logger.info(f"Saved {len(cleaned_data)} products to {filepath}")

        # Create a more organized version with categories
        if 'category' in df.columns:
            categories = df['category'].unique()
            for category in categories:
                if pd.notna(category):  # Skip NaN categories
                    category_df = df[df['category'] == category]
                    safe_category = str(category).lower().replace(' ', '_')
                    category_filename = f"mobilesentrix_{safe_category}.csv"
                    category_filepath = os.path.join('output', category_filename)
                    category_df.to_csv(category_filepath, index=False, encoding='utf-8')
                    logger.info(f"Saved {len(category_df)} {category} products to {category_filepath}")

        # Save as plain text file for easier viewing
        text_filepath = os.path.join('output', 'mobilesentrix_products.txt')
        with open(text_filepath, 'w', encoding='utf-8') as f:
            f.write("Name\tPrice\tURL\tImage URL\n")
            for product in cleaned_data:
                name = product.get("name", "")
                price = product.get("price", "")
                url = product.get("product_url", "")
                image_url = product.get("image_url", "")
                f.write(f"{name}\t{price}\t{url}\t{image_url}\n")
        logger.info(f"Saved products to text file: {text_filepath}")

        # Save as JSON for easier programmatic access
        json_filepath = os.path.join('output', 'mobilesentrix_products.json')
        import json
        with open(json_filepath, 'w', encoding='utf-8') as f:
            json.dump(cleaned_data, f, indent=2)
        logger.info(f"Saved products to JSON file: {json_filepath}")

        # Generate HTML report
        html_filepath = os.path.join('output', 'mobilesentrix_report.html')
        with open(html_filepath, 'w', encoding='utf-8') as f:
            f.write(self._generate_html_report(cleaned_data))
        logger.info(f"Generated HTML report: {html_filepath}")

        return filepath

    def _generate_html_report(self, products):
        """Generate an HTML report of the scraped products."""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MobileSentrix Scraper Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; }}
                .container {{ max-width: 1200px; margin: 0 auto; }}
                h1, h2 {{ color: #333; }}
                .stats {{ background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
                .product-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }}
                .product-card {{ border: 1px solid #ddd; border-radius: 5px; padding: 15px; }}
                .product-image {{ width: 100%; height: 200px; object-fit: contain; }}
                .product-title {{ font-weight: bold; margin: 10px 0 5px; }}
                .product-price {{ color: #e63946; font-weight: bold; }}
                .product-category {{ color: #666; font-size: 0.9em; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>MobileSentrix Scraper Report</h1>

                <div class="stats">
                    <p><strong>Total Products:</strong> {len(products)}</p>
                    <p><strong>Scrape Date:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </div>

                <h2>Products</h2>
                <div class="product-grid">
        """

        # Add product cards
        for product in products:
            name = product.get("name", "Unknown Product")
            price = product.get("price", "N/A")
            image_url = product.get("image_url", "")
            product_url = product.get("product_url", "")
            category = product.get("category", "Unknown")

            # Format price nicely
            price_display = f"${price:.2f}" if isinstance(price, (int, float)) else price

            html += f"""
                    <div class="product-card">
                        <img src="{image_url}" class="product-image" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687a4b89fe%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687a4b89fe%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2274.4296875%22%20y%3D%22104.5%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';">
                        <div class="product-title">{name}</div>
                        <div class="product-price">{price_display}</div>
                        <div class="product-category">{category}</div>
                        <a href="{product_url}" target="_blank">View Product</a>
                    </div>
            """

        html += """
                </div>
            </div>
        </body>
        </html>
        """

        return html

    async def run(self):
        """Main scraping loop."""
        async with aiohttp.ClientSession() as session:
            category_links = await self.get_category_links(session)
            if not category_links:
                logger.error("No category links found. Exiting.")
                return

            for category_url in category_links:
                await self.scrape_category(session, category_url)
                await asyncio.sleep(self.rate_limit_delay)  # Delay between categories

            csv_file = await self.save_to_csv()
            return csv_file

async def main():
    logger.info("Starting MobileSentrix scraper...")
    scraper = MobileSentrixScraper()
    csv_file = await scraper.run()
    if csv_file:
        logger.info(f"Scraping completed. Data saved to {csv_file}")
    else:
        logger.error("Scraping failed or no data was collected.")

if platform.system() == "Emscripten":
    asyncio.ensure_future(main())
else:
    if __name__ == "__main__":
        asyncio.run(main())
