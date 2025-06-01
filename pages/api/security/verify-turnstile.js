/**
 * API endpoint to verify Cloudflare Turnstile token
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    // Get the IP address from Cloudflare headers or request
    const ip = req.headers['cf-connecting-ip'] || 
               req.headers['x-forwarded-for'] || 
               req.socket.remoteAddress || 
               'unknown';
    
    // Verify the token with Cloudflare Turnstile API
    const formData = new URLSearchParams();
    formData.append('secret', process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || 'dummy_secret_key');
    formData.append('response', token);
    formData.append('remoteip', ip);
    
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      return res.status(200).json({ success: true });
    } else {
      console.error('Turnstile verification failed:', data['error-codes']);
      return res.status(400).json({ 
        success: false, 
        message: 'Verification failed', 
        errors: data['error-codes'] 
      });
    }
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
