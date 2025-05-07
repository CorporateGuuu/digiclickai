import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../../components/Header/Header';

// Mock useRouter
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}));

describe('Header Component', () => {
  it('renders the logo and navigation links', () => {
    render(<Header />);
    
    // Check if logo is rendered
    expect(screen.getByAltText(/MDTS/i)).toBeInTheDocument();
    
    // Check if navigation links are rendered
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Products/i)).toBeInTheDocument();
    expect(screen.getByText(/Categories/i)).toBeInTheDocument();
    expect(screen.getByText(/LCD Buyback/i)).toBeInTheDocument();
  });

  it('has working navigation links', async () => {
    const user = userEvent.setup();
    render(<Header />);
    
    // Get all navigation links
    const homeLink = screen.getByText(/Home/i);
    const productsLink = screen.getByText(/Products/i);
    const categoriesLink = screen.getByText(/Categories/i);
    const lcdBuybackLink = screen.getByText(/LCD Buyback/i);
    
    // Check if links have correct href attributes
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    expect(productsLink.closest('a')).toHaveAttribute('href', '/products');
    expect(categoriesLink.closest('a')).toHaveAttribute('href', '/categories');
    expect(lcdBuybackLink.closest('a')).toHaveAttribute('href', '/lcd-buyback');
    
    // Test clicking on links
    await user.click(homeLink);
    await user.click(productsLink);
    await user.click(categoriesLink);
    await user.click(lcdBuybackLink);
  });

  it('renders search bar', () => {
    render(<Header />);
    
    // Check if search bar is rendered
    const searchInput = screen.getByPlaceholderText(/Search/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('renders cart and account icons', () => {
    render(<Header />);
    
    // Check if cart and account icons are rendered
    const cartLink = screen.getByLabelText(/cart/i);
    const accountLink = screen.getByLabelText(/account/i);
    
    expect(cartLink).toBeInTheDocument();
    expect(accountLink).toBeInTheDocument();
    
    // Check if links have correct href attributes
    expect(cartLink).toHaveAttribute('href', '/cart');
    expect(accountLink).toHaveAttribute('href', '/account');
  });
});
