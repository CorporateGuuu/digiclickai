import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Helper function to execute SQL queries
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', { text, error });
    throw error;
  }
}

// Get all products with optional pagination
export async function getProducts(page = 1, limit = 20, categorySlug?: string) {
  const offset = (page - 1) * limit;
  
  let queryText = `
    SELECT p.*, c.name as category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
  `;
  
  const queryParams: any[] = [];
  
  // Add category filter if provided
  if (categorySlug) {
    queryText += `
      WHERE c.slug = $1
    `;
    queryParams.push(categorySlug);
  }
  
  // Add ordering and pagination
  queryText += `
    ORDER BY p.created_at DESC
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
  `;
  
  queryParams.push(limit, offset);
  
  const result = await query(queryText, queryParams);
  return result.rows;
}

// Get product by slug
export async function getProductBySlug(slug: string) {
  const productQuery = `
    SELECT p.*, c.name as category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = $1
  `;
  
  const productResult = await query(productQuery, [slug]);
  
  if (productResult.rows.length === 0) {
    return null;
  }
  
  const product = productResult.rows[0];
  
  // Get product specifications
  const specsQuery = `
    SELECT * FROM product_specifications
    WHERE product_id = $1
  `;
  const specsResult = await query(specsQuery, [product.id]);
  
  // Get product variants
  const variantsQuery = `
    SELECT * FROM product_variants
    WHERE product_id = $1
  `;
  const variantsResult = await query(variantsQuery, [product.id]);
  
  // Get product reviews
  const reviewsQuery = `
    SELECT r.*, u.first_name, u.last_name
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.product_id = $1
    ORDER BY r.created_at DESC
  `;
  const reviewsResult = await query(reviewsQuery, [product.id]);
  
  // Combine all data
  return {
    ...product,
    specifications: specsResult.rows[0] || {},
    variants: variantsResult.rows,
    reviews: reviewsResult.rows
  };
}

// Get all categories
export async function getCategories() {
  const queryText = `
    SELECT c.*, 
           (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
    FROM categories c
    ORDER BY c.name
  `;
  
  const result = await query(queryText);
  return result.rows;
}

// Get category by slug
export async function getCategoryBySlug(slug: string) {
  const queryText = `
    SELECT c.*, 
           (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
    FROM categories c
    WHERE c.slug = $1
  `;
  
  const result = await query(queryText, [slug]);
  return result.rows[0] || null;
}

// Search products
export async function searchProducts(searchTerm: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const queryText = `
    SELECT p.*, c.name as category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 
      p.name ILIKE $1 OR 
      p.description ILIKE $1 OR
      c.name ILIKE $1
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  
  const result = await query(queryText, [`%${searchTerm}%`, limit, offset]);
  return result.rows;
}

// Get featured products
export async function getFeaturedProducts(limit = 8) {
  const queryText = `
    SELECT p.*, c.name as category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_featured = true
    ORDER BY p.created_at DESC
    LIMIT $1
  `;
  
  const result = await query(queryText, [limit]);
  return result.rows;
}

// Get new products
export async function getNewProducts(limit = 8) {
  const queryText = `
    SELECT p.*, c.name as category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_new = true
    ORDER BY p.created_at DESC
    LIMIT $1
  `;
  
  const result = await query(queryText, [limit]);
  return result.rows;
}

// Export the pool for direct access if needed
export default pool;
