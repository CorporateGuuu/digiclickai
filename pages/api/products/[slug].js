import { getProductBySlug } from '../../../lib/db';

export default async function handler(req, res) {
  try {
    // Get product slug from URL
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Product slug is required'
      });
    }

    // Try to fetch product from database
    let product;
    try {
      product = await getProductBySlug(slug);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // If database error occurs, use mock data
      product = null;
    }

    // If product not found in database, use mock data
    if (!product) {
      // Create mock product based on slug
      product = createMockProduct(slug);
    }

    // Return product as JSON
    res.status(200).json({
      success: true,
      product
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

// Function to create mock product data
function createMockProduct(slug) {
  // Extract product name from slug
  const productName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Determine category based on slug
  let category = 'Accessories';
  let categorySlug = 'accessories';

  if (slug.includes('iphone')) {
    category = 'iPhone Parts';
    categorySlug = 'iphone-parts';
  } else if (slug.includes('samsung')) {
    category = 'Samsung Parts';
    categorySlug = 'samsung-parts';
  } else if (slug.includes('ipad')) {
    category = 'iPad Parts';
    categorySlug = 'ipad-parts';
  } else if (slug.includes('macbook')) {
    category = 'MacBook Parts';
    categorySlug = 'macbook-parts';
  } else if (slug.includes('tool')) {
    category = 'Repair Tools';
    categorySlug = 'repair-tools';
  }

  // Generate random price between $20 and $200
  const price = parseFloat((Math.random() * 180 + 20).toFixed(2));

  // Randomly apply discount
  const hasDiscount = Math.random() > 0.5;
  const discountPercentage = hasDiscount ? Math.floor(Math.random() * 30) + 5 : 0;
  const discountedPrice = hasDiscount
    ? parseFloat((price * (1 - discountPercentage / 100)).toFixed(2))
    : price;

  // Create mock product object
  return {
    id: Math.floor(Math.random() * 10000) + 1,
    name: productName,
    slug: slug,
    description: `This is a high-quality ${productName} for device repair. Perfect for professional repair shops and DIY enthusiasts.`,
    price: price,
    discount_percentage: discountPercentage,
    discounted_price: discountedPrice,
    stock_status: Math.random() > 0.2 ? 'In Stock' : 'Out of Stock',
    category_id: Math.floor(Math.random() * 5) + 1,
    category_name: category,
    category_slug: categorySlug,
    sku: `SKU-${Math.floor(Math.random() * 10000)}`,
    image_url: `/images/products/${Math.floor(Math.random() * 10) + 1}.jpg`,
    is_featured: Math.random() > 0.7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    specifications: {
      brand: slug.includes('iphone') || slug.includes('ipad') || slug.includes('macbook') ? 'Apple' :
             slug.includes('samsung') ? 'Samsung' : 'Generic',
      compatibility: slug.includes('iphone') ? 'iPhone models' :
                    slug.includes('samsung') ? 'Samsung Galaxy models' :
                    slug.includes('ipad') ? 'iPad models' :
                    slug.includes('macbook') ? 'MacBook models' : 'Various devices',
      warranty: '90 days',
      condition: 'New',
      material: 'Premium quality'
    }
  };
}
