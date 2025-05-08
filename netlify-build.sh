#!/bin/bash

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

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Build the Next.js application
echo "Building Next.js application..."
npm run build
