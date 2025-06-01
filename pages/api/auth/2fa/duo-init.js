import { generateDuoRequest } from '../../../../lib/2fa';
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
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }
    
    // Get user's email (used as username for DUO)
    const query = `
      SELECT email FROM users
      WHERE id = $1
    `;
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Generate DUO request
    const duoData = generateDuoRequest(userId, user.email);
    
    if (!duoData) {
      return res.status(500).json({ message: 'Failed to generate DUO request' });
    }
    
    return res.status(200).json(duoData);
  } catch (error) {
    console.error('Error initializing DUO:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
