import urllib.request
import re
import os
import json
from datetime import datetime

def scrape_mobilesentrix(url="https://www.mobilesentrix.com/"):
    """
    A simple scraper for MobileSentrix website that doesn't require external dependencies.
    Uses regular expressions to extract basic information.
    """
    try:
        # Create output directory if it doesn't exist
        os.makedirs('output', exist_ok=True)
        
        # Send a GET request to the URL
        print(f"Fetching {url}...")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        req = urllib.request.Request(url, headers=headers)
        response = urllib.request.urlopen(req)
        html = response.read().decode('utf-8')
        
        print("Extracting data...")
        
        # Extract title
        title_match = re.search('<title>(.*?)</title>', html, re.IGNORECASE)
        title = title_match.group(1) if title_match else "Unknown Title"
        
        # Extract meta description
        desc_match = re.search('<meta\\s+name=["\']description["\']\\s+content=["\']([^"\'>]*)["\']', html, re.IGNORECASE)
        description = desc_match.group(1) if desc_match else "No description available"
        
        # Extract categories
        categories = []
        category_matches = re.findall('<a\\s+href=["\']([^"\']*category[^"\']*)["\'][^>]*>(.*?)</a>', html, re.IGNORECASE)
        for url_part, name in category_matches:
            # Clean up the name (remove HTML tags)
            clean_name = re.sub('<[^<]+?>', '', name).strip()
            if clean_name and len(clean_name) < 50:  # Avoid very long strings that aren't categories
                categories.append({
                    "name": clean_name,
                    "url": url_part if url_part.startswith('http') else f"https://www.mobilesentrix.com{url_part if url_part.startswith('/') else '/' + url_part}"
                })
        
        # Extract products
        products = []
        
        # Try different product patterns
        product_patterns = [
            # Pattern 1: div with product class
            '<div\\s+class=["\'](?:product|item)[^"\']*["\'][^>]*>.*?<a\\s+href=["\']([^"\']*)["\'][^>]*>.*?<img[^>]*?src=["\']([^"\']*)["\'][^>]*?alt=["\']([^"\']*)["\'].*?<span\\s+class=["\'](?:price|amount)[^"\']*["\'][^>]*>(.*?)</span>.*?</div>',
            # Pattern 2: simpler product pattern
            '<a\\s+href=["\']([^"\']*product[^"\']*)["\'][^>]*>.*?<img[^>]*?src=["\']([^"\']*)["\'][^>]*?alt=["\']([^"\']*)["\'].*?</a>',
            # Pattern 3: list item with product
            '<li[^>]*>.*?<a\\s+href=["\']([^"\']*)["\'][^>]*>.*?<img[^>]*?src=["\']([^"\']*)["\'][^>]*?alt=["\']([^"\']*)["\'].*?</li>'
        ]
        
        for pattern in product_patterns:
            product_matches = re.findall(pattern, html, re.DOTALL | re.IGNORECASE)
            if product_matches:
                print(f"Found {len(product_matches)} products with pattern {product_patterns.index(pattern) + 1}")
                
                for match in product_matches[:20]:  # Limit to 20 products for demo
                    if len(match) >= 3:  # We need at least URL, image, and name
                        product_url, image_url, product_name = match[0], match[1], match[2]
                        price = match[3] if len(match) > 3 else "N/A"
                        
                        # Clean up price
                        price = re.sub('<[^<]+?>', '', price).strip() if price != "N/A" else "N/A"
                        
                        # Make URLs absolute
                        if not product_url.startswith('http'):
                            product_url = f"https://www.mobilesentrix.com{product_url if product_url.startswith('/') else '/' + product_url}"
                        
                        if not image_url.startswith('http'):
                            image_url = f"https://www.mobilesentrix.com{image_url if image_url.startswith('/') else '/' + image_url}"
                        
                        products.append({
                            "name": product_name,
                            "url": product_url,
                            "image": image_url,
                            "price": price
                        })
                
                # If we found products with this pattern, no need to try others
                if products:
                    break
        
        # Extract all images
        image_urls = re.findall('src=["\']([^"\'>]*\.(?:jpg|jpeg|png|gif))["\']', html, re.IGNORECASE)
        
        # Save the extracted data
        data = {
            "url": url,
            "title": title,
            "description": description,
            "scrape_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "categories": categories,
            "products": products,
            "image_count": len(image_urls)
        }
        
        # Save as JSON
        with open('output/mobilesentrix_data.json', 'w', encoding='utf-8') as file:
            json.dump(data, file, indent=4)
        
        # Save image URLs to a file
        with open('output/mobilesentrix_images.txt', 'w', encoding='utf-8') as file:
            for img_url in image_urls:
                # Convert relative URLs to absolute
                if not img_url.startswith('http'):
                    img_url = f"https://www.mobilesentrix.com{img_url if img_url.startswith('/') else '/' + img_url}"
                file.write(img_url + '\n')
        
        # Create a simple HTML report
        html_report = f"""<!DOCTYPE html>
<html>
<head>
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
        .category-list {{ list-style: none; padding: 0; }}
        .category-list li {{ margin-bottom: 5px; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>MobileSentrix Scraper Report</h1>
        
        <div class="stats">
            <p><strong>Website:</strong> {title}</p>
            <p><strong>Description:</strong> {description}</p>
            <p><strong>Scrape Date:</strong> {data['scrape_date']}</p>
            <p><strong>Categories Found:</strong> {len(categories)}</p>
            <p><strong>Products Found:</strong> {len(products)}</p>
            <p><strong>Images Found:</strong> {len(image_urls)}</p>
        </div>
        
        <h2>Categories</h2>
        <ul class="category-list">
            {"".join(f'<li><a href="{cat["url"]}">{cat["name"]}</a></li>' for cat in categories[:20])}
        </ul>
        
        <h2>Products</h2>
        <div class="product-grid">
            {"".join(f'''
            <div class="product-card">
                <img src="{product['image']}" alt="{product['name']}" class="product-image">
                <div class="product-title">{product['name']}</div>
                <div class="product-price">{product['price']}</div>
                <a href="{product['url']}" target="_blank">View Product</a>
            </div>
            ''' for product in products)}
        </div>
    </div>
</body>
</html>
        """
        
        with open('output/mobilesentrix_report.html', 'w', encoding='utf-8') as file:
            file.write(html_report)
        
        print(f"Scraping completed successfully.")
        print(f"Found {len(categories)} categories, {len(products)} products, and {len(image_urls)} images.")
        print(f"Data saved to:")
        print(f"  - output/mobilesentrix_data.json")
        print(f"  - output/mobilesentrix_images.txt")
        print(f"  - output/mobilesentrix_report.html")
        
        return {
            "success": True,
            "categories": len(categories),
            "products": len(products),
            "images": len(image_urls),
            "report_path": "output/mobilesentrix_report.html"
        }
    
    except Exception as e:
        print("An error occurred during scraping:", e)
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    scrape_mobilesentrix()
