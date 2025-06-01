import { pool } from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { query, productId, position, sessionId, timestamp } = req.body;
    
    if (!query || !productId) {
      return res.status(400).json({ message: 'Query and productId are required' });
    }
    
    // Insert click data into database
    const insertQuery = `
      INSERT INTO search_click_analytics (
        query, 
        product_id, 
        position, 
        session_id, 
        timestamp,
        user_id,
        user_agent,
        ip_address
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    
    // Get user ID from session if available
    const userId = req.session?.user?.id || null;
    
    // Get user agent and IP address
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.headers['x-forwarded-for'] || 
                      req.connection.remoteAddress || 
                      '';
    
    try {
      // Try to execute the query
      const { rows } = await pool.query(insertQuery, [
        query,
        productId,
        position || 0,
        sessionId,
        timestamp || new Date(),
        userId,
        userAgent,
        ipAddress
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
    console.error('Error processing search click analytics:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
