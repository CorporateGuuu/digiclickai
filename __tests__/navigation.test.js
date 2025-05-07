import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

// Mock useRouter
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}));

describe('Navigation Links', () => {
  it('header navigation links have correct hrefs', () => {
    render(<Header />);
    
    // Check main navigation links
    const homeLink = screen.getByText(/Home/i).closest('a');
    const productsLink = screen.getByText(/Products/i).closest('a');
    const categoriesLink = screen.getByText(/Categories/i).closest('a');
    const lcdBuybackLink = screen.getByText(/LCD Buyback/i).closest('a');
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(productsLink).toHaveAttribute('href', '/products');
    expect(categoriesLink).toHaveAttribute('href', '/categories');
    expect(lcdBuybackLink).toHaveAttribute('href', '/lcd-buyback');
    
    // Check utility navigation links
    const cartLink = screen.getByLabelText(/cart/i);
    const accountLink = screen.getByLabelText(/account/i);
    
    expect(cartLink).toHaveAttribute('href', '/cart');
    expect(accountLink).toHaveAttribute('href', '/account');
  });

  it('footer navigation links have correct hrefs', () => {
    render(<Footer />);
    
    // Check shop links
    const iphonePartsLink = screen.getByText(/iPhone Parts/i).closest('a');
    const samsungPartsLink = screen.getByText(/Samsung Parts/i).closest('a');
    const ipadPartsLink = screen.getByText(/iPad Parts/i).closest('a');
    const macbookPartsLink = screen.getByText(/MacBook Parts/i).closest('a');
    const repairToolsLink = screen.getByText(/Repair Tools/i).closest('a');
    
    expect(iphonePartsLink).toHaveAttribute('href', '/categories/iphone-parts');
    expect(samsungPartsLink).toHaveAttribute('href', '/categories/samsung-parts');
    expect(ipadPartsLink).toHaveAttribute('href', '/categories/ipad-parts');
    expect(macbookPartsLink).toHaveAttribute('href', '/categories/macbook-parts');
    expect(repairToolsLink).toHaveAttribute('href', '/categories/repair-tools');
    
    // Check information links
    const aboutUsLink = screen.getByText(/About Us/i).closest('a');
    const contactLink = screen.getByText(/Contact/i).closest('a');
    const blogLink = screen.getByText(/Blog/i).closest('a');
    const privacyPolicyLink = screen.getByText(/Privacy Policy/i).closest('a');
    const termsLink = screen.getByText(/Terms & Conditions/i).closest('a');
    
    expect(aboutUsLink).toHaveAttribute('href', '/about');
    expect(contactLink).toHaveAttribute('href', '/contact');
    expect(blogLink).toHaveAttribute('href', '/blog');
    expect(privacyPolicyLink).toHaveAttribute('href', '/privacy-policy');
    expect(termsLink).toHaveAttribute('href', '/terms');
    
    // Check customer service links
    const faqLink = screen.getByText(/FAQ/i).closest('a');
    const shippingLink = screen.getByText(/Shipping/i).closest('a');
    const returnsLink = screen.getByText(/Returns/i).closest('a');
    const warrantyLink = screen.getByText(/Warranty/i).closest('a');
    
    expect(faqLink).toHaveAttribute('href', '/faq');
    expect(shippingLink).toHaveAttribute('href', '/shipping');
    expect(returnsLink).toHaveAttribute('href', '/returns');
    expect(warrantyLink).toHaveAttribute('href', '/warranty');
  });

  it('allows navigation through header links', async () => {
    const user = userEvent.setup();
    const mockRouter = { push: jest.fn() };
    jest.spyOn(require('next/router'), 'useRouter').mockReturnValue(mockRouter);
    
    render(<Header />);
    
    // Click on Products link
    await user.click(screen.getByText(/Products/i));
    
    // Check if router.push was called with correct path
    expect(mockRouter.push).toHaveBeenCalledWith('/products');
  });

  it('allows navigation through footer links', async () => {
    const user = userEvent.setup();
    const mockRouter = { push: jest.fn() };
    jest.spyOn(require('next/router'), 'useRouter').mockReturnValue(mockRouter);
    
    render(<Footer />);
    
    // Click on About Us link
    await user.click(screen.getByText(/About Us/i));
    
    // Check if router.push was called with correct path
    expect(mockRouter.push).toHaveBeenCalledWith('/about');
  });
});
