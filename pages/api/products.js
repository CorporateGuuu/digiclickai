// Mock product data
const mockProducts = [
  {
    id: 1,
    name: "iPhone 13 Pro Max OLED Display Assembly",
    slug: "iphone-13-pro-max-oled-display-assembly",
    description: "Genuine Apple replacement OLED display assembly for iPhone 13 Pro Max. Includes front camera, proximity sensor, and earpiece speaker.",
    price: 299.99,
    discount_percentage: 10,
    stock_quantity: 25,
    category_id: 1,
    category_name: "iPhone Parts",
    brand_id: 1,
    brand_name: "Apple",
    image_url: null,
    is_featured: true,
    is_new: true,
    average_rating: 4.8,
    review_count: 12,
    created_at: "2023-01-15T08:00:00Z",
    updated_at: "2023-04-20T10:30:00Z"
  },
  {
    id: 2,
    name: "iPhone 12 Battery Replacement Kit",
    slug: "iphone-12-battery-replacement-kit",
    description: "Genuine Apple replacement battery for iPhone 12. Includes all necessary tools for installation.",
    price: 79.99,
    discount_percentage: 0,
    stock_quantity: 50,
    category_id: 1,
    category_name: "iPhone Parts",
    brand_id: 1,
    brand_name: "Apple",
    image_url: null,
    is_featured: true,
    is_new: false,
    average_rating: 4.5,
    review_count: 28,
    created_at: "2023-01-20T09:15:00Z",
    updated_at: "2023-04-18T14:45:00Z"
  },
  {
    id: 3,
    name: "Samsung Galaxy S22 Ultra AMOLED Display",
    slug: "samsung-galaxy-s22-ultra-amoled-display",
    description: "Original Samsung replacement AMOLED display for Galaxy S22 Ultra. Includes touch screen digitizer.",
    price: 249.99,
    discount_percentage: 15,
    stock_quantity: 18,
    category_id: 2,
    category_name: "Samsung Parts",
    brand_id: 2,
    brand_name: "Samsung",
    image_url: null,
    is_featured: true,
    is_new: true,
    average_rating: 4.7,
    review_count: 9,
    created_at: "2023-02-05T11:30:00Z",
    updated_at: "2023-04-22T16:20:00Z"
  },
  {
    id: 4,
    name: "iPad Pro 12.9\" (5th Gen) LCD Screen",
    slug: "ipad-pro-12-9-5th-gen-lcd-screen",
    description: "Genuine Apple replacement LCD screen for iPad Pro 12.9\" (5th Generation). Includes touch screen digitizer.",
    price: 349.99,
    discount_percentage: 5,
    stock_quantity: 12,
    category_id: 3,
    category_name: "iPad Parts",
    brand_id: 1,
    brand_name: "Apple",
    image_url: null,
    is_featured: false,
    is_new: true,
    average_rating: 4.9,
    review_count: 7,
    created_at: "2023-02-10T13:45:00Z",
    updated_at: "2023-04-15T09:10:00Z"
  },
  {
    id: 5,
    name: "MacBook Pro Retina Display Assembly (2021)",
    slug: "macbook-pro-retina-display-assembly-2021",
    description: "Genuine Apple replacement Retina display assembly for MacBook Pro (2021 model). Compatible with 14\" and 16\" models.",
    price: 599.99,
    discount_percentage: 0,
    stock_quantity: 8,
    category_id: 4,
    category_name: "MacBook Parts",
    brand_id: 1,
    brand_name: "Apple",
    image_url: null,
    is_featured: true,
    is_new: false,
    average_rating: 5.0,
    review_count: 4,
    created_at: "2023-02-15T10:00:00Z",
    updated_at: "2023-04-10T11:25:00Z"
  },
  {
    id: 6,
    name: "Professional Repair Tool Kit (24 pieces)",
    slug: "professional-repair-tool-kit-24-pieces",
    description: "Complete 24-piece repair tool kit for smartphones, tablets, and laptops. Includes precision screwdrivers, pry tools, tweezers, and more.",
    price: 49.99,
    discount_percentage: 20,
    stock_quantity: 35,
    category_id: 5,
    category_name: "Repair Tools",
    brand_id: 6,
    brand_name: "iFixit",
    image_url: null,
    is_featured: true,
    is_new: false,
    average_rating: 4.6,
    review_count: 42,
    created_at: "2023-01-05T15:30:00Z",
    updated_at: "2023-04-05T08:50:00Z"
  },
  {
    id: 7,
    name: "iPhone 13 Charging Port Flex Cable",
    slug: "iphone-13-charging-port-flex-cable",
    description: "Genuine Apple replacement charging port flex cable for iPhone 13. Includes microphone and speaker assembly.",
    price: 39.99,
    discount_percentage: 0,
    stock_quantity: 60,
    category_id: 1,
    category_name: "iPhone Parts",
    brand_id: 1,
    brand_name: "Apple",
    image_url: null,
    is_featured: false,
    is_new: false,
    average_rating: 4.4,
    review_count: 15,
    created_at: "2023-01-25T12:20:00Z",
    updated_at: "2023-04-12T13:15:00Z"
  },
  {
    id: 8,
    name: "Samsung Galaxy S21 Battery Replacement",
    slug: "samsung-galaxy-s21-battery-replacement",
    description: "Original Samsung replacement battery for Galaxy S21. Includes adhesive strips for installation.",
    price: 59.99,
    discount_percentage: 10,
    stock_quantity: 45,
    category_id: 2,
    category_name: "Samsung Parts",
    brand_id: 2,
    brand_name: "Samsung",
    image_url: null,
    is_featured: false,
    is_new: false,
    average_rating: 4.3,
    review_count: 22,
    created_at: "2023-02-20T09:40:00Z",
    updated_at: "2023-04-08T10:05:00Z"
  },
  {
    id: 9,
    name: "iPad Air 4 Digitizer Touch Screen",
    slug: "ipad-air-4-digitizer-touch-screen",
    description: "Genuine Apple replacement digitizer touch screen for iPad Air 4. Does not include LCD screen.",
    price: 129.99,
    discount_percentage: 5,
    stock_quantity: 20,
    category_id: 3,
    category_name: "iPad Parts",
    brand_id: 1,
    brand_name: "Apple",
    image_url: null,
    is_featured: false,
    is_new: true,
    average_rating: 4.7,
    review_count: 11,
    created_at: "2023-03-01T14:10:00Z",
    updated_at: "2023-04-14T15:30:00Z"
  },
  {
    id: 10,
    name: "MacBook Air M1 Keyboard Replacement",
    slug: "macbook-air-m1-keyboard-replacement",
    description: "Genuine Apple replacement keyboard for MacBook Air M1 (2020-2022). Includes backlight.",
    price: 179.99,
    discount_percentage: 0,
    stock_quantity: 15,
    category_id: 4,
    category_name: "MacBook Parts",
    brand_id: 1,
    brand_name: "Apple",
    image_url: null,
    is_featured: false,
    is_new: false,
    average_rating: 4.8,
    review_count: 6,
    created_at: "2023-03-05T11:25:00Z",
    updated_at: "2023-04-16T12:40:00Z"
  },
  {
    id: 11,
    name: "Heat Gun for Electronics Repair",
    slug: "heat-gun-for-electronics-repair",
    description: "Professional heat gun for electronics repair. Adjustable temperature settings from 100°C to 450°C.",
    price: 89.99,
    discount_percentage: 15,
    stock_quantity: 25,
    category_id: 5,
    category_name: "Repair Tools",
    brand_id: 7,
    brand_name: "MDTS Tools",
    image_url: null,
    is_featured: true,
    is_new: true,
    average_rating: 4.5,
    review_count: 18,
    created_at: "2023-03-10T10:15:00Z",
    updated_at: "2023-04-18T09:20:00Z"
  },
  {
    id: 12,
    name: "iPhone 14 Pro Rear Camera Module",
    slug: "iphone-14-pro-rear-camera-module",
    description: "Genuine Apple replacement rear camera module for iPhone 14 Pro. Includes all three camera lenses and sensors.",
    price: 199.99,
    discount_percentage: 0,
    stock_quantity: 10,
    category_id: 1,
    category_name: "iPhone Parts",
    brand_id: 1,
    brand_name: "Apple",
    image_url: null,
    is_featured: true,
    is_new: true,
    average_rating: 5.0,
    review_count: 3,
    created_at: "2023-03-15T13:30:00Z",
    updated_at: "2023-04-20T14:45:00Z"
  }
];

