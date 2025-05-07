import React from 'react';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
  return <div>This will not render</div>;
};

describe('ErrorBoundary Component', () => {
  it('renders children when there is no error', () => {
    cy.mount(
      <ErrorBoundary>
        <div data-testid="child">Child Component</div>
      </ErrorBoundary>
    );
    
    cy.get('[data-testid="child"]').should('exist');
    cy.contains('Child Component').should('be.visible');
  });

  it('renders fallback UI when there is an error', () => {
    cy.mount(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    cy.contains('Something went wrong').should('be.visible');
    cy.contains("We're sorry, but there was an error loading this component.").should('be.visible');
    cy.contains('Reload Page').should('be.visible');
  });

  it('shows error details when showDetails prop is true', () => {
    cy.mount(
      <ErrorBoundary showDetails={true}>
        <ThrowError />
      </ErrorBoundary>
    );
    
    cy.contains('Something went wrong').should('be.visible');
    cy.contains('Error: Test error').should('be.visible');
  });
});
