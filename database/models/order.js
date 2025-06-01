const db = require('../config');

const OrderModel = {
  // Get all orders with optional pagination
  async getAllOrders(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT o.*, u.email as user_email, u.first_name, u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const { rows } = await db.query(query, [limit, offset]);
    return rows;
  },
  
  // Get orders by user ID
  async getOrdersByUser(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT o.*
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const { rows } = await db.query(query, [userId, limit, offset]);
    return rows;
  },
  
  // Get order by ID
  async getOrderById(id) {
    const query = `
      SELECT o.*, u.email as user_email, u.first_name, u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    // Get order items
    const itemsQuery = `
      SELECT oi.*, p.name as product_name, p.image_url, p.sku,
             pv.variant_type, pv.variant_value
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
      WHERE oi.order_id = $1
    `;
    const itemsResult = await db.query(itemsQuery, [id]);
    
    // Get shipping address
    const shippingAddressQuery = `
      SELECT * FROM user_addresses
      WHERE id = $1
    `;
    const shippingAddressResult = await db.query(shippingAddressQuery, [rows[0].shipping_address_id]);
    
    // Get billing address
    const billingAddressQuery = `
      SELECT * FROM user_addresses
      WHERE id = $1
    `;
    const billingAddressResult = await db.query(billingAddressQuery, [rows[0].billing_address_id]);
    
    // Combine all data
    return {
      ...rows[0],
      items: itemsResult.rows,
      shipping_address: shippingAddressResult.rows[0] || null,
      billing_address: billingAddressResult.rows[0] || null
    };
  },
  
  // Get order by order number
  async getOrderByOrderNumber(orderNumber) {
    const query = `
      SELECT id FROM orders
      WHERE order_number = $1
    `;
    const { rows } = await db.query(query, [orderNumber]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return this.getOrderById(rows[0].id);
  },
  
  // Create a new order
  async createOrder(orderData) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Insert order
      const orderQuery = `
        INSERT INTO orders (
          user_id, order_number, status, total_amount,
          shipping_address_id, billing_address_id,
          shipping_method, shipping_cost,
          payment_method, payment_status, notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING id
      `;
      
      const orderValues = [
        orderData.user_id || null,
        orderNumber,
        orderData.status || 'pending',
        orderData.total_amount,
        orderData.shipping_address_id || null,
        orderData.billing_address_id || null,
        orderData.shipping_method || null,
        orderData.shipping_cost || 0,
        orderData.payment_method || null,
        orderData.payment_status || 'pending',
        orderData.notes || null
      ];
      
      const orderResult = await client.query(orderQuery, orderValues);
      const orderId = orderResult.rows[0].id;
      
      // Insert order items
      if (orderData.items && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          const itemQuery = `
            INSERT INTO order_items (
              order_id, product_id, variant_id, quantity, price, total_price
            ) VALUES (
              $1, $2, $3, $4, $5, $6
            )
          `;
          
          const itemValues = [
            orderId,
            item.product_id,
            item.variant_id || null,
            item.quantity,
            item.price,
            item.price * item.quantity
          ];
          
          await client.query(itemQuery, itemValues);
          
          // Update product stock
          const updateStockQuery = `
            UPDATE products
            SET stock_quantity = stock_quantity - $1
            WHERE id = $2
          `;
          await client.query(updateStockQuery, [item.quantity, item.product_id]);
          
          // Update variant stock if applicable
          if (item.variant_id) {
            const updateVariantStockQuery = `
              UPDATE product_variants
              SET stock_quantity = stock_quantity - $1
              WHERE id = $2
            `;
            await client.query(updateVariantStockQuery, [item.quantity, item.variant_id]);
          }
        }
      }
      
      // Clear cart if cart_id is provided
      if (orderData.cart_id) {
        const clearCartQuery = `
          DELETE FROM cart_items
          WHERE cart_id = $1
        `;
        await client.query(clearCartQuery, [orderData.cart_id]);
      }
      
      await client.query('COMMIT');
      
      // Return the created order
      return this.getOrderById(orderId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  // Update order status
  async updateOrderStatus(id, status, notes = null) {
    const query = `
      UPDATE orders
      SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const { rows } = await db.query(query, [status, notes, id]);
    
    if (rows.length === 0) {
      throw new Error(`Order with ID ${id} not found`);
    }
    
    return rows[0];
  },
  
  // Update payment status
  async updatePaymentStatus(id, paymentStatus, paymentMethod = null) {
    const query = `
      UPDATE orders
      SET payment_status = $1, payment_method = COALESCE($2, payment_method), updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const { rows } = await db.query(query, [paymentStatus, paymentMethod, id]);
    
    if (rows.length === 0) {
      throw new Error(`Order with ID ${id} not found`);
    }
    
    return rows[0];
  },
  
  // Cancel order
  async cancelOrder(id, reason = null) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Get order items to restore stock
      const itemsQuery = `
        SELECT product_id, variant_id, quantity
        FROM order_items
        WHERE order_id = $1
      `;
      const itemsResult = await client.query(itemsQuery, [id]);
      
      // Restore stock for each item
      for (const item of itemsResult.rows) {
        // Update product stock
        const updateStockQuery = `
          UPDATE products
          SET stock_quantity = stock_quantity + $1
          WHERE id = $2
        `;
        await client.query(updateStockQuery, [item.quantity, item.product_id]);
        
        // Update variant stock if applicable
        if (item.variant_id) {
          const updateVariantStockQuery = `
            UPDATE product_variants
            SET stock_quantity = stock_quantity + $1
            WHERE id = $2
          `;
          await client.query(updateVariantStockQuery, [item.quantity, item.variant_id]);
        }
      }
      
      // Update order status
      const updateQuery = `
        UPDATE orders
        SET status = 'cancelled', notes = COALESCE($1, notes), updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      const updateResult = await client.query(updateQuery, [reason, id]);
      
      if (updateResult.rows.length === 0) {
        throw new Error(`Order with ID ${id} not found`);
      }
      
      await client.query('COMMIT');
      
      return updateResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  // Get order statistics
  async getOrderStatistics() {
    const query = `
      SELECT
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as payment_pending_orders,
        COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as payment_failed_orders,
        COUNT(CASE WHEN payment_status = 'refunded' THEN 1 END) as refunded_orders
      FROM orders
    `;
    const { rows } = await db.query(query);
    return rows[0];
  },
  
  // Get recent orders
  async getRecentOrders(limit = 10) {
    const query = `
      SELECT o.*, u.email as user_email, u.first_name, u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT $1
    `;
    const { rows } = await db.query(query, [limit]);
    return rows;
  }
};

module.exports = OrderModel;
