#!/bin/bash

# MobileSentrix Scraper Runner
# This script attempts to run the most appropriate scraper based on available tools

echo "========================================================"
echo "MobileSentrix Scraper Runner"
echo "========================================================"

# Create output directory
mkdir -p output
echo "Created output directory: output"

# Check for Python
if command -v python3 &>/dev/null; then
    echo "Python 3 found, attempting to run Python scraper..."
    python3 resilient_scraper.py
    exit_code=$?
    if [ $exit_code -eq 0 ]; then
        echo "Python scraper completed successfully!"
        echo "Results saved to output directory."
        exit 0
    else
        echo "Python scraper failed with exit code $exit_code"
    fi
elif command -v python &>/dev/null; then
    echo "Python found, attempting to run Python scraper..."
    python resilient_scraper.py
    exit_code=$?
    if [ $exit_code -eq 0 ]; then
        echo "Python scraper completed successfully!"
        echo "Results saved to output directory."
        exit 0
    else
        echo "Python scraper failed with exit code $exit_code"
    fi
else
    echo "Python not found"
fi

# Check for Node.js
if command -v node &>/dev/null; then
    echo "Node.js found, attempting to run Node.js scraper..."
    node node_scraper.js
    exit_code=$?
    if [ $exit_code -eq 0 ]; then
        echo "Node.js scraper completed successfully!"
        echo "Results saved to output directory."
        exit 0
    else
        echo "Node.js scraper failed with exit code $exit_code"
    fi
else
    echo "Node.js not found"
fi

# Check for PHP
if command -v php &>/dev/null; then
    echo "PHP found, attempting to run PHP scraper..."
    php php_scraper.php
    exit_code=$?
    if [ $exit_code -eq 0 ]; then
        echo "PHP scraper completed successfully!"
        echo "Results saved to output directory."
        exit 0
    else
        echo "PHP scraper failed with exit code $exit_code"
    fi
else
    echo "PHP not found"
fi

# If we get here, all scrapers failed or weren't available
echo "========================================================"
echo "Unable to run any scraper automatically."
echo "Please try one of the following:"
echo ""
echo "1. Open cors_proxy_scraper.html in your web browser"
echo "2. Install Python, Node.js, or PHP and try again"
echo "3. Follow the instructions in README.md"
echo "========================================================"

# Create a simple HTML file with instructions
cat > output/scraper_instructions.html << 'EOL'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MobileSentrix Scraper Instructions</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .btn { display: inline-block; background: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; }
        .btn:hover { background: #2980b9; }
        code { background: #f1f1f1; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <h1>MobileSentrix Scraper Instructions</h1>
        
        <div class="card">
            <h2>Option 1: Browser-Based Scraper</h2>
            <p>The easiest way to run the scraper:</p>
            <p><a href="../cors_proxy_scraper.html" class="btn">Open Browser-Based Scraper</a></p>
            <p>This will open a web page where you can scrape the MobileSentrix website using a CORS proxy.</p>
        </div>
        
        <div class="card">
            <h2>Option 2: Install Required Software</h2>
            <p>To run the more powerful scrapers, you'll need one of the following:</p>
            <ul>
                <li><strong>Python:</strong> <a href="https://www.python.org/downloads/" target="_blank">Download Python</a></li>
                <li><strong>Node.js:</strong> <a href="https://nodejs.org/" target="_blank">Download Node.js</a></li>
                <li><strong>PHP:</strong> <a href="https://www.php.net/downloads" target="_blank">Download PHP</a></li>
            </ul>
            <p>After installation, run the appropriate scraper from the command line.</p>
        </div>
        
        <div class="card">
            <h2>Option 3: Command Line Developer Tools</h2>
            <p>On macOS, you might need to install the Command Line Developer Tools:</p>
            <code>xcode-select --install</code>
            <p>Follow the on-screen instructions to complete the installation.</p>
        </div>
        
        <p>For more detailed instructions, please refer to the README.md file.</p>
    </div>
</body>
</html>
EOL

echo "Created instructions file: output/scraper_instructions.html"
echo "Please open this file in your web browser for further guidance."

exit 1
