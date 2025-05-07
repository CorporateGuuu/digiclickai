import supabase from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { action } = req.query;
    
    if (action === 'signup') {
      try {
        const { email, password, name } = req.body;
        
        if (!email || !password) {
          return res.status(400).json({
            success: false,
            message: 'Email and password are required'
          });
        }
        
        // Split name into first_name and last_name if provided
        let firstName = '';
        let lastName = '';
        
        if (name) {
          const nameParts = name.trim().split(' ');
          firstName = nameParts[0];
          lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        }
        
        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName
            }
          }
        });
        
        if (authError) {
          throw authError;
        }
        
        return res.status(201).json({
          success: true,
          message: 'User registered successfully. Check your email for confirmation.',
          user: {
            id: authData.user.id,
            email: authData.user.email,
            name: `${firstName} ${lastName}`.trim()
          }
        });
      } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({
          success: false,
          message: error.message || 'Error during signup'
        });
      }
    } else if (action === 'signin') {
      try {
        const { email, password } = req.body;
        
        if (!email || !password) {
          return res.status(400).json({
            success: false,
            message: 'Email and password are required'
          });
        }
        
        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (authError) {
          throw authError;
        }
        
        return res.status(200).json({
          success: true,
          message: 'User signed in successfully',
          user: authData.user,
          session: authData.session
        });
      } catch (error) {
        console.error('Signin error:', error);
        return res.status(500).json({
          success: false,
          message: error.message || 'Error during signin'
        });
      }
    } else if (action === 'signout') {
      try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          throw error;
        }
        
        return res.status(200).json({
          success: true,
          message: 'User signed out successfully'
        });
      } catch (error) {
        console.error('Signout error:', error);
        return res.status(500).json({
          success: false,
          message: error.message || 'Error during signout'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}
