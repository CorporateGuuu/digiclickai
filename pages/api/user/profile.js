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
  
  // Handle GET request - fetch user profile
  if (req.method === 'GET') {
    try {
      const client = await pool.connect();
      
      try {
        const result = await client.query(
          'SELECT id, email, first_name, last_name, phone_number, image FROM users WHERE id = $1',
          [userId]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({ user: result.rows[0] });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Handle PUT request - update user profile
  if (req.method === 'PUT') {
    const { first_name, last_name, phone_number } = req.body;
    
    try {
      const client = await pool.connect();
      
      try {
        const result = await client.query(
          `UPDATE users 
           SET first_name = $1, last_name = $2, phone_number = $3, updated_at = NOW() 
           WHERE id = $4 
           RETURNING id, email, first_name, last_name, phone_number, image`,
          [first_name, last_name, phone_number, userId]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({ user: result.rows[0] });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Return 405 Method Not Allowed for other request methods
  return res.status(405).json({ message: 'Method not allowed' });
}
