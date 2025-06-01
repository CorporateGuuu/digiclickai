# MDTS Tech Store Database

This directory contains the database schema, setup scripts, and data import utilities for the MDTS Tech Store e-commerce platform.

## Database Structure

The database uses PostgreSQL with the following main tables:

- **categories**: Product categories
- **products**: Main product information
- **product_specifications**: Technical specifications for products
- **product_variants**: Variants of products (color, size, etc.)
- **users**: User accounts
- **user_addresses**: User shipping and billing addresses
- **carts**: Shopping carts
- **cart_items**: Items in shopping carts
- **orders**: Customer orders
- **order_items**: Items in orders
- **reviews**: Product reviews
- **wishlists**: User wishlists
- **wishlist_items**: Items in wishlists
- **coupons**: Discount coupons
- **password_reset_tokens**: Password reset tokens
- **chatbot_conversations**: Chatbot conversation records
- **chatbot_messages**: Individual chatbot messages
- **chatbot_analytics**: Analytics data for chatbot interactions
- **support_articles**: Knowledge base articles
- **lcd_buyback_requests**: LCD buyback program requests
- **outreach_campaigns**: Marketing outreach campaigns
- **recipients**: Outreach recipients
- **campaign_recipients**: Link between campaigns and recipients
- **outreach_messages**: Message templates for outreach campaigns

## Setup Instructions

### 1. Install PostgreSQL

Make sure PostgreSQL is installed and running on your system.

### 2. Install Required Node.js Packages

```bash
npm install pg bcrypt
```

### 3. Install Required Python Packages (for data conversion)

```bash
pip install pandas openpyxl
```

### 4. Combine Database Files

Run the database combination script to merge files from the "New Database" and "Product Database" folders:

```bash
python database/combine_database_files.py
```

This will process Excel and CSV files and save the combined data in the `database/data/combined` directory.

### 5. Set Up the Database

Run the database setup script to create the database and tables:

```bash
psql -U postgres -c "CREATE DATABASE mdtstech_store"
psql -U postgres -d mdtstech_store -f database/combined_schema.sql
```

### 6. Import Data

Run the data import script to populate the database with the combined data:

```bash
node database/import-combined-data.js
```

## Database Models

The `models` directory contains JavaScript modules for interacting with the database:

- **product.js**: Functions for managing products
- **category.js**: Functions for managing categories
- **user.js**: Functions for managing users and authentication
- **cart.js**: Functions for managing shopping carts
- **order.js**: Functions for managing orders

## Data Files

The original data files are stored in:

- **New Database**: Excel files with product data
- **Product Database**: Combined Excel and CSV files

The processed data files are stored in:

- **database/data/combined**: Combined CSV files ready for import

## Database Configuration

The database connection is configured in `lib/db.js`. By default, it connects to:

- **Host**: localhost
- **Port**: 5432
- **Database**: mdtstech_store
- **User**: postgres
- **Password**: postgres

You can override these settings by setting the `DATABASE_URL` environment variable.