export default function handler(req, res) {
  const { page = 1, limit = 12, category, brand, minPrice, maxPrice, inStock, sortBy } = req.query;
  
  // Parse query parameters
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  // Filter products based on query parameters
  let filteredProducts = [...mockProducts];
  
  if (category) {
    filteredProducts = filteredProducts.filter(product => 
      product.category_name.toLowerCase().includes(category.toLowerCase())
    );
  }
  
  if (brand) {
    filteredProducts = filteredProducts.filter(product => 
      product.brand_name.toLowerCase().includes(brand.toLowerCase())
    );
  }
  
  if (minPrice && maxPrice) {
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    filteredProducts = filteredProducts.filter(product => 
      product.price >= min && product.price <= max
    );
  }
  
  if (inStock === 'true') {
    filteredProducts = filteredProducts.filter(product => product.stock_quantity > 0);
  }
  
  // Sort products
  if (sortBy) {
    switch (sortBy) {
      case 'price_asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'rating':
        filteredProducts.sort((a, b) => b.average_rating - a.average_rating);
        break;
      default:
        // Default sort by featured
        filteredProducts.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }
  }
  
  // Pagination
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  // Return response
  res.status(200).json({
    success: true,
    products: paginatedProducts,
    total: filteredProducts.length,
    totalPages: Math.ceil(filteredProducts.length / limitNum),
    currentPage: pageNum
  });
}
