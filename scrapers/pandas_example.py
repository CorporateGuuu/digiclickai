"""
Example of using pandas with SQLAlchemy to save data to the database.
"""
import os
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv
import logging

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

def save_to_database_with_pandas(products_data, table_name='products'):
    """Save products to the database using pandas."""
    if not products_data:
        logger.warning("No products to save")
        return {
            'inserted': 0,
            'updated': 0,
            'total': 0,
            'error': 0
        }
    
    try:
        # Create DataFrame from scraped data
        df = pd.DataFrame(products_data)
        
        # Clean and prepare data
        # Handle specifications separately
        specs_df = None
        if 'specifications' in df.columns:
            # Extract specifications into a separate DataFrame
            specs_df = pd.json_normalize(df['specifications'])
            specs_df['product_id'] = None  # Will be filled after product insertion
            
            # Drop specifications column from main DataFrame
            df = df.drop(columns=['specifications'])
        
        # Create database connection
        engine = create_engine(
            f"postgresql://{DB_PARAMS['user']}:{DB_PARAMS['password']}@{DB_PARAMS['host']}:{DB_PARAMS['port']}/{DB_PARAMS['dbname']}"
        )
        
        # Insert data into database
        with engine.begin() as conn:
            # Insert products
            result = df.to_sql(
                table_name,
                conn,
                if_exists='append',  # 'replace' to overwrite, 'append' to add
                index=False,
                method='multi'  # For better performance
            )
            
            # If specifications exist, insert them
            if specs_df is not None and not specs_df.empty:
                # Get product IDs for the inserted products
                product_ids = pd.read_sql(
                    f"SELECT id, name FROM {table_name} WHERE name IN ({', '.join(['%s'] * len(df['name']))})",
                    conn,
                    params=tuple(df['name'])
                )
                
                # Map product names to IDs
                product_id_map = dict(zip(product_ids['name'], product_ids['id']))
                
                # Assign product IDs to specifications
                for i, product_name in enumerate(df['name']):
                    if product_name in product_id_map:
                        specs_df.loc[i, 'product_id'] = product_id_map[product_name]
                
                # Drop rows with missing product_id
                specs_df = specs_df.dropna(subset=['product_id'])
                
                # Insert specifications
                if not specs_df.empty:
                    specs_df.to_sql(
                        'product_specifications',
                        conn,
                        if_exists='append',
                        index=False,
                        method='multi'
                    )
        
        logger.info(f"Saved {len(df)} records to {table_name} table")
        
        return {
            'inserted': len(df),
            'updated': 0,  # pandas doesn't handle updates
            'total': len(df),
            'error': 0
        }
        
    except Exception as e:
        logger.error(f"Database error: {e}")
        return {
            'inserted': 0,
            'updated': 0,
            'total': 0,
            'error': len(products_data)
        }
