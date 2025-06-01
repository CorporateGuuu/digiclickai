/**
 * DigiClick AI Custom Cursor Configuration
 * Advanced settings and presets for the custom cursor system
 */

export const CURSOR_THEMES = {
  default: {
    name: 'DigiClick AI Default',
    colors: {
      primary: '#00d4ff',
      secondary: '#7b2cbf',
      accent: '#00ff88',
      text: '#ff6b6b',
      click: '#ffffff'
    },
    sizes: {
      default: 24,
      hover: 36,
      click: 18,
      glow: 48
    },
    animations: {
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      duration: 300,
      trailLength: 20,
      trailDecay: 0.05
    }
  },
  
  minimal: {
    name: 'Minimal Tech',
    colors: {
      primary: '#ffffff',
      secondary: '#00d4ff',
      accent: '#7b2cbf',
      text: '#ffffff',
      click: '#00d4ff'
    },
    sizes: {
      default: 16,
      hover: 24,
      click: 12,
      glow: 32
    },
    animations: {
      easing: 'ease-out',
      duration: 200,
      trailLength: 10,
      trailDecay: 0.1
    }
  },
  
  neon: {
    name: 'Neon Glow',
    colors: {
      primary: '#ff0080',
      secondary: '#00ff80',
      accent: '#8000ff',
      text: '#ffff00',
      click: '#ffffff'
    },
    sizes: {
      default: 32,
      hover: 48,
      click: 24,
      glow: 64
    },
    animations: {
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      duration: 400,
      trailLength: 30,
      trailDecay: 0.03
    }
  },
  
  corporate: {
    name: 'Corporate Blue',
    colors: {
      primary: '#0066cc',
      secondary: '#003d7a',
      accent: '#00aaff',
      text: '#ffffff',
      click: '#ffaa00'
    },
    sizes: {
      default: 20,
      hover: 28,
      click: 16,
      glow: 40
    },
    animations: {
      easing: 'ease-in-out',
      duration: 250,
      trailLength: 15,
      trailDecay: 0.07
    }
  }
};

export const CURSOR_SETTINGS = {
  // Performance settings
  performance: {
    enableTrail: true,
    enableGlow: true,
    enableRipple: true,
    enableText: true,
    useGPUAcceleration: true,
    maxFPS: 60
  },
  
  // Accessibility settings
  accessibility: {
    respectReducedMotion: true,
    highContrastMode: false,
    largeSize: false,
    enableSounds: false
  },
  
  // Interaction settings
  interaction: {
    hoverDelay: 100,
    clickDuration: 150,
    textDisplayTime: 2000,
    magneticStrength: 0.3,
    smoothing: 0.15
  },
  
  // Visual effects
  effects: {
    blendMode: 'difference',
    opacity: 1,
    blur: 0,
    scale: 1,
    rotation: 0
  }
};

export const CURSOR_SELECTORS = {
  // Interactive elements that trigger hover state
  interactive: [
    'a',
    'button',
    '[role="button"]',
    'input',
    'textarea',
    'select',
    '.cta-button',
    '.pulse-box',
    '.interactive'
  ],
  
  // Elements that trigger glow effect
  glow: [
    '.cta-button',
    '.pulse-box',
    '.glow-trigger',
    '.hero-button',
    '.nav-link'
  ],
  
  // Text elements
  text: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    '.glow-text',
    '.text-trigger',
    'p',
    'span'
  ],
  
  // Elements that disable cursor
  disabled: [
    '[disabled]',
    '.disabled',
    '.no-cursor'
  ]
};

/**
 * Get cursor theme by name
 */
export const getCursorTheme = (themeName = 'default') => {
  return CURSOR_THEMES[themeName] || CURSOR_THEMES.default;
};

/**
 * Apply cursor theme to CSS variables
 */
export const applyCursorTheme = (themeName = 'default') => {
  const theme = getCursorTheme(themeName);
  const root = document.documentElement;
  
  // Apply color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--cursor-color-${key}`, value);
  });
  
  // Apply size variables
  Object.entries(theme.sizes).forEach(([key, value]) => {
    root.style.setProperty(`--cursor-size-${key}`, `${value}px`);
  });
  
  // Apply animation variables
  Object.entries(theme.animations).forEach(([key, value]) => {
    root.style.setProperty(`--cursor-animation-${key}`, value);
  });
};

/**
 * Check if element matches selector
 */
export const matchesSelector = (element, selectors) => {
  return selectors.some(selector => {
    try {
      return element.matches(selector) || element.closest(selector);
    } catch (e) {
      return false;
    }
  });
};

/**
 * Get cursor type for element
 */
export const getCursorType = (element) => {
  if (!element) return 'default';
  
  if (matchesSelector(element, CURSOR_SELECTORS.disabled)) {
    return 'disabled';
  }
  
  if (matchesSelector(element, CURSOR_SELECTORS.glow)) {
    return 'glow';
  }
  
  if (matchesSelector(element, CURSOR_SELECTORS.interactive)) {
    return 'pointer';
  }
  
  if (matchesSelector(element, CURSOR_SELECTORS.text)) {
    return 'text';
  }
  
  return 'default';
};

/**
 * Initialize cursor system
 */
export const initializeCursor = (options = {}) => {
  const settings = { ...CURSOR_SETTINGS, ...options };
  
  // Apply theme
  if (options.theme) {
    applyCursorTheme(options.theme);
  }
  
  // Set performance settings
  if (settings.performance.useGPUAcceleration) {
    document.body.style.transform = 'translate3d(0, 0, 0)';
  }
  
  // Check for reduced motion preference
  if (settings.accessibility.respectReducedMotion) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      settings.performance.enableTrail = false;
      settings.performance.enableGlow = false;
    }
  }
  
  // Check for high contrast preference
  if (window.matchMedia('(prefers-contrast: high)').matches) {
    settings.accessibility.highContrastMode = true;
    applyCursorTheme('minimal');
  }
  
  return settings;
};

/**
 * Cursor event handlers
 */
export const CURSOR_EVENTS = {
  MOVE: 'cursor:move',
  HOVER: 'cursor:hover',
  CLICK: 'cursor:click',
  LEAVE: 'cursor:leave',
  CHANGE_TYPE: 'cursor:changeType'
};

/**
 * Emit cursor event
 */
export const emitCursorEvent = (eventType, data = {}) => {
  const event = new CustomEvent(eventType, { detail: data });
  document.dispatchEvent(event);
};

/**
 * Listen to cursor events
 */
export const onCursorEvent = (eventType, callback) => {
  document.addEventListener(eventType, callback);
  
  // Return cleanup function
  return () => {
    document.removeEventListener(eventType, callback);
  };
};

export default {
  CURSOR_THEMES,
  CURSOR_SETTINGS,
  CURSOR_SELECTORS,
  CURSOR_EVENTS,
  getCursorTheme,
  applyCursorTheme,
  matchesSelector,
  getCursorType,
  initializeCursor,
  emitCursorEvent,
  onCursorEvent
};
