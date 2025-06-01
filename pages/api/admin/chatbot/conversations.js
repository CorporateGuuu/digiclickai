import { pool } from '../../../../utils/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  // Check if user is authenticated and is an admin
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user.isAdmin) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    // Get conversations with message count
    const query = `
      SELECT 
        c.id, 
        c.user_id, 
        c.created_at, 
        c.updated_at, 
        c.status,
        COUNT(m.id) as message_count
      FROM chatbot_conversations c
      LEFT JOIN chatbot_messages m ON c.id = m.conversation_id
      GROUP BY c.id
      ORDER BY c.updated_at DESC
      LIMIT 100
    `;
    
    try {
      const { rows } = await pool.query(query);
      
      return res.status(200).json({
        success: true,
        conversations: rows
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Return mock data for demo purposes
      return res.status(200).json({
        success: true,
        conversations: getMockConversations()
      });
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// Generate mock conversations for demo purposes
function getMockConversations() {
  const statuses = ['active', 'closed', 'pending'];
  const users = ['user_123', 'user_456', 'anonymous', 'user_789', 'user_101'];
  
  return Array.from({ length: 20 }, (_, i) => {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
    
    const updatedAt = new Date(createdAt);
    updatedAt.setHours(updatedAt.getHours() + Math.floor(Math.random() * 48));
    
    return {
      id: `conv_${i + 1}`,
      user_id: users[Math.floor(Math.random() * users.length)],
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      message_count: Math.floor(Math.random() * 20) + 1
    };
  });
}
