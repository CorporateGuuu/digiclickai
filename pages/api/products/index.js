import { getProducts } from '../../../lib/db';

export default async function handler(req, res) {
  try {
    // Get query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category || null;
    
    // Fetch products from database
    const products = await getProducts(page, limit, category);
    
    // Return products as JSON
    res.status(200).json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        category
      }
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
