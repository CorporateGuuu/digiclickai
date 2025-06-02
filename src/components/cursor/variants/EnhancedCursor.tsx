'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useCursorABTest } from '../../../contexts/ABTestContext';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface EnhancedCursorProps {
  isVisible?: boolean;
}

const EnhancedCursor: React.FC<EnhancedCursorProps> = ({ isVisible = true }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const { config, trackCursorEvent } = useCursorABTest();
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!isVisible || typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY };
      setMousePos(newPos);
      
      // Create particles on movement
      if (config.animations?.particles && Math.random() < 0.3) {
        createParticle(newPos.x, newPos.y);
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const elementType = getElementType(target);
      
      setIsHovering(true);
      trackCursorEvent('hover_enter', elementType, {
        x: e.clientX,
        y: e.clientY,
        element_class: target.className,
        element_tag: target.tagName.toLowerCase()
      });
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      trackCursorEvent('hover_leave');
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const elementType = getElementType(target);
      
      trackCursorEvent('click', elementType, {
        x: e.clientX,
        y: e.clientY,
        element_class: target.className,
        element_tag: target.tagName.toLowerCase()
      });

      // Create burst of particles on click
      if (config.animations?.particles) {
        for (let i = 0; i < 8; i++) {
          createParticle(e.clientX, e.clientY, true);
        }
      }
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    document.addEventListener('click', handleClick);

    // Start particle animation loop
    animateParticles();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      document.removeEventListener('click', handleClick);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, config, trackCursorEvent]);

  useEffect(() => {
    if (!cursorRef.current) return;

    // Animate cursor position
    gsap.to(cursorRef.current, {
      x: mousePos.x,
      y: mousePos.y,
      duration: config.animations?.hover?.duration || 0.2,
      ease: "power2.out"
    });

    // Animate trail
    if (trailRef.current && config.animations?.trail) {
      gsap.to(trailRef.current, {
        x: mousePos.x,
        y: mousePos.y,
        duration: 0.4,
        ease: "power2.out"
      });
    }
  }, [mousePos, config]);

  useEffect(() => {
    if (!cursorRef.current) return;

    // Animate hover state
    const scale = isHovering ? (config.animations?.hover?.scale || 1.3) : 1;
    const glowIntensity = isHovering ? (config.animations?.glow?.intensity || 0.8) : 0.5;
    
    gsap.to(cursorRef.current, {
      scale,
      duration: config.animations?.hover?.duration || 0.2,
      ease: "power2.out"
    });

    // Update glow effect
    if (cursorRef.current) {
      cursorRef.current.style.boxShadow = `
        0 0 ${glowIntensity * 20}px ${config.animations?.glow?.color || '#00d4ff'},
        0 0 ${glowIntensity * 40}px ${config.animations?.glow?.color || '#00d4ff'},
        0 0 ${glowIntensity * 60}px ${config.animations?.glow?.color || '#00d4ff'}
      `;
    }
  }, [isHovering, config]);

  const createParticle = (x: number, y: number, burst = false) => {
    const particleConfig = config.animations?.particles;
    if (!particleConfig) return;

    const particle: Particle = {
      id: particleIdRef.current++,
      x,
      y,
      vx: (Math.random() - 0.5) * (burst ? 8 : 2),
      vy: (Math.random() - 0.5) * (burst ? 8 : 2),
      life: particleConfig.lifetime || 800,
      maxLife: particleConfig.lifetime || 800,
      size: Math.random() * 4 + 2
    };

    setParticles(prev => [...prev.slice(-14), particle]); // Keep max 15 particles
  };

  const animateParticles = () => {
    setParticles(prev => 
      prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 16, // Assuming 60fps
        vx: particle.vx * 0.98, // Friction
        vy: particle.vy * 0.98
      })).filter(particle => particle.life > 0)
    );

    animationFrameRef.current = requestAnimationFrame(animateParticles);
  };

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
      {/* Main Cursor */}
      <div
        ref={cursorRef}
        className="enhanced-cursor"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '20px',
          height: '20px',
          background: `linear-gradient(45deg, ${config.animations?.glow?.color || '#00d4ff'}, #7b2cbf)`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference',
          transition: 'box-shadow 0.2s ease'
        }}
      />

      {/* Trail Effect */}
      {config.animations?.trail && (
        <div
          ref={trailRef}
          className="cursor-trail"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '40px',
            height: '40px',
            background: `radial-gradient(circle, ${config.animations?.glow?.color || '#00d4ff'}20, transparent)`,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 9998,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}

      {/* Particles */}
      {config.animations?.particles && (
        <div ref={particlesRef} className="cursor-particles">
          {particles.map(particle => (
            <div
              key={particle.id}
              style={{
                position: 'fixed',
                top: particle.y,
                left: particle.x,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: config.animations?.glow?.color || '#00d4ff',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 9997,
                opacity: particle.life / particle.maxLife,
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 ${particle.size * 2}px ${config.animations?.glow?.color || '#00d4ff'}`
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .enhanced-cursor {
          will-change: transform;
        }
        
        .cursor-trail {
          will-change: transform;
        }
        
        .cursor-particles div {
          will-change: transform, opacity;
        }
        
        @media (hover: none) and (pointer: coarse) {
          .enhanced-cursor,
          .cursor-trail,
          .cursor-particles {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default EnhancedCursor;
