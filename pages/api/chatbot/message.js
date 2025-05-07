import { pool } from '../../../utils/db';
import { processMessage } from '../../../utils/chatbotService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { conversationId, message, userId } = req.body;
    
    if (!conversationId || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Conversation ID and message are required' 
      });
    }
    
    // Store the user message in the database
    const insertMessageQuery = `
      INSERT INTO chatbot_messages (
        conversation_id,
        role,
        content,
        created_at
      ) 
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    
    try {
      // Try to execute the query
      await pool.query(insertMessageQuery, [
        conversationId,
        'user',
        message,
        new Date()
      ]);
    } catch (dbError) {
      console.error('Database error storing user message:', dbError);
      // Continue even if database operation fails
    }
    
    // Process the message with the AI service
    const aiResponse = await processMessage(message, conversationId, userId);
    
    // Store the AI response in the database
    try {
      await pool.query(insertMessageQuery, [
        conversationId,
        'assistant',
        aiResponse,
        new Date()
      ]);
      
      // Update the conversation's last activity timestamp
      await pool.query(`
        UPDATE chatbot_conversations
        SET updated_at = $1
        WHERE id = $2
      `, [new Date(), conversationId]);
    } catch (dbError) {
      console.error('Database error storing AI response:', dbError);
      // Continue even if database operation fails
    }
    
    return res.status(200).json({ 
      success: true, 
      reply: aiResponse
    });
  } catch (error) {
    console.error('Error processing message:', error);
    
    // Return a fallback response
    return res.status(200).json({ 
      success: true,
      reply: "I'm sorry, I'm having trouble processing your request right now. Please try again or contact our support team at support@mdtstech.store if you need immediate assistance."
    });
  }
}
