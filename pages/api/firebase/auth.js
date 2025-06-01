import { signInWithEmail, signUpWithEmail, signOutUser } from '../../../lib/firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { action } = req.query;

  if (action === 'signin') {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const { user, error } = await signInWithEmail(email, password);

    if (error) {
      return res.status(401).json({ success: false, message: error });
    }

    return res.status(200).json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    });
  }

  if (action === 'signup') {
    const { email, password, name, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Split name into first_name and last_name
    let firstName = '';
    let lastName = '';

    if (name) {
      const nameParts = name.trim().split(' ');
      firstName = nameParts[0];
      lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    }

    const userData = {
      displayName: name,
      firstName,
      lastName,
      phone: phone || '',
      createdAt: new Date().toISOString()
    };

    const { user, error } = await signUpWithEmail(email, password, userData);

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    return res.status(201).json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    });
  }

  if (action === 'signout') {
    const { error } = await signOutUser();

    if (error) {
      return res.status(500).json({ success: false, message: error });
    }

    return res.status(200).json({ success: true, message: 'Signed out successfully' });
  }

  return res.status(400).json({ success: false, message: 'Invalid action' });
}
