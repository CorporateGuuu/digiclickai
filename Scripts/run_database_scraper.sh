#!/bin/bash
# Script to run the database scraper

# Set up colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting database scraper...${NC}"

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

# Check PostgreSQL connection
echo -e "\n${YELLOW}Checking PostgreSQL connection...${NC}"
if ! psql -c "SELECT 1" postgres &> /dev/null; then
    echo -e "${RED}Cannot connect to PostgreSQL. Please make sure PostgreSQL is running.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL connection successful${NC}"

# Check if database exists
echo -e "\n${YELLOW}Checking if database exists...${NC}"
if ! psql -c "SELECT 1" phone_electronics_store &> /dev/null; then
    echo -e "${RED}Database 'phone_electronics_store' does not exist. Please run the database setup script first.${NC}"
    echo -e "${YELLOW}Run: ./database/setup_database.sh${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database exists${NC}"

# Install required Python packages
echo -e "\n${YELLOW}Installing required Python packages...${NC}"
pip3 install -r Scripts/requirements.txt
echo -e "${GREEN}✓ Python packages installed${NC}"

# Run the scraper
echo -e "\n${YELLOW}Running database scraper...${NC}"
python3 Scripts/database_scraper.py
if [ $? -ne 0 ]; then
    echo -e "${RED}Error running database scraper. Check the logs for details.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database scraper completed successfully${NC}"

echo -e "\n${GREEN}Data has been scraped and inserted into the database.${NC}"
echo -e "You can now use the data in your application."
