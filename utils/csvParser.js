const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');
const path = require('path');
const slugify = require('../utils/slugify');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store',
  ssl: false,
});

/**
 * Parse a CSV file and insert products into the database
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<{success: boolean, message: string, count: number}>}
 */
const parseProductsCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    let errorCount = 0;
    let successCount = 0;
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          // Start a transaction
          const client = await pool.connect();
          try {
            await client.query('BEGIN');
            
            for (const row of results) {
              try {
                // Validate required fields
                if (!row.name || !row.price) {
                  errorCount++;
                  console.error(`Skipping row due to missing required fields: ${JSON.stringify(row)}`);
                  continue;
                }
                
                // Generate slug if not provided
                const slug = row.slug || slugify(row.name);
                
                // Check if product with this slug already exists
                const existingProduct = await client.query(
                  'SELECT id FROM products WHERE slug = $1',
                  [slug]
                );
                
                if (existingProduct.rows.length > 0) {
                  // Update existing product
                  const productId = existingProduct.rows[0].id;
                  
                  await client.query(
                    `UPDATE products SET 
                     name = $1, 
                     sku = $2, 
                     description = $3, 
                     price = $4, 
                     discount_percentage = $5, 
                     stock_quantity = $6, 
                     is_featured = $7, 
                     is_new = $8, 
                     image_url = $9, 
                     brand = $10, 
                     category_id = (SELECT id FROM categories WHERE name = $11 OR slug = $11 LIMIT 1),
                     updated_at = CURRENT_TIMESTAMP
                     WHERE id = $12`,
                    [
                      row.name,
                      row.sku || null,
                      row.description || null,
                      parseFloat(row.price) || 0,
                      parseFloat(row.discount_percentage) || 0,
                      parseInt(row.stock_quantity) || 0,
                      row.is_featured === 'true' || row.is_featured === '1' || false,
                      row.is_new === 'true' || row.is_new === '1' || false,
                      row.image_url || null,
                      row.brand || null,
                      row.category || null,
                      productId
                    ]
                  );
                  
                  // Update specifications if they exist
                  if (row.display || row.processor || row.memory || row.storage || 
                      row.camera || row.battery || row.connectivity || row.operating_system) {
                    
                    const existingSpecs = await client.query(
                      'SELECT id FROM product_specifications WHERE product_id = $1',
                      [productId]
                    );
                    
                    if (existingSpecs.rows.length > 0) {
                      // Update existing specifications
                      await client.query(
                        `UPDATE product_specifications SET 
                         display = $1, 
                         processor = $2, 
                         memory = $3, 
                         storage = $4, 
                         camera = $5, 
                         battery = $6, 
                         connectivity = $7, 
                         operating_system = $8
                         WHERE product_id = $9`,
                        [
                          row.display || null,
                          row.processor || null,
                          row.memory || null,
                          row.storage || null,
                          row.camera || null,
                          row.battery || null,
                          row.connectivity || null,
                          row.operating_system || null,
                          productId
                        ]
                      );
                    } else {
                      // Insert new specifications
                      await client.query(
                        `INSERT INTO product_specifications 
                         (product_id, display, processor, memory, storage, camera, battery, connectivity, operating_system)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                        [
                          productId,
                          row.display || null,
                          row.processor || null,
                          row.memory || null,
                          row.storage || null,
                          row.camera || null,
                          row.battery || null,
                          row.connectivity || null,
                          row.operating_system || null
                        ]
                      );
                    }
                  }
                  
                } else {
                  // Insert new product
                  const result = await client.query(
                    `INSERT INTO products 
                     (name, slug, sku, description, price, discount_percentage, stock_quantity, 
                      is_featured, is_new, image_url, brand, category_id)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 
                      (SELECT id FROM categories WHERE name = $12 OR slug = $12 LIMIT 1))
                     RETURNING id`,
                    [
                      row.name,
                      slug,
                      row.sku || null,
                      row.description || null,
                      parseFloat(row.price) || 0,
                      parseFloat(row.discount_percentage) || 0,
                      parseInt(row.stock_quantity) || 0,
                      row.is_featured === 'true' || row.is_featured === '1' || false,
                      row.is_new === 'true' || row.is_new === '1' || false,
                      row.image_url || null,
                      row.brand || null,
                      row.category || null
                    ]
                  );
                  
                  const productId = result.rows[0].id;
                  
                  // Insert specifications if they exist
                  if (row.display || row.processor || row.memory || row.storage || 
                      row.camera || row.battery || row.connectivity || row.operating_system) {
                    
                    await client.query(
                      `INSERT INTO product_specifications 
                       (product_id, display, processor, memory, storage, camera, battery, connectivity, operating_system)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                      [
                        productId,
                        row.display || null,
                        row.processor || null,
                        row.memory || null,
                        row.storage || null,
                        row.camera || null,
                        row.battery || null,
                        row.connectivity || null,
                        row.operating_system || null
                      ]
                    );
                  }
                }
                
                successCount++;
              } catch (err) {
                errorCount++;
                console.error(`Error processing row: ${JSON.stringify(row)}`, err);
              }
            }
            
            await client.query('COMMIT');
            
            resolve({
              success: true,
              message: `CSV processed successfully. ${successCount} products imported, ${errorCount} errors.`,
              count: successCount
            });
          } catch (err) {
            await client.query('ROLLBACK');
            reject({
              success: false,
              message: `Transaction failed: ${err.message}`,
              error: err
            });
          } finally {
            client.release();
          }
        } catch (err) {
          reject({
            success: false,
            message: `Database connection failed: ${err.message}`,
            error: err
          });
        }
      })
      .on('error', (err) => {
        reject({
          success: false,
          message: `CSV parsing failed: ${err.message}`,
          error: err
        });
      });
  });
};

module.exports = {
  parseProductsCSV
};
