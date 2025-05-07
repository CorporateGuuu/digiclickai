import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductPage from '../../pages/products/[id]';

// Mock the useRouter hook
jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { id: '1' },
    push: jest.fn(),
    pathname: '/products/1',
  }),
}));

// Mock product data
const mockProduct = {
  id: 1,
  name: 'iPhone 13 Screen Replacement',
  price: 89.99,
  description: 'High-quality replacement screen for iPhone 13',
  image: '/images/products/iphone-13-screen.jpg',
  category: 'iPhone Parts',
  stock: 15,
  rating: 4.5,
  reviews: 28,
};

// Mock getServerSideProps
jest.mock('../../lib/db', () => ({
  query: jest.fn(() => ({
    rows: [mockProduct],
  })),
}));

describe('Product Page', () => {
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
  });

  it('renders product details correctly', () => {
    render(<ProductPage product={mockProduct} />);
    
    // Check if product details are rendered
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(`$${mockProduct.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    expect(screen.getByText(`In Stock: ${mockProduct.stock}`)).toBeInTheDocument();
    
    // Check if product image is rendered
    const image = screen.getByAltText(mockProduct.name);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining(mockProduct.image));
  });

  it('allows changing quantity and adding to cart', async () => {
    const user = userEvent.setup();
    render(<ProductPage product={mockProduct} />);
    
    // Find quantity input and add to cart button
    const quantityInput = screen.getByLabelText(/quantity/i);
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    
    // Change quantity
    await user.clear(quantityInput);
    await user.type(quantityInput, '3');
    expect(quantityInput).toHaveValue(3);
    
    // Click add to cart button
    await user.click(addToCartButton);
    
    // Check if fetch was called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cart', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          productId: mockProduct.id,
          quantity: 3,
        }),
      }));
    });
  });

  it('shows related products section', () => {
    render(<ProductPage product={mockProduct} relatedProducts={[
      { id: 2, name: 'iPhone 13 Battery', price: 49.99, image: '/images/products/iphone-13-battery.jpg' },
      { id: 3, name: 'iPhone 13 Back Glass', price: 39.99, image: '/images/products/iphone-13-back.jpg' },
    ]} />);
    
    // Check if related products section is rendered
    expect(screen.getByText(/Related Products/i)).toBeInTheDocument();
    expect(screen.getByText('iPhone 13 Battery')).toBeInTheDocument();
    expect(screen.getByText('iPhone 13 Back Glass')).toBeInTheDocument();
  });

  it('shows error message when adding to cart fails', async () => {
    // Mock fetch to return an error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Failed to add to cart' }),
      })
    );
    
    const user = userEvent.setup();
    render(<ProductPage product={mockProduct} />);
    
    // Find add to cart button
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    
    // Click add to cart button
    await user.click(addToCartButton);
    
    // Check if error message is shown
    await waitFor(() => {
      expect(screen.getByText(/failed to add to cart/i)).toBeInTheDocument();
    });
  });
});
