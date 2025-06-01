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
  
  // Handle PUT request - update address
  if (req.method === 'PUT') {
    const { address_line1, address_line2, city, state, postal_code, country, is_default } = req.body;
    
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
        
        // If this address is set as default, unset any existing default address
        if (is_default) {
          await client.query(
            'UPDATE addresses SET is_default = false WHERE user_id = $1',
            [userId]
          );
        }
        
        // Update the address
        const result = await client.query(
          `UPDATE addresses 
           SET address_line1 = $1, address_line2 = $2, city = $3, state = $4, 
               postal_code = $5, country = $6, is_default = $7, updated_at = NOW() 
           WHERE id = $8 AND user_id = $9 
           RETURNING id, user_id, address_line1, address_line2, city, state, postal_code, country, is_default`,
          [address_line1, address_line2, city, state, postal_code, country, is_default, addressId, userId]
        );
        
        await client.query('COMMIT');
        
        return res.status(200).json({ address: result.rows[0] });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating address:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Handle DELETE request - delete address
  if (req.method === 'DELETE') {
    try {
      const client = await pool.connect();
      
      try {
        // Check if the address belongs to the user
        const checkResult = await client.query(
          'SELECT id, is_default FROM addresses WHERE id = $1 AND user_id = $2',
          [addressId, userId]
        );
        
        if (checkResult.rows.length === 0) {
          return res.status(404).json({ message: 'Address not found' });
        }
        
        // Delete the address
        await client.query(
          'DELETE FROM addresses WHERE id = $1 AND user_id = $2',
          [addressId, userId]
        );
        
        // If the deleted address was the default, set another address as default
        if (checkResult.rows[0].is_default) {
          const otherAddressResult = await client.query(
            'SELECT id FROM addresses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [userId]
          );
          
          if (otherAddressResult.rows.length > 0) {
            await client.query(
              'UPDATE addresses SET is_default = true WHERE id = $1',
              [otherAddressResult.rows[0].id]
            );
          }
        }
        
        return res.status(200).json({ message: 'Address deleted successfully' });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Return 405 Method Not Allowed for other request methods
  return res.status(405).json({ message: 'Method not allowed' });
}
