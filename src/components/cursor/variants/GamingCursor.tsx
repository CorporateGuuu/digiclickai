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
  color: string;
}

interface GamingCursorProps {
  isVisible?: boolean;
}

const GamingCursor: React.FC<GamingCursorProps> = ({ isVisible = true }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const { config, trackCursorEvent } = useCursorABTest();
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [rgbColor, setRgbColor] = useState('#ff0000');
  const particleIdRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const rgbAnimationRef = useRef<number>();

  // RGB color cycling
  useEffect(() => {
    if (!config.animations?.rgb?.enabled) return;

    let hue = 0;
    const animateRGB = () => {
      hue = (hue + (config.animations?.rgb?.speed || 2)) % 360;
      setRgbColor(`hsl(${hue}, 100%, 50%)`);
      rgbAnimationRef.current = requestAnimationFrame(animateRGB);
    };

    animateRGB();

    return () => {
      if (rgbAnimationRef.current) {
        cancelAnimationFrame(rgbAnimationRef.current);
      }
    };
  }, [config]);

  useEffect(() => {
    if (!isVisible || typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY };
      setMousePos(newPos);
      
      // Create particles on movement with higher frequency
      if (config.animations?.particles && Math.random() < 0.5) {
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

      // Create explosive particle burst on click
      if (config.animations?.particles) {
        for (let i = 0; i < 15; i++) {
          createParticle(e.clientX, e.clientY, true);
        }
      }

      // Intense click animation
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          scale: config.animations?.click?.scale || 0.7,
          duration: config.animations?.click?.duration || 0.08,
          ease: "power3.out",
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

    // Fast, responsive cursor movement
    gsap.to(cursorRef.current, {
      x: mousePos.x,
      y: mousePos.y,
      duration: config.animations?.hover?.duration || 0.15,
      ease: "power3.out"
    });

    // Animate trail with delay
    if (trailRef.current && config.animations?.trail) {
      gsap.to(trailRef.current, {
        x: mousePos.x,
        y: mousePos.y,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [mousePos, config]);

  useEffect(() => {
    if (!cursorRef.current) return;

    // Dynamic hover scaling
    const scale = isHovering ? (config.animations?.hover?.scale || 1.4) : 1;
    
    gsap.to(cursorRef.current, {
      scale,
      duration: config.animations?.hover?.duration || 0.15,
      ease: "power3.out"
    });

    // Update glow effect with RGB or static color
    const glowColor = config.animations?.rgb?.enabled ? rgbColor : '#00d4ff';
    const glowIntensity = isHovering ? 1.2 : 1.0;
    
    if (cursorRef.current) {
      cursorRef.current.style.background = `
        radial-gradient(circle, ${glowColor}, ${glowColor}80, transparent)
      `;
      cursorRef.current.style.boxShadow = `
        0 0 ${glowIntensity * 30}px ${glowColor},
        0 0 ${glowIntensity * 60}px ${glowColor},
        0 0 ${glowIntensity * 90}px ${glowColor}
      `;
    }
  }, [isHovering, rgbColor, config]);

  const createParticle = (x: number, y: number, burst = false) => {
    const particleConfig = config.animations?.particles;
    if (!particleConfig) return;

    const colors = config.animations?.rgb?.enabled 
      ? [rgbColor, '#ff0080', '#00ff80', '#8000ff', '#ff8000']
      : ['#00d4ff', '#7b2cbf', '#ff0080'];

    const particle: Particle = {
      id: particleIdRef.current++,
      x,
      y,
      vx: (Math.random() - 0.5) * (burst ? 12 : 4),
      vy: (Math.random() - 0.5) * (burst ? 12 : 4),
      life: particleConfig.lifetime || 1200,
      maxLife: particleConfig.lifetime || 1200,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)]
    };

    setParticles(prev => [...prev.slice(-24), particle]); // Keep max 25 particles
  };

  const animateParticles = () => {
    setParticles(prev => 
      prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 16, // Assuming 60fps
        vx: particle.vx * 0.96, // Less friction for more dynamic movement
        vy: particle.vy * 0.96 + 0.1 // Slight gravity
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

  const currentColor = config.animations?.rgb?.enabled ? rgbColor : '#00d4ff';

  return (
    <>
      {/* Main Gaming Cursor */}
      <div
        ref={cursorRef}
        className="gaming-cursor"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '24px',
          height: '24px',
          background: `radial-gradient(circle, ${currentColor}, ${currentColor}80, transparent)`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          border: `2px solid ${currentColor}`,
          transition: 'background 0.1s ease'
        }}
      />

      {/* Dynamic Trail */}
      {config.animations?.trail && (
        <div
          ref={trailRef}
          className="gaming-cursor-trail"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '60px',
            height: '60px',
            background: `radial-gradient(circle, ${currentColor}15, transparent)`,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 9998,
            transform: 'translate(-50%, -50%)',
            border: `1px solid ${currentColor}30`
          }}
        />
      )}

      {/* Gaming Particles */}
      {config.animations?.particles && (
        <div ref={particlesRef} className="gaming-cursor-particles">
          {particles.map(particle => (
            <div
              key={particle.id}
              style={{
                position: 'fixed',
                top: particle.y,
                left: particle.x,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: particle.color,
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 9997,
                opacity: particle.life / particle.maxLife,
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
                border: `1px solid ${particle.color}`
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .gaming-cursor {
          will-change: transform, background;
          filter: brightness(1.2) saturate(1.3);
        }
        
        .gaming-cursor-trail {
          will-change: transform;
          filter: blur(1px);
        }
        
        .gaming-cursor-particles div {
          will-change: transform, opacity;
          filter: brightness(1.1);
        }
        
        @media (hover: none) and (pointer: coarse) {
          .gaming-cursor,
          .gaming-cursor-trail,
          .gaming-cursor-particles {
            display: none;
          }
        }
        
        /* Gaming-style pulsing effect */
        @keyframes gaming-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
        }
        
        .gaming-cursor:hover {
          animation: gaming-pulse 0.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default GamingCursor;
