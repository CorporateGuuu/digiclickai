import { getSession } from 'next-auth/react';
import formidable from 'formidable';
import fs from 'fs';
import csv from 'csv-parser';
import { Pool } from 'pg';
import XLSX from 'xlsx';

// Configure formidable to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  // Check if request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Check authentication and admin status
  const session = await getSession({ req });
  if (!session || !session.user.isAdmin) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    // Parse the form data
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file;
    const source = fields.source;
    const mapping = JSON.parse(fields.mapping);

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Process the file based on its type
    let products = [];
    const filePath = file.filepath;
    const fileType = file.originalFilename.split('.').pop().toLowerCase();

    if (fileType === 'csv') {
      products = await parseCSV(filePath, mapping, source);
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      products = await parseExcel(filePath, mapping, source);
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file format' });
    }

    // Import products to database
    const importResult = await importProducts(products);

    return res.status(200).json({
      success: true,
      message: `Successfully processed ${products.length} products`,
      stats: importResult
    });
  } catch (error) {
    console.error('Error importing inventory:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to import inventory' });
  }
}

// Parse CSV file
async function parseCSV(filePath, mapping, source) {
  const products = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const product = mapProductData(row, mapping, source);
        if (product) {
          products.push(product);
        }
      })
      .on('end', () => {
        resolve(products);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Parse Excel file
async function parseExcel(filePath, mapping, source) {
  const products = [];
  
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  data.forEach(row => {
    const product = mapProductData(row, mapping, source);
    if (product) {
      products.push(product);
    }
  });
  
  return products;
}

// Map data from file to product structure
function mapProductData(row, mapping, source) {
  // Special handling for 4seller.com format
  if (source === '4seller') {
    return {
      sku: row[mapping.sku] || '',
      name: row[mapping.name] || '',
      description: row[mapping.description] || '',
      price: parseFloat(row[mapping.price]) || 0,
      stock: parseInt(row[mapping.stock]) || 0,
      category: row[mapping.category] || '',
      brand: row[mapping.brand] || '',
      images: row[mapping.images] ? row[mapping.images].split(',').map(img => img.trim()) : []
    };
  }
  
  // Generic mapping for other sources
  return {
    sku: row[mapping.sku] || '',
    name: row[mapping.name] || '',
    description: row[mapping.description] || '',
    price: parseFloat(row[mapping.price]) || 0,
    stock: parseInt(row[mapping.stock]) || 0,
    category: row[mapping.category] || '',
    brand: row[mapping.brand] || '',
    images: row[mapping.images] ? 
      (typeof row[mapping.images] === 'string' ? row[mapping.images].split(',').map(img => img.trim()) : [row[mapping.images]]) 
      : []
  };
}

// Import products to database
async function importProducts(products) {
  const stats = {
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: 0
  };
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    for (const product of products) {
      try {
        if (!product.sku || !product.name) {
          stats.skipped++;
          continue;
        }
        
        // Check if product exists
        const existingProduct = await client.query(
          'SELECT id FROM products WHERE sku = $1',
          [product.sku]
        );
        
        let categoryId = null;
        
        // Get or create category
        if (product.category) {
          const categoryResult = await client.query(
            `SELECT id FROM categories WHERE name = $1`,
            [product.category]
          );
          
          if (categoryResult.rows.length > 0) {
            categoryId = categoryResult.rows[0].id;
          } else {
            // Create new category
            const slug = product.category
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
              
            const newCategory = await client.query(
              `INSERT INTO categories (name, slug, created_at, updated_at)
               VALUES ($1, $2, NOW(), NOW())
               RETURNING id`,
              [product.category, slug]
            );
            
            categoryId = newCategory.rows[0].id;
          }
        }
        
        if (existingProduct.rows.length > 0) {
          // Update existing product
          await client.query(
            `UPDATE products
             SET name = $1, description = $2, price = $3, stock = $4, 
                 category_id = $5, brand = $6, updated_at = NOW()
             WHERE sku = $7`,
            [
              product.name,
              product.description,
              product.price,
              product.stock,
              categoryId,
              product.brand,
              product.sku
            ]
          );
          
          // Update product images if provided
          if (product.images && product.images.length > 0) {
            // Delete existing images
            await client.query(
              'DELETE FROM product_images WHERE product_id = $1',
              [existingProduct.rows[0].id]
            );
            
            // Add new images
            for (let i = 0; i < product.images.length; i++) {
              await client.query(
                `INSERT INTO product_images (product_id, image_url, display_order, created_at, updated_at)
                 VALUES ($1, $2, $3, NOW(), NOW())`,
                [existingProduct.rows[0].id, product.images[i], i + 1]
              );
            }
          }
          
          stats.updated++;
        } else {
          // Insert new product
          const newProduct = await client.query(
            `INSERT INTO products (sku, name, description, price, stock, category_id, brand, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
             RETURNING id`,
            [
              product.sku,
              product.name,
              product.description,
              product.price,
              product.stock,
              categoryId,
              product.brand
            ]
          );
          
          // Add product images if provided
          if (product.images && product.images.length > 0) {
            for (let i = 0; i < product.images.length; i++) {
              await client.query(
                `INSERT INTO product_images (product_id, image_url, display_order, created_at, updated_at)
                 VALUES ($1, $2, $3, NOW(), NOW())`,
                [newProduct.rows[0].id, product.images[i], i + 1]
              );
            }
          }
          
          stats.imported++;
        }
      } catch (error) {
        console.error('Error importing product:', error, product);
        stats.errors++;
      }
    }
    
    await client.query('COMMIT');
    return stats;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
