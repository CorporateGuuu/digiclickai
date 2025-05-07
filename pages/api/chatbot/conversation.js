import { pool } from '../../../utils/db';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Generate a new conversation ID
    const conversationId = uuidv4();
    
    // Store the conversation in the database
    const query = `
      INSERT INTO chatbot_conversations (
        id,
        user_id,
        created_at,
        updated_at,
        status
      ) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    
    try {
      // Try to execute the query
      await pool.query(query, [
        conversationId,
        userId,
        new Date(),
        new Date(),
        'active'
      ]);
      
      return res.status(200).json({ 
        success: true, 
        conversationId
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // If database operation fails, still return a conversation ID
      // This allows the chatbot to work even if the database is down
      return res.status(200).json({ 
        success: true,
        conversationId,
        stored: false
      });
    }
  } catch (error) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      conversationId: uuidv4() // Fallback conversation ID
    });
  }
}
