import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartPage from '../../pages/cart';

// Mock cart items
const mockCartItems = [
  {
    id: 1,
    product_id: 1,
    product_name: 'iPhone 13 Screen Replacement',
    price: 89.99,
    quantity: 2,
    image: '/images/products/iphone-13-screen.jpg',
  },
  {
    id: 2,
    product_id: 3,
    product_name: 'iPhone 13 Battery',
    price: 49.99,
    quantity: 1,
    image: '/images/products/iphone-13-battery.jpg',
  },
];

// Mock getServerSideProps
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/cart',
  }),
}));

describe('Cart Page', () => {
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
  });

  it('renders cart items correctly', () => {
    render(<CartPage cartItems={mockCartItems} />);
    
    // Check if cart items are rendered
    expect(screen.getByText('iPhone 13 Screen Replacement')).toBeInTheDocument();
    expect(screen.getByText('iPhone 13 Battery')).toBeInTheDocument();
    
    // Check if quantities are correct
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Check if prices are correct
    expect(screen.getByText('$89.99')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    
    // Check if subtotal is correct (2 * 89.99 + 1 * 49.99 = 229.97)
    expect(screen.getByText('$229.97')).toBeInTheDocument();
  });

  it('allows updating item quantity', async () => {
    const user = userEvent.setup();
    render(<CartPage cartItems={mockCartItems} />);
    
    // Find quantity inputs
    const quantityInputs = screen.getAllByLabelText(/quantity/i);
    
    // Change quantity of first item
    await user.clear(quantityInputs[0]);
    await user.type(quantityInputs[0], '3');
    
    // Check if update button is clicked
    const updateButtons = screen.getAllByText(/update/i);
    await user.click(updateButtons[0]);
    
    // Check if fetch was called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cart', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          cartItemId: mockCartItems[0].id,
          quantity: 3,
        }),
      }));
    });
  });

  it('allows removing items from cart', async () => {
    const user = userEvent.setup();
    render(<CartPage cartItems={mockCartItems} />);
    
    // Find remove buttons
    const removeButtons = screen.getAllByText(/remove/i);
    
    // Click remove button for first item
    await user.click(removeButtons[0]);
    
    // Check if fetch was called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cart', expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({
          cartItemId: mockCartItems[0].id,
        }),
      }));
    });
  });

  it('shows empty cart message when no items', () => {
    render(<CartPage cartItems={[]} />);
    
    // Check if empty cart message is shown
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    
    // Check if continue shopping button is shown
    const continueShoppingButton = screen.getByText(/continue shopping/i);
    expect(continueShoppingButton).toBeInTheDocument();
    expect(continueShoppingButton.closest('a')).toHaveAttribute('href', '/products');
  });

  it('allows proceeding to checkout', async () => {
    const user = userEvent.setup();
    const mockRouter = { push: jest.fn() };
    jest.spyOn(require('next/router'), 'useRouter').mockReturnValue(mockRouter);
    
    render(<CartPage cartItems={mockCartItems} />);
    
    // Find checkout button
    const checkoutButton = screen.getByText(/proceed to checkout/i);
    
    // Click checkout button
    await user.click(checkoutButton);
    
    // Check if router.push was called with correct path
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/checkout');
    });
  });
});
