#!/usr/bin/env python3
"""
Simple Fixed MobileSentrix Scraper
---------------------------------
A very simple scraper that focuses on correctly extracting product names and prices.
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

def extract_products(html):
    """Extract product information using regex."""
    products = []
    
    # Find product blocks
    product_blocks = re.findall(r'<div[^>]*class=["\'][^"\']*product[^"\']*["\'][^>]*>.*?</div>\s*</div>', html, re.DOTALL | re.IGNORECASE)
    if not product_blocks:
        product_blocks = re.findall(r'<li[^>]*class=["\'][^"\']*product[^"\']*["\'][^>]*>.*?</li>', html, re.DOTALL | re.IGNORECASE)
    
    print(f"Found {len(product_blocks)} potential product blocks")
    
    for block in product_blocks[:30]:  # Limit to 30 products
        try:
            # Extract product name
            name_match = re.search(r'<h\d[^>]*>(.*?)</h\d>', block, re.DOTALL | re.IGNORECASE)
            if not name_match:
                name_match = re.search(r'<a[^>]*>(.*?)</a>', block, re.DOTALL | re.IGNORECASE)
            
            product_name = "Unknown Product"
            if name_match:
                product_name = re.sub(r'<[^>]*>', '', name_match.group(1)).strip()
            
            # Extract product URL
            url_match = re.search(r'<a[^>]*href=["\'](.*?)["\']', block, re.DOTALL | re.IGNORECASE)
            product_url = url_match.group(1) if url_match else ""
            
            # If name is still unknown, try to extract from URL
            if product_name == "Unknown Product" and product_url:
                url_parts = product_url.split('/')
                if url_parts and len(url_parts) > 0:
                    product_name = url_parts[-1].replace('-', ' ').title()
            
            # Extract price
            price_match = re.search(r'<span[^>]*class=["\'](price|amount)["\'][^>]*>(.*?)</span>', block, re.DOTALL | re.IGNORECASE)
            if not price_match:
                price_match = re.search(r'\$([\d,.]+)', block, re.DOTALL | re.IGNORECASE)
            
            price = price_match.group(1) if price_match else "N/A"
            if price_match and len(price_match.groups()) > 1:
                price = price_match.group(2)
            
            # Clean up price
            price = re.sub(r'<[^>]*>', '', price).strip()
            price_clean = re.search(r'[$€£]?\s*([\d,.]+)', price)
            price = price_clean.group(1) if price_clean else price
            
            # Extract image URL
            img_match = re.search(r'<img[^>]*src=["\'](.*?)["\']', block, re.DOTALL | re.IGNORECASE)
            image_url = img_match.group(1) if img_match else ""
            
            # Make URLs absolute
            if product_url and not product_url.startswith('http'):
                product_url = TARGET_URL.rstrip('/') + ('/' if not product_url.startswith('/') else '') + product_url.lstrip('/')
            
            if image_url and not image_url.startswith('http'):
                image_url = TARGET_URL.rstrip('/') + ('/' if not image_url.startswith('/') else '') + image_url.lstrip('/')
            
            # Add to products list
            products.append({
                "name": product_name,
                "price": price,
                "url": product_url,
                "image": image_url
            })
            
            print(f"Found product: {product_name}, Price: {price}")
            
        except Exception as e:
            print(f"Error parsing product block: {e}")
    
    return products

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
                <div class="product-price">{product['price']}</div>
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
    print("SIMPLE FIXED MOBILESENTRIX SCRAPER")
    print("=" * 60)
    print(f"Target URL: {TARGET_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)
    
    # Create output directory
    create_output_dir()
    
    # Fetch website content
    html = fetch_url(TARGET_URL)
    if not html:
        print("Failed to fetch website content. Exiting.")
        return
    
    # Extract products
    products = extract_products(html)
    
    # Save products to file
    save_products_to_file(products)
    
    # Generate HTML report
    generate_html_report(products)
    
    print("\n" + "=" * 60)
    print("SCRAPING COMPLETED SUCCESSFULLY")
    print("=" * 60)
    print(f"Found {len(products)} products")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Output directory: {os.path.abspath(OUTPUT_DIR)}")
    print("\nTo view the report, open:")
    print(f"{os.path.abspath(os.path.join(OUTPUT_DIR, 'mobilesentrix_report.html'))}")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"An error occurred: {e}")
