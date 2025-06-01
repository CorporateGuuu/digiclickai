import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './CustomCursor.module.css';
import useMousePosition from '../../hooks/useMousePosition';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const trailRef = useRef([]);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [cursorType, setCursorType] = useState('default');
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef();

  // Use your enhanced mouse position hook
  const { x, y, isMoving, velocity, getSpeed } = useMousePosition();

  // Cursor animation loop using your mouse position data
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let currentX = x;
    let currentY = y;

    const animate = () => {
      // Smooth cursor movement with easing (enhanced with velocity)
      const baseEase = 0.15;
      const velocityFactor = Math.min(getSpeed() * 0.1, 0.3); // Use velocity for dynamic easing
      const ease = baseEase + velocityFactor;

      currentX += (x - currentX) * ease;
      currentY += (y - currentY) * ease;

      cursor.style.transform = `translate3d(${currentX - 12}px, ${currentY - 12}px, 0)`;

      // Update trail particles with velocity-based effects
      updateTrail(currentX, currentY);

      animationRef.current = requestAnimationFrame(animate);
    };

    // Only start animation if mouse is moving or visible
    if (isMoving || isVisible) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [x, y, isMoving, isVisible, getSpeed]);

  // Enhanced trail particles system with velocity-based effects
  const updateTrail = (currentX, currentY) => {
    const trail = trailRef.current;
    const speed = getSpeed();

    // Add new particle with velocity-based properties
    trail.push({
      x: currentX,
      y: currentY,
      life: 1,
      size: Math.max(2, Math.min(6, speed * 100)), // Dynamic size based on speed
      id: Date.now() + Math.random()
    });

    // Update existing particles with enhanced decay
    const decayRate = isMoving ? 0.05 : 0.08; // Faster decay when not moving
    for (let i = trail.length - 1; i >= 0; i--) {
      trail[i].life -= decayRate;
      if (trail[i].life <= 0) {
        trail.splice(i, 1);
      }
    }

    // Dynamic trail length based on movement
    const maxTrailLength = isMoving ? 20 : 10;
    if (trail.length > maxTrailLength) {
      trail.splice(0, trail.length - maxTrailLength);
    }

    // Render trail
    renderTrail();
  };

  // Enhanced trail particles rendering with dynamic sizing
  const renderTrail = () => {
    const existingTrails = document.querySelectorAll('.cursor-trail-particle');
    existingTrails.forEach(particle => particle.remove());

    trailRef.current.forEach((particle, index) => {
      const element = document.createElement('div');
      element.className = 'cursor-trail-particle';
      const size = particle.size || 4;
      element.style.cssText = `
        position: fixed;
        left: ${particle.x - size / 2}px;
        top: ${particle.y - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, #00d4ff ${particle.life * 100}%, transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        opacity: ${particle.life};
        transform: scale(${particle.life});
        box-shadow: 0 0 ${particle.life * 10}px #00d4ff;
      `;
      document.body.appendChild(element);
    });
  };

  // Event handlers (simplified since mouse position is handled by your hook)
  useEffect(() => {
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleMouseOver = (e) => {
      const target = e.target;
      
      // Check for interactive elements
      if (target.closest('a, button, [role="button"], input, textarea, select')) {
        setIsHovering(true);
        setCursorType('pointer');
      } else if (target.closest('.cta-button, .pulse-box')) {
        setIsHovering(true);
        setCursorType('glow');
      } else if (target.closest('h1, h2, h3, .glow-text')) {
        setIsHovering(true);
        setCursorType('text');
      } else {
        setIsHovering(false);
        setCursorType('default');
      }
    };

    const handleMouseDown = () => {
      setIsClicked(true);
      // Create click ripple effect using current mouse position
      createClickRipple(x, y);
    };

    const handleMouseUp = () => {
      setTimeout(() => setIsClicked(false), 150);
    };

    // Add event listeners (removed mousemove since it's handled by your hook)
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);

      // Clean up trail particles
      const existingTrails = document.querySelectorAll('.cursor-trail-particle');
      existingTrails.forEach(particle => particle.remove());
    };
  }, [x, y]); // Dependencies updated to use your hook's values

  // Create click ripple effect
  const createClickRipple = (x, y) => {
    const ripple = document.createElement('div');
    ripple.className = 'cursor-click-ripple';
    ripple.style.cssText = `
      position: fixed;
      left: ${x - 15}px;
      top: ${y - 15}px;
      width: 30px;
      height: 30px;
      border: 2px solid #00d4ff;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      animation: cursorRipple 0.6s ease-out forwards;
      box-shadow: 0 0 20px #00d4ff;
    `;
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  };

  // Hide cursor on touch devices
  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      setIsVisible(false);
    }
  }, []);

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cursorRipple {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        100% {
          transform: scale(3);
          opacity: 0;
        }
      }
      
      @keyframes cursorPulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.2);
        }
      }
      
      body {
        cursor: none !important;
      }
      
      * {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div
        ref={cursorRef}
        className={`${styles.cursor} ${styles[cursorType]} ${isHovering ? styles.hover : ''} ${isClicked ? styles.clicked : ''}`}
        role="presentation"
        aria-hidden="true"
      >
        <div className={styles.cursorInner}>
          <div className={styles.cursorCore}></div>
          <div className={styles.cursorGlow}></div>
        </div>
      </div>
      
      {/* Cursor text for different states */}
      {cursorType === 'pointer' && isHovering && (
        <div
          className={styles.cursorText}
          style={{
            transform: `translate3d(${x + 20}px, ${y - 10}px, 0)`
          }}
        >
          CLICK
        </div>
      )}

      {cursorType === 'glow' && isHovering && (
        <div
          className={styles.cursorText}
          style={{
            transform: `translate3d(${x + 20}px, ${y - 10}px, 0)`
          }}
        >
          INTERACT
        </div>
      )}
    </>
  );
};

export default CustomCursor;
