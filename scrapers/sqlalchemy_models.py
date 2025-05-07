"""
SQLAlchemy models for the database.
"""
import os
import logging
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# Database connection parameters from environment variables
DB_PARAMS = {
    'dbname': os.getenv('DB_NAME', 'phone_electronics_store'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres'),
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432')
}

# Create SQLAlchemy engine
engine = create_engine(
    f"postgresql://{DB_PARAMS['user']}:{DB_PARAMS['password']}@{DB_PARAMS['host']}:{DB_PARAMS['port']}/{DB_PARAMS['dbname']}"
)

# Create session factory
Session = sessionmaker(bind=engine)

# Create base class for models
Base = declarative_base()

class Category(Base):
    """Category model."""
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    image_url = Column(String(255))
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    products = relationship('Product', back_populates='category')
    
    def __repr__(self):
        return f"<Category(name='{self.name}', slug='{self.slug}')>"


class Product(Base):
    """Product model."""
    __tablename__ = 'products'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True)
    sku = Column(String(50))
    description = Column(Text)
    price = Column(Float, nullable=False)
    discount_percentage = Column(Float, default=0)
    stock_quantity = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    is_new = Column(Boolean, default=False)
    image_url = Column(String(255))
    category_id = Column(Integer, ForeignKey('categories.id'))
    brand = Column(String(100))
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    category = relationship('Category', back_populates='products')
    specifications = relationship('ProductSpecification', back_populates='product', uselist=False, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f"<Product(name='{self.name}', price={self.price})>"


class ProductSpecification(Base):
    """Product specification model."""
    __tablename__ = 'product_specifications'
    
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    display = Column(String(255))
    processor = Column(String(255))
    memory = Column(String(255))
    storage = Column(String(255))
    camera = Column(String(255))
    battery = Column(String(255))
    connectivity = Column(String(255))
    operating_system = Column(String(255))
    
    # Relationships
    product = relationship('Product', back_populates='specifications')
    
    def __repr__(self):
        return f"<ProductSpecification(product_id={self.product_id})>"


def get_session():
    """Get a database session."""
    return Session()


def init_db():
    """Initialize the database."""
    Base.metadata.create_all(engine)
    logger.info("Database initialized")


def close_all_connections():
    """Close all database connections."""
    engine.dispose()
    logger.info("All database connections closed")
