#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== MDTS Tech Store Database Setup ===${NC}"

# Step 1: Check if PostgreSQL is installed
echo -e "\n${YELLOW}Checking if PostgreSQL is installed...${NC}"
if command -v psql >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is installed${NC}"
else
    echo -e "${RED}PostgreSQL is not installed. Please install PostgreSQL and try again.${NC}"
    exit 1
fi

# Step 2: Check if Node.js is installed
echo -e "\n${YELLOW}Checking if Node.js is installed...${NC}"
if command -v node >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Node.js is installed${NC}"
else
    echo -e "${RED}Node.js is not installed. Please install Node.js and try again.${NC}"
    exit 1
fi

# Step 3: Install required Node.js packages
echo -e "\n${YELLOW}Installing required Node.js packages...${NC}"
npm install pg bcrypt csv-parser
echo -e "${GREEN}✓ Node.js packages installed${NC}"

# Step 4: Install required Python packages
echo -e "\n${YELLOW}Installing required Python packages...${NC}"
pip3 install pandas openpyxl
echo -e "${GREEN}✓ Python packages installed${NC}"

# Step 5: Create data directories
echo -e "\n${YELLOW}Creating data directories...${NC}"
mkdir -p database/data/combined
echo -e "${GREEN}✓ Data directories created${NC}"

# Step 6: Combine database files
echo -e "\n${YELLOW}Combining database files...${NC}"
python3 database/combine_database_files.py
if [ $? -ne 0 ]; then
    echo -e "${RED}Error combining database files. Check the output above for details.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database files combined${NC}"

# Step 7: Create database
echo -e "\n${YELLOW}Creating database...${NC}"
psql -U postgres -c "DROP DATABASE IF EXISTS mdtstech_store;"
psql -U postgres -c "CREATE DATABASE mdtstech_store;"
if [ $? -ne 0 ]; then
    echo -e "${RED}Error creating database. Check the output above for details.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database created${NC}"

# Step 8: Create tables
echo -e "\n${YELLOW}Creating tables...${NC}"
psql -U postgres -d mdtstech_store -f database/combined_schema.sql
if [ $? -ne 0 ]; then
    echo -e "${RED}Error creating tables. Check the output above for details.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Tables created${NC}"

# Step 9: Import data
echo -e "\n${YELLOW}Importing data...${NC}"
node database/import-combined-data.js
if [ $? -ne 0 ]; then
    echo -e "${RED}Error importing data. Check the output above for details.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Data imported${NC}"

# Step 10: Test database connection
echo -e "\n${YELLOW}Testing database connection...${NC}"
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/mdtstech_store',
});

async function testDB() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT COUNT(*) FROM products');
    console.log('Connected to database. Product count:', result.rows[0].count);
  } finally {
    client.release();
    await pool.end();
  }
}

testDB();
"
if [ $? -ne 0 ]; then
    echo -e "${RED}Database connection test failed. Check the output above for details.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database connection test successful${NC}"

echo -e "\n${GREEN}Database setup completed successfully!${NC}"
echo -e "You can now connect to the database using the following connection string:"
echo -e "${BLUE}postgresql://postgres:postgres@localhost:5432/mdtstech_store${NC}"
echo -e "\nTo use the database in your application, import the models from the database/models directory:"
echo -e "${BLUE}const { ProductModel, CategoryModel, UserModel, CartModel, OrderModel } = require('./database/models');${NC}"
