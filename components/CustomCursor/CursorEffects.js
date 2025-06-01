/**
 * DigiClick AI Cursor Effects System
 * Advanced visual effects and animations for the custom cursor
 */

/**
 * Create particle trail effect
 */
export const createParticleTrail = (x, y, options = {}) => {
  const {
    color = '#00d4ff',
    size = 4,
    life = 1,
    velocity = { x: 0, y: 0 },
    gravity = 0.1,
    friction = 0.98
  } = options;

  const particle = document.createElement('div');
  particle.className = 'cursor-particle';
  
  // Set initial styles
  particle.style.cssText = `
    position: fixed;
    left: ${x - size / 2}px;
    top: ${y - size / 2}px;
    width: ${size}px;
    height: ${size}px;
    background: radial-gradient(circle, ${color}, transparent);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    opacity: ${life};
    transform: scale(1);
    box-shadow: 0 0 ${size * 2}px ${color};
  `;

  document.body.appendChild(particle);

  // Animate particle
  let currentLife = life;
  let currentVelocity = { ...velocity };
  let currentX = x;
  let currentY = y;

  const animate = () => {
    currentLife -= 0.02;
    currentVelocity.y += gravity;
    currentVelocity.x *= friction;
    currentVelocity.y *= friction;
    
    currentX += currentVelocity.x;
    currentY += currentVelocity.y;

    particle.style.left = `${currentX - size / 2}px`;
    particle.style.top = `${currentY - size / 2}px`;
    particle.style.opacity = currentLife;
    particle.style.transform = `scale(${currentLife})`;

    if (currentLife > 0) {
      requestAnimationFrame(animate);
    } else {
      particle.remove();
    }
  };

  requestAnimationFrame(animate);
  return particle;
};

/**
 * Create ripple effect on click
 */
