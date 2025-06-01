const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { isAuthenticated } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/security');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store',
  ssl: false,
});

// Get user's wishlist
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Get or create user's wishlist
    let wishlistId;
    const wishlistQuery = 'SELECT id FROM wishlists WHERE user_id = $1';
    const wishlistResult = await pool.query(wishlistQuery, [userId]);
    
    if (wishlistResult.rows.length === 0) {
      // Create a new wishlist
      const newWishlistQuery = 'INSERT INTO wishlists (user_id) VALUES ($1) RETURNING id';
      const newWishlistResult = await pool.query(newWishlistQuery, [userId]);
      wishlistId = newWishlistResult.rows[0].id;
    } else {
      wishlistId = wishlistResult.rows[0].id;
    }
    
    // Get wishlist items
    const itemsQuery = `
      SELECT wi.id, wi.added_at,
             p.id as product_id, p.name, p.slug, p.price, p.discount_percentage, p.image_url,
             c.name as category_name
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE wi.wishlist_id = $1
      ORDER BY wi.added_at DESC
    `;
    const itemsResult = await pool.query(itemsQuery, [wishlistId]);
    
    // Format items with discounted price
    const items = itemsResult.rows.map(item => {
      const discountedPrice = item.price * (1 - (item.discount_percentage / 100));
      return {
        ...item,
        price: parseFloat(item.price),
        discounted_price: parseFloat(discountedPrice.toFixed(2))
      };
    });
    
    res.json({
      success: true,
      wishlist_id: wishlistId,
      items: items
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist'
    });
  }
});

// Add item to wishlist
router.post('/add', isAuthenticated, apiLimiter, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.session.userId;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Check if product exists
    const productQuery = 'SELECT id FROM products WHERE id = $1';
    const productResult = await pool.query(productQuery, [productId]);
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Get or create user's wishlist
    let wishlistId;
    const wishlistQuery = 'SELECT id FROM wishlists WHERE user_id = $1';
    const wishlistResult = await pool.query(wishlistQuery, [userId]);
    
    if (wishlistResult.rows.length === 0) {
      // Create a new wishlist
      const newWishlistQuery = 'INSERT INTO wishlists (user_id) VALUES ($1) RETURNING id';
      const newWishlistResult = await pool.query(newWishlistQuery, [userId]);
      wishlistId = newWishlistResult.rows[0].id;
    } else {
      wishlistId = wishlistResult.rows[0].id;
    }
    
    // Check if item already exists in wishlist
    const existingItemQuery = `
      SELECT id FROM wishlist_items
      WHERE wishlist_id = $1 AND product_id = $2
    `;
    const existingItemResult = await pool.query(existingItemQuery, [wishlistId, productId]);
    
    if (existingItemResult.rows.length > 0) {
      return res.json({
        success: true,
        message: 'Item already in wishlist'
      });
    }
    
    // Add item to wishlist
    const addItemQuery = `
      INSERT INTO wishlist_items (wishlist_id, product_id)
      VALUES ($1, $2)
      RETURNING id
    `;
    await pool.query(addItemQuery, [wishlistId, productId]);
    
    res.json({
      success: true,
      message: 'Item added to wishlist'
    });
  } catch (error) {
    console.error('Error adding item to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to wishlist'
    });
  }
});

// Remove item from wishlist
router.delete('/remove/:itemId', isAuthenticated, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.session.userId;
    
    // Get user's wishlist
    const wishlistQuery = 'SELECT id FROM wishlists WHERE user_id = $1';
    const wishlistResult = await pool.query(wishlistQuery, [userId]);
    
    if (wishlistResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    const wishlistId = wishlistResult.rows[0].id;
    
    // Remove item from wishlist
    const removeItemQuery = `
      DELETE FROM wishlist_items
      WHERE id = $1 AND wishlist_id = $2
      RETURNING id
    `;
    const removeResult = await pool.query(removeItemQuery, [itemId, wishlistId]);
    
    if (removeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist'
      });
    }
    
    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing item from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing item from wishlist'
    });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', isAuthenticated, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.session.userId;
    
    // Get user's wishlist
    const wishlistQuery = 'SELECT id FROM wishlists WHERE user_id = $1';
    const wishlistResult = await pool.query(wishlistQuery, [userId]);
    
    if (wishlistResult.rows.length === 0) {
      return res.json({
        success: true,
        inWishlist: false
      });
    }
    
    const wishlistId = wishlistResult.rows[0].id;
    
    // Check if product is in wishlist
    const checkQuery = `
      SELECT id FROM wishlist_items
      WHERE wishlist_id = $1 AND product_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [wishlistId, productId]);
    
    res.json({
      success: true,
      inWishlist: checkResult.rows.length > 0,
      wishlistItemId: checkResult.rows.length > 0 ? checkResult.rows[0].id : null
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking wishlist'
    });
  }
});

// Clear wishlist
router.delete('/clear', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Get user's wishlist
    const wishlistQuery = 'SELECT id FROM wishlists WHERE user_id = $1';
    const wishlistResult = await pool.query(wishlistQuery, [userId]);
    
    if (wishlistResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    const wishlistId = wishlistResult.rows[0].id;
    
    // Clear wishlist
    await pool.query('DELETE FROM wishlist_items WHERE wishlist_id = $1', [wishlistId]);
    
    res.json({
      success: true,
      message: 'Wishlist cleared'
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing wishlist'
    });
  }
});

module.exports = router;
