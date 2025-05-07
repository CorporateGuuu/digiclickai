#!/usr/bin/env python3
"""
Final MobileSentrix Scraper
---------------------------
This scraper is designed to correctly extract product names and prices from the MobileSentrix website.
It uses a more targeted approach to find actual products rather than navigation elements.
"""

import urllib.request
import re
import os
import json
import ssl
from datetime import datetime

# Configuration
TARGET_URL = "https://www.mobilesentrix.com/"
OUTPUT_DIR = "output"

def create_output_dir():
    """Create output directory if it doesn't exist."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Output directory ready: {OUTPUT_DIR}")
    return True

def fetch_url(url):
    """Fetch URL content with SSL verification disabled."""
    print(f"Fetching {url}...")
    
    # Create request with headers
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    
    # Create request
    req = urllib.request.Request(url, headers=headers)
    
    # Disable SSL verification
    context = ssl.create_default_context()
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE
    
    # Fetch content
    try:
        response = urllib.request.urlopen(req, context=context, timeout=30)
        html = response.read().decode('utf-8', errors='replace')
        print(f"Successfully fetched {url}")
        return html
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def extract_products_from_homepage(html):
    """Extract featured products from the homepage."""
    products = []
    
    # Look for product sections
    product_sections = re.findall(r'<div[^>]*class=["\'][^"\']*products-grid[^"\']*["\'][^>]*>(.*?)</div>\s*</div>', html, re.DOTALL | re.IGNORECASE)
    
    if not product_sections:
        print("No product sections found on homepage")
        return products
    
    print(f"Found {len(product_sections)} product sections")
    
    # Extract product items from each section
    for section in product_sections:
        product_items = re.findall(r'<li[^>]*class=["\'][^"\']*item[^"\']*["\'][^>]*>(.*?)</li>', section, re.DOTALL | re.IGNORECASE)
        
        print(f"Found {len(product_items)} product items in section")
        
        for item in product_items:
            try:
                # Extract product name
                name_match = re.search(r'<h2[^>]*class=["\']product-name["\'][^>]*>.*?<a[^>]*>(.*?)</a>', item, re.DOTALL | re.IGNORECASE)
                product_name = name_match.group(1).strip() if name_match else "Unknown Product"
                product_name = re.sub(r'<[^>]*>', '', product_name).strip()
                
                # Extract product URL
                url_match = re.search(r'<h2[^>]*class=["\']product-name["\'][^>]*>.*?<a[^>]*href=["\']([^"\']+)["\']', item, re.DOTALL | re.IGNORECASE)
                product_url = url_match.group(1) if url_match else ""
                
                # Extract price
                price_match = re.search(r'<span[^>]*class=["\']price["\'][^>]*>(.*?)</span>', item, re.DOTALL | re.IGNORECASE)
                price = price_match.group(1) if price_match else "N/A"
                price = re.sub(r'<[^>]*>', '', price).strip()
                
                # Clean up price - extract numeric value
                price_clean = re.search(r'[$€£]?\s*([\d,.]+)', price)
                price = price_clean.group(1) if price_clean else price
                
                # Extract image URL
                img_match = re.search(r'<img[^>]*src=["\']([^"\']+)["\']', item, re.DOTALL | re.IGNORECASE)
                image_url = img_match.group(1) if img_match else ""
                
                # Make URLs absolute
                if product_url and not product_url.startswith('http'):
                    product_url = TARGET_URL.rstrip('/') + ('/' if not product_url.startswith('/') else '') + product_url.lstrip('/')
                
                if image_url and not image_url.startswith('http'):
                    image_url = TARGET_URL.rstrip('/') + ('/' if not image_url.startswith('/') else '') + image_url.lstrip('/')
                
                # Skip non-product items
                if product_name == "Unknown Product" or not product_url or product_url.endswith('javascript:;'):
                    continue
                
                # Add to products list
                products.append({
                    "name": product_name,
                    "price": price,
                    "url": product_url,
                    "image": image_url
                })
                
                print(f"Found product: {product_name}, Price: {price}")
                
            except Exception as e:
                print(f"Error parsing product item: {e}")
    
    return products

def extract_products_from_category(html):
    """Extract products from a category page."""
    products = []
    
    # Find product items
    product_items = re.findall(r'<li[^>]*class=["\'][^"\']*item[^"\']*product[^"\']*["\'][^>]*>(.*?)</li>', html, re.DOTALL | re.IGNORECASE)
    
    print(f"Found {len(product_items)} product items on category page")
    
    for item in product_items:
        try:
            # Extract product name
            name_match = re.search(r'<h2[^>]*class=["\']product-name["\'][^>]*>.*?<a[^>]*>(.*?)</a>', item, re.DOTALL | re.IGNORECASE)
            product_name = name_match.group(1).strip() if name_match else "Unknown Product"
            product_name = re.sub(r'<[^>]*>', '', product_name).strip()
            
            # Extract product URL
            url_match = re.search(r'<h2[^>]*class=["\']product-name["\'][^>]*>.*?<a[^>]*href=["\']([^"\']+)["\']', item, re.DOTALL | re.IGNORECASE)
            product_url = url_match.group(1) if url_match else ""
            
            # Extract price
            price_match = re.search(r'<span[^>]*class=["\']price["\'][^>]*>(.*?)</span>', item, re.DOTALL | re.IGNORECASE)
            price = price_match.group(1) if price_match else "N/A"
            price = re.sub(r'<[^>]*>', '', price).strip()
            
            # Clean up price - extract numeric value
            price_clean = re.search(r'[$€£]?\s*([\d,.]+)', price)
            price = price_clean.group(1) if price_clean else price
            
            # Extract image URL
            img_match = re.search(r'<img[^>]*src=["\']([^"\']+)["\']', item, re.DOTALL | re.IGNORECASE)
            image_url = img_match.group(1) if img_match else ""
            
            # Make URLs absolute
            if product_url and not product_url.startswith('http'):
                product_url = TARGET_URL.rstrip('/') + ('/' if not product_url.startswith('/') else '') + product_url.lstrip('/')
            
            if image_url and not image_url.startswith('http'):
                image_url = TARGET_URL.rstrip('/') + ('/' if not image_url.startswith('/') else '') + image_url.lstrip('/')
            
            # Skip non-product items
            if product_name == "Unknown Product" or not product_url or product_url.endswith('javascript:;'):
                continue
            
            # Add to products list
            products.append({
                "name": product_name,
                "price": price,
                "url": product_url,
                "image": image_url
            })
            
            print(f"Found product: {product_name}, Price: {price}")
            
        except Exception as e:
            print(f"Error parsing product item: {e}")
    
    return products

def extract_category_urls(html):
    """Extract category URLs from the homepage."""
    category_urls = []
    
    # Find category links in the navigation menu
    nav_menu = re.findall(r'<nav[^>]*id=["\']nav["\'][^>]*>(.*?)</nav>', html, re.DOTALL | re.IGNORECASE)
    if nav_menu:
        category_links = re.findall(r'<a[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', nav_menu[0], re.DOTALL | re.IGNORECASE)
        for url, name in category_links:
            # Clean up name
            name = re.sub(r'<[^>]*>', '', name).strip()
            
            # Skip non-category links
            if 'login' in url.lower() or 'account' in url.lower() or 'cart' in url.lower() or 'javascript:' in url.lower():
                continue
            
            # Make URL absolute
            if not url.startswith('http'):
                url = TARGET_URL.rstrip('/') + ('/' if not url.startswith('/') else '') + url.lstrip('/')
            
            category_urls.append(url)
    
    return category_urls[:3]  # Limit to first 3 categories for demo

def save_products_to_file(products):
    """Save products to text file."""
    filepath = os.path.join(OUTPUT_DIR, 'mobilesentrix_products.txt')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write("Name\tPrice\tURL\tImage URL\n")
        for product in products:
            f.write(f"{product['name']}\t{product['price']}\t{product['url']}\t{product['image']}\n")
    print(f"Saved {len(products)} products to {filepath}")
    
    # Save as JSON
    json_filepath = os.path.join(OUTPUT_DIR, 'mobilesentrix_products.json')
    with open(json_filepath, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2)
    print(f"Saved products to JSON file: {json_filepath}")
    
    return filepath

def generate_html_report(products):
    """Generate a simple HTML report."""
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MobileSentrix Products</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        h1 {{ color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }}
        .product-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }}
        .product-card {{ border: 1px solid #ddd; border-radius: 5px; padding: 15px; }}
        .product-image {{ width: 100%; height: 200px; object-fit: contain; }}
        .product-title {{ font-weight: bold; margin: 10px 0 5px; }}
        .product-price {{ color: #e63946; font-weight: bold; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>MobileSentrix Products</h1>
        <p>Scraped on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        <p>Total Products: {len(products)}</p>
        
        <div class="product-grid">
            {"".join(f'''
            <div class="product-card">
                <img src="{product['image']}" alt="{product['name']}" class="product-image" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687a4b89fe%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687a4b89fe%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2274.4296875%22%20y%3D%22104.5%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';">
                <div class="product-title">{product['name']}</div>
                <div class="product-price">${product['price']}</div>
                <a href="{product['url']}" target="_blank">View Product</a>
            </div>
            ''' for product in products)}
        </div>
    </div>
</body>
</html>"""
    
    filepath = os.path.join(OUTPUT_DIR, 'mobilesentrix_report.html')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Generated HTML report: {filepath}")
    
    return filepath

