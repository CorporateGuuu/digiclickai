const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { isAuthenticated } = require('../../middleware/auth');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store',
  ssl: false,
});

// Get cart items
router.get('/', async (req, res) => {
  try {
    let cartId;
    
    if (req.session.userId) {
      // Get cart for logged in user
      const cartResult = await pool.query(
        'SELECT id FROM carts WHERE user_id = $1',
        [req.session.userId]
      );
      
      if (cartResult.rows.length === 0) {
        // Create a new cart for the user
        const newCartResult = await pool.query(
          'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
          [req.session.userId]
        );
        
        cartId = newCartResult.rows[0].id;
      } else {
        cartId = cartResult.rows[0].id;
      }
    } else {
      // Use session cart ID for guest users
      cartId = req.session.cartId;
      
      if (!cartId) {
        // Create a new cart for the guest
        const newCartResult = await pool.query(
          'INSERT INTO carts (user_id) VALUES (NULL) RETURNING id'
        );
        
        cartId = newCartResult.rows[0].id;
        req.session.cartId = cartId;
      }
    }
    
    // Get cart items
    const cartItemsQuery = `
      SELECT ci.id, ci.quantity, ci.product_id,
             p.name, p.slug, p.price, p.discount_percentage, p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `;
    const cartItemsResult = await pool.query(cartItemsQuery, [cartId]);
    
    // Calculate totals
    let subtotal = 0;
    const items = cartItemsResult.rows.map(item => {
      const discountedPrice = item.price * (1 - (item.discount_percentage / 100));
      const itemTotal = discountedPrice * item.quantity;
      subtotal += itemTotal;
      
      return {
        ...item,
        price: parseFloat(item.price),
        discounted_price: parseFloat(discountedPrice.toFixed(2)),
        item_total: parseFloat(itemTotal.toFixed(2))
      };
    });
    
    res.json({
      success: true,
      cart_id: cartId,
      items: items,
      item_count: items.length,
      subtotal: parseFloat(subtotal.toFixed(2))
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart'
    });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Check if product exists
    const productResult = await pool.query(
      'SELECT id, price FROM products WHERE id = $1',
      [product_id]
    );
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    let cartId;
    
    if (req.session.userId) {
      // Get cart for logged in user
      const cartResult = await pool.query(
        'SELECT id FROM carts WHERE user_id = $1',
        [req.session.userId]
      );
      
      if (cartResult.rows.length === 0) {
        // Create a new cart for the user
        const newCartResult = await pool.query(
          'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
          [req.session.userId]
        );
        
        cartId = newCartResult.rows[0].id;
      } else {
        cartId = cartResult.rows[0].id;
      }
    } else {
      // Use session cart ID for guest users
      cartId = req.session.cartId;
      
      if (!cartId) {
        // Create a new cart for the guest
        const newCartResult = await pool.query(
          'INSERT INTO carts (user_id) VALUES (NULL) RETURNING id'
        );
        
        cartId = newCartResult.rows[0].id;
        req.session.cartId = cartId;
      }
    }
    
    // Check if item already exists in cart
    const existingItemResult = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, product_id]
    );
    
    if (existingItemResult.rows.length > 0) {
      // Update quantity of existing item
      const existingItem = existingItemResult.rows[0];
      const newQuantity = existingItem.quantity + parseInt(quantity);
      
      await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2',
        [newQuantity, existingItem.id]
      );
    } else {
      // Add new item to cart
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cartId, product_id, quantity]
      );
    }
    
    res.json({
      success: true,
      message: 'Item added to cart'
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart'
    });
  }
});

// Update cart item quantity
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    // Get cart ID
    let cartId;
    
    if (req.session.userId) {
      const cartResult = await pool.query(
        'SELECT id FROM carts WHERE user_id = $1',
        [req.session.userId]
      );
      
      if (cartResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }
      
      cartId = cartResult.rows[0].id;
    } else {
      cartId = req.session.cartId;
      
      if (!cartId) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }
    }
    
    // Update cart item
    const updateResult = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3 RETURNING id',
      [quantity, id, cartId]
    );
    
    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Cart item updated'
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart item'
    });
  }
});

// Remove item from cart
router.delete('/remove/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get cart ID
    let cartId;
    
    if (req.session.userId) {
      const cartResult = await pool.query(
        'SELECT id FROM carts WHERE user_id = $1',
        [req.session.userId]
      );
      
      if (cartResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }
      
      cartId = cartResult.rows[0].id;
    } else {
      cartId = req.session.cartId;
      
      if (!cartId) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }
    }
    
    // Remove cart item
    const deleteResult = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING id',
      [id, cartId]
    );
    
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing cart item'
    });
  }
});

// Clear cart
router.delete('/clear', async (req, res) => {
  try {
    // Get cart ID
    let cartId;
    
    if (req.session.userId) {
      const cartResult = await pool.query(
        'SELECT id FROM carts WHERE user_id = $1',
        [req.session.userId]
      );
      
      if (cartResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }
      
      cartId = cartResult.rows[0].id;
    } else {
      cartId = req.session.cartId;
      
      if (!cartId) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }
    }
    
    // Clear cart items
    await pool.query(
      'DELETE FROM cart_items WHERE cart_id = $1',
      [cartId]
    );
    
    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart'
    });
  }
});

module.exports = router;
