'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// A/B Test Types
export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  config?: Record<string, any>;
}

export interface ABTestConfig {
  testId: string;
  isActive: boolean;
  variants: Record<string, ABTestVariant>;
  userVariant?: string;
  userId?: string;
  sessionId?: string;
}

export interface ABTestContextType {
  currentVariant: string;
  variantConfig: Record<string, any>;
  isLoading: boolean;
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  getVariant: (testId?: string) => string;
  isVariant: (variant: string) => boolean;
}

// Default context value
const defaultContext: ABTestContextType = {
  currentVariant: 'control',
  variantConfig: {},
  isLoading: true,
  trackEvent: () => {},
  getVariant: () => 'control',
  isVariant: () => false,
};

// Create context
const ABTestContext = createContext<ABTestContextType>(defaultContext);

// A/B Test Provider Props
interface ABTestProviderProps {
  children: ReactNode;
  testId?: string;
}

// Cursor variant configurations
const CURSOR_VARIANTS: Record<string, any> = {
  control: {
    theme: 'current',
    animations: {
      hover: { scale: 1.2, duration: 0.3 },
      click: { scale: 0.9, duration: 0.1 },
      trail: false,
      particles: false,
      glow: { intensity: 0.5, color: '#00d4ff' }
    },
    performance: { targetFPS: 60, memoryLimit: 50 }
  },
  enhanced: {
    theme: 'enhanced',
    animations: {
      hover: { scale: 1.3, duration: 0.2 },
      click: { scale: 0.8, duration: 0.1 },
      trail: true,
      particles: { count: 15, lifetime: 800 },
      glow: { intensity: 0.8, color: '#00d4ff' }
    },
    performance: { targetFPS: 60, memoryLimit: 60 }
  },
  minimal: {
    theme: 'minimal',
    animations: {
      hover: { scale: 1.1, duration: 0.4 },
      click: { scale: 0.95, duration: 0.05 },
      trail: false,
      particles: false,
      glow: { intensity: 0.2, color: '#ffffff' }
    },
    performance: { targetFPS: 60, memoryLimit: 30 }
  },
  gaming: {
    theme: 'gaming',
    animations: {
      hover: { scale: 1.4, duration: 0.15 },
      click: { scale: 0.7, duration: 0.08 },
      trail: true,
      particles: { count: 25, lifetime: 1200 },
      glow: { intensity: 1.0, color: 'rainbow' },
      rgb: { enabled: true, speed: 2 }
    },
    performance: { targetFPS: 60, memoryLimit: 80 }
  }
};

// A/B Test Provider Component
export const ABTestProvider: React.FC<ABTestProviderProps> = ({ 
  children, 
  testId = 'cursor-theme-optimization-v1' 
}) => {
  const [currentVariant, setCurrentVariant] = useState<string>('control');
  const [variantConfig, setVariantConfig] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    initializeABTest();
  }, [testId]);

  const initializeABTest = async () => {
    try {
      // Get variant from cookie or server headers
      const variant = getVariantFromCookie(testId) || 
                     getVariantFromHeaders() || 
                     'control';

      // Get user and session IDs
      const userIdFromStorage = getUserId();
      const sessionIdFromStorage = getSessionId();

      setCurrentVariant(variant);
      setVariantConfig(CURSOR_VARIANTS[variant] || CURSOR_VARIANTS.control);
      setUserId(userIdFromStorage);
      setSessionId(sessionIdFromStorage);
      setIsLoading(false);

      // Track assignment event
      trackEvent('ab_test_assigned', {
        testId,
        variant,
        userId: userIdFromStorage,
        sessionId: sessionIdFromStorage,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('A/B Test initialization error:', error);
      // Fallback to control variant
      setCurrentVariant('control');
      setVariantConfig(CURSOR_VARIANTS.control);
      setIsLoading(false);
    }
  };

  const getVariantFromCookie = (testId: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const abCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`ab_${testId}=`)
    );
    
    return abCookie ? abCookie.split('=')[1] : null;
  };

  const getVariantFromHeaders = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Check if variant was set by edge function
    const metaTag = document.querySelector('meta[name="ab-variant"]');
    return metaTag ? metaTag.getAttribute('content') : null;
  };

  const getUserId = (): string => {
    if (typeof window === 'undefined') return '';
    
    let userId = localStorage.getItem('ab_user_id');
    if (!userId) {
      userId = generateId();
      localStorage.setItem('ab_user_id', userId);
    }
    return userId;
  };

  const getSessionId = (): string => {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('ab_session_id');
    if (!sessionId) {
      sessionId = generateId();
      sessionStorage.setItem('ab_session_id', sessionId);
    }
    return sessionId;
  };

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
    const eventData = {
      event: eventName,
      testId,
      variant: currentVariant,
      userId,
      sessionId,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      ...properties
    };

    // Send to analytics
    if (typeof window !== 'undefined') {
      // Google Analytics 4
      if (window.gtag) {
        window.gtag('event', eventName, {
          custom_parameter_1: testId,
          custom_parameter_2: currentVariant,
          custom_parameter_3: userId,
          ...properties
        });
      }

      // Custom analytics endpoint
      fetch('/api/analytics/ab-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      }).catch(error => {
        console.warn('Analytics tracking failed:', error);
      });

      // Console logging for development
      if (process.env.NODE_ENV === 'development') {
        console.log('A/B Test Event:', eventData);
      }
    }
  };

  const getVariant = (testIdParam?: string): string => {
    return currentVariant;
  };

  const isVariant = (variant: string): boolean => {
    return currentVariant === variant;
  };

  const contextValue: ABTestContextType = {
    currentVariant,
    variantConfig,
    isLoading,
    trackEvent,
    getVariant,
    isVariant,
  };

  return (
    <ABTestContext.Provider value={contextValue}>
      {children}
    </ABTestContext.Provider>
  );
};

// Hook to use A/B Test context
export const useABTest = (): ABTestContextType => {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within an ABTestProvider');
  }
  return context;
};

// Hook specifically for cursor A/B testing
export const useCursorABTest = () => {
  const { currentVariant, variantConfig, trackEvent, isVariant } = useABTest();
  
  const trackCursorEvent = (eventType: string, element?: string, properties?: Record<string, any>) => {
    trackEvent('cursor_interaction', {
      interaction_type: eventType,
      element_type: element,
      cursor_variant: currentVariant,
      ...properties
    });
  };

  return {
    variant: currentVariant,
    config: variantConfig,
    trackCursorEvent,
    isVariant,
    isControl: isVariant('control'),
    isEnhanced: isVariant('enhanced'),
    isMinimal: isVariant('minimal'),
    isGaming: isVariant('gaming'),
  };
};

// Type declarations for global gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default ABTestContext;
