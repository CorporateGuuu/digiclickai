"""
Logging configuration for scrapers.
"""
import os
import logging
import logging.handlers
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get log level from environment variable
log_level_str = os.getenv('LOG_LEVEL', 'INFO')
log_level = getattr(logging, log_level_str.upper(), logging.INFO)

# Create logs directory if it doesn't exist
os.makedirs('logs', exist_ok=True)

def configure_logging(name):
    """Configure logging for a module."""
    logger = logging.getLogger(name)
    logger.setLevel(log_level)
    
    # Create formatters
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create handlers
    # File handler with rotation
    file_handler = logging.handlers.RotatingFileHandler(
        f'logs/{name}.log',
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(file_formatter)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(console_formatter)
    
    # Add handlers to logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger
