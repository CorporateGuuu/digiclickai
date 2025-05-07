import { Pool } from 'pg';
import supabase from './supabase';

// Create a PostgreSQL connection pool
let pool;

try {
  // Use Supabase connection if available, otherwise fall back to direct PostgreSQL connection
  const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('No database connection string provided');
  }

  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Test the connection
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  console.log('Database connection pool created successfully');
} catch (error) {
  console.error('Failed to create database connection pool:', error);

  // Create a mock pool for development/testing when DB is not available
  pool = {
    query: async () => {
      console.warn('Using mock database response');
      return { rows: [], rowCount: 0 };
    },
    on: () => { },
  };
}

// Export the pool for direct access
export { pool };

// Helper function to execute SQL queries
export async function query(text, params) {
  const start = Date.now();
  let client;

  try {
    // Get a client from the pool
    client = await pool.connect();

    // Execute the query
    const res = await client.query(text, params);
    // const duration = Date.now() - start;

    // console.log('Executed query', {
    //   text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    //   duration: Date.now() - start,
    //   rows: res.rowCount
    // });

    return res;
  } catch (error) {
    console.error('Error executing query', {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      error: error.message
    });

    // Provide more context for the error
    const enhancedError = new Error(`Database query failed: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.query = text;
    enhancedError.params = params;

    throw enhancedError;
  } finally {
    // Release the client back to the pool
    if (client) client.release();
  }
}

// Get all products with optional pagination
export async function getProducts(page = 1, limit = 20, categorySlug) {
  try {
    // Try to use Supabase first if available
    if (supabase) {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories:category_id (name)
        `)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Add category filter if provided
      if (categorySlug) {
        query = query.eq('categories.slug', categorySlug);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Format the products
      return data.map(product => ({
        ...product,
        category_name: product.categories?.name,
        price: parseFloat(product.price),
        discount_percentage: parseFloat(product.discount_percentage || 0),
        discounted_price: product.discount_percentage
          ? parseFloat((product.price * (1 - product.discount_percentage / 100)).toFixed(2))
          : parseFloat(product.price)
      }));
    }

    // Fall back to direct PostgreSQL query if Supabase is not available
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;

    const queryParams = [];

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

    // Format the products
    return result.rows.map(product => ({
      ...product,
      price: parseFloat(product.price),
      discount_percentage: parseFloat(product.discount_percentage || 0),
      discounted_price: product.discount_percentage
        ? parseFloat((product.price * (1 - product.discount_percentage / 100)).toFixed(2))
        : parseFloat(product.price)
    }));
  } catch (error) {
    console.error('Error fetching products:', error);

    // Return mock data in case of error
    return Array(limit).fill(0).map((_, i) => ({
      id: i + 1,
      name: `Sample Product ${i + 1}`,
      slug: `sample-product-${i + 1}`,
      description: 'This is a sample product description.',
      price: 99.99,
      discount_percentage: i % 3 === 0 ? 10 : 0,
      stock_quantity: 100,
      category_id: 1,
      category_name: categorySlug ? categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Sample Category',
      image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }
}

// Get product by slug
export async function getProductBySlug(slug) {
  try {
    // Try to use Supabase first if available
    if (supabase) {
      // Get product data
      const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id (name)
        `)
        .eq('slug', slug)
        .single();

      if (productError) {
        throw productError;
      }

      if (!product) {
        return null;
      }

      // Get product specifications
      const { data: specs, error: specsError } = await supabase
        .from('product_specifications')
        .select('*')
        .eq('product_id', product.id)
        .single();

      if (specsError && specsError.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
        throw specsError;
      }

      // Combine all data and format
      return {
        ...product,
        category_name: product.categories?.name,
        price: parseFloat(product.price),
        discount_percentage: parseFloat(product.discount_percentage || 0),
        discounted_price: product.discount_percentage
          ? parseFloat((product.price * (1 - product.discount_percentage / 100)).toFixed(2))
          : parseFloat(product.price),
        specifications: specs || {}
      };
    }

    // Fall back to direct PostgreSQL query if Supabase is not available
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

    // Combine all data and format
    return {
      ...product,
      price: parseFloat(product.price),
      discount_percentage: parseFloat(product.discount_percentage || 0),
      discounted_price: product.discount_percentage
        ? parseFloat((product.price * (1 - product.discount_percentage / 100)).toFixed(2))
        : parseFloat(product.price),
      specifications: specsResult.rows[0] || {}
    };
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);

    // Return mock data in case of error
    return {
      id: 1,
      name: `Sample Product (${slug})`,
      slug: slug,
      description: 'This is a sample product description. The actual product could not be loaded.',
      price: 99.99,
      discount_percentage: 0,
      stock_quantity: 100,
      category_id: 1,
      category_name: 'Sample Category',
      image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      specifications: {}
    };
  }
}

// Get all categories
export async function getCategories() {
  try {
    // Try to use Supabase first if available
    if (supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products:products(count)
        `)
        .order('name');

      if (error) {
        throw error;
      }

      return data.map(category => ({
        ...category,
        product_count: category.products?.count || 0
      }));
    }

    // Fall back to direct PostgreSQL query if Supabase is not available
    const queryText = `
      SELECT c.*,
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c
      ORDER BY c.name
    `;

    const result = await query(queryText);
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch categories:', error);

    // Return fallback data in case of database error
    return [
      { id: 1, name: 'iPhone Parts', slug: 'iphone-parts', product_count: 0 },
      { id: 2, name: 'Samsung Parts', slug: 'samsung-parts', product_count: 0 },
      { id: 3, name: 'iPad Parts', slug: 'ipad-parts', product_count: 0 },
      { id: 4, name: 'MacBook Parts', slug: 'macbook-parts', product_count: 0 },
      { id: 5, name: 'Repair Tools', slug: 'repair-tools', product_count: 0 }
    ];
  }
}

// Get category by slug
export async function getCategoryBySlug(slug) {
  try {
    // Try to use Supabase first if available
    if (supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products:products(count)
        `)
        .eq('slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        ...data,
        product_count: data.products?.count || 0
      };
    }

    // Fall back to direct PostgreSQL query if Supabase is not available
    const queryText = `
      SELECT c.*,
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c
      WHERE c.slug = $1
    `;

    const result = await query(queryText, [slug]);
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Failed to fetch category with slug ${slug}:`, error);

    // Return fallback data based on the slug
    const fallbackCategories = {
      'iphone-parts': { id: 1, name: 'iPhone Parts', slug: 'iphone-parts', product_count: 0 },
      'samsung-parts': { id: 2, name: 'Samsung Parts', slug: 'samsung-parts', product_count: 0 },
      'ipad-parts': { id: 3, name: 'iPad Parts', slug: 'ipad-parts', product_count: 0 },
      'macbook-parts': { id: 4, name: 'MacBook Parts', slug: 'macbook-parts', product_count: 0 },
      'repair-tools': { id: 5, name: 'Repair Tools', slug: 'repair-tools', product_count: 0 }
    };

    return fallbackCategories[slug] || null;
  }
}

// Get featured products
export async function getFeaturedProducts(limit = 8) {
  try {
    // Try to use Supabase first if available
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id (name)
        `)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      // Format the products
      return data.map(product => ({
        ...product,
        category_name: product.categories?.name,
        price: parseFloat(product.price),
        discount_percentage: parseFloat(product.discount_percentage || 0),
        discounted_price: product.discount_percentage
          ? parseFloat((product.price * (1 - product.discount_percentage / 100)).toFixed(2))
          : parseFloat(product.price)
      }));
    }

    // Fall back to direct PostgreSQL query if Supabase is not available
    const queryText = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = true
      ORDER BY p.created_at DESC
      LIMIT $1
    `;

    const result = await query(queryText, [limit]);

    // Format the products
    return result.rows.map(product => ({
      ...product,
      price: parseFloat(product.price),
      discount_percentage: parseFloat(product.discount_percentage || 0),
      discounted_price: product.discount_percentage
        ? parseFloat((product.price * (1 - product.discount_percentage / 100)).toFixed(2))
        : parseFloat(product.price)
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);

    // Return mock data in case of error
    return Array(limit).fill(0).map((_, i) => ({
      id: i + 1,
      name: `Featured Product ${i + 1}`,
      slug: `featured-product-${i + 1}`,
      description: 'This is a featured product description.',
      price: 149.99,
      discount_percentage: i % 2 === 0 ? 15 : 0,
      stock_quantity: 50,
      category_id: (i % 5) + 1,
      category_name: ['iPhone Parts', 'Samsung Parts', 'iPad Parts', 'MacBook Parts', 'Repair Tools'][i % 5],
      image_url: null,
      is_featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }
}

// Export the pool and functions for direct access if needed
export default {
  pool,
  query,
  getProducts,
  getProductBySlug,
  getCategories,
  getCategoryBySlug,
  getFeaturedProducts
};
