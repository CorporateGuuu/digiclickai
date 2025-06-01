# MobileSentrix Scraper

This project contains multiple implementations of a web scraper for the MobileSentrix website. Each implementation is designed to work with different environments and limitations.

## Table of Contents

- [Installation](#installation)
- [Scraper Implementations](#scraper-implementations)
  - [Browser-Based Scraper with CORS Proxy](#browser-based-scraper-with-cors-proxy)
  - [Node.js Scraper](#nodejs-scraper)
  - [PHP Scraper](#php-scraper)
  - [Python Scraper](#python-scraper)
- [Command Line Developer Tools](#command-line-developer-tools)
- [Output](#output)
- [Troubleshooting](#troubleshooting)

## Installation

No installation is required for the browser-based scraper. For other implementations, you'll need to have the respective runtime environments installed.

## Scraper Implementations

### Browser-Based Scraper with CORS Proxy

The easiest way to run the scraper without any installation:

1. Open `cors_proxy_scraper.html` in your web browser
2. Select a CORS proxy from the dropdown (needed to bypass browser security restrictions)
3. Click "Scrape Website"
4. View the results and download the report

**File:** `cors_proxy_scraper.html`

### Node.js Scraper

For a more robust scraping experience with Node.js:

1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Open a terminal/command prompt
3. Navigate to the directory containing the scraper
4. Run the scraper:

```bash
node node_scraper.js
```

**File:** `node_scraper.js`

### PHP Scraper

If you have PHP installed or access to a PHP server:

1. Make sure PHP is installed (version 7.0 or higher recommended)
2. Open a terminal/command prompt
3. Navigate to the directory containing the scraper
4. Run the scraper:

```bash
php php_scraper.php
```

Alternatively, upload to a PHP-enabled web server and access it through a browser.

**File:** `php_scraper.php`

### Python Scraper

For Python users, multiple options are available:

#### Simple Scraper (No External Dependencies)

```bash
python3 simple_scraper.py
```

**File:** `simple_scraper.py`

#### Resilient Scraper (No External Dependencies)

```bash
python3 resilient_scraper.py
```

**File:** `resilient_scraper.py`

#### Advanced Scraper (Requires External Libraries)

```bash
# Install dependencies
pip3 install requests beautifulsoup4 pandas aiohttp

# Run the scraper
python3 mobilesentrix_scraper.py
```

**File:** `mobilesentrix_scraper.py`

## Command Line Developer Tools

Some scrapers require the Command Line Developer Tools on macOS. To install:

1. Open Terminal
2. Run the following command:

```bash
xcode-select --install
```

3. Follow the on-screen instructions to complete the installation

For more details, see `install_dev_tools.md`.

## Output

All scrapers save their output to an `output` directory, which includes:

- `mobilesentrix_report.html` - Interactive HTML report
- `mobilesentrix_data.json` - Raw data in JSON format
- `mobilesentrix_images.txt` - List of image URLs
- `mobilesentrix_categories.txt` - List of categories
- `mobilesentrix_products.txt` - Tab-separated product data

## Troubleshooting

### CORS Issues with Browser-Based Scraper

If you encounter CORS errors with the browser-based scraper:

1. Try a different CORS proxy from the dropdown
2. Some proxies may have request limits or be temporarily unavailable
3. As a last resort, use one of the other scraper implementations

### Python/Node.js/PHP Not Found

If you get "command not found" errors:

1. Make sure the respective runtime is installed
2. Check that it's in your system PATH
3. Try using the full path to the executable

### SSL Certificate Errors

If you encounter SSL certificate errors:

1. The scrapers are configured to ignore SSL verification for simplicity
2. This is generally safe for scraping public websites
3. If you're concerned, modify the code to enable SSL verification

### Empty Results

If the scraper runs but returns no products:

1. The website structure may have changed
2. Try a different scraper implementation
3. Check the website manually to confirm it's accessible
