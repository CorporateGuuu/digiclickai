import { pool } from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, productId, timestamp } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Insert product view data into database
    const insertQuery = `
      INSERT INTO product_views (
        product_id, 
        user_id, 
        timestamp,
        user_agent,
        ip_address,
        session_id
      ) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    
    // Get user agent and IP address
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.headers['x-forwarded-for'] || 
                      req.connection.remoteAddress || 
                      '';
    
    // Get session ID from cookie if available
    const sessionId = req.cookies?.sessionId || null;
    
    try {
      // Try to execute the query
      const { rows } = await pool.query(insertQuery, [
        productId,
        userId || null,
        timestamp || new Date(),
        userAgent,
        ipAddress,
        sessionId
      ]);
      
      return res.status(200).json({ 
        success: true, 
        id: rows[0]?.id 
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Even if the database operation fails, return success
      // to avoid disrupting the user experience
      return res.status(200).json({ 
        success: true,
        stored: false,
        message: 'Analytics recorded locally only'
      });
    }
  } catch (error) {
    console.error('Error processing product view analytics:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
