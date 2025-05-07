import { getSession } from 'next-auth/react';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
  
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
  
  try {
    let cartResult;
    
    if (userId) {
      // Get cart by user ID
      cartResult = await query(
        'SELECT id FROM carts WHERE user_id = $1',
        [userId]
      );
    } else {
      // Get cart by session ID
      cartResult = await query(
        'SELECT id FROM carts WHERE session_id = $1',
        [sessionId]
      );
    }
    
    if (cartResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    const cartId = cartResult.rows[0].id;
    
    // Clear cart items
    await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    
    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Error clearing cart'
    });
  }
}
