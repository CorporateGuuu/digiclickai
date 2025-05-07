#!/usr/bin/env python3
"""
Main script to run scrapers.
"""
import os
import sys
import asyncio
import argparse
import logging
from dotenv import load_dotenv
from scrapers.log_config import configure_logging
from scrapers.db_config import close_all_connections

# Import scrapers
from scrapers.mobile_sentrix_scraper import MobileSentrixScraper

# Load environment variables
load_dotenv()

# Configure logging
logger = configure_logging('run_scrapers')

# Available scrapers
SCRAPERS = {
    'mobile_sentrix': MobileSentrixScraper,
    # Add more scrapers here
}

async def run_scraper(scraper_name):
    """Run a specific scraper."""
    if scraper_name not in SCRAPERS:
        logger.error(f"Scraper '{scraper_name}' not found")
        return False
    
    try:
        scraper = SCRAPERS[scraper_name]()
        await scraper.run()
        return True
    except Exception as e:
        logger.error(f"Error running scraper '{scraper_name}': {e}")
        return False

async def run_all_scrapers():
    """Run all available scrapers."""
    results = []
    for name in SCRAPERS:
        logger.info(f"Running scraper: {name}")
        success = await run_scraper(name)
        results.append((name, success))
    
    # Log results
    logger.info("Scraper results:")
    for name, success in results:
        status = "SUCCESS" if success else "FAILED"
        logger.info(f"  {name}: {status}")
    
    # Return True if all scrapers succeeded
    return all(success for _, success in results)

def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Run product scrapers')
    parser.add_argument('--scraper', help='Name of the scraper to run (default: run all)')
    args = parser.parse_args()
    
    try:
        if args.scraper:
            if args.scraper not in SCRAPERS:
                logger.error(f"Scraper '{args.scraper}' not found")
                print(f"Available scrapers: {', '.join(SCRAPERS.keys())}")
                return 1
            
            logger.info(f"Running scraper: {args.scraper}")
            success = asyncio.run(run_scraper(args.scraper))
        else:
            logger.info("Running all scrapers")
            success = asyncio.run(run_all_scrapers())
        
        return 0 if success else 1
    except KeyboardInterrupt:
        logger.info("Scraping interrupted by user")
        return 130
    except Exception as e:
        logger.error(f"Unhandled exception: {e}", exc_info=True)
        return 1
    finally:
        # Close all database connections
        close_all_connections()

if __name__ == '__main__':
    sys.exit(main())
