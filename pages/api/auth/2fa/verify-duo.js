import { verifyDuoResponse } from '../../../../lib/2fa';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { userId, signedResponse } = req.body;
    
    if (!userId || !signedResponse) {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }
    
    // Verify the DUO response
    const username = verifyDuoResponse(signedResponse);
    
    if (!username) {
      return res.status(400).json({ message: 'Invalid DUO response' });
    }
    
    // Set a session cookie to indicate 2FA verification
    res.setHeader('Set-Cookie', `twoFactorVerified=true; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);
    
    return res.status(200).json({ message: 'DUO verification successful' });
  } catch (error) {
    console.error('Error verifying DUO response:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
