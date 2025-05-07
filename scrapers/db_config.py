"""
Database configuration module for scrapers.
Handles connection pooling and database access.
"""
import os
import logging
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor, execute_values
from dotenv import load_dotenv

# Load environment variables from .env file
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

# Create a connection pool
try:
    connection_pool = pool.ThreadedConnectionPool(
        minconn=1,
        maxconn=10,
        **DB_PARAMS
    )
    logger.info("Database connection pool created successfully")
except Exception as e:
    logger.error(f"Error creating connection pool: {e}")
    connection_pool = None

def get_connection():
    """Get a connection from the pool."""
    if connection_pool:
        return connection_pool.getconn()
    else:
        logger.error("Connection pool not available")
        return None

def release_connection(conn):
    """Release a connection back to the pool."""
    if connection_pool:
        connection_pool.putconn(conn)

def close_all_connections():
    """Close all connections in the pool."""
    if connection_pool:
        connection_pool.closeall()
        logger.info("All database connections closed")

class DatabaseManager:
    """Database manager class for handling database operations."""
    
    def __init__(self):
        self.conn = None
        self.cursor = None
    
    def __enter__(self):
        """Context manager entry point."""
        self.conn = get_connection()
        if self.conn:
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit point."""
        if exc_type:
            logger.error(f"Database error: {exc_val}")
            if self.conn:
                self.conn.rollback()
        else:
            if self.conn:
                self.conn.commit()
        
        if self.cursor:
            self.cursor.close()
        
        if self.conn:
            release_connection(self.conn)
    
    def execute(self, query, params=None):
        """Execute a query and return results."""
        if not self.cursor:
            logger.error("No database cursor available")
            return None
        
        try:
            self.cursor.execute(query, params)
            return self.cursor.fetchall()
        except Exception as e:
            logger.error(f"Query execution error: {e}")
            logger.error(f"Query: {query}")
            logger.error(f"Params: {params}")
            raise
    
    def execute_many(self, query, params_list):
        """Execute a query with multiple parameter sets."""
        if not self.cursor:
            logger.error("No database cursor available")
            return None
        
        try:
            self.cursor.executemany(query, params_list)
            return self.cursor.rowcount
        except Exception as e:
            logger.error(f"Batch query execution error: {e}")
            raise
    
    def execute_values(self, query, values, template=None, page_size=100):
        """Execute a query with multiple values using execute_values."""
        if not self.cursor:
            logger.error("No database cursor available")
            return None
        
        try:
            return execute_values(
                self.cursor, query, values, 
                template=template, page_size=page_size
            )
        except Exception as e:
            logger.error(f"Execute values error: {e}")
            raise
    
    def execute_and_fetch_one(self, query, params=None):
        """Execute a query and return a single result."""
        if not self.cursor:
            logger.error("No database cursor available")
            return None
        
        try:
            self.cursor.execute(query, params)
            return self.cursor.fetchone()
        except Exception as e:
            logger.error(f"Query execution error: {e}")
            raise
