"""
Example scraper using SQLAlchemy.
"""
import asyncio
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from scrapers.base_scraper import BaseScraper
from scrapers.sqlalchemy_repository import SQLAlchemyRepository

class SQLAlchemyScraperExample(BaseScraper):
    """Example scraper using SQLAlchemy."""
    
    def __init__(self):
        """Initialize the scraper."""
        super().__init__('sqlalchemy_example')
        self.base_url = 'https://www.example.com'
    
    async def get_category_links(self, session):
        """Get category links to scrape."""
        self.logger.info("Getting category links")
        
        # Fetch the homepage
        html = await self.fetch_with_retry(session, self.base_url)
        if not html:
            return []
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # Find category links (this is an example, adjust selectors as needed)
        category_links = []
        nav_elements = soup.select('nav.category-navigation a')
        
        for link in nav_elements:
            href = link.get('href')
            if href and '/category/' in href:
                full_url = urljoin(self.base_url, href)
                category_links.append(full_url)
                self.logger.debug(f"Found category link: {full_url}")
        
        return category_links
    
    async def scrape_category(self, session, category_url):
        """Scrape a category page."""
        self.logger.info(f"Scraping category: {category_url}")
        
        # Extract category name from URL
        category_match = re.search(r'/category/([^/]+)', category_url)
        category_name = category_match.group(1).replace('-', ' ').title() if category_match else None
        
        # Fetch the category page
        html = await self.fetch_with_retry(session, category_url)
        if not html:
            return
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # Find product links (this is an example, adjust selectors as needed)
        product_links = []
        product_elements = soup.select('div.product-item a.product-link')
        
        for link in product_elements:
            href = link.get('href')
            if href and '/product/' in href:
                full_url = urljoin(self.base_url, href)
                product_links.append(full_url)
                self.logger.debug(f"Found product link: {full_url}")
        
        # Scrape each product
        for product_url in product_links[:5]:  # Limit to 5 products for testing
            product_data = await self.scrape_product(session, product_url)
            if product_data:
                # Add category to product data
                if category_name:
                    product_data['category'] = category_name
                
                self.products_data.append(product_data)
                await asyncio.sleep(self.rate_limit_delay)
    
    async def scrape_product(self, session, product_url):
        """Scrape a product page."""
        self.logger.info(f"Scraping product: {product_url}")
        
        # Fetch the product page
        html = await self.fetch_with_retry(session, product_url)
        if not html:
            return None
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # Extract product data (this is an example, adjust selectors as needed)
        try:
            # Basic product info
            product_name = soup.select_one('h1.product-title').text.strip()
            price_element = soup.select_one('span.price')
            price = price_element.text.strip().replace('$', '').replace(',', '') if price_element else '0'
            
            # Extract brand
            brand_element = soup.select_one('span.brand')
            brand = brand_element.text.strip() if brand_element else None
            
            # Extract image URL
            image_element = soup.select_one('img.product-image')
            image_url = image_element.get('src') if image_element else None
            if image_url:
                image_url = urljoin(self.base_url, image_url)
            
            # Extract description
            description_element = soup.select_one('div.product-description')
            description = description_element.text.strip() if description_element else None
            
            # Extract specifications
            specs = {}
            specs_table = soup.select_one('table.specifications')
            if specs_table:
                for row in specs_table.select('tr'):
                    cells = row.select('td')
                    if len(cells) >= 2:
                        key = cells[0].text.strip().lower().replace(' ', '_')
                        value = cells[1].text.strip()
                        specs[key] = value
            
            # Create product data dictionary
            product_data = {
                'name': product_name,
                'price': price,
                'brand': brand,
                'image_url': image_url,
                'description': description,
                'specifications': {
                    'display': specs.get('display', ''),
                    'processor': specs.get('processor', ''),
                    'memory': specs.get('memory', ''),
                    'storage': specs.get('storage', ''),
                    'camera': specs.get('camera', ''),
                    'battery': specs.get('battery', ''),
                    'connectivity': specs.get('connectivity', ''),
                    'operating_system': specs.get('operating_system', '')
                }
            }
            
            self.logger.debug(f"Extracted product data: {product_name}")
            return product_data
            
        except Exception as e:
            self.logger.error(f"Error scraping product {product_url}: {e}")
            return None
    
    async def save_to_database(self):
        """Save scraped data to the database using SQLAlchemy."""
        if not self.products_data:
            self.logger.warning("No data to save to database")
            return
        
        self.logger.info(f"Saving {len(self.products_data)} products to database using SQLAlchemy")
        result = SQLAlchemyRepository.batch_save_products(self.products_data)
        
        self.logger.info(f"Database save results: {result}")
        return result
