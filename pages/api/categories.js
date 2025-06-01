// Mock categories data
const mockCategories = [
  { 
    id: 1, 
    name: 'iPhone Parts', 
    slug: 'iphone-parts', 
    product_count: 124, 
    image_url: '/images/gapp/iphone-parts.png',
    description: 'Genuine Apple parts and high-quality replacements for all iPhone models'
  },
  { 
    id: 2, 
    name: 'Samsung Parts', 
    slug: 'samsung-parts', 
    product_count: 98, 
    image_url: '/images/gapp/samsung-parts.png',
    description: 'Premium quality replacement parts for all Samsung Galaxy models'
  },
  { 
    id: 3, 
    name: 'iPad Parts', 
    slug: 'ipad-parts', 
    product_count: 76, 
    image_url: '/images/gapp/ipad-parts.png',
    description: 'Genuine Apple parts and quality replacements for all iPad models'
  },
  { 
    id: 4, 
    name: 'MacBook Parts', 
    slug: 'macbook-parts', 
    product_count: 52, 
    image_url: '/images/gapp/macbook-parts.png',
    description: 'High-quality replacement parts for all MacBook models'
  },
  { 
    id: 5, 
    name: 'Repair Tools', 
    slug: 'repair-tools', 
    product_count: 87, 
    image_url: '/images/gapp/repair-tools.png',
    description: 'Professional repair tools for all your device repair needs'
  }
];

export default function handler(req, res) {
  res.status(200).json({
    success: true,
    categories: mockCategories
  });
}
