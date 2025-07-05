import { render, screen } from '@testing-library/react';
import PrivacyPolicy from '../pages/privacy';
import Layout from '../components/Layout/Layout';

// Mock the Layout component
jest.mock('../components/Layout/Layout', () => {
  return jest.fn(({ children }) => (
    <div data-testid="mock-layout">
      <header data-testid="mock-header">Header</header>
      {children}
      <footer data-testid="mock-footer">Footer</footer>
    </div>
  ));
});

describe('Privacy Policy Page', () => {
  beforeEach(() => {
    Layout.mockClear();
  });

  test('renders the privacy policy page with layout', () => {
    render(<PrivacyPolicy />);
    
    // Check that the Layout component is rendered
    expect(Layout).toHaveBeenCalled();
    
    // Check that the Layout component receives the correct props
    expect(Layout).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Privacy Policy - Midas Technical Solutions',
        description: 'Learn about how Midas Technical Solutions collects, uses, and protects your personal information.'
      }),
      expect.anything()
    );
    
    // Check that the header and footer are rendered
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    
    // Check that the privacy policy content is rendered
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText(/Last Updated:/)).toBeInTheDocument();
  });

  test('renders all privacy policy sections', () => {
    render(<PrivacyPolicy />);
    
    // Check that all sections are rendered
    expect(screen.getByText('Information We Collect')).toBeInTheDocument();
    expect(screen.getByText('How We Use Your Information')).toBeInTheDocument();
    expect(screen.getByText('Information Sharing and Disclosure')).toBeInTheDocument();
    expect(screen.getByText('Your Choices and Rights')).toBeInTheDocument();
    expect(screen.getByText('Data Security')).toBeInTheDocument();
    expect(screen.getByText('Children\'s Privacy')).toBeInTheDocument();
    expect(screen.getByText('International Data Transfers')).toBeInTheDocument();
    expect(screen.getByText('Changes to This Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  test('renders the contact information correctly', () => {
    render(<PrivacyPolicy />);
    
    // Check that the contact information is rendered
    expect(screen.getByText(/If you have any questions/)).toBeInTheDocument();
    expect(screen.getByText(/support@mdtstech.store/)).toBeInTheDocument();
    expect(screen.getByText(/Vienna, VA 22182/)).toBeInTheDocument();
  });
});
