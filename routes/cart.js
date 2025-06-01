const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store',
  ssl: false,
});

// Cart page
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
    
    res.render('cart', {
      title: 'Shopping Cart',
      cartId: cartId,
      items: items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      error: req.query.error,
      success: req.query.success
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).send('Server error');
  }
});

// Checkout page
router.get('/checkout', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.userId) {
      return res.redirect('/login?redirect=/cart/checkout');
    }
    
    // Get cart
    const cartResult = await pool.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [req.session.userId]
    );
    
    if (cartResult.rows.length === 0) {
      return res.redirect('/cart?error=Cart not found');
    }
    
    const cartId = cartResult.rows[0].id;
    
    // Get cart items
    const cartItemsQuery = `
      SELECT ci.id, ci.quantity, ci.product_id,
             p.name, p.slug, p.price, p.discount_percentage, p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `;
    const cartItemsResult = await pool.query(cartItemsQuery, [cartId]);
    
    if (cartItemsResult.rows.length === 0) {
      return res.redirect('/cart?error=Cart is empty');
    }
    
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
    
    // Get user addresses
    const addressesQuery = `
      SELECT id, address_line1, address_line2, city, state, postal_code, country, is_default
      FROM user_addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
    `;
    const addressesResult = await pool.query(addressesQuery, [req.session.userId]);
    
    // Get user details
    const userQuery = `
      SELECT email, first_name, last_name, phone
      FROM users
      WHERE id = $1
    `;
    const userResult = await pool.query(userQuery, [req.session.userId]);
    
    res.render('checkout', {
      title: 'Checkout',
      cartId: cartId,
      items: items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      addresses: addressesResult.rows,
      user: userResult.rows[0],
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY || 'pk_test_your_test_key',
      error: req.query.error
    });
  } catch (error) {
    console.error('Error loading checkout:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
