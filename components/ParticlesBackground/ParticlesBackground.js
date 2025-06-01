import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

const ParticlesBackground = ({ 
  id = 'particles-js',
  config = null,
  className = '',
  style = {}
}) => {
  const containerRef = useRef(null);
  const isInitialized = useRef(false);

  const defaultConfig = {
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: '#00d4ff'
      },
      shape: {
        type: 'circle',
        stroke: {
          width: 0,
          color: '#000000'
        },
        polygon: {
          nb_sides: 5
        }
      },
      opacity: {
        value: 0.5,
        random: false,
        anim: {
          enable: false,
          speed: 1,
          opacity_min: 0.1,
          sync: false
        }
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: false,
          speed: 40,
          size_min: 0.1,
          sync: false
        }
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: '#00d4ff',
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 6,
        direction: 'none',
        random: false,
        straight: false,
        out_mode: 'out',
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200
        }
      }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: {
          enable: true,
          mode: 'repulse'
        },
        onclick: {
          enable: true,
          mode: 'push'
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 400,
          line_linked: {
            opacity: 1
          }
        },
        bubble: {
          distance: 400,
          size: 40,
          duration: 2,
          opacity: 8,
          speed: 3
        },
        repulse: {
          distance: 200,
          duration: 0.4
        },
        push: {
          particles_nb: 4
        },
        remove: {
          particles_nb: 2
        }
      }
    },
    retina_detect: true
  };

  const initializeParticles = () => {
    if (typeof window !== 'undefined' && window.particlesJS && !isInitialized.current) {
      const particleConfig = config || defaultConfig;
      
      try {
        window.particlesJS(id, particleConfig);
        isInitialized.current = true;
        console.log('Particles.js initialized successfully');
      } catch (error) {
        console.error('Failed to initialize particles.js:', error);
      }
    }
  };

  useEffect(() => {
    // Initialize particles when component mounts
    const timer = setTimeout(() => {
      initializeParticles();
    }, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup particles instance if it exists
      if (window.pJSDom && window.pJSDom.length > 0) {
        window.pJSDom.forEach((pjs, index) => {
          if (pjs.pJS.canvas.el.id === id) {
            window.pJSDom.splice(index, 1);
          }
        });
      }
    };
  }, [id, config]);

  // Reinitialize if config changes
  useEffect(() => {
    if (isInitialized.current) {
      isInitialized.current = false;
      initializeParticles();
    }
  }, [config]);

  const handleParticlesLoad = () => {
    // Retry initialization if particles.js is now available
    if (!isInitialized.current) {
      initializeParticles();
    }
  };

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js"
        strategy="afterInteractive"
        onLoad={handleParticlesLoad}
      />
      
      <div
        id={id}
        ref={containerRef}
        className={`particles-container ${className}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          ...style
        }}
      />
    </>
  );
};

// Preset configurations for different themes
export const ParticlePresets = {
  default: {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: '#00d4ff' },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: false },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: '#00d4ff',
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 6,
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
      }
    },
    retina_detect: true
  },

  minimal: {
    particles: {
      number: { value: 40, density: { enable: true, value_area: 800 } },
      color: { value: '#00d4ff' },
      shape: { type: 'circle' },
      opacity: { value: 0.3, random: false },
      size: { value: 2, random: true },
      line_linked: {
        enable: true,
        distance: 200,
        color: '#00d4ff',
        opacity: 0.2,
        width: 1
      },
      move: {
        enable: true,
        speed: 3,
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
        onhover: { enable: false },
        onclick: { enable: false },
        resize: true
      }
    },
    retina_detect: true
  },

  intense: {
    particles: {
      number: { value: 120, density: { enable: true, value_area: 800 } },
      color: { value: ['#00d4ff', '#7b2cbf', '#ff6b6b'] },
      shape: { type: 'circle' },
      opacity: { value: 0.7, random: true },
      size: { value: 4, random: true },
      line_linked: {
        enable: true,
        distance: 120,
        color: '#00d4ff',
        opacity: 0.6,
        width: 2
      },
      move: {
        enable: true,
        speed: 8,
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
        bubble: { distance: 250, size: 8, duration: 2, opacity: 0.8, speed: 3 },
        repulse: { distance: 300, duration: 0.4 }
      }
    },
    retina_detect: true
  }
};

export default ParticlesBackground;
