import { sendEmailVerification, sendSmsVerification } from '../../../../lib/2fa';
import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mdtstech_store',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { userId, method } = req.body;
    
    if (!userId || !method || !['email', 'sms'].includes(method)) {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }
    
    // Get user's email or phone number
    const query = `
      SELECT email, phone_number FROM users
      WHERE id = $1
    `;
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Send verification based on method
    let success = false;
    
    if (method === 'email') {
      if (!user.email) {
        return res.status(400).json({ message: 'User does not have an email address' });
      }
      
      success = await sendEmailVerification(userId, user.email);
    } else if (method === 'sms') {
      if (!user.phone_number) {
        return res.status(400).json({ message: 'User does not have a phone number' });
      }
      
      success = await sendSmsVerification(userId, user.phone_number);
    }
    
    if (!success) {
      return res.status(500).json({ message: `Failed to send ${method} verification` });
    }
    
    return res.status(200).json({ message: `${method} verification sent successfully` });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
