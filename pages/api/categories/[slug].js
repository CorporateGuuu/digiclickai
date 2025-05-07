import { getCategoryBySlug, getProducts } from '../../../lib/db';

export default async function handler(req, res) {
  try {
    // Get category slug from URL
    const { slug } = req.query;
    
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Category slug is required'
      });
    }
    
    // Fetch category from database
    const category = await getCategoryBySlug(slug);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Get query parameters for products
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Fetch products in this category
    const products = await getProducts(page, limit, slug);
    
    // Return category and its products as JSON
    res.status(200).json({
      success: true,
      category,
      products,
      pagination: {
        page,
        limit
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
