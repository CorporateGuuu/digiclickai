import { buffer } from 'micro';
import Stripe from 'stripe';
import { query } from '../../../lib/db';

// Disable body parsing, need the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).json({ success: false, message: 'Stripe webhook secret is not set' });
  }

  try {
    // Get the raw body
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Extract metadata
      const { cart_id, user_id } = session.metadata;

      // Get cart items
      const cartItemsResult = await query(`
        SELECT ci.product_id, ci.quantity, p.name, p.price, p.discount_percentage
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1
      `, [cart_id]);

      if (cartItemsResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }

      // Calculate total amount
      let totalAmount = 0;
      const orderItems = cartItemsResult.rows.map(item => {
        const price = parseFloat(item.price);
        const discountPercentage = parseFloat(item.discount_percentage || 0);
        const discountedPrice = discountPercentage > 0
          ? price * (1 - discountPercentage / 100)
          : price;
        const itemTotal = discountedPrice * item.quantity;
        totalAmount += itemTotal;

        return {
          product_id: item.product_id,
          product_name: item.name,
          product_price: price,
          quantity: item.quantity,
          discount_percentage: discountPercentage,
          total_price: itemTotal
        };
      });

      // Add shipping cost if applicable
      const shippingCost = session.shipping_cost ? session.shipping_cost.amount_total / 100 : 0;
      totalAmount += shippingCost;

      // Generate order number
      const orderNumber = generateOrderNumber();

      // Get customer details
      const customer = {
        name: session.customer_details.name,
        email: session.customer_details.email,
        phone: session.customer_details.phone || '',
      };

      // Get shipping details
      const shipping = session.shipping_details ? {
        name: session.shipping_details.name,
        address: {
          line1: session.shipping_details.address.line1,
          line2: session.shipping_details.address.line2 || '',
          city: session.shipping_details.address.city,
          state: session.shipping_details.address.state,
          postal_code: session.shipping_details.address.postal_code,
          country: session.shipping_details.address.country,
        },
        phone: session.shipping_details.phone || '',
      } : null;

      // Create shipping address object
      const shippingAddress = shipping ? {
        name: shipping.name,
        email: customer.email,
        phone: shipping.phone || customer.phone,
        address: shipping.address.line1 + (shipping.address.line2 ? ', ' + shipping.address.line2 : ''),
        city: shipping.address.city,
        state: shipping.address.state,
        zip: shipping.address.postal_code,
        country: shipping.address.country
      } : null;

      // Get billing details
      const billingAddress = {
        name: session.customer_details.name,
        email: session.customer_details.email,
        phone: session.customer_details.phone || '',
        address: session.customer_details.address.line1 + (session.customer_details.address.line2 ? ', ' + session.customer_details.address.line2 : ''),
        city: session.customer_details.address.city,
        state: session.customer_details.address.state,
        zip: session.customer_details.address.postal_code,
        country: session.customer_details.address.country
      };

      // Get payment details
      const paymentMethod = {
        type: session.payment_method_types[0],
        payment_intent: session.payment_intent,
        amount: session.amount_total / 100,
        currency: session.currency,
        status: session.payment_status
      };

      // Begin transaction
      const client = await query.getClient();

      try {
        await client.query('BEGIN');

        // Create order
        const orderResult = await client.query(`
          INSERT INTO orders (
            user_id, order_number, status, total_amount,
            shipping_address, billing_address, payment_method,
            payment_status, shipping_method, shipping_cost
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id
        `, [
          user_id || null,
          orderNumber,
          'processing',
          totalAmount,
          JSON.stringify(shippingAddress),
          JSON.stringify(billingAddress),
          JSON.stringify(paymentMethod),
          session.payment_status,
          session.shipping_cost ? session.shipping_cost.shipping_rate.display_name : 'Free shipping',
          shippingCost
        ]);

        const orderId = orderResult.rows[0].id;

        // Insert order items
        for (const item of orderItems) {
          await client.query(`
            INSERT INTO order_items (
              order_id, product_id, product_name, product_price,
              quantity, discount_percentage, total_price
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            orderId,
            item.product_id,
            item.product_name,
            item.product_price,
            item.quantity,
            item.discount_percentage,
            item.total_price
          ]);
        }

        // Add order status history
        await client.query(`
          INSERT INTO order_status_history (order_id, status, notes)
          VALUES ($1, $2, $3)
        `, [
          orderId,
          'processing',
          'Payment completed via Stripe'
        ]);

        // Clear cart
        await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cart_id]);

        // Commit transaction
        await client.query('COMMIT');

        // // // console.log(`Order ${orderNumber} created successfully`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing order:', error);
        throw error;
      } finally {
        client.release();
      }
    }

    // Return a response to acknowledge receipt of the event
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return res.status(500).json({ success: false, message: 'Error processing webhook' });
  }
}

// Generate a unique order number
function generateOrderNumber() {
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${timestamp}-${random}`;
}
