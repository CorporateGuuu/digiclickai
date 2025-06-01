import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { generateBackupCodes } from '../../../../lib/2fa';

export default async function handler(req, res) {
  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userId = session.user.id;
  
  // POST request - Generate new backup codes
  if (req.method === 'POST') {
    try {
      const codes = await generateBackupCodes(userId);
      
      if (!codes || codes.length === 0) {
        return res.status(500).json({ message: 'Failed to generate backup codes' });
      }
      
      return res.status(200).json({ codes });
    } catch (error) {
      console.error('Error generating backup codes:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}
