#!/usr/bin/env python3
"""
Enhanced scraper that directly inserts data into PostgreSQL database.
This script scrapes product data and inserts it into the database using SQLAlchemy.
"""

import os
import sys
import re
import json
import asyncio
import aiohttp
import platform
import logging
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.dialects.postgresql import insert

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("scraper.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("database_scraper")

# Database configuration
DB_URL = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store')

class DatabaseScraper:
    """Scraper that inserts data directly into PostgreSQL database."""
    
    def __init__(self, base_url="https://www.mobilesentrix.com"):
        self.base_url = base_url
        self.products_data = []
        self.categories_data = []
        self.rate_limit_delay = 1  # Delay between requests in seconds
        self.engine = create_engine(DB_URL)
        
    async def get_category_links(self, session):
        """Get all category links from the website."""
        try:
            logger.info(f"Fetching categories from {self.base_url}")
            async with session.get(self.base_url) as response:
                if response.status != 200:
                    logger.error(f"Failed to fetch categories: {response.status}")
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Find category links (adjust selectors based on website structure)
                category_links = []
                nav_elements = soup.select('nav ul li a')  # Adjust selector as needed
                
                for link in nav_elements:
                    href = link.get('href')
                    if href and '/category/' in href:
                        category_url = urljoin(self.base_url, href)
                        category_name = link.text.strip()
                        
                        # Store category data
                        self.categories_data.append({
                            'name': category_name,
                            'slug': self.create_slug(category_name),
                            'url': category_url
                        })
                        
                        category_links.append(category_url)
                        logger.info(f"Found category: {category_name} - {category_url}")
                
                return category_links
        except Exception as e:
            logger.error(f"Error getting category links: {e}")
            return []
    
    async def scrape_category(self, session, category_url):
        """Scrape products from a category page."""
        try:
            logger.info(f"Scraping category: {category_url}")
            async with session.get(category_url) as response:
                if response.status != 200:
                    logger.error(f"Failed to fetch category: {response.status}")
                    return
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Extract category name
                category_name = "Uncategorized"
                category_title = soup.select_one('h1.category-title')  # Adjust selector
                if category_title:
                    category_name = category_title.text.strip()
                
                # Find product links
                product_links = []
                product_elements = soup.select('.product-item a.product-link')  # Adjust selector
                
                for link in product_elements:
                    href = link.get('href')
                    if href:
                        product_url = urljoin(self.base_url, href)
                        product_links.append(product_url)
                
                # Scrape each product
                for product_url in product_links[:10]:  # Limit to 10 products per category for testing
                    product_data = await self.scrape_product(session, product_url, category_name)
                    if product_data:
                        self.products_data.append(product_data)
                        await asyncio.sleep(self.rate_limit_delay)  # Respect rate limits
        except Exception as e:
            logger.error(f"Error scraping category {category_url}: {e}")
    
    async def scrape_product(self, session, product_url, category):
        """Scrape data from a product page."""
        try:
            logger.info(f"Scraping product: {product_url}")
            async with session.get(product_url) as response:
                if response.status != 200:
                    logger.error(f"Failed to fetch product: {response.status}")
                    return None
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Extract product name
                name = "Unknown Product"
                name_element = soup.select_one('h1.product-title')  # Adjust selector
                if name_element:
                    name = name_element.text.strip()
                
                # Extract price
                price = 0.0
                price_element = soup.select_one('.product-price')  # Adjust selector
                if price_element:
                    price_text = price_element.text.strip()
                    # Extract numeric price
                    price_match = re.search(r'[\d,]+\.\d+', price_text)
                    if price_match:
                        price = float(price_match.group(0).replace(',', ''))
                
                # Extract image URL
                img_url = ""
                img_element = soup.select_one('.product-image img')  # Adjust selector
                if img_element:
                    img_url = img_element.get('src', '')
                    if img_url and not img_url.startswith(('http://', 'https://')):
                        img_url = urljoin(self.base_url, img_url)
                
                # Extract specifications
                specs = {}
                specs_table = soup.select_one('.product-specs')  # Adjust selector
                if specs_table:
                    rows = specs_table.select('tr')
                    for row in rows:
                        cols = row.select('td')
                        if len(cols) >= 2:
                            key = cols[0].text.strip().lower().replace(' ', '_')
                            value = cols[1].text.strip()
                            specs[key] = value
                
                # Create product data dictionary
                product_data = {
                    "name": name,
                    "slug": self.create_slug(name),
                    "price": price,
                    "image_url": img_url,
                    "description": self.extract_description(soup),
                    "specifications": specs,
                    "product_url": product_url,
                    "category": category,
                    "sku": f"SKU-{self.generate_sku(name)}",
                    "stock_quantity": 10,  # Default stock
                    "is_featured": False,
                    "is_new": True,
                    "brand": self.extract_brand(name, specs)
                }
                
                # Log the extracted product data
                logger.info(f"Extracted product: {name}, Price: {price}, Category: {category}")
                
                return product_data
        except Exception as e:
            logger.error(f"Error parsing product {product_url}: {e}")
            return None
    
    def extract_description(self, soup):
        """Extract product description from the page."""
        description = ""
        desc_element = soup.select_one('.product-description')  # Adjust selector
        if desc_element:
            description = desc_element.text.strip()
        return description
    
    def extract_brand(self, name, specs):
        """Extract brand from product name or specifications."""
        common_brands = ["Apple", "Samsung", "Google", "Sony", "LG", "Motorola", "OnePlus", "Xiaomi"]
        
        # Check if brand is in specifications
        if specs and 'brand' in specs:
            return specs['brand']
        
        # Check if brand is in product name
        for brand in common_brands:
            if brand.lower() in name.lower():
                return brand
        
        return "Generic"
    
    def create_slug(self, text):
        """Create a URL-friendly slug from text."""
        if not text:
            return ""
        # Convert to lowercase and replace spaces with hyphens
        slug = text.lower().strip()
        # Remove special characters
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        # Replace spaces with hyphens
        slug = re.sub(r'\s+', '-', slug)
        # Remove multiple hyphens
        slug = re.sub(r'-+', '-', slug)
        # Remove leading/trailing hyphens
        slug = slug.strip('-')
        return slug
    
    def generate_sku(self, name):
        """Generate a SKU from product name."""
        # Use first 3 letters of each word + timestamp
        words = name.split()
        prefix = ''.join([word[:3].upper() for word in words if word])[:10]
        timestamp = datetime.now().strftime('%m%d%H%M')
        return f"{prefix}-{timestamp}"
    
    async def insert_categories_to_db(self):
        """Insert categories into the database."""
        if not self.categories_data:
            logger.warning("No categories to insert")
            return
        
        try:
            # Connect to database
            with self.engine.connect() as connection:
                # Insert categories with UPSERT
                for category in self.categories_data:
                    # Create insert statement with on conflict do update
                    insert_stmt = text("""
                        INSERT INTO categories (name, slug, description, image_url)
                        VALUES (:name, :slug, :description, :image_url)
                        ON CONFLICT (slug) 
                        DO UPDATE SET 
                            name = EXCLUDED.name,
                            description = EXCLUDED.description,
                            image_url = EXCLUDED.image_url,
                            updated_at = CURRENT_TIMESTAMP
                        RETURNING id
                    """)
                    
                    # Execute statement
                    result = connection.execute(
                        insert_stmt, 
                        {
                            'name': category['name'],
                            'slug': category['slug'],
                            'description': f"Products in the {category['name']} category",
                            'image_url': ''
                        }
                    )
                    
                    # Get the category ID
                    category['id'] = result.fetchone()[0]
                
                connection.commit()
                logger.info(f"Inserted {len(self.categories_data)} categories into database")
        except SQLAlchemyError as e:
            logger.error(f"Database error inserting categories: {e}")
    
    async def insert_products_to_db(self):
        """Insert products into the database."""
        if not self.products_data:
            logger.warning("No products to insert")
            return
        
        try:
            # Connect to database
            with self.engine.connect() as connection:
                # Get category IDs
                category_query = text("SELECT id, name FROM categories")
                categories = {row[1]: row[0] for row in connection.execute(category_query)}
                
                # Insert products with UPSERT
                for product in self.products_data:
                    # Get category ID
                    category_id = categories.get(product['category'])
                    if not category_id:
                        # If category doesn't exist, use default category or create one
                        logger.warning(f"Category '{product['category']}' not found, using default")
                        default_category = "Uncategorized"
                        if default_category not in categories:
                            # Create default category
                            insert_cat_stmt = text("""
                                INSERT INTO categories (name, slug, description)
                                VALUES (:name, :slug, :description)
                                RETURNING id
                            """)
                            result = connection.execute(
                                insert_cat_stmt,
                                {
                                    'name': default_category,
                                    'slug': 'uncategorized',
                                    'description': 'Uncategorized products'
                                }
                            )
                            category_id = result.fetchone()[0]
                            categories[default_category] = category_id
                        else:
                            category_id = categories[default_category]
                    
                    # Create insert statement with on conflict do update
                    insert_stmt = text("""
                        INSERT INTO products (
                            name, slug, sku, description, price, 
                            stock_quantity, is_featured, is_new, 
                            image_url, category_id, brand
                        )
                        VALUES (
                            :name, :slug, :sku, :description, :price, 
                            :stock_quantity, :is_featured, :is_new, 
                            :image_url, :category_id, :brand
                        )
                        ON CONFLICT (slug) 
                        DO UPDATE SET 
                            name = EXCLUDED.name,
                            sku = EXCLUDED.sku,
                            description = EXCLUDED.description,
                            price = EXCLUDED.price,
                            stock_quantity = EXCLUDED.stock_quantity,
                            is_featured = EXCLUDED.is_featured,
                            is_new = EXCLUDED.is_new,
                            image_url = EXCLUDED.image_url,
                            category_id = EXCLUDED.category_id,
                            brand = EXCLUDED.brand,
                            updated_at = CURRENT_TIMESTAMP
                        RETURNING id
                    """)
                    
                    # Execute statement
                    result = connection.execute(
                        insert_stmt, 
                        {
                            'name': product['name'],
                            'slug': product['slug'],
                            'sku': product['sku'],
                            'description': product['description'],
                            'price': product['price'],
                            'stock_quantity': product['stock_quantity'],
                            'is_featured': product['is_featured'],
                            'is_new': product['is_new'],
                            'image_url': product['image_url'],
                            'category_id': category_id,
                            'brand': product['brand']
                        }
                    )
                    
                    # Get the product ID
                    product_id = result.fetchone()[0]
                    
                    # Insert specifications if available
                    if product['specifications']:
                        specs_stmt = text("""
                            INSERT INTO product_specifications (
                                product_id, display, processor, memory, storage,
                                camera, battery, connectivity, operating_system, additional_features
                            )
                            VALUES (
                                :product_id, :display, :processor, :memory, :storage,
                                :camera, :battery, :connectivity, :operating_system, :additional_features
                            )
                            ON CONFLICT (product_id)
                            DO UPDATE SET
                                display = EXCLUDED.display,
                                processor = EXCLUDED.processor,
                                memory = EXCLUDED.memory,
                                storage = EXCLUDED.storage,
                                camera = EXCLUDED.camera,
                                battery = EXCLUDED.battery,
                                connectivity = EXCLUDED.connectivity,
                                operating_system = EXCLUDED.operating_system,
                                additional_features = EXCLUDED.additional_features
                        """)
                        
                        specs = product['specifications']
                        connection.execute(
                            specs_stmt,
                            {
                                'product_id': product_id,
                                'display': specs.get('display', None),
                                'processor': specs.get('processor', None),
                                'memory': specs.get('memory', None),
                                'storage': specs.get('storage', None),
                                'camera': specs.get('camera', None),
                                'battery': specs.get('battery', None),
                                'connectivity': specs.get('connectivity', None),
                                'operating_system': specs.get('operating_system', None),
                                'additional_features': json.dumps(specs)
                            }
                        )
                
                connection.commit()
                logger.info(f"Inserted {len(self.products_data)} products into database")
        except SQLAlchemyError as e:
            logger.error(f"Database error inserting products: {e}")
    
    async def run(self):
        """Main scraping loop."""
        async with aiohttp.ClientSession() as session:
            # Get category links
            category_links = await self.get_category_links(session)
            if not category_links:
                logger.error("No category links found. Exiting.")
                return
            
            # Insert categories into database
            await self.insert_categories_to_db()
            
            # Scrape each category
            for category_url in category_links:
                await self.scrape_category(session, category_url)
                await asyncio.sleep(self.rate_limit_delay)  # Delay between categories
            
            # Insert products into database
            await self.insert_products_to_db()
            
            logger.info("Scraping and database insertion completed successfully")
            return True

async def main():
    logger.info("Starting database scraper...")
    scraper = DatabaseScraper()
    success = await scraper.run()
    if success:
        logger.info("Scraping completed successfully")
    else:
        logger.error("Scraping failed")

if platform.system() == "Emscripten":
    asyncio.ensure_future(main())
else:
    if __name__ == "__main__":
        asyncio.run(main())
