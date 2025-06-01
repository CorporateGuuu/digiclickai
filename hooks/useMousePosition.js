'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Enhanced useMousePosition hook for DigiClick AI
 * Based on your original clean structure with added performance optimizations
 */
const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });

  // Performance optimization refs
  const lastPosition = useRef({ x: 0, y: 0 });
  const lastTime = useRef(Date.now());
  const rafId = useRef(null);
  const timeoutId = useRef(null);

  // Enhanced mouse move handler with performance optimizations
  const handleMouseMove = useCallback((e) => {
    // Cancel previous animation frame for smooth performance
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime.current;

      // Calculate velocity for advanced cursor effects
      const deltaX = e.clientX - lastPosition.current.x;
      const deltaY = e.clientY - lastPosition.current.y;

      if (deltaTime > 0) {
        setVelocity({
          x: deltaX / deltaTime,
          y: deltaY / deltaTime
        });
      }

      // Update position (keeping your original structure)
      setPosition({ x: e.clientX, y: e.clientY });

      // Update tracking variables
      lastPosition.current = { x: e.clientX, y: e.clientY };
      lastTime.current = currentTime;

      // Set moving state
      setIsMoving(true);

      // Clear existing timeout
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      // Set moving to false after inactivity
      timeoutId.current = setTimeout(() => {
        setIsMoving(false);
        setVelocity({ x: 0, y: 0 });
      }, 100);
    });
  }, []);

  useEffect(() => {
    // Check if device supports mouse (performance optimization)
    const hasMouseSupport = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (!hasMouseSupport) {
      return;
    }

    // Use window for global mouse tracking (keeping your original approach)
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);

      // Cleanup performance optimization refs
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [handleMouseMove]);

  // Return enhanced position data while maintaining your original structure
  return {
    ...position, // Spread your original x, y structure
    isMoving,
    velocity,
    // Additional utility functions for advanced cursor effects
    getDistance: (x2, y2) => {
      const dx = position.x - x2;
      const dy = position.y - y2;
      return Math.sqrt(dx * dx + dy * dy);
    },
    getAngle: (x2, y2) => {
      const dx = x2 - position.x;
      const dy = y2 - position.y;
      return Math.atan2(dy, dx);
    },
    getSpeed: () => {
      return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    }
  };
};

export default useMousePosition;
