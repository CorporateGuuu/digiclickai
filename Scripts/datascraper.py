import urllib.request
import re
import os
import json
from datetime import datetime

def scrape_website(url):
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

        # Extract basic information
        print("Extracting data...")

        # Extract title
        title_match = re.search('<title>(.*?)</title>', html, re.IGNORECASE)
        title = title_match.group(1) if title_match else "Unknown Title"

        # Extract meta description
        desc_match = re.search('<meta\\s+name=["\']description["\']\\s+content=["\']([^"\'>]*)["\']', html, re.IGNORECASE)
        description = desc_match.group(1) if desc_match else "No description available"

        # Extract image URLs
        image_urls = re.findall('src=["\']([^"\'>]*\.(?:jpg|jpeg|png|gif))["\']', html, re.IGNORECASE)

        # Extract product information (basic pattern matching)
        products = []
        product_blocks = re.findall('<div\\s+class=["\']product[^>]*>(.*?)</div>', html, re.DOTALL | re.IGNORECASE)

        for block in product_blocks[:10]:  # Limit to first 10 products for demo
            product_name_match = re.search('alt=["\']([^"\'>]*)["\']', block, re.IGNORECASE)
            product_name = product_name_match.group(1) if product_name_match else "Unknown Product"

            price_match = re.search('\\$([\\d,\\.]+)', block)
            price = price_match.group(1) if price_match else "N/A"

            products.append({
                "name": product_name,
                "price": price
            })

        # Save the extracted data
        data = {
            "url": url,
            "title": title,
            "description": description,
            "scrape_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "image_count": len(image_urls),
            "products": products
        }

        # Save as JSON
        with open('output/website_data.json', 'w', encoding='utf-8') as file:
            json.dump(data, file, indent=4)

        # Save image URLs to a file
        with open('output/image_urls.txt', 'w', encoding='utf-8') as file:
            for img_url in image_urls:
                # Convert relative URLs to absolute
                if img_url.startswith('/'):
                    img_url = url.rstrip('/') + img_url
                file.write(img_url + '\n')

        print(f"Scraping completed successfully. Found {len(products)} products and {len(image_urls)} images.")
        print(f"Data saved to output/website_data.json and output/image_urls.txt")

    except Exception as e:
        print("An error occurred during scraping:", e)

# URL for MobileSentrix website
url = 'https://www.mobilesentrix.com/'
scrape_website(url)