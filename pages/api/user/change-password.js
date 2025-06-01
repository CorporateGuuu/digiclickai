import { getSession } from 'next-auth/react';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

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
  
  // Handle POST request - change password
  if (req.method === 'POST') {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    try {
      const client = await pool.connect();
      
      try {
        // Get the user's current password hash
        const userResult = await client.query(
          'SELECT password FROM users WHERE id = $1',
          [userId]
        );
        
        if (userResult.rows.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        const currentPasswordHash = userResult.rows[0].password;
        
        // Verify the current password
        const isPasswordValid = await bcrypt.compare(currentPassword, currentPasswordHash);
        
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);
        
        // Update the password
        await client.query(
          'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
          [newPasswordHash, userId]
        );
        
        return res.status(200).json({ message: 'Password changed successfully' });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Return 405 Method Not Allowed for other request methods
  return res.status(405).json({ message: 'Method not allowed' });
}
