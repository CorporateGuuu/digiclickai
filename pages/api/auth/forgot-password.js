import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    // Check if the user exists
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal that the user doesn't exist for security reasons
      return res.status(200).json({ 
        success: true, 
        message: 'If your email is registered, you will receive password reset instructions.' 
      });
    }

    const userId = userResult.rows[0].id;
    
    // Generate a reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
    
    // Set token expiration (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Store the reset token in the database
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at) 
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) 
       DO UPDATE SET token = $2, expires_at = $3, updated_at = NOW()`,
      [userId, resetToken, expiresAt]
    );
    
    // In a real application, you would send an email with the reset link
    // For this demo, we'll just return success
    // // // console.log(`Reset token for ${email}: ${resetToken}`);
    // // // console.log(`Reset link would be: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'If your email is registered, you will receive password reset instructions.' 
    });
    
  } catch (error) {
    console.error('Error in forgot password:', error);
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
}
