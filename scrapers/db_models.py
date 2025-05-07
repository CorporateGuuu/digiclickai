"""
Database models and operations for scrapers.
Handles database schema and CRUD operations.
"""
import logging
import re
from datetime import datetime
from scrapers.db_config import DatabaseManager

# Configure logging
logger = logging.getLogger(__name__)

class CategoryModel:
    """Category model for database operations."""
    
    @staticmethod
    def create_slug(name):
        """Create a URL-friendly slug from a name."""
        # Convert to lowercase, replace spaces and special chars with hyphens
        slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        return slug
    
    @staticmethod
    def get_by_name(name):
        """Get a category by name."""
        with DatabaseManager() as db:
            result = db.execute_and_fetch_one(
                "SELECT id, name, slug FROM categories WHERE name = %s",
                (name,)
            )
            return result
    
    @staticmethod
    def get_or_create(name, description=None):
        """Get a category by name or create it if it doesn't exist."""
        # First try to get the category
        category = CategoryModel.get_by_name(name)
        
        if category:
            logger.debug(f"Found existing category: {name}")
            return category
        
        # Create a new category
        slug = CategoryModel.create_slug(name)
        description = description or f"Products in the {name} category"
        
        with DatabaseManager() as db:
            result = db.execute_and_fetch_one(
                """
                INSERT INTO categories (name, slug, description)
                VALUES (%s, %s, %s)
                RETURNING id, name, slug
                """,
                (name, slug, description)
            )
            logger.info(f"Created new category: {name}")
            return result
    
    @staticmethod
    def get_all():
        """Get all categories."""
        with DatabaseManager() as db:
            return db.execute("SELECT id, name, slug FROM categories ORDER BY name")


class ProductModel:
    """Product model for database operations."""
    
    @staticmethod
    def create_slug(name):
        """Create a URL-friendly slug from a name."""
        # Convert to lowercase, replace spaces and special chars with hyphens
        slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        return slug
    
    @staticmethod
    def get_by_name_or_slug(name, slug=None):
        """Get a product by name or slug."""
        slug = slug or ProductModel.create_slug(name)
        
        with DatabaseManager() as db:
            result = db.execute_and_fetch_one(
                "SELECT id, name, slug FROM products WHERE name = %s OR slug = %s",
                (name, slug)
            )
            return result
    
    @staticmethod
    def upsert(product_data):
        """Insert or update a product."""
        name = product_data['name']
        slug = ProductModel.create_slug(name)
        
        # Get category ID if available
        category_id = None
        if 'category' in product_data and product_data['category']:
            category = CategoryModel.get_or_create(product_data['category'])
            if category:
                category_id = category['id']
        
        # Check if product exists
        existing_product = ProductModel.get_by_name_or_slug(name, slug)
        
        with DatabaseManager() as db:
            if existing_product:
                # Update existing product
                product_id = existing_product['id']
                db.execute(
                    """
                    UPDATE products SET
                        price = %s,
                        discount_percentage = %s,
                        stock_quantity = %s,
                        image_url = %s,
                        category_id = %s,
                        brand = %s,
                        updated_at = %s
                    WHERE id = %s
                    RETURNING id
                    """,
                    (
                        float(product_data['price']),
                        product_data.get('discount_percentage', 0),
                        product_data.get('stock_quantity', 100),
                        product_data.get('image_url', ''),
                        category_id,
                        product_data.get('brand', ''),
                        datetime.now(),
                        product_id
                    )
                )
                logger.info(f"Updated product: {name}")
                return product_id
            else:
                # Insert new product
                result = db.execute_and_fetch_one(
                    """
                    INSERT INTO products (
                        name, slug, description, price, discount_percentage,
                        stock_quantity, is_featured, is_new, image_url,
                        category_id, brand
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (
                        name,
                        slug,
                        product_data.get('description', ''),
                        float(product_data['price']),
                        product_data.get('discount_percentage', 0),
                        product_data.get('stock_quantity', 100),
                        product_data.get('is_featured', False),
                        product_data.get('is_new', True),
                        product_data.get('image_url', ''),
                        category_id,
                        product_data.get('brand', '')
                    )
                )
                logger.info(f"Inserted new product: {name}")
                return result['id']
    
    @staticmethod
    def batch_upsert(products_data):
        """Batch insert or update products."""
        inserted_count = 0
        updated_count = 0
        
        for product_data in products_data:
            try:
                name = product_data['name']
                slug = ProductModel.create_slug(name)
                
                # Check if product exists
                existing_product = ProductModel.get_by_name_or_slug(name, slug)
                
                if existing_product:
                    ProductModel.upsert(product_data)
                    updated_count += 1
                else:
                    ProductModel.upsert(product_data)
                    inserted_count += 1
            except Exception as e:
                logger.error(f"Error processing product {product_data.get('name', 'unknown')}: {e}")
        
        return {
            'inserted': inserted_count,
            'updated': updated_count,
            'total': inserted_count + updated_count
        }


class ProductSpecificationModel:
    """Product specification model for database operations."""
    
    @staticmethod
    def get_by_product_id(product_id):
        """Get specifications by product ID."""
        with DatabaseManager() as db:
            result = db.execute_and_fetch_one(
                "SELECT id FROM product_specifications WHERE product_id = %s",
                (product_id,)
            )
            return result
    
    @staticmethod
    def upsert(product_id, specs_data):
        """Insert or update product specifications."""
        # Check if specifications exist
        existing_specs = ProductSpecificationModel.get_by_product_id(product_id)
        
        with DatabaseManager() as db:
            if existing_specs:
                # Update existing specifications
                db.execute(
                    """
                    UPDATE product_specifications SET
                        display = %s,
                        processor = %s,
                        memory = %s,
                        storage = %s,
                        camera = %s,
                        battery = %s,
                        connectivity = %s,
                        operating_system = %s
                    WHERE product_id = %s
                    """,
                    (
                        specs_data.get('display', ''),
                        specs_data.get('processor', ''),
                        specs_data.get('memory', ''),
                        specs_data.get('storage', ''),
                        specs_data.get('camera', ''),
                        specs_data.get('battery', ''),
                        specs_data.get('connectivity', ''),
                        specs_data.get('operating_system', ''),
                        product_id
                    )
                )
                logger.debug(f"Updated specifications for product ID: {product_id}")
            else:
                # Insert new specifications
                db.execute(
                    """
                    INSERT INTO product_specifications (
                        product_id, display, processor, memory, storage,
                        camera, battery, connectivity, operating_system
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        product_id,
                        specs_data.get('display', ''),
                        specs_data.get('processor', ''),
                        specs_data.get('memory', ''),
                        specs_data.get('storage', ''),
                        specs_data.get('camera', ''),
                        specs_data.get('battery', ''),
                        specs_data.get('connectivity', ''),
                        specs_data.get('operating_system', '')
                    )
                )
                logger.debug(f"Inserted specifications for product ID: {product_id}")
