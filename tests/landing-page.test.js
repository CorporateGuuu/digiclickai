import { render, screen } from '@testing-library/react';
import Home from '../pages/index';
import FeaturedProducts from '../components/FeaturedProducts/FeaturedProducts';

// Mock the components
jest.mock('../components/FeaturedProducts/FeaturedProducts', () => {
  return jest.fn(() => <div data-testid="mock-featured-products">Featured Products</div>);
});

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    pathname: '/',
  })),
}));

describe('Landing Page', () => {
  beforeEach(() => {
    FeaturedProducts.mockClear();
  });

  test('renders the landing page with featured products', () => {
    render(<Home />);
    
    // Check that the FeaturedProducts component is rendered
    expect(FeaturedProducts).toHaveBeenCalled();
    expect(screen.getByTestId('mock-featured-products')).toBeInTheDocument();
  });
});

describe('FeaturedProducts Component', () => {
  const mockProducts = [
    {
      id: 1,
      name: 'iPhone 13 Pro Screen',
      price: 82.34,
      discount_percentage: 10,
      category: 'iPhone Parts',
      imageUrl: '/images/products/iphone-screen.jpg',
    },
    {
      id: 2,
      name: 'Samsung Galaxy S21 Battery',
      price: 45.99,
      discount_percentage: 0,
      category: 'Samsung Parts',
      imageUrl: '/images/products/samsung-battery.jpg',
    }
  ];

  test('renders products with only one price value', () => {
    // Unmock the FeaturedProducts component for this test
    jest.unmock('../components/FeaturedProducts/FeaturedProducts');
    
    // Import the actual component
    const ActualFeaturedProducts = require('../components/FeaturedProducts/FeaturedProducts').default;
    
    render(<ActualFeaturedProducts products={mockProducts} />);
    
    // Check that each product is rendered
    expect(screen.getByText('iPhone 13 Pro Screen')).toBeInTheDocument();
    expect(screen.getByText('Samsung Galaxy S21 Battery')).toBeInTheDocument();
    
    // Check that only one price value is displayed for each product
    const prices = screen.getAllByText(/\$\d+\.\d+/);
    expect(prices).toHaveLength(2);
    
    // Check that the original price is not displayed
    const originalPrices = screen.queryAllByClassName('originalPrice');
    expect(originalPrices).toHaveLength(0);
    
    // Check that the sale price is displayed
    expect(screen.getByText('$82.34')).toBeInTheDocument();
    expect(screen.getByText('$45.99')).toBeInTheDocument();
  });
});
