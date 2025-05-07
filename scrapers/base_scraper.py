"""
Base scraper class for all scrapers.
"""
import os
import asyncio
import aiohttp
import logging
from abc import ABC, abstractmethod
from dotenv import load_dotenv
from scrapers.log_config import configure_logging
from scrapers.db_repository import ProductRepository

# Load environment variables
load_dotenv()

# Configure logging
logger = configure_logging('base_scraper')

class BaseScraper(ABC):
    """Base scraper class that all scrapers should inherit from."""
    
    def __init__(self, name):
        """Initialize the scraper."""
        self.name = name
        self.logger = configure_logging(f'scraper.{name}')
        self.products_data = []
        self.user_agent = os.getenv('SCRAPER_USER_AGENT', 'Mozilla/5.0')
        self.rate_limit_delay = float(os.getenv('SCRAPER_RATE_LIMIT_DELAY', 2))
        self.max_retries = int(os.getenv('SCRAPER_MAX_RETRIES', 3))
    
    @abstractmethod
    async def get_category_links(self, session):
        """Get category links to scrape."""
        pass
    
    @abstractmethod
    async def scrape_category(self, session, category_url):
        """Scrape a category page."""
        pass
    
    @abstractmethod
    async def scrape_product(self, session, product_url):
        """Scrape a product page."""
        pass
    
    async def fetch_with_retry(self, session, url, headers=None, params=None):
        """Fetch a URL with retry logic."""
        if headers is None:
            headers = {'User-Agent': self.user_agent}
        
        for attempt in range(self.max_retries):
            try:
                async with session.get(url, headers=headers, params=params) as response:
                    if response.status == 200:
                        return await response.text()
                    else:
                        self.logger.warning(f"HTTP {response.status} for URL: {url}")
                        if response.status == 429:  # Too Many Requests
                            retry_after = int(response.headers.get('Retry-After', self.rate_limit_delay * 2))
                            self.logger.info(f"Rate limited. Waiting {retry_after} seconds")
                            await asyncio.sleep(retry_after)
                        elif response.status == 404:  # Not Found
                            return None
                        else:
                            await asyncio.sleep(self.rate_limit_delay * (attempt + 1))
            except (aiohttp.ClientError, asyncio.TimeoutError) as e:
                self.logger.warning(f"Attempt {attempt + 1}/{self.max_retries} failed for URL {url}: {e}")
                await asyncio.sleep(self.rate_limit_delay * (attempt + 1))
        
        self.logger.error(f"Failed to fetch URL after {self.max_retries} attempts: {url}")
        return None
    
    async def save_to_database(self):
        """Save scraped data to the database."""
        if not self.products_data:
            self.logger.warning("No data to save to database")
            return
        
        self.logger.info(f"Saving {len(self.products_data)} products to database")
        result = ProductRepository.batch_save_products(self.products_data)
        
        self.logger.info(f"Database save results: {result}")
        return result
    
    async def run(self):
        """Main scraping method."""
        self.logger.info(f"Starting {self.name} scraper")
        
        async with aiohttp.ClientSession() as session:
            # Get category links
            category_links = await self.get_category_links(session)
            if not category_links:
                self.logger.error("No category links found. Exiting.")
                return
            
            self.logger.info(f"Found {len(category_links)} categories to scrape")
            
            # Scrape each category
            for i, category_url in enumerate(category_links):
                self.logger.info(f"Scraping category {i+1}/{len(category_links)}: {category_url}")
                await self.scrape_category(session, category_url)
                await asyncio.sleep(self.rate_limit_delay)
            
            # Save data to database
            await self.save_to_database()
            
            self.logger.info(f"Finished {self.name} scraper")
