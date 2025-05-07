import Image from 'next/image';
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const TARGET_URL = 'https://www.mobilesentrix.com/';
const OUTPUT_DIR = path.join(__dirname, 'output');

// Create output directory if it doesn't exist
try {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  // // // console.log(`Output directory ready: ${OUTPUT_DIR}`);
} catch (err) {
  console.error(`Error creating output directory: ${err.message}`);
  process.exit(1);
}

// Function to fetch URL content
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    // // // console.log(`Fetching ${url}...`);
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 30000,
      rejectUnauthorized: false // Ignore SSL errors
    };
    
    const req = https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Request failed with status code ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // // // console.log(`Successfully fetched ${url}`);
        resolve(data);
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    
    req.end();
  });
}

// Function to extract title
function extractTitle(html) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  return titleMatch ? titleMatch[1] : 'Unknown Title';
}

// Function to extract description
function extractDescription(html) {
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"'>]*)["']/i) || 
                    html.match(/<meta\s+content=["']([^"'>]*)["']\s+name=["']description["']/i);
  return descMatch ? descMatch[1] : 'No description available';
}

// Function to extract categories
function extractCategories(html, baseUrl) {
  const categories = [];
  const categoryRegex = /<a\s+href=["']([^"']*category[^"']*)["'][^>]*>(.*?)<\/a>/gi;
  
  let match;
  while ((match = categoryRegex.exec(html)) !== null) {
    const url = match[1];
    const name = match[2].replace(/<[^>]*>/g, '').trim();
    
    if (name && name.length < 50) {
      // Make URL absolute
      const fullUrl = url.startsWith('http') ? url : 
                     `${baseUrl.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url.replace(/^\//, '')}`;
      
      categories.push({
        name,
        url: fullUrl
      });
    }
  }
  
  // Remove duplicates
  const uniqueCategories = [];
  const seenUrls = new Set();
  
  for (const cat of categories) {
    if (!seenUrls.has(cat.url)) {
      uniqueCategories.push(cat);
      seenUrls.add(cat.url);
    }
  }
  
  return uniqueCategories;
}

// Function to extract products
function extractProducts(html, baseUrl) {
  const products = [];
  
  // Try to find product blocks
  const productBlockRegex = /<div\s+class=["'](?:product|item)[^"']*["'][^>]*>(.*?)<\/div>\s*(?:<\/div>|<div)/gs;
  const productBlocks = html.match(productBlockRegex) || [];
  
  // // // console.log(`Found ${productBlocks.length} potential product blocks`);
  
  // Process up to 30 product blocks
  for (let i = 0; i < Math.min(productBlocks.length, 30); i++) {
    const block = productBlocks[i];
    
    try {
      // Extract product URL and name
      const urlMatch = block.match(/<a\s+href=["']([^"']+)["'][^>]*>(?:.*?<img[^>]*alt=["']([^"']+)["']|.*?<span[^>]*>([^<]+)<\/span>)/s);
      
      if (!urlMatch) continue;
      
      const productUrl = urlMatch[1];
      const productName = urlMatch[2] || (urlMatch[3] ? urlMatch[3] : 'Unknown Product');
      
      // Clean up name
      const cleanName = productName.replace(/<[^>]*>/g, '').trim();
      
      // Skip if name is too short or looks like navigation
      if (cleanName.length < 5 || ['home', 'next', 'previous', 'category'].includes(cleanName.toLowerCase())) {
        continue;
      }
      
      // Extract image URL
      const imgMatch = block.match(/<img[^>]*src=["']([^"']+)["']/);
      const imageUrl = imgMatch ? imgMatch[1] : '';
      
      // Extract price
      const priceMatch = block.match(/<span[^>]*class=["'][^"']*(?:price|amount)[^"']*["'][^>]*>(.*?)<\/span>/s);
      let price = priceMatch ? priceMatch[1] : 'N/A';
      
      // Clean up price
      price = price.replace(/<[^>]*>/g, '').trim();
      const priceClean = price.match(/[$€£]?\s*(\d[\d,.]*)/);
      price = priceClean ? priceClean[1] : price;
      
      // Make URLs absolute
      const fullProductUrl = productUrl.startsWith('http') ? productUrl : 
                           `${baseUrl.replace(/\/$/, '')}${productUrl.startsWith('/') ? '' : '/'}${productUrl.replace(/^\//, '')}`;
      
      const fullImageUrl = imageUrl && !imageUrl.startsWith('http') ? 
                         `${baseUrl.replace(/\/$/, '')}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl.replace(/^\//, '')}` : 
                         imageUrl;
      
      // Add to products list
      products.push({
        name: cleanName,
        url: fullProductUrl,
        image: fullImageUrl,
        price
      });
    } catch (err) {
      console.error(`Error parsing product block: ${err.message}`);
    }
  }
  
  // Remove duplicates
  const uniqueProducts = [];
  const seenUrls = new Set();
  
  for (const product of products) {
    if (!seenUrls.has(product.url)) {
      uniqueProducts.push(product);
      seenUrls.add(product.url);
    }
  }
  
  return uniqueProducts;
}

// Function to extract images
function extractImages(html, baseUrl) {
  const imageRegex = /src=["']([^"'>]*\.(?:jpg|jpeg|png|gif|webp))["']/gi;
  const images = [];
  const seenUrls = new Set();
  
  let match;
  while ((match = imageRegex.exec(html)) !== null) {
    let imgUrl = match[1];
    
    // Make URL absolute
    if (!imgUrl.startsWith('http')) {
      imgUrl = `${baseUrl.replace(/\/$/, '')}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl.replace(/^\//, '')}`;
    }
    
    if (!seenUrls.has(imgUrl)) {
      images.push(imgUrl);
      seenUrls.add(imgUrl);
    }
  }
  
  return images;
}

// Function to generate HTML report
function generateHtmlReport(data) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MobileSentrix Scraper Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1, h2 { color: #2c3e50; }
        h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .stats { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
        .product-card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; transition: transform 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .product-card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .product-image { width: 100%; height: 200px; object-fit: contain; border-radius: 3px; }
        .product-title { font-weight: bold; margin: 10px 0 5px; font-size: 1.1em; }
        .product-price { color: #e63946; font-weight: bold; }
        .category-list { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 10px; }
        .category-list li { margin-bottom: 5px; background: #eee; padding: 5px 10px; border-radius: 15px; }
        .category-list li a { text-decoration: none; color: #333; }
        .category-list li a:hover { text-decoration: underline; }
        .timestamp { color: #666; font-size: 0.9em; margin-top: 30px; text-align: center; }
        .btn { display: inline-block; padding: 8px 15px; background: #3498db; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px; }
        .btn:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>MobileSentrix Scraper Report</h1>
        
        <div class="stats">
            <p><strong>Website:</strong> ${data.title}</p>
            <p><strong>Description:</strong> ${data.description}</p>
            <p><strong>Scrape Date:</strong> ${data.scrape_date}</p>
            <p><strong>Categories Found:</strong> ${data.categories.length}</p>
            <p><strong>Products Found:</strong> ${data.products.length}</p>
            <p><strong>Images Found:</strong> ${data.images.length}</p>
        </div>
        
        <h2>Categories</h2>
        <ul class="category-list">
            ${data.categories.slice(0, 20).map(cat => `<li><a href="${cat.url}" target="_blank">${cat.name}</Link></li>`).join('')}
        </ul>
        
        <h2>Products</h2>
        <div class="product-grid">
            ${data.products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687a4b89fe%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687a4b89fe%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2274.4296875%22%20y%3D%22104.5%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';">
                <div class="product-title">${product.name}</div>
                <div class="product-price">${product.price}</div>
                <a href="${product.url}" class="btn" target="_blank">View Product</Link>
            </div>
            `).join('')}
        </div>
        
        <div class="timestamp">
            Report generated on ${data.scrape_date}
        </div>
    </div>
</body>
</html>`;
}

// Function to save data files
function saveDataFiles(data) {
  try {
    // Save as JSON
    const jsonPath = path.join(OUTPUT_DIR, 'mobilesentrix_data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 4), 'utf8');
    // // // console.log(`Saved JSON data to ${jsonPath}`);
    
    // Save image URLs to a text file
    const imgPath = path.join(OUTPUT_DIR, 'mobilesentrix_images.txt');
    fs.writeFileSync(imgPath, data.images.join('\n'), 'utf8');
    // // // console.log(`Saved image URLs to ${imgPath}`);
    
    // Save HTML report
    const htmlReport = generateHtmlReport(data);
    const reportPath = path.join(OUTPUT_DIR, 'mobilesentrix_report.html');
    fs.writeFileSync(reportPath, htmlReport, 'utf8');
    // // // console.log(`Saved HTML report to ${reportPath}`);
    
    // Save categories to a text file
    const catPath = path.join(OUTPUT_DIR, 'mobilesentrix_categories.txt');
    fs.writeFileSync(catPath, data.categories.map(cat => `${cat.name}: ${cat.url}`).join('\n'), 'utf8');
    // // // console.log(`Saved categories to ${catPath}`);
    
    // Save products to a CSV-like text file
    const prodPath = path.join(OUTPUT_DIR, 'mobilesentrix_products.txt');
    fs.writeFileSync(
      prodPath, 
      `Name\tPrice\tURL\tImage URL\n${data.products.map(p => `${p.name}\t${p.price}\t${p.url}\t${p.image}`).join('\n')}`,
      'utf8'
    );
    // // // console.log(`Saved products to ${prodPath}`);
    
    return true;
  } catch (err) {
    console.error(`Error saving data files: ${err.message}`);
    return false;
  }
}

// Main function
async function main() {
  // // // console.log('='.repeat(60));
  // // // console.log('MOBILESENTRIX SCRAPER (NODE.JS VERSION)');
  // // // console.log('='.repeat(60));
  // // // console.log(`Target URL: ${TARGET_URL}`);
  // // // console.log(`Started at: ${new Date().toISOString()}`);
  // // // console.log('-'.repeat(60));
  
  try {
    // Fetch website content
    const html = await fetchUrl(TARGET_URL);
    
    // // // console.log('\nExtracting data...');
    
    // Extract basic information
    const title = extractTitle(html);
    const description = extractDescription(html);
    
    // Extract categories, products, and images
    const categories = extractCategories(html, TARGET_URL);
    const products = extractProducts(html, TARGET_URL);
    const images = extractImages(html, TARGET_URL);
    
    // Prepare data structure
    const data = {
      url: TARGET_URL,
      title,
      description,
      scrape_date: new Date().toISOString(),
      categories,
      products,
      images: images.slice(0, 100) // Limit to first 100 images
    };
    
    // Print summary
    // // // console.log('\n' + '='.repeat(60));
    // // // console.log('SCRAPING RESULTS');
    // // // console.log('='.repeat(60));
    // // // console.log(`Website Title: ${title}`);
    // // // console.log(`Categories Found: ${categories.length}`);
    // // // console.log(`Products Found: ${products.length}`);
    // // // console.log(`Images Found: ${images.length}`);
    
    // Save data to files
    // // // console.log('\nSaving data files...');
    saveDataFiles(data);
    
    // // // console.log('\n' + '='.repeat(60));
    // // // console.log('SCRAPING COMPLETED SUCCESSFULLY');
    // // // console.log('='.repeat(60));
    // // // console.log(`Finished at: ${new Date().toISOString()}`);
    // // // console.log(`Output directory: ${path.resolve(OUTPUT_DIR)}`);
    // // // console.log('\nTo view the report, open:');
    // // // console.log(`${path.resolve(path.join(OUTPUT_DIR, 'mobilesentrix_report.html'))}`);
  } catch (err) {
    console.error(`\nAn error occurred: ${err.message}`);
    process.exit(1);
  }
}

// Run the main function
main();
