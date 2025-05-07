# Phone Electronics Store Scrapers

This directory contains scrapers for the Phone Electronics Store e-commerce platform. The scrapers collect product data from various sources and store it in a PostgreSQL database.

## Features

- Asynchronous scraping with aiohttp
- PostgreSQL database integration with connection pooling
- Batch processing for better performance
- Proper error handling and logging
- Environment variable configuration
- Rate limiting to avoid being blocked
- Retry logic for failed requests
- Upsert logic to handle duplicate data

## Directory Structure

- `__init__.py` - Package initialization
- `base_scraper.py` - Base scraper class that all scrapers inherit from
- `db_config.py` - Database configuration and connection pooling
- `db_models.py` - Database models and operations
- `db_repository.py` - Repository for database operations
- `log_config.py` - Logging configuration
- `mobile_sentrix_scraper.py` - Example scraper implementation

## Adding New Scrapers

To add a new scraper:

1. Create a new Python file in this directory
2. Implement a class that inherits from `BaseScraper`
3. Implement the required methods:
   - `get_category_links`
   - `scrape_category`
   - `scrape_product`
4. Add the scraper to the `SCRAPERS` dictionary in `run_scrapers.py`

Example:
```python
from scrapers.base_scraper import BaseScraper

class MyNewScraper(BaseScraper):
    def __init__(self):
        super().__init__('my_new_scraper')
        self.base_url = 'https://example.com'
    
    async def get_category_links(self, session):
        # Implementation
        pass
    
    async def scrape_category(self, session, category_url):
        # Implementation
        pass
    
    async def scrape_product(self, session, product_url):
        # Implementation
        pass
```

## Database Schema

The scrapers are designed to work with the following database schema:

### Categories Table
```sql
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  sku VARCHAR(50),
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  image_url VARCHAR(255),
  category_id INTEGER REFERENCES categories(id),
  brand VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Product Specifications Table
```sql
CREATE TABLE IF NOT EXISTS product_specifications (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display VARCHAR(255),
  processor VARCHAR(255),
  memory VARCHAR(255),
  storage VARCHAR(255),
  camera VARCHAR(255),
  battery VARCHAR(255),
  connectivity VARCHAR(255),
  operating_system VARCHAR(255)
);
```
