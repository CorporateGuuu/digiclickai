'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useCursorABTest } from '../../../contexts/ABTestContext';

interface MinimalCursorProps {
  isVisible?: boolean;
}

const MinimalCursor: React.FC<MinimalCursorProps> = ({ isVisible = true }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const { config, trackCursorEvent } = useCursorABTest();
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [elementType, setElementType] = useState<string>('default');

  useEffect(() => {
    if (!isVisible || typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const type = getElementType(target);
      
      setIsHovering(true);
      setElementType(type);
      
      trackCursorEvent('hover_enter', type, {
        x: e.clientX,
        y: e.clientY,
        element_class: target.className,
        element_tag: target.tagName.toLowerCase()
      });
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setElementType('default');
      trackCursorEvent('hover_leave');
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const type = getElementType(target);
      
      trackCursorEvent('click', type, {
        x: e.clientX,
        y: e.clientY,
        element_class: target.className,
        element_tag: target.tagName.toLowerCase()
      });

      // Subtle click animation
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          scale: config.animations?.click?.scale || 0.95,
          duration: config.animations?.click?.duration || 0.05,
          ease: "power2.out",
          yoyo: true,
          repeat: 1
        });
      }
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      document.removeEventListener('click', handleClick);
    };
  }, [isVisible, config, trackCursorEvent]);

  useEffect(() => {
    if (!cursorRef.current || !dotRef.current) return;

    // Animate cursor position with smooth following
    gsap.to(cursorRef.current, {
      x: mousePos.x,
      y: mousePos.y,
      duration: config.animations?.hover?.duration || 0.4,
      ease: "power2.out"
    });

    // Animate dot with slight delay for subtle trail effect
    gsap.to(dotRef.current, {
      x: mousePos.x,
      y: mousePos.y,
      duration: 0.6,
      ease: "power2.out"
    });
  }, [mousePos, config]);

  useEffect(() => {
    if (!cursorRef.current || !dotRef.current) return;

    // Subtle hover animations based on element type
    const getHoverStyle = () => {
      switch (elementType) {
        case 'button':
          return {
            scale: config.animations?.hover?.scale || 1.1,
            borderWidth: '2px',
            opacity: 0.8
          };
        case 'link':
          return {
            scale: config.animations?.hover?.scale || 1.1,
            borderWidth: '1px',
            opacity: 0.9
          };
        case 'form':
          return {
            scale: 1.05,
            borderWidth: '1px',
            opacity: 0.7
          };
        default:
          return {
            scale: 1,
            borderWidth: '1px',
            opacity: isHovering ? 0.6 : 0.4
          };
      }
    };

    const hoverStyle = getHoverStyle();
    
    gsap.to(cursorRef.current, {
      scale: hoverStyle.scale,
      duration: config.animations?.hover?.duration || 0.4,
      ease: "power2.out"
    });

    // Update cursor styles
    if (cursorRef.current) {
      cursorRef.current.style.borderWidth = hoverStyle.borderWidth;
      cursorRef.current.style.opacity = hoverStyle.opacity.toString();
    }

    // Animate dot
    gsap.to(dotRef.current, {
      scale: isHovering ? 0.8 : 1,
      duration: 0.3,
      ease: "power2.out"
    });
  }, [isHovering, elementType, config]);

  const getElementType = (element: HTMLElement): string => {
    if (element.matches('button, .cta-button, .btn')) return 'button';
    if (element.matches('a, .nav-link')) return 'link';
    if (element.matches('input, textarea, select')) return 'form';
    if (element.matches('.card, .project-card')) return 'card';
    if (element.matches('h1, h2, h3, h4, h5, h6')) return 'heading';
    return 'default';
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Outer Ring */}
      <div
        ref={cursorRef}
        className="minimal-cursor-ring"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '32px',
          height: '32px',
          border: `1px solid ${config.animations?.glow?.color || '#ffffff'}`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          opacity: 0.4,
          transition: 'border-width 0.3s ease, opacity 0.3s ease'
        }}
      />

      {/* Inner Dot */}
      <div
        ref={dotRef}
        className="minimal-cursor-dot"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '4px',
          height: '4px',
          background: config.animations?.glow?.color || '#ffffff',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 10000,
          transform: 'translate(-50%, -50%)',
          opacity: 0.8
        }}
      />

      <style jsx>{`
        .minimal-cursor-ring {
          will-change: transform, scale;
          backdrop-filter: blur(1px);
        }
        
        .minimal-cursor-dot {
          will-change: transform, scale;
        }
        
        @media (hover: none) and (pointer: coarse) {
          .minimal-cursor-ring,
          .minimal-cursor-dot {
            display: none;
          }
        }
        
        /* Subtle glow effect for better visibility */
        .minimal-cursor-ring::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            ${config.animations?.glow?.color || '#ffffff'}10,
            transparent 70%
          );
          z-index: -1;
        }
      `}</style>
    </>
  );
};

export default MinimalCursor;
