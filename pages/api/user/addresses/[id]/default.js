import { getSession } from 'next-auth/react';
import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userId = session.user.id;
  const addressId = req.query.id;
  
  // Handle PUT request - set address as default
  if (req.method === 'PUT') {
    try {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Check if the address belongs to the user
        const checkResult = await client.query(
          'SELECT id FROM addresses WHERE id = $1 AND user_id = $2',
          [addressId, userId]
        );
        
        if (checkResult.rows.length === 0) {
          return res.status(404).json({ message: 'Address not found' });
        }
        
        // Unset any existing default address
        await client.query(
          'UPDATE addresses SET is_default = false WHERE user_id = $1',
          [userId]
        );
        
        // Set the specified address as default
        await client.query(
          'UPDATE addresses SET is_default = true WHERE id = $1 AND user_id = $2',
          [addressId, userId]
        );
        
        await client.query('COMMIT');
        
        return res.status(200).json({ message: 'Default address updated successfully' });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Return 405 Method Not Allowed for other request methods
  return res.status(405).json({ message: 'Method not allowed' });
}
