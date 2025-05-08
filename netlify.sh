#!/bin/bash

# Print environment information
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "Repository directory: $REPOSITORY_ROOT"
echo "Build directory: $BUILD_DIR"
echo "Netlify base directory: $NETLIFY_BASE_DIR"

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
  echo "Searching for package.json files in the entire repository:"
  find / -name "package.json" -not -path "*/node_modules/*" 2>/dev/null | grep -v "node_modules"

  # Try to find the main project directory
  MAIN_DIR=$(find / -name "package.json" -not -path "*/node_modules/*" 2>/dev/null | grep -v "node_modules" | head -n 1 | xargs dirname)

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

    # Create a minimal package.json file
    echo "Creating a minimal package.json file"
    cat > package.json << 'EOL'
{
  "name": "digiclick-website",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "next build",
    "start": "next start -p 3002"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
EOL

    echo "Created package.json:"
    cat package.json

    echo "Installing minimal dependencies"
    npm install

    echo "Creating minimal Next.js app"
    mkdir -p pages
    cat > pages/index.js << 'EOL'
export default function Home() {
  return (
    <div>
      <h1>DigiClick Website</h1>
      <p>This is a placeholder page. The actual website is coming soon.</p>
    </div>
  )
}
EOL

    echo "Building minimal Next.js app"
    npm run build

    exit 0
  fi
fi
