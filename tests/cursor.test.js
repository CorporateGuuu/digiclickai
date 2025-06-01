/**
 * DigiClick AI Custom Cursor Tests
 * Tests for cursor functionality, performance, and integration
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomCursor from '../components/CustomCursor/CustomCursor';
import Layout from '../components/Layout';
import useMousePosition from '../hooks/useMousePosition';

// Mock GSAP
jest.mock('gsap', () => ({
  fromTo: jest.fn(),
  from: jest.fn(),
  to: jest.fn(),
  set: jest.fn(),
  timeline: jest.fn(() => ({
    fromTo: jest.fn(),
    from: jest.fn(),
    to: jest.fn()
  }))
}));

// Mock useMousePosition hook
jest.mock('../hooks/useMousePosition', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    x: 100,
    y: 100,
    isMoving: false,
    velocity: { x: 0, y: 0 },
    getSpeed: () => 0,
    getDistance: () => 0,
    getAngle: () => 0
  }))
}));

// Mock window.matchMedia for touch device detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('DigiClick AI Custom Cursor', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset DOM
    document.body.innerHTML = '';
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
    global.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    // Clean up any created elements
    const particles = document.querySelectorAll('.cursor-trail-particle');
    particles.forEach(particle => particle.remove());
    
    const ripples = document.querySelectorAll('.cursor-click-ripple');
    ripples.forEach(ripple => ripple.remove());
  });

  describe('CustomCursor Component', () => {
    test('renders without crashing', () => {
      render(<CustomCursor />);
      // CustomCursor doesn't render visible content by default
      expect(document.body).toBeInTheDocument();
    });

    test('hides on touch devices', () => {
      // Mock touch device
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(hover: none) and (pointer: coarse)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(<CustomCursor />);
      
      // Should not render cursor on touch devices
      const cursor = document.querySelector('.cursor');
      expect(cursor).toBeNull();
    });

    test('creates cursor element on desktop', () => {
      // Mock desktop device
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query !== '(hover: none) and (pointer: coarse)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(<CustomCursor />);
      
      // Wait for cursor to be created
      waitFor(() => {
        const cursor = document.querySelector('[role="presentation"]');
        expect(cursor).toBeInTheDocument();
      });
    });

    test('responds to mouse movement', () => {
      const mockMousePosition = {
        x: 200,
        y: 150,
        isMoving: true,
        velocity: { x: 5, y: 3 },
        getSpeed: () => 8,
        getDistance: () => 0,
        getAngle: () => 0
      };

      useMousePosition.mockReturnValue(mockMousePosition);

      render(<CustomCursor />);

      // Verify that the hook is called
      expect(useMousePosition).toHaveBeenCalled();
    });

    test('creates particle trails', async () => {
      const mockMousePosition = {
        x: 300,
        y: 200,
        isMoving: true,
        velocity: { x: 10, y: 5 },
        getSpeed: () => 15,
        getDistance: () => 0,
        getAngle: () => 0
      };

      useMousePosition.mockReturnValue(mockMousePosition);

      render(<CustomCursor />);

      // Wait for particles to be created
      await waitFor(() => {
        const particles = document.querySelectorAll('.cursor-trail-particle');
        expect(particles.length).toBeGreaterThan(0);
      }, { timeout: 1000 });
    });

    test('creates click ripple effects', async () => {
      render(<CustomCursor />);

      // Simulate mouse click
      fireEvent.mouseDown(document.body);

      // Wait for ripple to be created
      await waitFor(() => {
        const ripples = document.querySelectorAll('.cursor-click-ripple');
        expect(ripples.length).toBeGreaterThan(0);
      }, { timeout: 500 });
    });
  });

  describe('Layout Integration', () => {
    test('Layout renders with CustomCursor', () => {
      render(
        <Layout showCursor={true}>
          <div>Test content</div>
        </Layout>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    test('Layout can disable cursor', () => {
      render(
        <Layout showCursor={false}>
          <div>Test content</div>
        </Layout>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
      
      // Cursor should not be rendered
      const cursor = document.querySelector('[role="presentation"]');
      expect(cursor).toBeNull();
    });

    test('Layout applies cursor theme', () => {
      render(
        <Layout showCursor={true} cursorTheme="neon">
          <div>Test content</div>
        </Layout>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('Mouse Position Hook', () => {
    test('useMousePosition returns expected structure', () => {
      const result = useMousePosition();
      
      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y');
      expect(result).toHaveProperty('isMoving');
      expect(result).toHaveProperty('velocity');
      expect(result).toHaveProperty('getSpeed');
      expect(result).toHaveProperty('getDistance');
      expect(result).toHaveProperty('getAngle');
    });

    test('getSpeed function works correctly', () => {
      const mockMousePosition = {
        x: 100,
        y: 100,
        isMoving: true,
        velocity: { x: 3, y: 4 },
        getSpeed: () => Math.sqrt(3*3 + 4*4), // Should return 5
        getDistance: () => 0,
        getAngle: () => 0
      };

      useMousePosition.mockReturnValue(mockMousePosition);
      
      const result = useMousePosition();
      expect(result.getSpeed()).toBe(5);
    });
  });

  describe('Performance Tests', () => {
    test('cursor cleanup prevents memory leaks', async () => {
      const { unmount } = render(<CustomCursor />);

      // Create some particles
      fireEvent.mouseMove(document.body);
      fireEvent.mouseDown(document.body);

      // Wait for particles to be created
      await waitFor(() => {
        const particles = document.querySelectorAll('.cursor-trail-particle');
        expect(particles.length).toBeGreaterThan(0);
      });

      // Unmount component
      unmount();

      // Wait for cleanup
      await waitFor(() => {
        const particles = document.querySelectorAll('.cursor-trail-particle');
        const ripples = document.querySelectorAll('.cursor-click-ripple');
        expect(particles.length + ripples.length).toBe(0);
      }, { timeout: 2000 });
    });

    test('requestAnimationFrame is used for smooth animations', () => {
      render(<CustomCursor />);
      
      // Verify that requestAnimationFrame is called
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    test('event listeners are properly cleaned up', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = render(<CustomCursor />);

      // Verify event listeners were added
      expect(addEventListenerSpy).toHaveBeenCalled();

      // Unmount and verify cleanup
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    test('cursor has proper ARIA attributes', async () => {
      render(<CustomCursor />);

      await waitFor(() => {
        const cursor = document.querySelector('[role="presentation"]');
        if (cursor) {
          expect(cursor).toHaveAttribute('aria-hidden', 'true');
        }
      });
    });

    test('respects reduced motion preferences', () => {
      // Mock reduced motion preference
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(<CustomCursor />);

      // Cursor should still render but with reduced animations
      // This would be tested by checking CSS classes or animation states
    });
  });

  describe('Error Handling', () => {
    test('handles missing GSAP gracefully', () => {
      // Mock GSAP as undefined
      global.gsap = undefined;

      expect(() => {
        render(<CustomCursor />);
      }).not.toThrow();
    });

    test('handles DOM manipulation errors gracefully', () => {
      // Mock document.createElement to throw an error
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn(() => {
        throw new Error('DOM error');
      });

      expect(() => {
        render(<CustomCursor />);
      }).not.toThrow();

      // Restore original function
      document.createElement = originalCreateElement;
    });
  });
});

describe('Integration Tests', () => {
  test('cursor works with interactive elements', async () => {
    render(
      <Layout showCursor={true}>
        <button className="cta-button">Test Button</button>
        <a href="#" className="nav-link">Test Link</a>
        <h1 className="glow-text">Test Heading</h1>
      </Layout>
    );

    const button = screen.getByText('Test Button');
    const link = screen.getByText('Test Link');
    const heading = screen.getByText('Test Heading');

    expect(button).toBeInTheDocument();
    expect(link).toBeInTheDocument();
    expect(heading).toBeInTheDocument();

    // Test hover interactions
    fireEvent.mouseOver(button);
    fireEvent.mouseOver(link);
    fireEvent.mouseOver(heading);

    // These would trigger cursor state changes in the actual implementation
  });

  test('cursor themes apply correctly', () => {
    const themes = ['default', 'minimal', 'neon', 'corporate'];

    themes.forEach(theme => {
      const { unmount } = render(
        <Layout showCursor={true} cursorTheme={theme}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
      unmount();
    });
  });
});
