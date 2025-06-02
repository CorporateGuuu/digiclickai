'use client';

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useCursorABTest } from '../../contexts/ABTestContext';
import { detectDevice, preloadGSAPIfNeeded, loadGSAPForVariant } from '../../lib/gsap-loader';
import { capturePerformanceIssue } from '../../lib/sentry-config';
import EnhancedCustomCursor from './EnhancedCustomCursor'; // Fallback cursor

// Dynamic imports for cursor variants with chunk splitting
const EnhancedCursor = lazy(() =>
  import('./variants/EnhancedCursor').then(module => ({ default: module.default }))
);

const MinimalCursor = lazy(() =>
  import('./variants/MinimalCursor').then(module => ({ default: module.default }))
);

const GamingCursor = lazy(() =>
  import('./variants/GamingCursor').then(module => ({ default: module.default }))
);

interface ABTestCursorManagerProps {
  children?: React.ReactNode;
}

const ABTestCursorManager: React.FC<ABTestCursorManagerProps> = ({ children }) => {
  const { variant, config, trackCursorEvent, isVariant } = useCursorABTest();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Use optimized device detection
    const device = detectDevice();
    setIsTouchDevice(device.isTouch);
    setIsVisible(!device.isTouch);

    // Preload GSAP if needed for the variant
    if (!device.isTouch) {
      preloadGSAPIfNeeded();

      // Load GSAP for current variant
      loadGSAPForVariant(variant)
        .then(() => {
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Failed to load GSAP for variant:', variant, error);
          setLoadError(true);
          setIsLoading(false);

          capturePerformanceIssue(
            'cursor_variant_load_failed',
            0,
            1,
            {
              tags: { variant, component: 'cursor_manager' },
              extra: { error: error.message }
            }
          );
        });
    } else {
      setIsLoading(false);
    }
    
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

  // Fallback to control variant on error or loading failure
  if (hasError || loadError) {
    return (
      <>
        <EnhancedCustomCursor isVisible={isVisible} />
        {children}
      </>
    );
  }

  // Don't render cursor on touch devices
  if (isTouchDevice) {
    return <>{children}</>;
  }

  // Show loading state while GSAP loads
  if (isLoading) {
    return (
      <>
        <EnhancedCustomCursor isVisible={isVisible} />
        {children}
      </>
    );
  }

  // Render appropriate cursor variant with Suspense
  const renderCursorVariant = () => {
    const CursorFallback = () => (
      <EnhancedCustomCursor isVisible={isVisible} />
    );

    switch (variant) {
      case 'enhanced':
        return (
          <Suspense fallback={<CursorFallback />}>
            <EnhancedCursor isVisible={isVisible} />
          </Suspense>
        );

      case 'minimal':
        return (
          <Suspense fallback={<CursorFallback />}>
            <MinimalCursor isVisible={isVisible} />
          </Suspense>
        );

      case 'gaming':
        return (
          <Suspense fallback={<CursorFallback />}>
            <GamingCursor isVisible={isVisible} />
          </Suspense>
        );

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
