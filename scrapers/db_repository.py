"""
Database repository module for scrapers.
Provides a high-level interface for database operations.
"""
import logging
from scrapers.db_models import CategoryModel, ProductModel, ProductSpecificationModel
from scrapers.db_config import DatabaseManager

# Configure logging
logger = logging.getLogger(__name__)

class ProductRepository:
    """Repository for product-related database operations."""
    
    @staticmethod
    def save_products(products_data):
        """Save products to the database."""
        if not products_data:
            logger.warning("No products to save")
            return {
                'inserted': 0,
                'updated': 0,
                'total': 0,
                'error': 0
            }
        
        inserted_count = 0
        updated_count = 0
        error_count = 0
        
        # Process each product
        for product_data in products_data:
            try:
                # Check if product exists
                name = product_data['name']
                slug = ProductModel.create_slug(name)
                existing_product = ProductModel.get_by_name_or_slug(name, slug)
                
                # Insert or update product
                product_id = ProductModel.upsert(product_data)
                
                # Insert or update specifications if available
                if 'specifications' in product_data and product_data['specifications']:
                    ProductSpecificationModel.upsert(product_id, product_data['specifications'])
                
                if existing_product:
                    updated_count += 1
                else:
                    inserted_count += 1
                    
            except Exception as e:
                logger.error(f"Error saving product {product_data.get('name', 'unknown')}: {e}")
                error_count += 1
        
        result = {
            'inserted': inserted_count,
            'updated': updated_count,
            'total': inserted_count + updated_count,
            'error': error_count
        }
        
        logger.info(f"Product save results: {result}")
        return result
    
    @staticmethod
    def batch_save_products(products_data, batch_size=100):
        """Save products in batches for better performance."""
        if not products_data:
            logger.warning("No products to save")
            return {
                'inserted': 0,
                'updated': 0,
                'total': 0,
                'error': 0
            }
        
        total_inserted = 0
        total_updated = 0
        total_error = 0
        
        # Process products in batches
        for i in range(0, len(products_data), batch_size):
            batch = products_data[i:i+batch_size]
            logger.info(f"Processing batch {i//batch_size + 1} of {(len(products_data) + batch_size - 1) // batch_size}")
            
            try:
                with DatabaseManager() as db:
                    # First, extract and process all categories
                    categories = {}
                    for product in batch:
                        if 'category' in product and product['category']:
                            category_name = product['category']
                            if category_name not in categories:
                                category = CategoryModel.get_or_create(category_name)
                                categories[category_name] = category['id']
                    
                    # Process products
                    for product in batch:
                        try:
                            name = product['name']
                            slug = ProductModel.create_slug(name)
                            
                            # Get category ID if available
                            category_id = None
                            if 'category' in product and product['category'] in categories:
                                category_id = categories[product['category']]
                            
                            # Check if product exists
                            result = db.execute_and_fetch_one(
                                "SELECT id FROM products WHERE name = %s OR slug = %s",
                                (name, slug)
                            )
                            
                            if result:
                                # Update existing product
                                product_id = result['id']
                                db.execute(
                                    """
                                    UPDATE products SET
                                        price = %s,
                                        discount_percentage = %s,
                                        stock_quantity = %s,
                                        image_url = %s,
                                        category_id = %s,
                                        brand = %s,
                                        updated_at = CURRENT_TIMESTAMP
                                    WHERE id = %s
                                    """,
                                    (
                                        float(product['price']),
                                        product.get('discount_percentage', 0),
                                        product.get('stock_quantity', 100),
                                        product.get('image_url', ''),
                                        category_id,
                                        product.get('brand', ''),
                                        product_id
                                    )
                                )
                                total_updated += 1
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
                                        product.get('description', ''),
                                        float(product['price']),
                                        product.get('discount_percentage', 0),
                                        product.get('stock_quantity', 100),
                                        product.get('is_featured', False),
                                        product.get('is_new', True),
                                        product.get('image_url', ''),
                                        category_id,
                                        product.get('brand', '')
                                    )
                                )
                                product_id = result['id']
                                total_inserted += 1
                            
                            # Insert or update specifications if available
                            if 'specifications' in product and product['specifications']:
                                specs = product['specifications']
                                
                                # Check if specifications exist
                                spec_result = db.execute_and_fetch_one(
                                    "SELECT id FROM product_specifications WHERE product_id = %s",
                                    (product_id,)
                                )
                                
                                if spec_result:
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
                                            specs.get('display', ''),
                                            specs.get('processor', ''),
                                            specs.get('memory', ''),
                                            specs.get('storage', ''),
                                            specs.get('camera', ''),
                                            specs.get('battery', ''),
                                            specs.get('connectivity', ''),
                                            specs.get('operating_system', ''),
                                            product_id
                                        )
                                    )
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
                                            specs.get('display', ''),
                                            specs.get('processor', ''),
                                            specs.get('memory', ''),
                                            specs.get('storage', ''),
                                            specs.get('camera', ''),
                                            specs.get('battery', ''),
                                            specs.get('connectivity', ''),
                                            specs.get('operating_system', '')
                                        )
                                    )
                        except Exception as e:
                            logger.error(f"Error processing product {product.get('name', 'unknown')}: {e}")
                            total_error += 1
            except Exception as e:
                logger.error(f"Error processing batch: {e}")
                total_error += len(batch)
        
        result = {
            'inserted': total_inserted,
            'updated': total_updated,
            'total': total_inserted + total_updated,
            'error': total_error
        }
        
        logger.info(f"Batch save results: {result}")
        return result
