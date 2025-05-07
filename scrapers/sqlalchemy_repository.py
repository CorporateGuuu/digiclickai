"""
SQLAlchemy repository for database operations.
"""
import logging
import re
from contextlib import contextmanager
from sqlalchemy.exc import SQLAlchemyError
from scrapers.sqlalchemy_models import get_session, Category, Product, ProductSpecification

# Configure logging
logger = logging.getLogger(__name__)

@contextmanager
def session_scope():
    """Provide a transactional scope around a series of operations."""
    session = get_session()
    try:
        yield session
        session.commit()
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        session.close()

class SQLAlchemyRepository:
    """Repository for database operations using SQLAlchemy."""
    
    @staticmethod
    def create_slug(name):
        """Create a URL-friendly slug from a name."""
        # Convert to lowercase, replace spaces and special chars with hyphens
        slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        return slug
    
    @staticmethod
    def get_or_create_category(session, name, description=None):
        """Get a category by name or create it if it doesn't exist."""
        category = session.query(Category).filter_by(name=name).first()
        
        if category:
            logger.debug(f"Found existing category: {name}")
            return category
        
        # Create a new category
        slug = SQLAlchemyRepository.create_slug(name)
        description = description or f"Products in the {name} category"
        
        category = Category(
            name=name,
            slug=slug,
            description=description
        )
        
        session.add(category)
        session.flush()  # Flush to get the ID
        
        logger.info(f"Created new category: {name}")
        return category
    
    @staticmethod
    def save_product(session, product_data):
        """Save a product to the database."""
        name = product_data['name']
        slug = SQLAlchemyRepository.create_slug(name)
        
        # Get or create category
        category = None
        if 'category' in product_data and product_data['category']:
            category = SQLAlchemyRepository.get_or_create_category(
                session, product_data['category']
            )
        
        # Check if product exists
        product = session.query(Product).filter(
            (Product.name == name) | (Product.slug == slug)
        ).first()
        
        if product:
            # Update existing product
            product.price = float(product_data['price'])
            product.discount_percentage = product_data.get('discount_percentage', 0)
            product.stock_quantity = product_data.get('stock_quantity', 100)
            product.image_url = product_data.get('image_url', '')
            
            if category:
                product.category = category
            
            product.brand = product_data.get('brand', '')
            
            logger.info(f"Updated product: {name}")
        else:
            # Create new product
            product = Product(
                name=name,
                slug=slug,
                description=product_data.get('description', ''),
                price=float(product_data['price']),
                discount_percentage=product_data.get('discount_percentage', 0),
                stock_quantity=product_data.get('stock_quantity', 100),
                is_featured=product_data.get('is_featured', False),
                is_new=product_data.get('is_new', True),
                image_url=product_data.get('image_url', ''),
                category=category,
                brand=product_data.get('brand', '')
            )
            
            session.add(product)
            session.flush()  # Flush to get the ID
            
            logger.info(f"Created new product: {name}")
        
        # Save specifications if available
        if 'specifications' in product_data and product_data['specifications']:
            specs_data = product_data['specifications']
            
            # Check if specifications exist
            specs = session.query(ProductSpecification).filter_by(
                product_id=product.id
            ).first()
            
            if specs:
                # Update existing specifications
                specs.display = specs_data.get('display', '')
                specs.processor = specs_data.get('processor', '')
                specs.memory = specs_data.get('memory', '')
                specs.storage = specs_data.get('storage', '')
                specs.camera = specs_data.get('camera', '')
                specs.battery = specs_data.get('battery', '')
                specs.connectivity = specs_data.get('connectivity', '')
                specs.operating_system = specs_data.get('operating_system', '')
                
                logger.debug(f"Updated specifications for product: {name}")
            else:
                # Create new specifications
                specs = ProductSpecification(
                    product=product,
                    display=specs_data.get('display', ''),
                    processor=specs_data.get('processor', ''),
                    memory=specs_data.get('memory', ''),
                    storage=specs_data.get('storage', ''),
                    camera=specs_data.get('camera', ''),
                    battery=specs_data.get('battery', ''),
                    connectivity=specs_data.get('connectivity', ''),
                    operating_system=specs_data.get('operating_system', '')
                )
                
                session.add(specs)
                logger.debug(f"Created specifications for product: {name}")
        
        return product
    
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
        
        with session_scope() as session:
            for product_data in products_data:
                try:
                    name = product_data['name']
                    slug = SQLAlchemyRepository.create_slug(name)
                    
                    # Check if product exists
                    existing_product = session.query(Product).filter(
                        (Product.name == name) | (Product.slug == slug)
                    ).first()
                    
                    # Save product
                    SQLAlchemyRepository.save_product(session, product_data)
                    
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
            
            with session_scope() as session:
                for product_data in batch:
                    try:
                        name = product_data['name']
                        slug = SQLAlchemyRepository.create_slug(name)
                        
                        # Check if product exists
                        existing_product = session.query(Product).filter(
                            (Product.name == name) | (Product.slug == slug)
                        ).first()
                        
                        # Save product
                        SQLAlchemyRepository.save_product(session, product_data)
                        
                        if existing_product:
                            total_updated += 1
                        else:
                            total_inserted += 1
                    except Exception as e:
                        logger.error(f"Error saving product {product_data.get('name', 'unknown')}: {e}")
                        total_error += 1
        
        result = {
            'inserted': total_inserted,
            'updated': total_updated,
            'total': total_inserted + total_updated,
            'error': total_error
        }
        
        logger.info(f"Batch save results: {result}")
        return result
