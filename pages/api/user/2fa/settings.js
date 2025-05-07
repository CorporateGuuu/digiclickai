import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { getUserTwoFactorSettings, updateUserTwoFactorSettings } from '../../../../lib/2fa';

export default async function handler(req, res) {
  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userId = session.user.id;
  
  // GET request - Get user's 2FA settings
  if (req.method === 'GET') {
    try {
      const settings = await getUserTwoFactorSettings(userId);
      
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }
      
      return res.status(200).json({ settings });
    } catch (error) {
      console.error('Error getting 2FA settings:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // PUT request - Update user's 2FA settings
  if (req.method === 'PUT') {
    try {
      const {
        enabled,
        preferred_method,
        email_enabled,
        sms_enabled,
        duo_enabled,
      } = req.body;
      
      // Validate input
      if (enabled && !preferred_method) {
        return res.status(400).json({ message: 'Preferred method is required when 2FA is enabled' });
      }
      
      if (enabled && preferred_method && !req.body[`${preferred_method}_enabled`]) {
        return res.status(400).json({ message: `${preferred_method} verification is not enabled` });
      }
      
      // Update settings
      const success = await updateUserTwoFactorSettings(userId, {
        enabled,
        preferred_method,
        email_enabled,
        sms_enabled,
        duo_enabled,
      });
      
      if (!success) {
        return res.status(500).json({ message: 'Failed to update 2FA settings' });
      }
      
      // Get updated settings
      const settings = await getUserTwoFactorSettings(userId);
      
      return res.status(200).json({ settings });
    } catch (error) {
      console.error('Error updating 2FA settings:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}
