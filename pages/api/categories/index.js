import { getCategories } from '../../../lib/db';

export default async function handler(req, res) {
  try {
    // Fetch categories from database
    const categories = await getCategories();
    
    // Return categories as JSON
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
