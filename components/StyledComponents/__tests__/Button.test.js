import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';
import { ThemeProvider } from 'styled-components';

// Mock styled-components to avoid issues with CSS-in-JS in tests
jest.mock('styled-components', () => ({
  ...jest.requireActual('styled-components'),
  css: jest.fn(() => ({})),
}));

// Create a wrapper component with ThemeProvider
const renderWithTheme = (ui) => {
  return render(
    <ThemeProvider theme={{}}>
      {ui}
    </ThemeProvider>
  );
};

describe('Button', () => {
  test('renders correctly with default props', () => {
    renderWithTheme(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  test('applies different variants correctly', () => {
    const { rerender } = renderWithTheme(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button', { name: /primary/i })).toBeInTheDocument();
    
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button', { name: /secondary/i })).toBeInTheDocument();
    
    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button', { name: /outline/i })).toBeInTheDocument();
    
    rerender(<Button variant="text">Text</Button>);
    expect(screen.getByRole('button', { name: /text/i })).toBeInTheDocument();
  });

  test('applies different sizes correctly', () => {
    const { rerender } = renderWithTheme(<Button size="small">Small</Button>);
    expect(screen.getByRole('button', { name: /small/i })).toBeInTheDocument();
    
    rerender(<Button size="medium">Medium</Button>);
    expect(screen.getByRole('button', { name: /medium/i })).toBeInTheDocument();
    
    rerender(<Button size="large">Large</Button>);
    expect(screen.getByRole('button', { name: /large/i })).toBeInTheDocument();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('can be disabled', () => {
    const handleClick = jest.fn();
    renderWithTheme(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
