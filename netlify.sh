#!/bin/bash

# Print environment information
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "Repository directory: $REPOSITORY_ROOT"
echo "Build directory: $BUILD_DIR"

# List files in current directory
echo "Files in current directory:"
ls -la

# Check if package.json exists
if [ -f "package.json" ]; then
  echo "Found package.json, proceeding with npm install"
  # Install dependencies
  npm install

  # Build the Next.js application
  npm run build
else
  echo "Error: package.json not found in $(pwd)"
  echo "Searching for package.json files:"
  find . -name "package.json" -not -path "*/node_modules/*" -not -path "*/\.*"
  
  # Try to find the main project directory
  MAIN_DIR=$(find . -name "package.json" -not -path "*/node_modules/*" -not -path "*/\.*" -exec dirname {} \; | grep -v "node_modules" | head -n 1)
  
  if [ -n "$MAIN_DIR" ]; then
    echo "Found potential main directory: $MAIN_DIR"
    echo "Changing to $MAIN_DIR"
    cd "$MAIN_DIR"
    
    echo "Files in $MAIN_DIR:"
    ls -la
    
    echo "Installing dependencies in $MAIN_DIR"
    npm install
    
    echo "Building in $MAIN_DIR"
    npm run build
  else
    echo "Could not find a suitable package.json file"
    exit 1
  fi
fi