export const createRippleEffect = (x, y, options = {}) => {
  const {
    color = '#00d4ff',
    maxSize = 100,
    duration = 600,
    opacity = 0.6
  } = options;

  const ripple = document.createElement('div');
  ripple.className = 'cursor-ripple';
  
  ripple.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: 0;
    height: 0;
    border: 2px solid ${color};
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    opacity: ${opacity};
    transform: translate(-50%, -50%);
    box-shadow: 0 0 20px ${color};
  `;

  document.body.appendChild(ripple);

  // Animate ripple
  ripple.animate([
    {
      width: '0px',
      height: '0px',
      opacity: opacity
    },
    {
      width: `${maxSize}px`,
      height: `${maxSize}px`,
      opacity: 0
    }
  ], {
    duration,
    easing: 'ease-out'
  }).onfinish = () => {
    ripple.remove();
  };

  return ripple;
};

/**
 * Create magnetic effect for interactive elements
 */
export const createMagneticEffect = (element, cursor, strength = 0.3) => {
  if (!element || !cursor) return;

  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const cursorRect = cursor.getBoundingClientRect();
  const cursorX = cursorRect.left + cursorRect.width / 2;
  const cursorY = cursorRect.top + cursorRect.height / 2;

  const distance = Math.sqrt(
    Math.pow(centerX - cursorX, 2) + Math.pow(centerY - cursorY, 2)
  );

  const maxDistance = 100;
  
  if (distance < maxDistance) {
    const force = (maxDistance - distance) / maxDistance;
    const pullX = (centerX - cursorX) * force * strength;
    const pullY = (centerY - cursorY) * force * strength;

    cursor.style.transform += ` translate(${pullX}px, ${pullY}px)`;
  }
};

/**
 * Create text reveal effect
 */
export const createTextReveal = (text, x, y, options = {}) => {
  const {
    color = '#00d4ff',
    fontSize = '12px',
    duration = 2000,
    animation = 'fadeInUp'
  } = options;

  const textElement = document.createElement('div');
  textElement.className = 'cursor-text-reveal';
  textElement.textContent = text;
  
  textElement.style.cssText = `
    position: fixed;
    left: ${x + 20}px;
    top: ${y - 10}px;
    font-family: 'Orbitron', monospace;
    font-size: ${fontSize};
    font-weight: 700;
    color: ${color};
    text-transform: uppercase;
    letter-spacing: 2px;
    background: rgba(0, 0, 0, 0.8);
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid ${color};
    box-shadow: 0 0 10px ${color}40;
    pointer-events: none;
    z-index: 10001;
    backdrop-filter: blur(10px);
    opacity: 0;
    transform: translateY(10px);
  `;

  document.body.appendChild(textElement);

  // Animate text reveal
  const animations = {
    fadeInUp: [
      { opacity: 0, transform: 'translateY(10px)' },
      { opacity: 1, transform: 'translateY(0px)' }
    ],
    slideIn: [
      { opacity: 0, transform: 'translateX(-20px)' },
      { opacity: 1, transform: 'translateX(0px)' }
    ],
    scale: [
      { opacity: 0, transform: 'scale(0.8)' },
      { opacity: 1, transform: 'scale(1)' }
    ]
  };

  textElement.animate(animations[animation] || animations.fadeInUp, {
    duration: 300,
    easing: 'ease-out',
    fill: 'forwards'
  });

  // Remove after duration
  setTimeout(() => {
    textElement.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], {
      duration: 200,
      easing: 'ease-in'
    }).onfinish = () => {
      textElement.remove();
    };
  }, duration);

  return textElement;
};

/**
 * Create glow pulse effect
 */
export const createGlowPulse = (element, options = {}) => {
  const {
    color = '#00d4ff',
    intensity = 20,
    duration = 1000,
    iterations = 'infinite'
  } = options;

  if (!element) return;

  const originalBoxShadow = element.style.boxShadow;
  
  element.animate([
    {
      boxShadow: `0 0 ${intensity}px ${color}, 0 0 ${intensity * 2}px ${color}40`
    },
    {
      boxShadow: `0 0 ${intensity * 2}px ${color}, 0 0 ${intensity * 4}px ${color}60`
    },
    {
      boxShadow: `0 0 ${intensity}px ${color}, 0 0 ${intensity * 2}px ${color}40`
    }
  ], {
    duration,
    iterations,
    easing: 'ease-in-out'
  });

  // Return cleanup function
  return () => {
    element.style.boxShadow = originalBoxShadow;
  };
};

/**
 * Create cursor morphing effect
 */
export const morphCursor = (cursor, targetShape, options = {}) => {
  const {
    duration = 300,
    easing = 'ease-out'
  } = options;

  if (!cursor) return;

  const shapes = {
    circle: {
      borderRadius: '50%',
      transform: 'scale(1)'
    },
    square: {
      borderRadius: '0%',
      transform: 'scale(1)'
    },
    diamond: {
      borderRadius: '0%',
      transform: 'scale(1) rotate(45deg)'
    },
    cross: {
      borderRadius: '0%',
      transform: 'scale(1)',
      clipPath: 'polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)'
    }
  };

  const targetStyles = shapes[targetShape] || shapes.circle;

  cursor.animate([
    cursor.style,
    targetStyles
  ], {
    duration,
    easing,
    fill: 'forwards'
  });
};

/**
 * Create cursor trail with custom pattern
 */
export const createCustomTrail = (points, options = {}) => {
  const {
    color = '#00d4ff',
    pattern = 'dots',
    spacing = 10,
    decay = 0.05
  } = options;

  points.forEach((point, index) => {
    const delay = index * spacing;
    
    setTimeout(() => {
      switch (pattern) {
        case 'dots':
          createParticleTrail(point.x, point.y, { color, size: 3 });
          break;
        case 'lines':
          if (index > 0) {
            createLineTrail(points[index - 1], point, { color });
          }
          break;
        case 'stars':
          createStarTrail(point.x, point.y, { color });
          break;
        default:
          createParticleTrail(point.x, point.y, { color });
      }
    }, delay);
  });
};

/**
 * Create line trail between two points
 */
export const createLineTrail = (point1, point2, options = {}) => {
  const { color = '#00d4ff' } = options;
  
  const line = document.createElement('div');
  const length = Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
  const angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);

  line.style.cssText = `
    position: fixed;
    left: ${point1.x}px;
    top: ${point1.y}px;
    width: ${length}px;
    height: 2px;
    background: linear-gradient(90deg, ${color}, transparent);
    transform-origin: 0 50%;
    transform: rotate(${angle}rad);
    pointer-events: none;
    z-index: 9999;
    opacity: 0.8;
  `;

  document.body.appendChild(line);

  // Fade out
  line.animate([
    { opacity: 0.8 },
    { opacity: 0 }
  ], {
    duration: 500,
    easing: 'ease-out'
  }).onfinish = () => {
    line.remove();
  };
};

/**
 * Create star trail effect
 */
export const createStarTrail = (x, y, options = {}) => {
  const { color = '#00d4ff' } = options;
  
  const star = document.createElement('div');
  star.innerHTML = '✦';
  
  star.style.cssText = `
    position: fixed;
    left: ${x - 8}px;
    top: ${y - 8}px;
    font-size: 16px;
    color: ${color};
    pointer-events: none;
    z-index: 9999;
    text-shadow: 0 0 10px ${color};
    animation: starTwinkle 1s ease-out forwards;
  `;

  document.body.appendChild(star);

  setTimeout(() => {
    star.remove();
  }, 1000);
};

/**
 * Performance monitor for cursor effects
 */
export const CursorPerformanceMonitor = {
  frameCount: 0,
  lastTime: performance.now(),
  fps: 60,
  
  update() {
    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  },
  
  shouldReduceEffects() {
    return this.fps < 30;
  },
  
  getPerformanceLevel() {
    if (this.fps >= 50) return 'high';
    if (this.fps >= 30) return 'medium';
    return 'low';
  }
};

export default {
  createParticleTrail,
  createRippleEffect,
  createMagneticEffect,
  createTextReveal,
  createGlowPulse,
  morphCursor,
  createCustomTrail,
  createLineTrail,
  createStarTrail,
  CursorPerformanceMonitor
};
