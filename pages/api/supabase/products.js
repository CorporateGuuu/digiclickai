import supabase from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get query parameters
      const { page = 1, limit = 20, category } = req.query;
      const offset = (page - 1) * limit;
      
      // Build query
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      // Add category filter if provided
      if (category) {
        query = query.eq('category_id', category);
      }
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) {
        throw error;
      }
      
      // Format the products
      const formattedProducts = data.map(product => ({
        ...product,
        price: parseFloat(product.price),
        discount_percentage: parseFloat(product.discount_percentage || 0),
        discounted_price: product.discount_percentage
          ? parseFloat((product.price * (1 - product.discount_percentage / 100)).toFixed(2))
          : parseFloat(product.price),
        category_name: product.categories?.name
      }));
      
      return res.status(200).json({
        success: true,
        products: formattedProducts,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / limit)
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: error.message
      });
    }
  } else if (req.method === 'POST') {
    // Check if user is authenticated and has admin privileges
    // This would typically be done with a middleware
    
    try {
      const { name, slug, description, price, category_id, image_url, stock_quantity, discount_percentage, is_featured, is_new, brand } = req.body;
      
      // Validate required fields
      if (!name || !slug || !price || !category_id) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
      
      // Insert product
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name,
            slug,
            description,
            price,
            category_id,
            image_url,
            stock_quantity: stock_quantity || 0,
            discount_percentage: discount_percentage || 0,
            is_featured: is_featured || false,
            is_new: is_new || false,
            brand
          }
        ])
        .select();
      
      if (error) {
        throw error;
      }
      
      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: data[0]
      });
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message
      });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
