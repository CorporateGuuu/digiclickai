describe('Basic functionality', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
  });

  it('should have the correct title', () => {
    cy.title().should('include', 'MDTS');
  });

  it('should have a working header with navigation', () => {
    // Check that the header exists
    cy.get('header').should('exist');
    
    // Check that the logo exists and links to the homepage
    cy.get('header a[href="/"]').should('exist');
    
    // Check that the navigation links exist
    cy.get('header nav').should('exist');
  });

  it('should have a working footer', () => {
    // Check that the footer exists
    cy.get('footer').should('exist');
    
    // Check that the footer has links
    cy.get('footer a').should('have.length.at.least', 1);
  });

  it('should navigate to the cart page', () => {
    // Find and click the cart link
    cy.get('a[href="/cart"]').first().click();
    
    // Check that we are on the cart page
    cy.url().should('include', '/cart');
    cy.get('h1').should('contain', 'Your Cart');
  });

  it('should navigate to the privacy page', () => {
    // Find and click the privacy link in the footer
    cy.get('footer a[href="/privacy"]').click();
    
    // Check that we are on the privacy page
    cy.url().should('include', '/privacy');
    cy.get('h1').should('contain', 'Privacy Policy');
  });

  it('should have no console errors', () => {
    // Listen for console errors
    cy.on('window:console', (message) => {
      // Skip React DevTools messages
      if (message.message && message.message.includes('Download the React DevTools')) {
        return;
      }
      // Fail the test if there's an error
      expect(message.level).not.to.equal('error');
    });
    
    // Navigate to a few pages to check for errors
    cy.visit('/');
    cy.visit('/cart');
    cy.visit('/privacy');
  });
});
