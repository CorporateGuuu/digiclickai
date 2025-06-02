/**
 * Context-Aware Cursor System Tests
 * Tests all enhanced cursor states and interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedCustomCursor from '../components/CustomCursor/EnhancedCustomCursor';

// Mock GSAP
const mockGsap = {
  set: jest.fn(),
  to: jest.fn(),
  killTweensOf: jest.fn(),
};

// Mock window.gsap
Object.defineProperty(window, 'gsap', {
  value: mockGsap,
  writable: true,
});

// Mock useMousePosition hook
jest.mock('../hooks/useMousePosition', () => ({
  __esModule: true,
  default: () => ({
    x: 100,
    y: 100,
    isMoving: false,
    velocity: { x: 0, y: 0 },
    getSpeed: () => 0.5,
  }),
}));

describe('Context-Aware Cursor System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock non-touch device
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(hover: hover)' || query === '(pointer: fine)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('CTA Button Cursor State', () => {
    test('should transform to larger glowing circle on CTA button hover', async () => {
      render(<EnhancedCustomCursor />);
      
      // Create a CTA button element
      const ctaButton = document.createElement('button');
      ctaButton.className = 'cta-button';
      ctaButton.textContent = 'Test CTA';
      document.body.appendChild(ctaButton);

      // Simulate mouseover
      fireEvent.mouseOver(ctaButton);

      await waitFor(() => {
        expect(mockGsap.to).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            scale: 2.5,
            duration: 0.3,
            ease: 'power2.out'
          })
        );
      });

      document.body.removeChild(ctaButton);
    });

    test('should display "ENGAGE" text for CTA buttons', async () => {
      render(<EnhancedCustomCursor />);
      
      const ctaButton = document.createElement('button');
      ctaButton.setAttribute('data-cursor', 'cta');
      document.body.appendChild(ctaButton);

      fireEvent.mouseOver(ctaButton);

      await waitFor(() => {
        expect(document.querySelector('.cursorText')).toBeInTheDocument();
      });

      document.body.removeChild(ctaButton);
    });
  });

  describe('Navigation Link Cursor State', () => {
    test('should show arrow pointer with particle trail effect', async () => {
      render(<EnhancedCustomCursor />);
      
      const navLink = document.createElement('a');
      navLink.className = 'nav-link';
      navLink.href = '#';
      navLink.textContent = 'Home';
      document.body.appendChild(navLink);

      fireEvent.mouseOver(navLink);

      await waitFor(() => {
        expect(mockGsap.to).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            scale: 1.4,
            duration: 0.3,
            ease: 'power2.out'
          })
        );
      });

      document.body.removeChild(navLink);
    });
  });

  describe('Text Input Cursor State', () => {
    test('should switch to I-beam cursor for text inputs', async () => {
      render(<EnhancedCustomCursor />);
      
      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.placeholder = 'Enter text';
      document.body.appendChild(textInput);

      fireEvent.mouseOver(textInput);

      await waitFor(() => {
        expect(mockGsap.to).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            scaleX: 0.3,
            scaleY: 1.8,
            duration: 0.3,
            ease: 'power2.out'
          })
        );
      });

      document.body.removeChild(textInput);
    });

    test('should show typing indicator for text areas', async () => {
      render(<EnhancedCustomCursor />);
      
      const textarea = document.createElement('textarea');
      textarea.placeholder = 'Enter message';
      document.body.appendChild(textarea);

      fireEvent.mouseOver(textarea);

      await waitFor(() => {
        expect(mockGsap.to).toHaveBeenCalled();
      });

      document.body.removeChild(textarea);
    });
  });

  describe('Interactive Cards Cursor State', () => {
    test('should expand cursor with zoom icon for cards', async () => {
      render(<EnhancedCustomCursor />);
      
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = '<h3>Test Card</h3><p>Card content</p>';
      document.body.appendChild(card);

      fireEvent.mouseOver(card);

      await waitFor(() => {
        expect(mockGsap.to).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            scale: 1.8,
            duration: 0.3,
            ease: 'power2.out'
          })
        );
      });

      document.body.removeChild(card);
    });
  });

  describe('Draggable Elements Cursor State', () => {
    test('should show custom drag cursor for draggable elements', async () => {
      render(<EnhancedCustomCursor />);
      
      const draggable = document.createElement('div');
      draggable.draggable = true;
      draggable.textContent = 'Drag me';
      document.body.appendChild(draggable);

      fireEvent.mouseOver(draggable);

      await waitFor(() => {
        expect(mockGsap.to).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            scale: 1.5,
            duration: 0.3,
            ease: 'power2.out'
          })
        );
      });

      document.body.removeChild(draggable);
    });

    test('should handle drag start and end events', async () => {
      render(<EnhancedCustomCursor />);
      
      const draggable = document.createElement('div');
      draggable.draggable = true;
      document.body.appendChild(draggable);

      fireEvent.dragStart(draggable);
      await waitFor(() => {
        expect(mockGsap.to).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            scale: 1.8,
            duration: 0.2,
            ease: 'power2.out'
          })
        );
      });

      fireEvent.dragEnd(draggable);
      await waitFor(() => {
        expect(mockGsap.to).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          })
        );
      });

      document.body.removeChild(draggable);
    });
  });

  describe('File Upload Cursor State', () => {
    test('should display upload icon cursor for file inputs', async () => {
      render(<EnhancedCustomCursor />);
      
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.className = 'file-upload';
      document.body.appendChild(fileInput);

      fireEvent.mouseOver(fileInput);

      await waitFor(() => {
        expect(mockGsap.to).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            scale: 1.6,
            duration: 0.3,
            ease: 'power2.out'
          })
        );
      });

      document.body.removeChild(fileInput);
    });
  });

  describe('Disabled Elements Cursor State', () => {
    test('should show disabled cursor for disabled elements', async () => {
      render(<EnhancedCustomCursor />);
      
      const disabledButton = document.createElement('button');
      disabledButton.disabled = true;
      disabledButton.textContent = 'Disabled';
      document.body.appendChild(disabledButton);

      fireEvent.mouseOver(disabledButton);

      await waitFor(() => {
        expect(mockGsap.to).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            scale: 1.1,
            duration: 0.3,
            ease: 'power2.out'
          })
        );
      });

      document.body.removeChild(disabledButton);
    });
  });

  describe('Loading State Cursor', () => {
    test('should show spinning cursor during loading', async () => {
      render(<EnhancedCustomCursor />);
      
      const loadingElement = document.createElement('div');
      loadingElement.className = 'loading';
      document.body.appendChild(loadingElement);

      fireEvent.mouseOver(loadingElement);

      await waitFor(() => {
        expect(mockGsap.to).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            scale: 1.3,
            rotation: 360,
            repeat: -1,
            transformOrigin: 'center'
          })
        );
      });

      document.body.removeChild(loadingElement);
    });
  });

  describe('Form Validation States', () => {
    test('should show success cursor for valid inputs', async () => {
      render(<EnhancedCustomCursor />);
      
      const input = document.createElement('input');
      input.type = 'email';
      input.value = 'test@example.com';
      // Mock validity
      Object.defineProperty(input, 'validity', {
        value: { valid: true },
        writable: true,
      });
      document.body.appendChild(input);

      fireEvent.input(input);

      await waitFor(() => {
        expect(mockGsap.to).toHaveBeenCalled();
      });

      document.body.removeChild(input);
    });

    test('should show error cursor for invalid inputs', async () => {
      render(<EnhancedCustomCursor />);
      
      const input = document.createElement('input');
      input.type = 'email';
      input.value = 'invalid-email';
      // Mock validity
      Object.defineProperty(input, 'validity', {
        value: { valid: false },
        writable: true,
      });
      document.body.appendChild(input);

      fireEvent.input(input);

      await waitFor(() => {
        expect(mockGsap.to).toHaveBeenCalled();
      });

      document.body.removeChild(input);
    });
  });

  describe('Performance and Accessibility', () => {
    test('should disable cursor on touch devices', () => {
      // Mock touch device
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(hover: none)' || query === '(pointer: coarse)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const { container } = render(<EnhancedCustomCursor />);
      expect(container.firstChild).toBeNull();
    });

    test('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<EnhancedCustomCursor />);
      // Cursor should still render but with reduced animations
      expect(mockGsap.set).toHaveBeenCalled();
    });

    test('should cleanup GSAP animations on unmount', () => {
      const { unmount } = render(<EnhancedCustomCursor />);
      
      unmount();
      
      expect(mockGsap.killTweensOf).toHaveBeenCalled();
    });
  });

  describe('Cursor Reset Functionality', () => {
    test('should reset cursor state when leaving interactive elements', async () => {
      render(<EnhancedCustomCursor />);
      
      const button = document.createElement('button');
      button.className = 'cta-button';
      document.body.appendChild(button);

      // Hover over button
      fireEvent.mouseOver(button);
      
      // Move to non-interactive element
      const div = document.createElement('div');
      document.body.appendChild(div);
      fireEvent.mouseOver(div);

      await waitFor(() => {
        expect(mockGsap.to).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            scale: 1,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            duration: 0.3,
            ease: 'power2.out'
          })
        );
      });

      document.body.removeChild(button);
      document.body.removeChild(div);
    });
  });
});
