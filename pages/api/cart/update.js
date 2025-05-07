import { getSession } from 'next-auth/react';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const session = await getSession({ req });
    const userId = session?.user?.id;
    const { sessionId } = req.cookies;
    
    // Ensure we have either a user ID or a session ID
    if (!userId && !sessionId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const { itemId, quantity } = req.body;
    
    if (!itemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and quantity are required'
      });
    }
    
    // Convert quantity to integer
    const quantityInt = parseInt(quantity);
    
    if (isNaN(quantityInt) || quantityInt < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer'
      });
    }
    
    // Get cart ID
    let cartId;
    if (userId) {
      const cartResult = await query(
        'SELECT id FROM carts WHERE user_id = ? AND status = "active" LIMIT 1',
        [userId]
      );
      
      if (cartResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }
      
      cartId = cartResult[0].id;
    } else {
      const cartResult = await query(
        'SELECT id FROM carts WHERE session_id = ? AND status = "active" LIMIT 1',
        [sessionId]
      );
      
      if (cartResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }
      
      cartId = cartResult[0].id;
    }
    
    // Check if item exists in cart
    const itemResult = await query(
      'SELECT id FROM cart_items WHERE cart_id = ? AND id = ? LIMIT 1',
      [cartId, itemId]
    );
    
    if (itemResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    // Update item quantity
    await query(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantityInt, itemId]
    );
    
    // Get updated cart data
    const cartItems = await query(`
      SELECT ci.id, p.name, p.slug, p.price, ci.quantity, p.image_url, p.discount_percentage,
        CASE 
          WHEN p.discount_percentage > 0 
          THEN ROUND(p.price * (1 - p.discount_percentage / 100), 2) 
          ELSE NULL 
        END AS discounted_price,
        CASE 
          WHEN p.discount_percentage > 0 
          THEN ROUND(ROUND(p.price * (1 - p.discount_percentage / 100), 2) * ci.quantity, 2)
          ELSE ROUND(p.price * ci.quantity, 2)
        END AS total
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cartId]);
    
    // Calculate cart totals
    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
    const subtotal = cartItems.reduce((total, item) => total + item.total, 0);
    
    // Return updated cart
    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cart: {
        id: cartId,
        user_id: userId,
        items: cartItems,
        item_count: itemCount,
        subtotal: subtotal
      }
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
