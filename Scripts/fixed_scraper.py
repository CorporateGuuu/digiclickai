#!/usr/bin/env python3
"""
Fixed MobileSentrix Scraper
---------------------------
This scraper is designed to work with minimal dependencies and handle various limitations.
It uses only standard library modules and provides multiple fallback mechanisms.
"""

import urllib.request
import urllib.error
import re
import os
import json
import time
import random
import ssl
import sys
from datetime import datetime
from http.cookiejar import CookieJar

# Configuration
TARGET_URL = "https://www.mobilesentrix.com/"
OUTPUT_DIR = "output"
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0"
]

def create_output_dir():
    """Create output directory if it doesn't exist."""
    try:
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        print(f"Output directory ready: {OUTPUT_DIR}")
        return True
    except Exception as e:
        print(f"Error creating output directory: {e}")
        return False

def get_random_user_agent():
    """Return a random user agent from the list."""
    return random.choice(USER_AGENTS)

def fetch_url(url, max_retries=3, delay=2):
    """
    Fetch URL content with retry mechanism and various fallbacks.
    Returns HTML content as string or None if all attempts fail.
    """
    print(f"Fetching {url}...")
    
    # Create a cookie jar to handle cookies
    cookie_jar = CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))
    
    # Try with different approaches
    for attempt in range(max_retries):
        try:
            # Create request with headers
            headers = {
                'User-Agent': get_random_user_agent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0'
            }
            
            # Create request
            req = urllib.request.Request(url, headers=headers)
            
            # Try with SSL verification
            try:
                response = opener.open(req, timeout=30)
            except (ssl.SSLError, urllib.error.URLError):
                print("SSL verification failed, trying without verification...")
                # Try without SSL verification
                context = ssl.create_default_context()
                context.check_hostname = False
                context.verify_mode = ssl.CERT_NONE
                response = opener.open(req, timeout=30, context=context)
            
            # Read and decode content
            html = response.read().decode('utf-8', errors='replace')
            
            if html and len(html) > 500:  # Ensure we got meaningful content
                print(f"Successfully fetched {url} (Attempt {attempt+1}/{max_retries})")
                return html
            else:
                print(f"Received empty or too small response (Attempt {attempt+1}/{max_retries})")
        
        except Exception as e:
            print(f"Error fetching {url} (Attempt {attempt+1}/{max_retries}): {e}")
        
        # Wait before retrying
        if attempt < max_retries - 1:
            sleep_time = delay * (attempt + 1)  # Progressive delay
            print(f"Retrying in {sleep_time} seconds...")
            time.sleep(sleep_time)
    
    print(f"Failed to fetch {url} after {max_retries} attempts")
    return None

def extract_title(html):
    """Extract page title."""
    title_match = re.search('<title>(.*?)</title>', html, re.IGNORECASE)
    return title_match.group(1) if title_match else "Unknown Title"

def extract_description(html):
    """Extract meta description."""
    desc_match = re.search('<meta\\s+name=["\']description["\']\\s+content=["\']([^"\'>]*)["\']', html, re.IGNORECASE)
    if not desc_match:
        desc_match = re.search('<meta\\s+content=["\']([^"\'>]*)["\']\\s+name=["\']description["\']', html, re.IGNORECASE)
    return desc_match.group(1) if desc_match else "No description available"

def extract_categories(html, base_url):
    """Extract category links."""
    categories = []
    
    # Try different patterns for category links
    patterns = [
        '<a\\s+href=["\']([^"\']*category[^"\']*)["\'][^>]*>(.*?)</a>',
        '<a\\s+href=["\']([^"\']*)["\'][^>]*>\\s*<span[^>]*>\\s*(.*?)\\s*</span>\\s*</a>',
        '<li[^>]*>\\s*<a\\s+href=["\']([^"\']*)["\'][^>]*>(.*?)</a>\\s*</li>'
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, html, re.IGNORECASE | re.DOTALL)
        for url_part, name in matches:
            # Clean up the name (remove HTML tags)
            clean_name = re.sub('<[^<]+?>', '', name).strip()
            
            # Skip empty names or very long strings
            if not clean_name or len(clean_name) > 50:
                continue
                
            # Skip non-category links
            if 'login' in url_part.lower() or 'account' in url_part.lower() or 'cart' in url_part.lower():
                continue
                
            # Make URL absolute
            if not url_part.startswith('http'):
                url_part = base_url.rstrip('/') + ('/' if not url_part.startswith('/') else '') + url_part.lstrip('/')
                
            categories.append({
                "name": clean_name,
                "url": url_part
            })
    
    # Remove duplicates while preserving order
    unique_categories = []
    seen_urls = set()
    for cat in categories:
        if cat['url'] not in seen_urls:
            unique_categories.append(cat)
            seen_urls.add(cat['url'])
            
    return unique_categories

