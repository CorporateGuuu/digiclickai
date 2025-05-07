import { getSession } from 'next-auth/react';
import { query } from '../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  // Ensure user is authenticated
  if (!session?.user?.id) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  switch (req.method) {
    case 'GET':
      return getOrders(req, res, session.user.id);
    case 'POST':
      return createOrder(req, res, session.user.id);
    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
  }
}

// Get user orders
async function getOrders(req, res, userId) {
  try {
    // Get orders
    const ordersResult = await query(`
      SELECT id, order_number, status, total_amount, created_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);
    
    const orders = ordersResult.rows;
    
    // Return orders
    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting orders'
    });
  }
}

// Create a new order
async function createOrder(req, res, userId) {
  const client = await query.getClient();
  
  try {
    const {
      items,
      shipping_address,
      billing_address,
      payment_method,
      notes,
      total_amount
    } = req.body;
    
    if (!items || !items.length || !shipping_address || !billing_address || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Create order
    const orderResult = await client.query(`
      INSERT INTO orders (
        user_id, order_number, status, total_amount,
        shipping_address, billing_address, payment_method,
        payment_status, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, order_number, status, total_amount, created_at
    `, [
      userId,
      orderNumber,
      'pending',
      total_amount,
      JSON.stringify(shipping_address),
      JSON.stringify(billing_address),
      JSON.stringify(payment_method),
      'pending',
      notes || ''
    ]);
    
    const order = orderResult.rows[0];
    
    // Insert order items
    for (const item of items) {
      // Get product details
      const productResult = await client.query(
        'SELECT name, price, discount_percentage FROM products WHERE id = $1',
        [item.product_id]
      );
      
      if (productResult.rows.length === 0) {
        throw new Error(`Product not found: ${item.product_id}`);
      }
      
      const product = productResult.rows[0];
      const price = parseFloat(product.price);
      const discountPercentage = parseFloat(product.discount_percentage || 0);
      const discountedPrice = discountPercentage > 0 
        ? price * (1 - discountPercentage / 100) 
        : price;
      
      // Insert order item
      await client.query(`
        INSERT INTO order_items (
          order_id, product_id, product_name, product_price,
          quantity, discount_percentage, total_price
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        order.id,
        item.product_id,
        product.name,
        price,
        item.quantity,
        discountPercentage,
        parseFloat((discountedPrice * item.quantity).toFixed(2))
      ]);
    }
    
    // Add order status history
    await client.query(`
      INSERT INTO order_status_history (order_id, status, notes)
      VALUES ($1, $2, $3)
    `, [
      order.id,
      'pending',
      'Order created'
    ]);
    
    // Clear cart
    const cartResult = await client.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [userId]
    );
    
    if (cartResult.rows.length > 0) {
      const cartId = cartResult.rows[0].id;
      await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Return order
    return res.status(201).json({
      success: true,
      order,
      message: 'Order created successfully'
    });
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  } finally {
    client.release();
  }
}

// Generate a unique order number
function generateOrderNumber() {
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${timestamp}-${random}`;
}
