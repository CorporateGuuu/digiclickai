// Mock API endpoint for user profile data
export default function handler(req, res) {
  // Check if it's a GET request
  if (req.method === 'GET') {
    // Return mock user data
    return res.status(200).json({
      user: {
        id: '1',
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '+1 (555) 123-4567',
        image: '/images/avatar.jpg',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-06-15T00:00:00Z'
      }
    });
  }
  
  // Handle PUT request to update profile
  if (req.method === 'PUT') {
    const { first_name, last_name, phone_number } = req.body;
    
    // Return updated user data
    return res.status(200).json({
      user: {
        id: '1',
        email: 'user@example.com',
        first_name,
        last_name,
        phone_number,
        image: '/images/avatar.jpg',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: new Date().toISOString()
      }
    });
  }
  
  // Return 405 Method Not Allowed for other request methods
  return res.status(405).json({ message: 'Method not allowed' });
}
