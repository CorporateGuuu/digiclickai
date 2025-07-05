const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store',
  ssl: false,
});

// Search page
router.get('/', async (req, res) => {
  try {
    const { q, category, brand, min_price, max_price, sort } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Build search query
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Search term
    if (q) {
      query += `
        AND (
          p.name ILIKE $${paramIndex} 
          OR p.description ILIKE $${paramIndex}
          OR p.brand ILIKE $${paramIndex}
          OR c.name ILIKE $${paramIndex}
        )
      `;
      queryParams.push(`%${q}%`);
      paramIndex++;
    }
    
    // Category filter
    if (category) {
      query += ` AND c.slug = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }
    
    // Brand filter
    if (brand) {
      query += ` AND p.brand ILIKE $${paramIndex}`;
      queryParams.push(`%${brand}%`);
      paramIndex++;
    }
    
    // Price range filter
    if (min_price) {
      query += ` AND p.price >= $${paramIndex}`;
      queryParams.push(parseFloat(min_price));
      paramIndex++;
    }
    
    if (max_price) {
      query += ` AND p.price <= $${paramIndex}`;
      queryParams.push(parseFloat(max_price));
      paramIndex++;
    }
    
    // Sorting
    if (sort) {
      switch (sort) {
        case 'price_asc':
          query += ` ORDER BY p.price ASC`;
          break;
        case 'price_desc':
          query += ` ORDER BY p.price DESC`;
          break;
        case 'newest':
          query += ` ORDER BY p.created_at DESC`;
          break;
        case 'name_asc':
          query += ` ORDER BY p.name ASC`;
          break;
        default:
          // Default sort by relevance (if search term provided) or newest
          if (q) {
            query += `
              ORDER BY 
                CASE 
                  WHEN p.name ILIKE $${paramIndex} THEN 1
                  WHEN p.brand ILIKE $${paramIndex} THEN 2
                  WHEN c.name ILIKE $${paramIndex} THEN 3
                  ELSE 4
                END,
                p.is_featured DESC,
                p.created_at DESC
            `;
            queryParams.push(`%${q}%`);
            paramIndex++;
          } else {
            query += ` ORDER BY p.is_featured DESC, p.created_at DESC`;
          }
      }
    } else {
      // Default sort
      if (q) {
        query += `
          ORDER BY 
            CASE 
              WHEN p.name ILIKE $${paramIndex} THEN 1
              WHEN p.brand ILIKE $${paramIndex} THEN 2
              WHEN c.name ILIKE $${paramIndex} THEN 3
              ELSE 4
            END,
            p.is_featured DESC,
            p.created_at DESC
        `;
        queryParams.push(`%${q}%`);
        paramIndex++;
      } else {
        query += ` ORDER BY p.is_featured DESC, p.created_at DESC`;
      }
    }
    
    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    
    // Execute query
    const productsResult = await pool.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    
    // Reset param index for count query
    paramIndex = 1;
    const countParams = [];
    
    // Search term
    if (q) {
      countQuery += `
        AND (
          p.name ILIKE $${paramIndex} 
          OR p.description ILIKE $${paramIndex}
          OR p.brand ILIKE $${paramIndex}
          OR c.name ILIKE $${paramIndex}
        )
      `;
      countParams.push(`%${q}%`);
      paramIndex++;
    }
    
    // Category filter
    if (category) {
      countQuery += ` AND c.slug = $${paramIndex}`;
      countParams.push(category);
      paramIndex++;
    }
    
    // Brand filter
    if (brand) {
      countQuery += ` AND p.brand ILIKE $${paramIndex}`;
      countParams.push(`%${brand}%`);
      paramIndex++;
    }
    
    // Price range filter
    if (min_price) {
      countQuery += ` AND p.price >= $${paramIndex}`;
      countParams.push(parseFloat(min_price));
      paramIndex++;
    }
    
    if (max_price) {
      countQuery += ` AND p.price <= $${paramIndex}`;
      countParams.push(parseFloat(max_price));
      paramIndex++;
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const totalProducts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalProducts / limit);
    
    // Get all categories for filter
    const categoriesQuery = `
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name
    `;
    const categoriesResult = await pool.query(categoriesQuery);
    
    // Get all brands for filter
    const brandsQuery = `
      SELECT DISTINCT brand, COUNT(*) as product_count
      FROM products
      WHERE brand IS NOT NULL AND brand != ''
      GROUP BY brand
      ORDER BY brand
    `;
    const brandsResult = await pool.query(brandsQuery);
    
    // Get price range for filter
    const priceRangeQuery = `
      SELECT MIN(price) as min_price, MAX(price) as max_price
      FROM products
    `;
    const priceRangeResult = await pool.query(priceRangeQuery);
    
    res.render('search', {
      title: q ? `Search results for "${q}"` : 'Search Products',
      metaDescription: q ? `Search results for "${q}" - Find the best products at Phone Electronics Store` : 'Search for phones, tablets, and electronics at Phone Electronics Store',
      products: productsResult.rows,
      query: q || '',
      filters: {
        category,
        brand,
        min_price: min_price || '',
        max_price: max_price || '',
        sort: sort || 'relevance'
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts
      },
      categories: categoriesResult.rows,
      brands: brandsResult.rows,
      priceRange: priceRangeResult.rows[0] || { min_price: 0, max_price: 1000 }
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
