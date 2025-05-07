// This file contains end-to-end tests using Cypress
// To run these tests, you need to install Cypress: npm install --save-dev cypress

describe('E2E Tests', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('http://localhost:3004');
  });

  describe('Navigation', () => {
    it('should navigate to the cart page', () => {
      // Click on the cart icon in the header
      cy.get('a[href="/cart"]').click();
      
      // Check that we are on the cart page
      cy.url().should('include', '/cart');
      cy.contains('h1', 'Your Cart').should('be.visible');
    });

    it('should navigate to the privacy page', () => {
      // Click on the privacy link in the footer
      cy.get('a[href="/privacy"]').click();
      
      // Check that we are on the privacy page
      cy.url().should('include', '/privacy');
      cy.contains('h1', 'Privacy Policy').should('be.visible');
    });
  });

  describe('Cart Functionality', () => {
    it('should add a product to the cart', () => {
      // Navigate to a product page
      cy.get('a[href="/products/iphone-13-pro-screen"]').first().click();
      
      // Check that we are on the product page
      cy.url().should('include', '/products/iphone-13-pro-screen');
      
      // Add the product to the cart
      cy.contains('button', 'Add to Cart').click();
      
      // Navigate to the cart page
      cy.get('a[href="/cart"]').click();
      
      // Check that the product is in the cart
      cy.contains('iPhone 13 Pro Screen').should('be.visible');
    });

    it('should update the quantity of a product in the cart', () => {
      // Navigate to the cart page
      cy.get('a[href="/cart"]').click();
      
      // Check that the product is in the cart
      cy.contains('iPhone 13 Pro Screen').should('be.visible');
      
      // Get the current quantity
      cy.get('.quantity_control span').then(($span) => {
        const initialQuantity = parseInt($span.text());
        
        // Click the + button
        cy.get('.quantity_control button').last().click();
        
        // Check that the quantity has increased
        cy.get('.quantity_control span').should('have.text', (initialQuantity + 1).toString());
      });
    });

    it('should remove a product from the cart', () => {
      // Navigate to the cart page
      cy.get('a[href="/cart"]').click();
      
      // Check that the product is in the cart
      cy.contains('iPhone 13 Pro Screen').should('be.visible');
      
      // Click the Remove button
      cy.contains('button', 'Remove').click();
      
      // Check that the product is no longer in the cart
      cy.contains('Your cart is empty').should('be.visible');
    });
  });

  describe('Landing Page', () => {
    it('should display featured products with only one price value', () => {
      // Check that the featured products section is visible
      cy.contains('h2', 'Featured Products').should('be.visible');
      
      // Check that each product has only one price value
      cy.get('.product').each(($product) => {
        // Count the number of price elements
        cy.wrap($product).find('.price span').should('have.length', 1);
      });
    });
  });

  describe('CSS Integration', () => {
    it('should load all required CSS files', () => {
      // Check that all required CSS files are loaded
      cy.get('link[href="/css/global.css"]').should('exist');
      cy.get('link[href="/css/components.css"]').should('exist');
      cy.get('link[href="/css/home.css"]').should('exist');
      cy.get('link[href="/css/animations.css"]').should('exist');
    });

    it('should apply CSS styles correctly', () => {
      // Check that the cart container has the correct styles
      cy.get('.cart_container').should('have.css', 'display', 'flex');
      
      // Check that the cart items container has the correct styles
      cy.get('.cart_items').should('have.css', 'background-color', 'rgb(255, 255, 255)');
      
      // Check that the cart summary has the correct styles
      cy.get('.cart_summary').should('have.css', 'border-radius', '8px');
    });
  });
});
