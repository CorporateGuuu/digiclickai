import { runChatbotTests } from '../../../utils/chatbotTestCases';
import { processMessage } from '../../../utils/chatbotService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user.isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized. Only administrators can run chatbot tests.' 
      });
    }
    
    // Run the tests
    const results = await runChatbotTests(processMessage);
    
    // Return the results
    return res.status(200).json({ 
      success: true,
      results
    });
  } catch (error) {
    console.error('Error running chatbot tests:', error);
    
    return res.status(500).json({ 
      success: false,
      message: 'Error running chatbot tests',
      error: error.message
    });
  }
}
