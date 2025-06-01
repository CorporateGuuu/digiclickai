import { getSession } from 'next-auth/react';
import { query } from '../../../lib/db';

// This API route merges a session cart with a user cart after login
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
  
  const session = await getSession({ req });
  if (!session?.user?.id) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Session ID is required'
    });
  }
  
  try {
    const userId = session.user.id;
    
    // Get session cart
    const sessionCartResult = await query(
      'SELECT id FROM carts WHERE session_id = $1',
      [sessionId]
    );
    
    if (sessionCartResult.rows.length === 0) {
      // No session cart to merge
      return res.status(200).json({
        success: true,
        message: 'No session cart to merge'
      });
    }
    
    const sessionCartId = sessionCartResult.rows[0].id;
    
    // Get user cart or create one
    let userCartResult = await query(
      'SELECT id FROM carts WHERE user_id = $1',
      [userId]
    );
    
    let userCartId;
    if (userCartResult.rows.length === 0) {
      // Create new cart for user
      userCartResult = await query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
        [userId]
      );
      userCartId = userCartResult.rows[0].id;
    } else {
      userCartId = userCartResult.rows[0].id;
    }
    
    // Get session cart items
    const sessionCartItemsResult = await query(
      'SELECT product_id, quantity FROM cart_items WHERE cart_id = $1',
      [sessionCartId]
    );
    
    const sessionCartItems = sessionCartItemsResult.rows;
    
    // Begin transaction
    const client = await query.getClient();
    try {
      await client.query('BEGIN');
      
      // For each session cart item
      for (const item of sessionCartItems) {
        // Check if product already in user cart
        const existingItemResult = await client.query(
          'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
          [userCartId, item.product_id]
        );
        
        if (existingItemResult.rows.length > 0) {
          // Update quantity if product already in user cart
          const existingItem = existingItemResult.rows[0];
          const newQuantity = existingItem.quantity + item.quantity;
          
          await client.query(
            'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newQuantity, existingItem.id]
          );
        } else {
          // Add new item to user cart
          await client.query(
            'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
            [userCartId, item.product_id, item.quantity]
          );
        }
      }
      
      // Delete session cart
      await client.query('DELETE FROM carts WHERE id = $1', [sessionCartId]);
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
    return res.status(200).json({
      success: true,
      message: 'Carts merged successfully'
    });
  } catch (error) {
    console.error('Error merging carts:', error);
    return res.status(500).json({
      success: false,
      message: 'Error merging carts'
    });
  }
}
