// Mock data for search results
const mockProducts = [
  {
    id: 1,
    name: 'iPhone 13 Pro OLED Screen',
    slug: 'iphone-13-pro-oled-screen',
    description: 'High-quality replacement OLED screen for iPhone 13 Pro models.',
    price: 129.99,
    discount_percentage: 13.33,
    imageUrl: '/images/iphone-screen.svg',
    category_name: 'iPhone Parts',
    created_at: '2023-05-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'Professional Repair Tool Kit',
    slug: 'professional-repair-tool-kit',
    description: 'Complete toolkit for phone and tablet repairs with precision screwdrivers.',
    price: 89.99,
    discount_percentage: 0,
    imageUrl: '/images/repair-tools.svg',
    category_name: 'Tools',
    created_at: '2023-05-14T14:20:00Z'
  },
  {
    id: 3,
    name: 'Samsung Galaxy S22 Battery',
    slug: 'samsung-galaxy-s22-battery',
    description: 'Replacement battery for Samsung Galaxy S22 with installation tools.',
    price: 39.99,
    discount_percentage: 20,
    imageUrl: '/images/samsung-battery.svg',
    category_name: 'Samsung Parts',
    created_at: '2023-05-13T09:15:00Z'
  },
  {
    id: 4,
    name: 'iPad Pro 12.9" LCD Assembly',
    slug: 'ipad-pro-12-9-lcd-assembly',
    description: 'Complete LCD assembly for iPad Pro 12.9" models with digitizer.',
    price: 199.99,
    discount_percentage: 0,
    imageUrl: '/images/ipad-screen.svg',
    category_name: 'iPad Parts',
    created_at: '2023-05-12T16:45:00Z'
  },
  {
    id: 5,
    name: 'iPhone 12 LCD Screen',
    slug: 'iphone-12-lcd-screen',
    description: 'Replacement LCD screen for iPhone 12 models with high color accuracy.',
    price: 89.99,
    discount_percentage: 0,
    imageUrl: '/images/iphone12-screen.svg',
    category_name: 'iPhone Parts',
    created_at: '2023-05-11T11:30:00Z'
  },
  {
    id: 6,
    name: 'Samsung Galaxy S21 Battery',
    slug: 'samsung-galaxy-s21-battery',
    description: 'OEM quality replacement battery for Samsung Galaxy S21.',
    price: 34.99,
    discount_percentage: 0,
    imageUrl: '/images/s21-battery.svg',
    category_name: 'Samsung Parts',
    created_at: '2023-05-10T13:20:00Z'
  },
  {
    id: 7,
    name: 'iPad Mini 5 Digitizer',
    slug: 'ipad-mini-5-digitizer',
    description: 'Replacement touch digitizer for iPad Mini 5 with installation kit.',
    price: 79.99,
    discount_percentage: 10,
    imageUrl: '/images/ipad-mini.svg',
    category_name: 'iPad Parts',
    created_at: '2023-05-09T15:10:00Z'
  },
  {
    id: 8,
    name: 'MacBook Pro Keyboard',
    slug: 'macbook-pro-keyboard',
    description: 'Replacement keyboard for MacBook Pro models 2019-2021.',
    price: 129.99,
    discount_percentage: 0,
    imageUrl: '/images/macbook-keyboard.svg',
    category_name: 'MacBook Parts',
    created_at: '2023-05-08T10:05:00Z'
  }
];

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q || q.trim() === '') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    // Simulate a delay to mimic a real API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Filter products based on search query
    const searchResults = mockProducts.filter(product => {
      const searchTerm = q.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category_name.toLowerCase().includes(searchTerm)
      );
    });

    return res.status(200).json(searchResults);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
