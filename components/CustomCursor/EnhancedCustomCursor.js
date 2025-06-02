import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './CustomCursor.module.css';
import useMousePosition from '../../hooks/useMousePosition';

const EnhancedCustomCursor = ({ theme = 'default' }) => {
  const cursorRef = useRef(null);
  const cursorInnerRef = useRef(null);
  const cursorGlowRef = useRef(null);
  const trailContainerRef = useRef(null);
  const rippleContainerRef = useRef(null);
  
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [cursorType, setCursorType] = useState('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [validationState, setValidationState] = useState(null); // 'success', 'error', null
  
  const animationRef = useRef();
  const gsapRef = useRef(null);
  const performanceMode = process.env.NEXT_PUBLIC_CURSOR_PERFORMANCE_MODE || 'high';

  // Enhanced mouse position hook with velocity tracking
  const { x, y, isMoving, velocity, getSpeed } = useMousePosition();

  // Initialize GSAP when available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gsap) {
      gsapRef.current = window.gsap;
    }
  }, []);

  // Touch device detection
  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const hasHover = window.matchMedia('(hover: hover)').matches;
      const hasPointer = window.matchMedia('(pointer: fine)').matches;
      
      setIsTouchDevice(hasTouch && (!hasHover || !hasPointer));
    };

    checkTouchDevice();
    setIsVisible(!isTouchDevice);
  }, [isTouchDevice]);

  // GSAP-powered cursor animation system
  useEffect(() => {
    if (isTouchDevice || !isVisible || !gsapRef.current) return;

    const cursor = cursorRef.current;
    const cursorInner = cursorInnerRef.current;
    const cursorGlow = cursorGlowRef.current;
    
    if (!cursor) return;

    const gsap = gsapRef.current;

    // Set initial cursor position with GSAP
    gsap.set(cursor, {
      x: x - 12,
      y: y - 12,
      scale: 1,
      opacity: 1,
      force3D: true
    });

    // Smooth cursor following with GSAP
    const updateCursorPosition = () => {
      if (!cursor || !gsap) return;

      // Dynamic easing based on movement speed
      const speed = getSpeed();
      const dynamicEase = speed > 0.5 ? 'power2.out' : 'power3.out';
      const duration = performanceMode === 'high' ? (speed > 0.5 ? 0.1 : 0.15) : 0.2;

      gsap.to(cursor, {
        x: x - 12,
        y: y - 12,
        duration: duration,
        ease: dynamicEase,
        overwrite: 'auto',
        force3D: true
      });

      // Update trail with GSAP animations
      if (process.env.NEXT_PUBLIC_ENABLE_PARTICLE_TRAILS !== 'false') {
        updateTrailWithGSAP(x, y, speed);
      }
    };

    // Start animation loop
    const animate = () => {
      updateCursorPosition();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Kill any GSAP animations on cleanup
      if (gsap && cursor) {
        gsap.killTweensOf(cursor);
      }
    };
  }, [x, y, isMoving, isVisible, isTouchDevice, getSpeed]);

  // Enhanced GSAP trail system
  const updateTrailWithGSAP = useCallback((currentX, currentY, speed) => {
    if (!gsapRef.current || isTouchDevice) return;

    const gsap = gsapRef.current;
    const maxTrailLength = parseInt(process.env.NEXT_PUBLIC_CURSOR_TRAIL_LENGTH) || 20;

    // Create new trail particle
    const particle = document.createElement('div');
    particle.className = styles.trailParticle;
    
    // Dynamic size and opacity based on speed
    const size = Math.max(3, Math.min(8, speed * 150));
    const opacity = Math.max(0.3, Math.min(1, speed * 2));
    
    gsap.set(particle, {
      x: currentX - size / 2,
      y: currentY - size / 2,
      width: size,
      height: size,
      opacity: opacity,
      scale: 1,
      force3D: true
    });

    if (trailContainerRef.current) {
      trailContainerRef.current.appendChild(particle);
    } else {
      document.body.appendChild(particle);
    }

    // Animate particle fade out with GSAP
    gsap.to(particle, {
      opacity: 0,
      scale: 0.5,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }
    });

    // Limit trail length for performance
    const particles = document.querySelectorAll(`.${styles.trailParticle}`);
    if (particles.length > maxTrailLength) {
      for (let i = 0; i < particles.length - maxTrailLength; i++) {
        if (particles[i]) {
          gsap.killTweensOf(particles[i]);
          particles[i].remove();
        }
      }
    }
  }, [isTouchDevice]);

  // Enhanced interaction detection with GSAP hover effects
  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleMouseOver = (e) => {
      const target = e.target;
      const cursor = cursorRef.current;
      const cursorInner = cursorInnerRef.current;
      const cursorGlow = cursorGlowRef.current;

      if (!gsapRef.current || !cursor) return;

      const gsap = gsapRef.current;

      // Reset states
      setIsLoading(false);
      setIsDisabled(false);
      setIsDragging(false);
      setValidationState(null);

      // Check for disabled elements first
      if (target.disabled || target.closest('[disabled]') || target.closest('.disabled')) {
        setIsHovering(true);
        setIsDisabled(true);
        setCursorType('disabled');
        gsap.to(cursor, { scale: 1.1, duration: 0.3, ease: 'power2.out' });
        if (cursorGlow) {
          gsap.to(cursorGlow, { scale: 1.5, opacity: 0.3, duration: 0.3 });
        }
        return;
      }

      // Check for loading states
      if (target.closest('.loading') || target.closest('[data-loading="true"]')) {
        setIsHovering(true);
        setIsLoading(true);
        setCursorType('loading');
        gsap.to(cursor, {
          scale: 1.3,
          duration: 0.3,
          ease: 'power2.out',
          rotation: 360,
          repeat: -1,
          transformOrigin: 'center'
        });
        return;
      }

      // Enhanced element detection with specific CSS classes
      if (target.closest('.cta-button, [data-cursor="cta"]')) {
        setIsHovering(true);
        setCursorType('cta');
        // Transform to larger glowing circle (20px → 30px)
        gsap.to(cursor, { scale: 2.5, duration: 0.3, ease: 'power2.out' });
        if (cursorGlow) {
          gsap.to(cursorGlow, { scale: 3, opacity: 0.9, duration: 0.3 });
        }
      } else if (target.closest('.nav-link, nav a, [data-cursor="nav"]')) {
        setIsHovering(true);
        setCursorType('nav');
        // Arrow pointer with trailing particle effect
        gsap.to(cursor, { scale: 1.4, duration: 0.3, ease: 'power2.out' });
        if (cursorGlow) {
          gsap.to(cursorGlow, { scale: 2, opacity: 0.7, duration: 0.3 });
        }
      } else if (target.closest('input[type="text"], input[type="email"], input[type="password"], textarea, [contenteditable], [data-cursor="text"]')) {
        setIsHovering(true);
        setCursorType('text');
        // Precise text cursor (I-beam) with typing indicator
        gsap.to(cursor, { scaleX: 0.3, scaleY: 1.8, duration: 0.3, ease: 'power2.out' });
        if (cursorGlow) {
          gsap.to(cursorGlow, { scaleX: 0.5, scaleY: 2, opacity: 0.6, duration: 0.3 });
        }
      } else if (target.closest('.card, .image-container, [data-cursor="zoom"]')) {
        setIsHovering(true);
        setCursorType('zoom');
        // Expand cursor with zoom-in icon and pulsing animation
        gsap.to(cursor, {
          scale: 1.8,
          duration: 0.3,
          ease: 'power2.out'
        });
        if (cursorGlow) {
          gsap.to(cursorGlow, {
            scale: 2.5,
            opacity: 0.8,
            duration: 0.3,
            repeat: -1,
            yoyo: true,
            repeatDelay: 0.5
          });
        }
      } else if (target.closest('[draggable="true"], .draggable, [data-cursor="drag"]')) {
        setIsHovering(true);
        setIsDragging(true);
        setCursorType('drag');
        // Custom drag cursor with directional arrows
        gsap.to(cursor, { scale: 1.5, duration: 0.3, ease: 'power2.out' });
        if (cursorGlow) {
          gsap.to(cursorGlow, { scale: 2.2, opacity: 0.8, duration: 0.3 });
        }
      } else if (target.closest('.file-upload, input[type="file"], [data-cursor="upload"]')) {
        setIsHovering(true);
        setCursorType('upload');
        // Upload icon cursor with animated cloud/arrow graphic
        gsap.to(cursor, { scale: 1.6, duration: 0.3, ease: 'power2.out' });
        if (cursorGlow) {
          gsap.to(cursorGlow, {
            scale: 2.3,
            opacity: 0.7,
            duration: 0.3,
            repeat: -1,
            yoyo: true,
            repeatDelay: 0.3
          });
        }
      } else if (target.closest('.glow-text, [data-cursor="glow"]')) {
        setIsHovering(true);
        setCursorType('glow');
        // Enhanced glow effects for highlighted text
        gsap.to(cursor, { scale: 1.5, duration: 0.3, ease: 'power2.out' });
        if (cursorGlow) {
          gsap.to(cursorGlow, { scale: 3, opacity: 1, duration: 0.3 });
        }
      } else if (target.closest('.pulse-box, [data-cursor="pulse"]')) {
        setIsHovering(true);
        setCursorType('pulse');
        // Pulsing animation for interactive containers
        gsap.to(cursor, {
          scale: 1.4,
          duration: 0.3,
          ease: 'power2.out',
          repeat: -1,
          yoyo: true
        });
      } else if (target.closest('.glow-trigger, [data-cursor="trigger"]')) {
        setIsHovering(true);
        setCursorType('trigger');
        // Custom glow effects for special elements
        gsap.to(cursor, { scale: 1.8, duration: 0.3, ease: 'power2.out' });
        if (cursorGlow) {
          gsap.to(cursorGlow, { scale: 3.5, opacity: 0.9, duration: 0.3 });
        }
      } else if (target.closest('a, button, [role="button"], [data-cursor="pointer"]')) {
        setIsHovering(true);
        setCursorType('pointer');
        gsap.to(cursor, { scale: 1.3, duration: 0.3, ease: 'power2.out' });
        if (cursorGlow) {
          gsap.to(cursorGlow, { scale: 1.8, opacity: 0.7, duration: 0.3 });
        }
      } else {
        setIsHovering(false);
        setCursorType('default');
        // Reset to default state
        gsap.to(cursor, { scale: 1, scaleX: 1, scaleY: 1, rotation: 0, duration: 0.3, ease: 'power2.out' });
        if (cursorGlow) {
          gsap.to(cursorGlow, { scale: 1, scaleX: 1, scaleY: 1, opacity: 0.5, duration: 0.3 });
        }
        // Kill any repeating animations
        gsap.killTweensOf(cursor);
        gsap.killTweensOf(cursorGlow);
      }
    };

    const handleMouseDown = () => {
      setIsClicked(true);
      // Enhanced click animation with GSAP
      createClickRippleWithGSAP(x, y);
      
      if (gsapRef.current && cursorRef.current) {
        gsapRef.current.to(cursorRef.current, {
          scale: 0.8,
          duration: 0.1,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1
        });
      }
    };

    const handleMouseUp = () => {
      setTimeout(() => setIsClicked(false), 150);
      setIsDragging(false);
    };

    // Form validation detection
    const handleFormValidation = (e) => {
      const target = e.target;
      if (!target.closest('input, textarea, select')) return;

      const cursor = cursorRef.current;
      const cursorGlow = cursorGlowRef.current;

      if (!gsapRef.current || !cursor) return;
      const gsap = gsapRef.current;

      // Check validation state
      if (target.validity && !target.validity.valid && target.value) {
        setValidationState('error');
        setCursorType('error');
        gsap.to(cursor, { scale: 1.2, duration: 0.2, ease: 'power2.out' });
        if (cursorGlow) {
          gsap.to(cursorGlow, { scale: 1.8, opacity: 0.8, duration: 0.2 });
        }
      } else if (target.validity && target.validity.valid && target.value) {
        setValidationState('success');
        setCursorType('success');
        gsap.to(cursor, { scale: 1.2, duration: 0.2, ease: 'power2.out' });
        if (cursorGlow) {
          gsap.to(cursorGlow, { scale: 1.8, opacity: 0.8, duration: 0.2 });
        }
      }
    };

    // Drag event handlers
    const handleDragStart = () => {
      setIsDragging(true);
      setCursorType('dragging');
      const cursor = cursorRef.current;
      if (gsapRef.current && cursor) {
        gsapRef.current.to(cursor, { scale: 1.8, duration: 0.2, ease: 'power2.out' });
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      const cursor = cursorRef.current;
      if (gsapRef.current && cursor) {
        gsapRef.current.to(cursor, { scale: 1, duration: 0.3, ease: 'power2.out' });
      }
    };

    // Loading state detection for forms
    const handleFormSubmit = (e) => {
      const form = e.target;
      if (form.tagName === 'FORM') {
        setIsLoading(true);
        setCursorType('loading');

        // Reset loading state after a delay (or listen for completion)
        setTimeout(() => {
          setIsLoading(false);
          setCursorType('default');
        }, 3000);
      }
    };

    // Add event listeners
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('input', handleFormValidation);
    document.addEventListener('change', handleFormValidation);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    document.addEventListener('submit', handleFormSubmit);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('input', handleFormValidation);
      document.removeEventListener('change', handleFormValidation);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
      document.removeEventListener('submit', handleFormSubmit);

      // Clean up GSAP animations
      if (gsapRef.current && cursorRef.current) {
        gsapRef.current.killTweensOf(cursorRef.current);
        gsapRef.current.killTweensOf(cursorGlowRef.current);
      }
    };
  }, [x, y, isTouchDevice]);

  // Enhanced click ripple effect with GSAP
  const createClickRippleWithGSAP = useCallback((clickX, clickY) => {
    if (!gsapRef.current || !process.env.NEXT_PUBLIC_ENABLE_CLICK_EFFECTS) return;

    const gsap = gsapRef.current;
    const ripple = document.createElement('div');
    ripple.className = styles.clickRipple;
    
    gsap.set(ripple, {
      x: clickX - 15,
      y: clickY - 15,
      width: 30,
      height: 30,
      opacity: 1,
      scale: 1,
      force3D: true
    });

    if (rippleContainerRef.current) {
      rippleContainerRef.current.appendChild(ripple);
    } else {
      document.body.appendChild(ripple);
    }

    // GSAP ripple animation
    gsap.to(ripple, {
      scale: 3,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }
    });
  }, []);

  // Global cursor styles
  useEffect(() => {
    if (isTouchDevice) return;

    const style = document.createElement('style');
    style.textContent = `
      body, * {
        cursor: none !important;
      }
      
      .cursor-disabled {
        cursor: auto !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [isTouchDevice]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Trail Container */}
      <div ref={trailContainerRef} className={styles.trailContainer} />
      
      {/* Ripple Container */}
      <div ref={rippleContainerRef} className={styles.rippleContainer} />
      
      {/* Main Cursor */}
      <div
        ref={cursorRef}
        className={`${styles.cursor} ${styles[cursorType]} ${styles[theme]} ${isHovering ? styles.hover : ''} ${isClicked ? styles.clicked : ''} ${isLoading ? styles.loading : ''} ${isDisabled ? styles.disabled : ''} ${isDragging ? styles.dragging : ''} ${validationState ? styles[validationState] : ''}`}
        role="presentation"
        aria-hidden="true"
      >
        <div ref={cursorInnerRef} className={styles.cursorInner}>
          <div className={styles.cursorCore}>
            {/* Context-aware cursor icons */}
            {cursorType === 'text' && <div className={styles.cursorIcon}>|</div>}
            {cursorType === 'zoom' && <div className={styles.cursorIcon}>🔍</div>}
            {cursorType === 'drag' && <div className={styles.cursorIcon}>✋</div>}
            {cursorType === 'upload' && <div className={styles.cursorIcon}>☁️</div>}
            {cursorType === 'loading' && <div className={styles.cursorIcon}>⟳</div>}
            {cursorType === 'disabled' && <div className={styles.cursorIcon}>⚠</div>}
            {cursorType === 'success' && <div className={styles.cursorIcon}>✓</div>}
            {cursorType === 'error' && <div className={styles.cursorIcon}>✗</div>}
          </div>
          <div ref={cursorGlowRef} className={styles.cursorGlow}></div>
        </div>
      </div>

      {/* Enhanced cursor text for different states */}
      {cursorType === 'pointer' && isHovering && (
        <div
          className={styles.cursorText}
          style={{
            transform: `translate3d(${x + 25}px, ${y - 15}px, 0)`
          }}
        >
          CLICK
        </div>
      )}

      {cursorType === 'cta' && isHovering && (
        <div
          className={`${styles.cursorText} ${styles.ctaText}`}
          style={{
            transform: `translate3d(${x + 30}px, ${y - 15}px, 0)`
          }}
        >
          ENGAGE
        </div>
      )}

      {cursorType === 'nav' && isHovering && (
        <div
          className={styles.cursorText}
          style={{
            transform: `translate3d(${x + 25}px, ${y - 15}px, 0)`
          }}
        >
          NAVIGATE
        </div>
      )}

      {cursorType === 'text' && isHovering && (
        <div
          className={styles.cursorText}
          style={{
            transform: `translate3d(${x + 25}px, ${y - 15}px, 0)`
          }}
        >
          TYPE
        </div>
      )}

      {cursorType === 'zoom' && isHovering && (
        <div
          className={styles.cursorText}
          style={{
            transform: `translate3d(${x + 30}px, ${y - 15}px, 0)`
          }}
        >
          ZOOM
        </div>
      )}

      {cursorType === 'drag' && isHovering && (
        <div
          className={styles.cursorText}
          style={{
            transform: `translate3d(${x + 25}px, ${y - 15}px, 0)`
          }}
        >
          DRAG
        </div>
      )}

      {cursorType === 'upload' && isHovering && (
        <div
          className={styles.cursorText}
          style={{
            transform: `translate3d(${x + 30}px, ${y - 15}px, 0)`
          }}
        >
          UPLOAD
        </div>
      )}

      {cursorType === 'loading' && isLoading && (
        <div
          className={`${styles.cursorText} ${styles.loadingText}`}
          style={{
            transform: `translate3d(${x + 30}px, ${y - 15}px, 0)`
          }}
        >
          LOADING...
        </div>
      )}

      {cursorType === 'disabled' && isDisabled && (
        <div
          className={`${styles.cursorText} ${styles.disabledText}`}
          style={{
            transform: `translate3d(${x + 30}px, ${y - 15}px, 0)`
          }}
        >
          DISABLED
        </div>
      )}

      {cursorType === 'success' && validationState === 'success' && (
        <div
          className={`${styles.cursorText} ${styles.successText}`}
          style={{
            transform: `translate3d(${x + 30}px, ${y - 15}px, 0)`
          }}
        >
          VALID
        </div>
      )}

      {cursorType === 'error' && validationState === 'error' && (
        <div
          className={`${styles.cursorText} ${styles.errorText}`}
          style={{
            transform: `translate3d(${x + 30}px, ${y - 15}px, 0)`
          }}
        >
          INVALID
        </div>
      )}

      {cursorType === 'glow' && isHovering && (
        <div
          className={styles.cursorText}
          style={{
            transform: `translate3d(${x + 25}px, ${y - 15}px, 0)`
          }}
        >
          GLOW
        </div>
      )}
    </>
  );
};

export default EnhancedCustomCursor;