def main():
    """Main function."""
    print("=" * 60)
    print("FINAL MOBILESENTRIX SCRAPER")
    print("=" * 60)
    print(f"Target URL: {TARGET_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)
    
    # Create output directory
    create_output_dir()
    
    # Fetch homepage
    html = fetch_url(TARGET_URL)
    if not html:
        print("Failed to fetch website content. Exiting.")
        return
    
    # Extract products from homepage
    products = extract_products_from_homepage(html)
    
    # Extract category URLs
    category_urls = extract_category_urls(html)
    print(f"Found {len(category_urls)} category URLs")
    
    # Scrape products from categories
    for url in category_urls:
        print(f"Scraping category: {url}")
        category_html = fetch_url(url)
        if category_html:
            category_products = extract_products_from_category(category_html)
            products.extend(category_products)
    
    # Remove duplicates
    unique_products = []
    seen_urls = set()
    for product in products:
        if product['url'] not in seen_urls:
            unique_products.append(product)
            seen_urls.add(product['url'])
    
    # Save products to file
    save_products_to_file(unique_products)
    
    # Generate HTML report
    generate_html_report(unique_products)
    
    print("\n" + "=" * 60)
    print("SCRAPING COMPLETED SUCCESSFULLY")
    print("=" * 60)
    print(f"Found {len(unique_products)} unique products")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Output directory: {os.path.abspath(OUTPUT_DIR)}")
    print("\nTo view the report, open:")
    print(f"{os.path.abspath(os.path.join(OUTPUT_DIR, 'mobilesentrix_report.html'))}")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"An error occurred: {e}")
