import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { sendEmailVerification, sendSmsVerification } from '../../../../lib/2fa';
import { query } from '../../../../lib/db';

export default async function handler(req, res) {
  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userId = session.user.id;
  
  // POST request - Send test verification
  if (req.method === 'POST') {
    try {
      const { method } = req.body;
      
      if (!method) {
        return res.status(400).json({ message: 'Method is required' });
      }
      
      if (method !== 'email' && method !== 'sms') {
        return res.status(400).json({ message: 'Invalid method' });
      }
      
      // Get user's email or phone number
      const userResult = await query(
        'SELECT email, phone_number FROM users WHERE id = $1',
        [userId]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const user = userResult.rows[0];
      
      let success = false;
      
      if (method === 'email') {
        if (!user.email) {
          return res.status(400).json({ message: 'User has no email address' });
        }
        
        success = await sendEmailVerification(userId, user.email);
      } else if (method === 'sms') {
        if (!user.phone_number) {
          return res.status(400).json({ message: 'User has no phone number' });
        }
        
        success = await sendSmsVerification(userId, user.phone_number);
      }
      
      if (!success) {
        return res.status(500).json({ message: `Failed to send ${method} verification` });
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error sending test verification:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}