def extract_products(html, base_url):
    """Extract product information."""
    products = []
    
    # Try different patterns for product blocks
    product_block_patterns = [
        # Pattern 1: div with product class
        '<div\\s+class=["\'](?:product|item)[^"\']*["\'][^>]*>(.*?)</div>\\s*(?:</div>|<div)',
        # Pattern 2: li with product class
        '<li[^>]*class=["\'][^"\']*product[^"\']*["\'][^>]*>(.*?)</li>',
        # Pattern 3: article with product
        '<article[^>]*>(.*?)</article>'
    ]
    
    for block_pattern in product_block_patterns:
        product_blocks = re.findall(block_pattern, html, re.DOTALL | re.IGNORECASE)
        
        if not product_blocks:
            continue
            
        print(f"Found {len(product_blocks)} potential product blocks")
        
        for block in product_blocks[:30]:  # Limit to 30 products for performance
            try:
                # Extract product URL and name using multiple patterns
                # Pattern 1: Link with image alt text
                url_match = re.search('<a\\s+href=["\']([^"\']+)["\'][^>]*>.*?<img[^>]*alt=["\']([^"\']+)["\']', block, re.DOTALL | re.IGNORECASE)
                
                if not url_match:
                    # Pattern 2: Link with span text
                    url_match = re.search('<a\\s+href=["\']([^"\']+)["\'][^>]*>.*?<span[^>]*>([^<]+)</span>', block, re.DOTALL | re.IGNORECASE)
                
                if not url_match:
                    # Pattern 3: Link with h2/h3/h4 text
                    url_match = re.search('<a\\s+href=["\']([^"\']+)["\'][^>]*>.*?<h[2-4][^>]*>([^<]+)</h[2-4]>', block, re.DOTALL | re.IGNORECASE)
                
                if not url_match:
                    # Pattern 4: Link with any text
                    url_match = re.search('<a\\s+href=["\']([^"\']+)["\'][^>]*>([^<]+)</a>', block, re.DOTALL | re.IGNORECASE)
                
                if not url_match:
                    # Pattern 5: Just find a link and extract product name from URL
                    url_match = re.search('<a\\s+href=["\']([^"\']+)["\']', block, re.DOTALL | re.IGNORECASE)
                    if url_match:
                        product_url = url_match.group(1)
                        # Try to extract name from URL
                        url_parts = product_url.split('/')
                        if url_parts and len(url_parts) > 0:
                            product_name = url_parts[-1].replace('-', ' ').title()
                        else:
                            product_name = "Unknown Product"
                    else:
                        continue
                else:
                    product_url = url_match.group(1)
                    product_name = url_match.group(2) if len(url_match.groups()) > 1 else "Unknown Product"
                
                # Clean up name
                product_name = re.sub('<[^<]+?>', '', product_name).strip()
                
                # Skip if name is too short or looks like navigation
                if len(product_name) < 5 or product_name.lower() in ['home', 'next', 'previous', 'category']:
                    continue
                
                # Extract image URL
                img_match = re.search('<img[^>]*src=["\']([^"\']+)["\']', block, re.DOTALL | re.IGNORECASE)
                image_url = img_match.group(1) if img_match else ""
                
                # Extract price
                price_match = re.search('<span[^>]*class=["\'][^"\']*(?:price|amount)[^"\']*["\'][^>]*>(.*?)</span>', block, re.DOTALL | re.IGNORECASE)
                if not price_match:
                    # Try another pattern for price
                    price_match = re.search('\\$([\\d,\\.]+)', block)
                
                price = price_match.group(1) if price_match else "N/A"
                
                # Clean up price (remove HTML tags and keep only digits, dots, and commas)
                price = re.sub('<[^<]+?>', '', price).strip()
                price_clean = re.search('[$€£]?\\s*(\\d[\\d,.]*)', price)
                price = price_clean.group(1) if price_clean else price
                
                # Make URLs absolute
                if not product_url.startswith('http'):
                    product_url = base_url.rstrip('/') + ('/' if not product_url.startswith('/') else '') + product_url.lstrip('/')
                
                if image_url and not image_url.startswith('http'):
                    image_url = base_url.rstrip('/') + ('/' if not image_url.startswith('/') else '') + image_url.lstrip('/')
                
                # Add to products list
                products.append({
                    "name": product_name,
                    "url": product_url,
                    "image": image_url,
                    "price": price
                })
                
                print(f"Found product: {product_name}, Price: {price}")
                
            except Exception as e:
                print(f"Error parsing product block: {e}")
                continue
        
        # If we found products with this pattern, no need to try others
        if products:
            break
    
    # Remove duplicates while preserving order
    unique_products = []
    seen_urls = set()
    for product in products:
        if product['url'] not in seen_urls:
            unique_products.append(product)
            seen_urls.add(product['url'])
    
    return unique_products

