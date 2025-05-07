/**
 * Script to import combined data into the database
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const csv = require('csv-parser');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mdtstech_store',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Paths
const DATA_DIR = path.join(__dirname, 'data', 'combined');
const UNIFIED_DATA_PATH = path.join(DATA_DIR, 'unified_database.csv');
const METADATA_PATH = path.join(DATA_DIR, 'metadata.json');

// Log with timestamp
function logMessage(message) {
  const timestamp = new Date().toISOString();
  // // // console.log(`[${timestamp}] ${message}`);
}

// Check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Read CSV file and return rows
async function readCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', (error) => reject(error));
  });
}

// Import categories
async function importCategories(client, products) {
  logMessage('Importing categories...');
  
  // Extract unique categories from products
  const categories = new Set();
  products.forEach(product => {
    if (product.category) {
      categories.add(product.category);
    }
  });
  
  // Insert categories
  for (const category of categories) {
    const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    try {
      await client.query(
        'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING',
        [category, slug, `Products in the ${category} category`]
      );
    } catch (error) {
      logMessage(`Error inserting category ${category}: ${error.message}`);
    }
  }
  
  // Get category IDs
  const categoryResult = await client.query('SELECT id, name FROM categories');
  const categoryMap = {};
  categoryResult.rows.forEach(row => {
    categoryMap[row.name.toLowerCase()] = row.id;
  });
  
  logMessage(`Imported ${categories.size} categories`);
  return categoryMap;
}

// Import products
async function importProducts(client, products, categoryMap) {
  logMessage('Importing products...');
  
  let importedCount = 0;
  let errorCount = 0;
  
  for (const product of products) {
    try {
      // Generate slug if not present
      const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Get category ID
      const categoryId = product.category ? categoryMap[product.category.toLowerCase()] : null;
      
      // Insert product
      const productResult = await client.query(
        `INSERT INTO products (
          name, slug, sku, description, price, discount_percentage,
          stock_quantity, is_featured, is_new, image_url, brand, category_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          discount_percentage = EXCLUDED.discount_percentage,
          stock_quantity = EXCLUDED.stock_quantity,
          is_featured = EXCLUDED.is_featured,
          is_new = EXCLUDED.is_new,
          image_url = EXCLUDED.image_url,
          brand = EXCLUDED.brand,
          category_id = EXCLUDED.category_id,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id`,
        [
          product.name,
          slug,
          product.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
          product.description || `${product.name} - High-quality product`,
          parseFloat(product.price) || 99.99,
          parseFloat(product.discount_percentage) || 0,
          parseInt(product.stock_quantity) || 10,
          product.is_featured === 'true' || false,
          product.is_new === 'true' || false,
          product.image_url || `/images/products/${slug}.jpg`,
          product.brand || 'Generic',
          categoryId
        ]
      );
      
      const productId = productResult.rows[0].id;
      
      // Insert product specifications if available
      if (product.display || product.processor || product.memory || product.storage) {
        await client.query(
          `INSERT INTO product_specifications (
            product_id, display, processor, memory, storage,
            camera, battery, connectivity, operating_system
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (product_id) DO UPDATE SET
            display = EXCLUDED.display,
            processor = EXCLUDED.processor,
            memory = EXCLUDED.memory,
            storage = EXCLUDED.storage,
            camera = EXCLUDED.camera,
            battery = EXCLUDED.battery,
            connectivity = EXCLUDED.connectivity,
            operating_system = EXCLUDED.operating_system`,
          [
            productId,
            product.display || null,
            product.processor || null,
            product.memory || null,
            product.storage || null,
            product.camera || null,
            product.battery || null,
            product.connectivity || null,
            product.operating_system || null
          ]
        );
      }
      
      importedCount++;
    } catch (error) {
      logMessage(`Error importing product ${product.name}: ${error.message}`);
      errorCount++;
    }
  }
  
  logMessage(`Imported ${importedCount} products with ${errorCount} errors`);
}

// Main function
async function main() {
  logMessage('Starting data import process...');
  
  // Check if data files exist
  if (!fileExists(UNIFIED_DATA_PATH)) {
    logMessage(`Error: Unified data file not found at ${UNIFIED_DATA_PATH}`);
    process.exit(1);
  }
  
  // Read metadata if available
  let metadata = null;
  if (fileExists(METADATA_PATH)) {
    try {
      metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
      logMessage(`Found metadata: ${metadata.total_records} total records`);
    } catch (error) {
      logMessage(`Error reading metadata: ${error.message}`);
    }
  }
  
  // Read unified data
  let products = [];
  try {
    products = await readCsvFile(UNIFIED_DATA_PATH);
    logMessage(`Read ${products.length} products from unified data file`);
  } catch (error) {
    logMessage(`Error reading unified data: ${error.message}`);
    process.exit(1);
  }
  
  // Connect to database
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Import data
    const categoryMap = await importCategories(client, products);
    await importProducts(client, products, categoryMap);
    
    // Commit transaction
    await client.query('COMMIT');
    
    logMessage('Data import completed successfully');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    logMessage(`Error during import: ${error.message}`);
    process.exit(1);
  } finally {
    // Release client
    client.release();
  }
  
  // Close pool
  await pool.end();
}

// Run main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
