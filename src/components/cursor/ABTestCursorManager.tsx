'use client';

import React, { useEffect, useState } from 'react';
import { useCursorABTest } from '../../contexts/ABTestContext';
import EnhancedCustomCursor from './EnhancedCustomCursor'; // Current cursor
import EnhancedCursor from './variants/EnhancedCursor';
import MinimalCursor from './variants/MinimalCursor';
import GamingCursor from './variants/GamingCursor';

interface ABTestCursorManagerProps {
  children?: React.ReactNode;
}

const ABTestCursorManager: React.FC<ABTestCursorManagerProps> = ({ children }) => {
  const { variant, config, trackCursorEvent, isVariant } = useCursorABTest();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Detect touch devices
    const checkTouchDevice = () => {
      const hasTouch = 'ontouchstart' in window || 
                      navigator.maxTouchPoints > 0 || 
                      (navigator as any).msMaxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
      setIsVisible(!hasTouch);
    };

    checkTouchDevice();
    
    // Track cursor variant assignment
    trackCursorEvent('variant_assigned', undefined, {
      variant,
      config: JSON.stringify(config),
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight
    });

    // Performance monitoring
    const startTime = performance.now();
    const checkPerformance = () => {
      const endTime = performance.now();
      const initTime = endTime - startTime;
      
      trackCursorEvent('performance_init', undefined, {
        variant,
        init_time: initTime,
        memory_used: (performance as any).memory?.usedJSHeapSize || 0,
        memory_total: (performance as any).memory?.totalJSHeapSize || 0
      });
    };

    // Check performance after component is fully loaded
    setTimeout(checkPerformance, 1000);

    // Monitor frame rate
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        trackCursorEvent('performance_fps', undefined, {
          variant,
          fps,
          target_fps: config.performance?.targetFPS || 60,
          memory_used: (performance as any).memory?.usedJSHeapSize || 0
        });
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    // Start FPS monitoring after a delay
    setTimeout(() => requestAnimationFrame(measureFPS), 2000);

  }, [variant, config, trackCursorEvent]);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isPageVisible = !document.hidden;
      setIsVisible(isPageVisible && !isTouchDevice);
      
      trackCursorEvent('visibility_change', undefined, {
        variant,
        visible: isPageVisible,
        touch_device: isTouchDevice
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [variant, isTouchDevice, trackCursorEvent]);

  // Error boundary for cursor variants
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (error.message.includes('cursor') || error.filename?.includes('cursor')) {
        setHasError(true);
        trackCursorEvent('error', undefined, {
          variant,
          error_message: error.message,
          error_filename: error.filename,
          error_line: error.lineno
        });
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [variant, trackCursorEvent]);

  // Fallback to control variant on error
  if (hasError) {
    return <EnhancedCustomCursor isVisible={isVisible} />;
  }

  // Don't render cursor on touch devices
  if (isTouchDevice) {
    return <>{children}</>;
  }

  // Render appropriate cursor variant
  const renderCursorVariant = () => {
    switch (variant) {
      case 'enhanced':
        return <EnhancedCursor isVisible={isVisible} />;
      
      case 'minimal':
        return <MinimalCursor isVisible={isVisible} />;
      
      case 'gaming':
        return <GamingCursor isVisible={isVisible} />;
      
      case 'control':
      default:
        return <EnhancedCustomCursor isVisible={isVisible} />;
    }
  };

  return (
    <>
      {renderCursorVariant()}
      {children}
      
      {/* Performance monitoring overlay for development */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 10001,
            fontFamily: 'monospace'
          }}
        >
          <div>A/B Test Variant: {variant}</div>
          <div>Touch Device: {isTouchDevice ? 'Yes' : 'No'}</div>
          <div>Cursor Visible: {isVisible ? 'Yes' : 'No'}</div>
          <div>Target FPS: {config.performance?.targetFPS || 60}</div>
          <div>Memory Limit: {config.performance?.memoryLimit || 50}MB</div>
        </div>
      )}
    </>
  );
};

export default ABTestCursorManager;
