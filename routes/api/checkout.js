const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { isAuthenticated } = require('../../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key');
const { sendOrderConfirmation } = require('../../utils/email');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store',
  ssl: false,
});

// Create checkout session
router.post('/create-session', async (req, res) => {
  try {
    const { address_id } = req.body;

    // Get cart ID
    let cartId;
    let userId = req.session.userId;

    if (userId) {
      const cartResult = await pool.query(
        'SELECT id FROM carts WHERE user_id = $1',
        [userId]
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
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Calculate totals and prepare line items for Stripe
    let subtotal = 0;
    const lineItems = cartItemsResult.rows.map(item => {
      const discountedPrice = item.price * (1 - (item.discount_percentage / 100));
      const itemTotal = discountedPrice * item.quantity;
      subtotal += itemTotal;

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: [item.image_url]
          },
          unit_amount: Math.round(discountedPrice * 100) // Stripe uses cents
        },
        quantity: item.quantity
      };
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/cart`,
      metadata: {
        cart_id: cartId,
        user_id: userId || '',
        address_id: address_id || ''
      }
    });

    res.json({
      success: true,
      session_id: session.id,
      checkout_url: session.url
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating checkout session'
    });
  }
});

// Process successful checkout
router.get('/success', async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.redirect('/cart?error=Invalid session');
    }

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || session.payment_status !== 'paid') {
      return res.redirect('/cart?error=Payment not completed');
    }

    const cartId = session.metadata.cart_id;
    const userId = session.metadata.user_id || null;
    const addressId = session.metadata.address_id || null;

    // Get cart items
    const cartItemsQuery = `
      SELECT ci.id, ci.quantity, ci.product_id,
             p.name, p.slug, p.price, p.discount_percentage
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `;
    const cartItemsResult = await pool.query(cartItemsQuery, [cartId]);

    if (cartItemsResult.rows.length === 0) {
      return res.redirect('/cart?error=Cart is empty');
    }

    // Calculate total amount
    let totalAmount = 0;
    cartItemsResult.rows.forEach(item => {
      const discountedPrice = item.price * (1 - (item.discount_percentage / 100));
      totalAmount += discountedPrice * item.quantity;
    });

    // Start a transaction
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders
         (user_id, address_id, total_amount, payment_id, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [userId, addressId, totalAmount, session.payment_intent, 'paid']
      );

      const orderId = orderResult.rows[0].id;

      // Add order items
      for (const item of cartItemsResult.rows) {
        const discountedPrice = item.price * (1 - (item.discount_percentage / 100));

        await client.query(
          `INSERT INTO order_items
           (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.product_id, item.quantity, discountedPrice]
        );

        // Update product stock
        await client.query(
          `UPDATE products
           SET stock_quantity = stock_quantity - $1
           WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }

      // Clear cart
      await client.query(
        'DELETE FROM cart_items WHERE cart_id = $1',
        [cartId]
      );

      await client.query('COMMIT');

      // Send order confirmation email if user is logged in
      if (userId) {
        const userQuery = 'SELECT email, first_name, last_name FROM users WHERE id = $1';
        const userResult = await client.query(userQuery, [userId]);

        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];

          // Format items for email
          const emailItems = cartItemsResult.rows.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price * (1 - (item.discount_percentage / 100)),
            total_price: item.quantity * (item.price * (1 - (item.discount_percentage / 100)))
          }));

          // Generate order number (order ID + random suffix)
          const orderNumber = `${orderId}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

          // Update order with order number
          await client.query(
            'UPDATE orders SET order_number = $1 WHERE id = $2',
            [orderNumber, orderId]
          );

          // Send confirmation email
          sendOrderConfirmation({
            ...order,
            order_number: orderNumber
          }, user, emailItems)
            .catch(err => console.error('Error sending order confirmation email:', err));
        }
      }

      // Redirect to order confirmation page
      res.redirect(`/orders/${orderId}/confirmation`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing order:', error);
      res.redirect('/cart?error=Error processing order');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error processing checkout:', error);
    res.redirect('/cart?error=Error processing checkout');
  }
});

// Webhook for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret';

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;

      // Process the order
      try {
        const cartId = session.metadata.cart_id;
        const userId = session.metadata.user_id || null;
        const addressId = session.metadata.address_id || null;

        // Get cart items
        const cartItemsQuery = `
          SELECT ci.id, ci.quantity, ci.product_id,
                 p.name, p.slug, p.price, p.discount_percentage
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          WHERE ci.cart_id = $1
        `;
        const cartItemsResult = await pool.query(cartItemsQuery, [cartId]);

        if (cartItemsResult.rows.length === 0) {
          console.error('Cart is empty for session:', session.id);
          return res.json({ received: true });
        }

        // Calculate total amount
        let totalAmount = 0;
        cartItemsResult.rows.forEach(item => {
          const discountedPrice = item.price * (1 - (item.discount_percentage / 100));
          totalAmount += discountedPrice * item.quantity;
        });

        // Start a transaction
        const client = await pool.connect();

        try {
          await client.query('BEGIN');

          // Create order
          const orderResult = await client.query(
            `INSERT INTO orders
             (user_id, address_id, total_amount, payment_id, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [userId, addressId, totalAmount, session.payment_intent, 'paid']
          );

          const orderId = orderResult.rows[0].id;

          // Add order items
          for (const item of cartItemsResult.rows) {
            const discountedPrice = item.price * (1 - (item.discount_percentage / 100));

            await client.query(
              `INSERT INTO order_items
               (order_id, product_id, quantity, price)
               VALUES ($1, $2, $3, $4)`,
              [orderId, item.product_id, item.quantity, discountedPrice]
            );

            // Update product stock
            await client.query(
              `UPDATE products
               SET stock_quantity = stock_quantity - $1
               WHERE id = $2`,
              [item.quantity, item.product_id]
            );
          }

          // Clear cart
          await client.query(
            'DELETE FROM cart_items WHERE cart_id = $1',
            [cartId]
          );

          await client.query('COMMIT');

          // // // console.log('Order processed successfully:', orderId);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error('Error processing order:', error);
        } finally {
          client.release();
        }
      } catch (error) {
        console.error('Error processing checkout session:', error);
      }
      break;

    default:
      // // // console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
