#!/bin/bash
# Script to set up the database and import data

# Set up colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting database setup process...${NC}"

# Step 1: Check for required tools
echo -e "\n${YELLOW}Checking for required tools...${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js is installed${NC}"

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3 and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 is installed${NC}"

# Check for PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL is not installed. Please install PostgreSQL and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL is installed${NC}"

# Step 2: Check PostgreSQL connection
echo -e "\n${YELLOW}Checking PostgreSQL connection...${NC}"
if ! psql -c "SELECT 1" postgres &> /dev/null; then
    echo -e "${RED}Cannot connect to PostgreSQL. Please make sure PostgreSQL is running.${NC}"
    echo -e "${BLUE}Try running: brew services start postgresql${NC}"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL connection successful${NC}"

# Step 3: Install required Node.js packages
echo -e "\n${YELLOW}Installing required Node.js packages...${NC}"
npm install pg bcrypt
echo -e "${GREEN}✓ Node.js packages installed${NC}"

# Step 4: Install required Python packages
echo -e "\n${YELLOW}Installing required Python packages...${NC}"
pip3 install pandas openpyxl
echo -e "${GREEN}✓ Python packages installed${NC}"

# Step 5: Create data directories
echo -e "\n${YELLOW}Creating data directories...${NC}"
mkdir -p database/data/normalized
mkdir -p database/logs
echo -e "${GREEN}✓ Data directories created${NC}"

# Step 6: Convert Excel files to CSV
echo -e "\n${YELLOW}Converting Excel files to CSV...${NC}"
python3 database/convert_excel_to_csv.py
if [ $? -ne 0 ]; then
    echo -e "${RED}Error converting Excel files to CSV. Check the output above for details.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Excel files converted to CSV${NC}"

# Step 7: Merge and normalize data
echo -e "\n${YELLOW}Merging and normalizing data...${NC}"
python3 database/merge_data.py
if [ $? -ne 0 ]; then
    echo -e "${RED}Error merging and normalizing data. Check the output above for details.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Data merged and normalized${NC}"

# Step 8: Set up the database
echo -e "\n${YELLOW}Setting up the database...${NC}"
node database/setup.js
if [ $? -ne 0 ]; then
    echo -e "${RED}Error setting up the database. Check the output above for details.${NC}"
    exit 1
fi

# Create e-commerce tables
echo -e "\n${YELLOW}Creating e-commerce tables...${NC}"
psql -U postgres -d phone_electronics_store -f database/create_ecommerce_tables.sql
if [ $? -ne 0 ]; then
    echo -e "${RED}Error creating e-commerce tables. Check the output above for details.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ E-commerce tables created${NC}"

echo -e "${GREEN}✓ Database set up${NC}"

# Step 9: Import data
echo -e "\n${YELLOW}Importing data into the database...${NC}"
node database/import-csv.js
if [ $? -ne 0 ]; then
    echo -e "${RED}Error importing data. Check the output above for details.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Data imported${NC}"

# Step 10: Test database connection
echo -e "\n${YELLOW}Testing database connection...${NC}"
node -e "
const db = require('./database/config');
async function testDB() {
  try {
    const result = await db.testConnection();
    if (result) {
      console.log('Database connection test successful');
      process.exit(0);
    } else {
      console.error('Database connection test failed');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error testing database connection:', err);
    process.exit(1);
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
echo -e "${BLUE}postgresql://postgres:postgres@localhost:5432/phone_electronics_store${NC}"
echo -e "\nTo use the database in your application, import the models from the database/models directory:"
echo -e "${BLUE}const { ProductModel, CategoryModel, UserModel, CartModel, OrderModel } = require('./database/models');${NC}"
