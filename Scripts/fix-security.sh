#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== MDTS Tech Store Security Fix Script ===${NC}"

# Step 1: Check if Node.js is installed
echo -e "\n${YELLOW}Checking if Node.js is installed...${NC}"
if command -v node >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Node.js is installed${NC}"
else
    echo -e "${RED}Node.js is not installed. Please install Node.js and try again.${NC}"
    exit 1
fi

# Step 2: Install required packages
echo -e "\n${YELLOW}Installing required packages...${NC}"
npm install dotenv bcrypt express-validator helmet csurf express-rate-limit
echo -e "${GREEN}✓ Required packages installed${NC}"

# Step 3: Create .env.local file if it doesn't exist
echo -e "\n${YELLOW}Checking for .env.local file...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    
    # Generate random secrets
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    CSRF_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    # Create .env.local file
    cat > .env.local << EOF
# Database configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=mdtstech_store
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mdtstech_store

# NextAuth.js configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# JWT configuration
JWT_SECRET=${JWT_SECRET}

# Session configuration
SESSION_SECRET=${SESSION_SECRET}

# OAuth providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Security settings
NODE_ENV=development
CSRF_SECRET=${CSRF_SECRET}
EOF
    
    echo -e "${GREEN}✓ .env.local file created${NC}"
else
    echo -e "${GREEN}✓ .env.local file already exists${NC}"
fi

# Step 4: Run security check
echo -e "\n${YELLOW}Running security check...${NC}"
node scripts/security-check.js
echo -e "${GREEN}✓ Security check completed${NC}"

# Step 5: Update admin password
echo -e "\n${YELLOW}Updating admin password...${NC}"
node scripts/update-admin-password.js
echo -e "${GREEN}✓ Admin password updated${NC}"

# Step 6: Run npm audit fix
echo -e "\n${YELLOW}Running npm audit fix...${NC}"
npm audit fix
echo -e "${GREEN}✓ npm audit fix completed${NC}"

echo -e "\n${GREEN}Security fixes completed!${NC}"
echo -e "Please make sure to:"
echo -e "1. Keep your .env.local file secure and never commit it to version control"
echo -e "2. Regularly update your dependencies with 'npm update' and 'npm audit fix'"
echo -e "3. Run the security check script periodically with 'node scripts/security-check.js'"
echo -e "4. Use strong passwords for all admin accounts"
echo -e "5. Enable HTTPS in production"
