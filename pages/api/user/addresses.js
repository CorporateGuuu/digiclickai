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
  
  // Handle GET request - fetch user addresses
  if (req.method === 'GET') {
    try {
      const client = await pool.connect();
      
      try {
        const result = await client.query(
          `SELECT id, user_id, address_line1, address_line2, city, state, postal_code, country, is_default 
           FROM addresses 
           WHERE user_id = $1 
           ORDER BY is_default DESC, created_at DESC`,
          [userId]
        );
        
        return res.status(200).json({ addresses: result.rows });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching user addresses:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Handle POST request - create new address
  if (req.method === 'POST') {
    const { address_line1, address_line2, city, state, postal_code, country, is_default } = req.body;
    
    try {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // If this address is set as default, unset any existing default address
        if (is_default) {
          await client.query(
            'UPDATE addresses SET is_default = false WHERE user_id = $1',
            [userId]
          );
        }
        
        // Insert the new address
        const result = await client.query(
          `INSERT INTO addresses 
           (user_id, address_line1, address_line2, city, state, postal_code, country, is_default, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
           RETURNING id, user_id, address_line1, address_line2, city, state, postal_code, country, is_default`,
          [userId, address_line1, address_line2, city, state, postal_code, country, is_default]
        );
        
        await client.query('COMMIT');
        
        return res.status(201).json({ address: result.rows[0] });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error creating address:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Return 405 Method Not Allowed for other request methods
  return res.status(405).json({ message: 'Method not allowed' });
}
