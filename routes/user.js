const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { isAuthenticated } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/security');
const bcrypt = require('bcrypt');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store',
  ssl: false,
});

// User profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    // Get user details
    const userQuery = `
      SELECT id, email, first_name, last_name, phone, created_at
      FROM users
      WHERE id = $1
    `;
    const userResult = await pool.query(userQuery, [req.session.userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).render('404', { message: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get user addresses
    const addressesQuery = `
      SELECT id, address_line1, address_line2, city, state, postal_code, country, is_default
      FROM user_addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
    `;
    const addressesResult = await pool.query(addressesQuery, [req.session.userId]);

    res.render('user/profile', {
      title: 'My Profile',
      user: user,
      addresses: addressesResult.rows
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('Server error');
  }
});

// Update profile
router.post('/profile', isAuthenticated, async (req, res) => {
  try {
    const { first_name, last_name, phone, current_password, new_password, confirm_password } = req.body;

    // Start a transaction
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update basic info
      await client.query(
        `UPDATE users SET
         first_name = $1,
         last_name = $2,
         phone = $3,
         updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [first_name, last_name, phone, req.session.userId]
      );

      // Update password if provided
      if (current_password && new_password && confirm_password) {
        if (new_password !== confirm_password) {
          throw new Error('New passwords do not match');
        }

        // Verify current password
        const userResult = await client.query(
          'SELECT password_hash FROM users WHERE id = $1',
          [req.session.userId]
        );

        const passwordMatch = await bcrypt.compare(current_password, userResult.rows[0].password_hash);

        if (!passwordMatch) {
          throw new Error('Current password is incorrect');
        }

        // Update password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        await client.query(
          `UPDATE users SET
           password_hash = $1,
           updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [hashedPassword, req.session.userId]
        );
      }

      await client.query('COMMIT');

      res.redirect('/user/profile?success=Profile updated successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.redirect(`/user/profile?error=${encodeURIComponent(error.message || 'Error updating profile')}`);
  }
});

// Address management
router.get('/addresses', isAuthenticated, async (req, res) => {
  try {
    // Get user addresses
    const addressesQuery = `
      SELECT id, address_line1, address_line2, city, state, postal_code, country, is_default
      FROM user_addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
    `;
    const addressesResult = await pool.query(addressesQuery, [req.session.userId]);

    res.render('user/addresses', {
      title: 'My Addresses',
      addresses: addressesResult.rows
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).send('Server error');
  }
});

// Add/Edit address form
router.get('/addresses/edit/:id?', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    if (id) {
      // Edit existing address
      const addressQuery = `
        SELECT id, address_line1, address_line2, city, state, postal_code, country, is_default
        FROM user_addresses
        WHERE id = $1 AND user_id = $2
      `;
      const addressResult = await pool.query(addressQuery, [id, req.session.userId]);

      if (addressResult.rows.length === 0) {
        return res.status(404).render('404', { message: 'Address not found' });
      }

      res.render('user/address-form', {
        title: 'Edit Address',
        address: addressResult.rows[0],
        isNew: false
      });
    } else {
      // Add new address
      res.render('user/address-form', {
        title: 'Add Address',
        address: {},
        isNew: true
      });
    }
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).send('Server error');
  }
});

// Save address (add or update)
router.post('/addresses/save', isAuthenticated, async (req, res) => {
  try {
    const {
      id,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      is_default
    } = req.body;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // If setting as default, unset any existing default
      if (is_default === 'on') {
        await client.query(
          'UPDATE user_addresses SET is_default = false WHERE user_id = $1',
          [req.session.userId]
        );
      }

      if (id) {
        // Update existing address
        await client.query(
          `UPDATE user_addresses SET
           address_line1 = $1,
           address_line2 = $2,
           city = $3,
           state = $4,
           postal_code = $5,
           country = $6,
           is_default = $7,
           updated_at = CURRENT_TIMESTAMP
           WHERE id = $8 AND user_id = $9`,
          [
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            is_default === 'on',
            id,
            req.session.userId
          ]
        );
      } else {
        // Insert new address
        await client.query(
          `INSERT INTO user_addresses
           (user_id, address_line1, address_line2, city, state, postal_code, country, is_default)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            req.session.userId,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            is_default === 'on'
          ]
        );
      }

      await client.query('COMMIT');

      res.redirect('/user/addresses');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving address:', error);
    res.status(500).send('Server error');
  }
});

// Delete address
router.post('/addresses/delete/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2',
      [id, req.session.userId]
    );

    res.redirect('/user/addresses');
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).send('Server error');
  }
});

// Order history
router.get('/orders', isAuthenticated, async (req, res) => {
  try {
    // Get user orders
    const ordersQuery = `
      SELECT id, total_amount, status, created_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const ordersResult = await pool.query(ordersQuery, [req.session.userId]);

    res.render('user/orders', {
      title: 'My Orders',
      orders: ordersResult.rows
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Server error');
  }
});

// Order details
router.get('/orders/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Get order details
    const orderQuery = `
      SELECT o.*,
             a.address_line1, a.address_line2, a.city, a.state, a.postal_code, a.country
      FROM orders o
      LEFT JOIN user_addresses a ON o.address_id = a.id
      WHERE o.id = $1 AND o.user_id = $2
    `;
    const orderResult = await pool.query(orderQuery, [id, req.session.userId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).render('404', { message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsQuery = `
      SELECT oi.*, p.name, p.slug, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `;
    const itemsResult = await pool.query(itemsQuery, [id]);

    res.render('user/order-detail', {
      title: `Order #${id}`,
      order: order,
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).send('Server error');
  }
});

// Wishlist page
router.get('/wishlist', isAuthenticated, async (req, res) => {
  try {
    res.render('user/wishlist', {
      title: 'My Wishlist'
    });
  } catch (error) {
    console.error('Error loading wishlist page:', error);
    res.status(500).send('Server error');
  }
});

// Order confirmation
router.get('/orders/:id/confirmation', async (req, res) => {
  try {
    const { id } = req.params;

    // Get order details
    const orderQuery = `
      SELECT o.*,
             u.email, u.first_name, u.last_name,
             a.address_line1, a.address_line2, a.city, a.state, a.postal_code, a.country
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN user_addresses a ON o.address_id = a.id
      WHERE o.id = $1
    `;
    const orderResult = await pool.query(orderQuery, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).render('404', { message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Check if user is authorized to view this order
    if (order.user_id && req.session.userId !== order.user_id) {
      return res.status(403).render('403', {
        message: 'You are not authorized to view this order'
      });
    }

    // Get order items
    const itemsQuery = `
      SELECT oi.*, p.name, p.slug, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `;
    const itemsResult = await pool.query(itemsQuery, [id]);

    res.render('user/order-confirmation', {
      title: 'Order Confirmation',
      order: order,
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Error fetching order confirmation:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
