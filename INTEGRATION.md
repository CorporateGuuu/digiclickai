# E-Commerce Platform Integration Guide

This guide explains how the data scraping, database, and frontend components are integrated in the e-commerce platform.

## Architecture Overview

The platform consists of three main components:

1. **Python Scrapers**: Scripts that extract product data from external sources and insert it into the PostgreSQL database
2. **PostgreSQL Database**: Stores all product, category, user, and order data
3. **Next.js Frontend**: Displays the data and provides the user interface

## Database Setup

The database uses PostgreSQL with tables for products, categories, users, carts, and orders. To set up the database:

```bash
# Run the database setup script
./database/setup_database.sh
```

This will:
- Create the PostgreSQL database
- Set up the schema with all required tables
- Import initial data from CSV files

## Data Scraping and Import

The Python scrapers extract data from external sources and insert it directly into the database:

```bash
# Install required Python packages
pip install -r Scripts/requirements.txt

# Run the database scraper
./Scripts/run_database_scraper.sh
```

The scraper:
- Extracts product data from MobileSentrix and other sources
- Normalizes the data (categories, specifications, etc.)
- Inserts the data into the PostgreSQL database using SQLAlchemy
- Handles duplicates with UPSERT operations

## Frontend Integration

The Next.js frontend connects to the database using the `pg` package:

1. **Database Connection**: The `lib/db.ts` file provides functions to query the database
2. **API Routes**: The `/api` routes fetch data from the database and return it as JSON
3. **Server Components**: The page components fetch data directly from the database

### Running the Frontend

```bash
# Install dependencies
cd phone-electronics-store
npm install

# Run the development server
npm run dev
```

## Data Flow

1. **Scrapers → Database**: Python scrapers extract data and insert it into PostgreSQL
2. **Database → API**: Next.js API routes query the database and return JSON
3. **API → Frontend**: React components fetch data from the API and render it

## Folder Structure

```
├── database/               # Database setup and models
│   ├── models/             # Database models for each entity
│   ├── schema.sql          # Database schema
│   ├── setup.js            # Database setup script
│   └── setup_database.sh   # Main setup script
├── Scripts/                # Python scraper scripts
│   ├── database_scraper.py # Scraper that inserts into database
│   └── requirements.txt    # Python dependencies
└── phone-electronics-store/ # Next.js frontend
    ├── app/                # Next.js app directory
    │   ├── api/            # API routes
    │   └── page.tsx        # Home page
    ├── components/         # React components
    └── lib/                # Utility functions
        └── db.ts           # Database connection
```

## Maintenance and Updates

To update the product data:

1. Run the scraper script to fetch new data:
   ```bash
   ./Scripts/run_database_scraper.sh
   ```

2. The frontend will automatically display the updated data on the next page load

## Troubleshooting

- **Database Connection Issues**: Check PostgreSQL is running and the connection string is correct
- **Scraper Errors**: Check the scraper logs in `scraper.log`
- **Frontend Errors**: Check the Next.js server logs for API or database errors
