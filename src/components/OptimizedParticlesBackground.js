/**
 * Optimized Particles Background for DigiClick AI
 * Lazy loading with CSS fallback and A/B variant optimization
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getCursorVariant } from '../lib/gsap-loader';
import { capturePerformanceIssue } from '../lib/sentry-config';

// Particle configurations by variant
const PARTICLE_CONFIGS = {
  control: null, // No particles
  minimal: null, // No particles
  enhanced: {
    particles: {
      number: { value: 15, density: { enable: true, value_area: 800 } },
      color: { value: '#00d4ff' },
      shape: { type: 'circle' },
      opacity: { value: 0.3, random: true },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: '#00d4ff',
        opacity: 0.2,
        width: 1
      },
      move: {
        enable: true,
        speed: 1,
        direction: 'none',
        random: false,
        straight: false,
        out_mode: 'out',
        bounce: false
      }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'repulse' },
        onclick: { enable: true, mode: 'push' },
        resize: true
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
        push: { particles_nb: 2 }
      }
    },
    retina_detect: true
  },
  gaming: {
    particles: {
      number: { value: 25, density: { enable: true, value_area: 800 } },
      color: { value: ['#00d4ff', '#7b2cbf', '#ff6b6b', '#4ecdc4'] },
      shape: { type: ['circle', 'triangle'] },
      opacity: { value: 0.4, random: true },
      size: { value: 4, random: true },
      line_linked: {
        enable: true,
        distance: 120,
        color: '#00d4ff',
        opacity: 0.3,
        width: 1.5
      },
      move: {
        enable: true,
        speed: 1.5,
        direction: 'none',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false
      }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'bubble' },
        onclick: { enable: true, mode: 'repulse' },
        resize: true
      },
      modes: {
        bubble: { distance: 150, size: 8, duration: 2, opacity: 0.8 },
        repulse: { distance: 200, duration: 0.4 }
      }
    },
    retina_detect: true
  }
};

const OptimizedParticlesBackground = ({ className = '', style = {} }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [particlesInstance, setParticlesInstance] = useState(null);
  const [variant, setVariant] = useState('control');
  const [loadError, setLoadError] = useState(false);
  
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const loadStartTime = useRef(null);
  
  // Get current A/B testing variant
  useEffect(() => {
    const currentVariant = getCursorVariant();
    setVariant(currentVariant);
  }, []);
  
  // Check if particles are needed for current variant
  const needsParticles = PARTICLE_CONFIGS[variant] !== null;
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!needsParticles || typeof window === 'undefined') {
      return;
    }
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            loadParticles();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before element is visible
        threshold: 0.1
      }
    );
    
    if (containerRef.current) {
      observerRef.current.observe(containerRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [needsParticles, isVisible]);
  
  // Load particles.js dynamically
  const loadParticles = useCallback(async () => {
    if (isLoaded || loadError || !needsParticles) {
      return;
    }
    
    loadStartTime.current = performance.now();
    
    try {
      console.log(`📦 Loading particles.js for variant: ${variant}`);
      
      // Use requestIdleCallback for non-blocking load
      const loadPromise = new Promise((resolve, reject) => {
        const loadFunction = async () => {
          try {
            // Dynamic import of particles.js
            const particlesJS = await import('particles.js');
            
            // Initialize particles with variant-specific config
            const config = PARTICLE_CONFIGS[variant];
            if (config && containerRef.current) {
              // Create particles instance
              window.particlesJS('particles-container', config);
              
              // Store reference to particles instance
              if (window.pJSDom && window.pJSDom.length > 0) {
                setParticlesInstance(window.pJSDom[window.pJSDom.length - 1]);
              }
              
              resolve();
            } else {
              reject(new Error('Invalid particles configuration'));
            }
          } catch (error) {
            reject(error);
          }
        };
        
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadFunction);
        } else {
          setTimeout(loadFunction, 0);
        }
      });
      
      await loadPromise;
      
      const loadTime = performance.now() - loadStartTime.current;
      console.log(`✅ Particles.js loaded for ${variant} in ${Math.round(loadTime)}ms`);
      
      // Track performance if loading is slow
      if (loadTime > 300) {
        capturePerformanceIssue(
          'particles_slow_loading',
          loadTime,
          300,
          {
            tags: { 
              variant: variant,
              component: 'particles_background'
            },
            extra: {
              particle_count: PARTICLE_CONFIGS[variant]?.particles?.number?.value || 0
            }
          }
        );
      }
      
      setIsLoaded(true);
      
    } catch (error) {
      console.error('❌ Failed to load particles.js:', error);
      setLoadError(true);
      
      capturePerformanceIssue(
        'particles_loading_failed',
        0,
        1,
        {
          tags: { 
            variant: variant,
            component: 'particles_background'
          },
          extra: {
            error: error.message
          }
        }
      );
    }
  }, [variant, isLoaded, loadError, needsParticles]);
  
  // Page visibility handling for performance
  useEffect(() => {
    if (!isLoaded || !particlesInstance) {
      return;
    }
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause particles when page is hidden
        if (particlesInstance.pJS && particlesInstance.pJS.fn.vendors.draw) {
          particlesInstance.pJS.fn.vendors.draw = () => {};
        }
      } else {
        // Resume particles when page is visible
        if (particlesInstance.pJS && particlesInstance.pJS.fn.vendors.draw) {
          particlesInstance.pJS.fn.vendors.draw = particlesInstance.pJS.fn.vendors.drawShape;
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoaded, particlesInstance]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (particlesInstance && particlesInstance.pJS) {
        particlesInstance.pJS.fn.vendors.destroypJS();
      }
    };
  }, [particlesInstance]);
  
  // Don't render anything if particles not needed for variant
  if (!needsParticles) {
    return null;
  }
  
  return (
    <div
      ref={containerRef}
      className={`particles-background ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        ...style
      }}
    >
      {/* CSS fallback background while particles load */}
      {!isLoaded && !loadError && (
        <div
          className="particles-fallback"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: variant === 'gaming' 
              ? 'radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(123, 44, 191, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(255, 107, 107, 0.1) 0%, transparent 50%)'
              : 'radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.05) 0%, transparent 70%)',
            animation: variant === 'gaming' 
              ? 'particlesFallbackGaming 20s ease-in-out infinite'
              : 'particlesFallbackEnhanced 15s ease-in-out infinite'
          }}
        />
      )}
      
      {/* Particles container */}
      <div
        id="particles-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
      />
      
      {/* Loading indicator */}
      {isVisible && !isLoaded && !loadError && (
        <div
          className="particles-loading"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#00d4ff',
            fontSize: '12px',
            opacity: 0.5
          }}
        >
          Loading particles...
        </div>
      )}
      
      {/* Error fallback */}
      {loadError && (
        <div
          className="particles-error-fallback"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.03) 0%, transparent 70%)'
          }}
        />
      )}
      
      <style jsx>{`
        @keyframes particlesFallbackEnhanced {
          0%, 100% { 
            background-position: 0% 50%, 100% 50%, 50% 100%;
            opacity: 0.3;
          }
          50% { 
            background-position: 100% 50%, 0% 50%, 50% 0%;
            opacity: 0.5;
          }
        }
        
        @keyframes particlesFallbackGaming {
          0%, 100% { 
            background-position: 0% 50%, 100% 20%, 40% 80%;
            opacity: 0.4;
          }
          33% { 
            background-position: 50% 0%, 80% 80%, 0% 20%;
            opacity: 0.6;
          }
          66% { 
            background-position: 100% 50%, 20% 0%, 80% 100%;
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default OptimizedParticlesBackground;