def extract_images(html, base_url):
    """Extract all image URLs."""
    image_urls = re.findall('src=["\']([^"\'>]*\\.(?:jpg|jpeg|png|gif|webp))["\']', html, re.IGNORECASE)
    
    # Make URLs absolute and remove duplicates
    unique_images = []
    seen_urls = set()
    
    for img_url in image_urls:
        if not img_url.startswith('http'):
            img_url = base_url.rstrip('/') + ('/' if not img_url.startswith('/') else '') + img_url.lstrip('/')
        
        if img_url not in seen_urls:
            unique_images.append(img_url)
            seen_urls.add(img_url)
    
    return unique_images

def generate_html_report(data):
    """Generate HTML report from scraped data."""
    html_report = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MobileSentrix Scraper Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; color: #333; }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        h1, h2 {{ color: #2c3e50; }}
        h1 {{ border-bottom: 2px solid #eee; padding-bottom: 10px; }}
        .stats {{ background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }}
        .product-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }}
        .product-card {{ border: 1px solid #ddd; border-radius: 5px; padding: 15px; transition: transform 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
        .product-card:hover {{ transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }}
        .product-image {{ width: 100%; height: 200px; object-fit: contain; border-radius: 3px; }}
        .product-title {{ font-weight: bold; margin: 10px 0 5px; font-size: 1.1em; }}
        .product-price {{ color: #e63946; font-weight: bold; }}
        .category-list {{ list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 10px; }}
        .category-list li {{ margin-bottom: 5px; background: #eee; padding: 5px 10px; border-radius: 15px; }}
        .category-list li a {{ text-decoration: none; color: #333; }}
        .category-list li a:hover {{ text-decoration: underline; }}
        .timestamp {{ color: #666; font-size: 0.9em; margin-top: 30px; text-align: center; }}
        .btn {{ display: inline-block; padding: 8px 15px; background: #3498db; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px; }}
        .btn:hover {{ background: #2980b9; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>MobileSentrix Scraper Report</h1>
        
        <div class="stats">
            <p><strong>Website:</strong> {data['title']}</p>
            <p><strong>Description:</strong> {data['description']}</p>
            <p><strong>Scrape Date:</strong> {data['scrape_date']}</p>
            <p><strong>Categories Found:</strong> {len(data['categories'])}</p>
            <p><strong>Products Found:</strong> {len(data['products'])}</p>
            <p><strong>Images Found:</strong> {len(data['images'])}</p>
        </div>
        
        <h2>Categories</h2>
        <ul class="category-list">
            {"".join(f'<li><a href="{cat["url"]}" target="_blank">{cat["name"]}</a></li>' for cat in data['categories'][:20])}
        </ul>
        
        <h2>Products</h2>
        <div class="product-grid">
            {"".join(f'''
            <div class="product-card">
                <img src="{product['image']}" alt="{product['name']}" class="product-image" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687a4b89fe%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687a4b89fe%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2274.4296875%22%20y%3D%22104.5%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';">
                <div class="product-title">{product['name']}</div>
                <div class="product-price">{product['price']}</div>
                <a href="{product['url']}" class="btn" target="_blank">View Product</a>
            </div>
            ''' for product in data['products'])}
        </div>
        
        <div class="timestamp">
            Report generated on {data['scrape_date']}
        </div>
    </div>
</body>
</html>
    """
    
    return html_report

def save_data_files(data):
    """Save scraped data to various file formats."""
    try:
        # Save as JSON
        json_path = os.path.join(OUTPUT_DIR, 'mobilesentrix_data.json')
        with open(json_path, 'w', encoding='utf-8') as file:
            json.dump(data, file, indent=4)
        print(f"Saved JSON data to {json_path}")
        
        # Save image URLs to a text file
        img_path = os.path.join(OUTPUT_DIR, 'mobilesentrix_images.txt')
        with open(img_path, 'w', encoding='utf-8') as file:
            for img_url in data['images']:
                file.write(img_url + '\n')
        print(f"Saved image URLs to {img_path}")
        
        # Save HTML report
        html_report = generate_html_report(data)
        report_path = os.path.join(OUTPUT_DIR, 'mobilesentrix_report.html')
        with open(report_path, 'w', encoding='utf-8') as file:
            file.write(html_report)
        print(f"Saved HTML report to {report_path}")
        
        # Save categories to a text file
        cat_path = os.path.join(OUTPUT_DIR, 'mobilesentrix_categories.txt')
        with open(cat_path, 'w', encoding='utf-8') as file:
            for cat in data['categories']:
                file.write(f"{cat['name']}: {cat['url']}\n")
        print(f"Saved categories to {cat_path}")
        
        # Save products to a CSV-like text file
        prod_path = os.path.join(OUTPUT_DIR, 'mobilesentrix_products.txt')
        with open(prod_path, 'w', encoding='utf-8') as file:
            file.write("Name\tPrice\tURL\tImage URL\n")
            for product in data['products']:
                file.write(f"{product['name']}\t{product['price']}\t{product['url']}\t{product['image']}\n")
        print(f"Saved products to {prod_path}")
        
        return True
    except Exception as e:
        print(f"Error saving data files: {e}")
        return False

def main():
    """Main function to run the scraper."""
    print("=" * 60)
    print("FIXED MOBILESENTRIX SCRAPER")
    print("=" * 60)
    print(f"Target URL: {TARGET_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)
    
    # Create output directory
    if not create_output_dir():
        return
    
    # Fetch website content
    html = fetch_url(TARGET_URL)
    if not html:
        print("Failed to fetch website content. Exiting.")
        return
    
    print("\nExtracting data...")
    
    # Extract basic information
    title = extract_title(html)
    description = extract_description(html)
    
    # Extract categories, products, and images
    categories = extract_categories(html, TARGET_URL)
    products = extract_products(html, TARGET_URL)
    images = extract_images(html, TARGET_URL)
    
    # Prepare data structure
    data = {
        "url": TARGET_URL,
        "title": title,
        "description": description,
        "scrape_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "categories": categories,
        "products": products,
        "images": images[:100]  # Limit to first 100 images
    }
    
    # Print summary
    print("\n" + "=" * 60)
    print("SCRAPING RESULTS")
    print("=" * 60)
    print(f"Website Title: {title}")
    print(f"Categories Found: {len(categories)}")
    print(f"Products Found: {len(products)}")
    print(f"Images Found: {len(images)}")
    
    # Save data to files
    print("\nSaving data files...")
    save_data_files(data)
    
    print("\n" + "=" * 60)
    print("SCRAPING COMPLETED SUCCESSFULLY")
    print("=" * 60)
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Output directory: {os.path.abspath(OUTPUT_DIR)}")
    print("\nTo view the report, open:")
    print(f"{os.path.abspath(os.path.join(OUTPUT_DIR, 'mobilesentrix_report.html'))}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nScraping interrupted by user.")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
