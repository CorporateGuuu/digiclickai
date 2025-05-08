#!/bin/bash

# Print current directory
echo "Current directory: $(pwd)"
echo "Listing files in current directory:"
ls -la

# Install system dependencies
if command -v apt-get &> /dev/null; then
  echo "Installing PostgreSQL development files..."
  apt-get update -y
  apt-get install -y postgresql-client libpq-dev
fi

# Install Python dependencies
if command -v pip &> /dev/null; then
  echo "Installing Python dependencies..."
  pip install --upgrade pip
  pip install -r requirements.txt
fi

# Check if package.json exists
if [ -f "package.json" ]; then
  echo "Found package.json, proceeding with npm install"
  # Install Node.js dependencies
  echo "Installing Node.js dependencies..."
  npm install

  # Build the Next.js application
  echo "Building Next.js application..."
  npm run build
else
  echo "Error: package.json not found in $(pwd)"
  echo "Listing all package.json files:"
  find / -name "package.json" 2>/dev/null | grep -v "node_modules"
  exit 1
fi
