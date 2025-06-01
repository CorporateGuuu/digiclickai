const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store',
  ssl: false,
});

/**
 * Get related products based on category, brand, and price range
 * @param {number} productId - The ID of the current product
 * @param {number} limit - Maximum number of related products to return
 * @returns {Promise<Array>} - Array of related products
 */
async function getRelatedProducts(productId, limit = 4) {
  try {
    // Get current product details
    const productQuery = `
      SELECT id, name, category_id, brand, price
      FROM products
      WHERE id = $1
    `;
    const productResult = await pool.query(productQuery, [productId]);
    
    if (productResult.rows.length === 0) {
      throw new Error('Product not found');
    }
    
    const product = productResult.rows[0];
    
    // Calculate price range (±30% of current product price)
    const minPrice = product.price * 0.7;
    const maxPrice = product.price * 1.3;
    
    // Query for related products
    const relatedQuery = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id != $1
        AND (
          -- Same category
          p.category_id = $2
          OR
          -- Same brand
          (p.brand = $3 AND p.price BETWEEN $4 AND $5)
        )
      ORDER BY
        -- Prioritize products that match both category and brand
        CASE WHEN p.category_id = $2 AND p.brand = $3 THEN 1
             WHEN p.category_id = $2 THEN 2
             WHEN p.brand = $3 THEN 3
             ELSE 4
        END,
        -- Then by price similarity
        ABS(p.price - $6)
      LIMIT $7
    `;
    
    const relatedResult = await pool.query(relatedQuery, [
      productId,
      product.category_id,
      product.brand,
      minPrice,
      maxPrice,
      product.price,
      limit
    ]);
    
    // If we don't have enough related products, get more based on category only
    if (relatedResult.rows.length < limit) {
      const remainingLimit = limit - relatedResult.rows.length;
      
      const additionalQuery = `
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id != $1
          AND p.id NOT IN (${relatedResult.rows.map(p => p.id).join(',') || '0'})
          AND p.category_id = $2
        ORDER BY p.is_featured DESC, p.created_at DESC
        LIMIT $3
      `;
      
      const additionalResult = await pool.query(additionalQuery, [
        productId,
        product.category_id,
        remainingLimit
      ]);
      
      return [...relatedResult.rows, ...additionalResult.rows];
    }
    
    return relatedResult.rows;
  } catch (error) {
    console.error('Error getting related products:', error);
    return [];
  }
}

module.exports = {
  getRelatedProducts
};
