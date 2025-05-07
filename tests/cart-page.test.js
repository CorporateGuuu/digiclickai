import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Cart from '../pages/cart';

describe('Cart Page', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    // Setup router mock
    useRouter.mockImplementation(() => ({
      push: mockPush,
    }));

    // Setup session mock
    useSession.mockImplementation(() => ({
      data: null,
      status: 'unauthenticated'
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<Cart />);
    expect(screen.getByText('Loading your cart...')).toBeInTheDocument();
  });

  test('renders empty cart message when cart is empty', async () => {
    // Mock the fetch implementation to return empty cart
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          cart: { items: [], item_count: 0, subtotal: 0 }
        }),
      })
    );

    render(<Cart />);

    await waitFor(() => {
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
    });
  });

  test('renders cart items when cart has items', async () => {
    // Mock the fetch implementation to return cart with items
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          cart: {
            items: [
              {
                id: 1,
                name: 'iPhone 13 Pro LCD Screen',
                price: 89.99,
                quantity: 2,
                image_url: '/images/gapp/iphone-screen.jpg',
                slug: 'iphone-13-pro-lcd-screen',
                discount_percentage: 0,
                total: 179.98
              }
            ],
            item_count: 2,
            subtotal: 179.98
          }
        }),
      })
    );

    render(<Cart />);

    await waitFor(() => {
      expect(screen.getByText('iPhone 13 Pro LCD Screen')).toBeInTheDocument();
      expect(screen.getByText('$179.98')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  test('updates quantity when + button is clicked', async () => {
    // Mock the fetch implementation
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          cart: {
            items: [
              {
                id: 1,
                name: 'iPhone 13 Pro LCD Screen',
                price: 89.99,
                quantity: 3, // Updated quantity
                image_url: '/images/gapp/iphone-screen.jpg',
                slug: 'iphone-13-pro-lcd-screen',
                discount_percentage: 0,
                total: 269.97 // Updated total
              }
            ],
            item_count: 3,
            subtotal: 269.97
          }
        }),
      })
    );

    render(<Cart />);

    // Wait for the cart to load
    await waitFor(() => {
      expect(screen.getByText('iPhone 13 Pro LCD Screen')).toBeInTheDocument();
    });

    // Click the + button
    const plusButton = screen.getAllByText('+')[0];
    fireEvent.click(plusButton);

    // Verify the fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith('/api/cart', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId: 1, quantity: 3 }),
    });

    // Verify the updated quantity and total
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('$269.97')).toBeInTheDocument();
    });
  });

  test('removes item when Remove button is clicked', async () => {
    // Mock the fetch implementation
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          cart: {
            items: [], // Empty cart after removal
            item_count: 0,
            subtotal: 0
          }
        }),
      })
    );

    render(<Cart />);

    // Wait for the cart to load
    await waitFor(() => {
      expect(screen.getByText('iPhone 13 Pro LCD Screen')).toBeInTheDocument();
    });

    // Click the Remove button
    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    // Verify the fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith('/api/cart', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId: 1 }),
    });

    // Verify the cart is now empty
    await waitFor(() => {
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });
  });

  test('proceeds to checkout when Proceed to Checkout button is clicked', async () => {
    render(<Cart />);

    // Wait for the cart to load
    await waitFor(() => {
      expect(screen.getByText('iPhone 13 Pro LCD Screen')).toBeInTheDocument();
    });

    // Click the Proceed to Checkout button
    const checkoutButton = screen.getByText('Proceed to Checkout');
    fireEvent.click(checkoutButton);

    // Verify the router.push was called with the correct path
    expect(mockPush).toHaveBeenCalledWith('/checkout');
  });

  test('displays correct CSS styling for cart elements', async () => {
    render(<Cart />);

    // Wait for the cart to load
    await waitFor(() => {
      expect(screen.getByText('iPhone 13 Pro LCD Screen')).toBeInTheDocument();
    });

    // Check that the cart container has the correct class
    const cartContainer = document.querySelector('.cart_container');
    expect(cartContainer).toBeInTheDocument();

    // Check that the cart items container has the correct class
    const cartItems = document.querySelector('.cart_items');
    expect(cartItems).toBeInTheDocument();

    // Check that the cart summary has the correct class
    const cartSummary = document.querySelector('.cart_summary');
    expect(cartSummary).toBeInTheDocument();

    // Check that the quantity control has the correct class
    const quantityControl = document.querySelector('.quantity_control');
    expect(quantityControl).toBeInTheDocument();
  });
});
