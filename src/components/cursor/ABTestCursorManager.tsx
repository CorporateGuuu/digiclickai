'use client';

import React, { useEffect, useState, Suspense, lazy, useRef } from 'react';
import { useRouter } from 'next/router';
import { useCursorABTest } from '../../contexts/ABTestContext';
import { detectDevice, preloadGSAPIfNeeded, loadGSAPForVariant } from '../../lib/gsap-loader';
import { capturePerformanceIssue } from '../../lib/sentry-config';
import { getAccessibilityManager } from '../../lib/accessibility-manager';
import { getZIndexManager } from '../../lib/z-index-manager';
import EnhancedCustomCursor from '../../../components/CustomCursor/EnhancedCustomCursor'; // Fallback cursor

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
  const router = useRouter();
  const { variant, config, trackCursorEvent, isVariant } = useCursorABTest();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [accessibilityDisabled, setAccessibilityDisabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Refs for cleanup
  const gsapCleanupRef = useRef<(() => void) | null>(null);
  const performanceMonitorRef = useRef<number | null>(null);

  useEffect(() => {
    // Use optimized device detection
    const device = detectDevice();
    setIsTouchDevice(device.isTouch);

    // Initialize accessibility manager
    const accessibilityManager = getAccessibilityManager();
    if (accessibilityManager) {
      const status = accessibilityManager.getAccessibilityStatus();
      setAccessibilityDisabled(status.cursorAccessibilityMode || status.screenReader);
      setReducedMotion(status.reducedMotion);
    }

    // Initialize z-index manager for modal handling
    const zIndexManager = getZIndexManager();

    // Set visibility based on device and accessibility
    setIsVisible(!device.isTouch && !accessibilityDisabled);

    // Preload GSAP if needed for the variant and accessibility allows
    if (!device.isTouch && !accessibilityDisabled) {
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

    // Setup accessibility event listeners
    const handleAccessibilityDisable = () => {
      setAccessibilityDisabled(true);
      setIsVisible(false);
      trackCursorEvent('accessibility_disabled', undefined, { variant, reason: 'user_request' });
    };

    const handleAccessibilityEnable = () => {
      setAccessibilityDisabled(false);
      setIsVisible(!device.isTouch);
      trackCursorEvent('accessibility_enabled', undefined, { variant });
    };

    const handleReducedMotion = (e: CustomEvent) => {
      setReducedMotion(e.detail.enabled);
      trackCursorEvent('reduced_motion_changed', undefined, {
        variant,
        enabled: e.detail.enabled
      });
    };

    const handleVariantSwitch = (e: CustomEvent) => {
      trackCursorEvent('accessibility_variant_switch', undefined, {
        variant,
        new_variant: e.detail.variant,
        accessibility_mode: accessibilityDisabled
      });
    };

    const handleModalStateChange = (e: CustomEvent) => {
      const { action, modalZIndex, cursorAdjustment } = e.detail;

      if (cursorAdjustment) {
        switch (cursorAdjustment.action) {
          case 'hide':
            setIsVisible(false);
            trackCursorEvent('cursor_hidden_for_modal', undefined, { variant, modalZIndex });
            break;
          case 'adjust':
            // Cursor stays visible but z-index is managed by z-index manager
            trackCursorEvent('cursor_adjusted_for_modal', undefined, { variant, modalZIndex, newZIndex: cursorAdjustment.zIndex });
            break;
          case 'restore':
            setIsVisible(!device.isTouch && !accessibilityDisabled);
            trackCursorEvent('cursor_restored_after_modal', undefined, { variant });
            break;
        }
      }
    };

    // Add event listeners
    window.addEventListener('accessibility-disable-cursor', handleAccessibilityDisable);
    window.addEventListener('accessibility-enable-cursor', handleAccessibilityEnable);
    window.addEventListener('accessibility-reduce-motion', handleReducedMotion as EventListener);
    window.addEventListener('accessibility-switch-cursor-variant', handleVariantSwitch as EventListener);
    window.addEventListener('modal-state-changed', handleModalStateChange as EventListener);

    // Cleanup function
    return () => {
      window.removeEventListener('accessibility-disable-cursor', handleAccessibilityDisable);
      window.removeEventListener('accessibility-enable-cursor', handleAccessibilityEnable);
      window.removeEventListener('accessibility-reduce-motion', handleReducedMotion as EventListener);
      window.removeEventListener('accessibility-switch-cursor-variant', handleVariantSwitch as EventListener);
      window.removeEventListener('modal-state-changed', handleModalStateChange as EventListener);
    };

  }, [variant, config, trackCursorEvent, accessibilityDisabled]);

  // Handle Next.js page transitions
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      setIsTransitioning(true);

      // Clean up GSAP animations before transition
      if (gsapCleanupRef.current) {
        gsapCleanupRef.current();
      }

      // Temporarily hide cursor during transition
      setIsVisible(false);

      trackCursorEvent('page_transition_start', undefined, {
        variant,
        from: router.asPath,
        to: url,
        accessibility_mode: accessibilityDisabled
      });
    };

    const handleRouteChangeComplete = (url: string) => {
      setIsTransitioning(false);

      // Restore cursor visibility after transition
      setTimeout(() => {
        setIsVisible(!isTouchDevice && !accessibilityDisabled);
      }, 100);

      // Reload GSAP for the new page if needed
      if (!isTouchDevice && !accessibilityDisabled) {
        loadGSAPForVariant(variant).catch((error) => {
          console.error('Failed to reload GSAP after page transition:', error);
        });
      }

      trackCursorEvent('page_transition_complete', undefined, {
        variant,
        to: url,
        accessibility_mode: accessibilityDisabled
      });
    };

    const handleRouteChangeError = (err: Error, url: string) => {
      setIsTransitioning(false);
      setIsVisible(!isTouchDevice && !accessibilityDisabled);

      trackCursorEvent('page_transition_error', undefined, {
        variant,
        to: url,
        error: err.message,
        accessibility_mode: accessibilityDisabled
      });
    };

    // Add router event listeners
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router, variant, isTouchDevice, accessibilityDisabled, trackCursorEvent]);

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

  // Don't render cursor on touch devices or when accessibility disabled
  if (isTouchDevice || accessibilityDisabled) {
    return (
      <>
        {/* Hidden accessibility announcement for screen readers */}
        <div
          className="screen-reader-only"
          aria-live="polite"
          aria-label={`Cursor system disabled. Current A/B test variant: ${variant}. Touch device: ${isTouchDevice}. Accessibility mode: ${accessibilityDisabled}`}
        />
        {children}
      </>
    );
  }

  // Show loading state while GSAP loads
  if (isLoading) {
    return (
      <>
        <EnhancedCustomCursor isVisible={isVisible} />
        <div
          className="screen-reader-only"
          aria-live="polite"
          aria-label={`Loading cursor variant: ${variant}`}
        />
        {children}
      </>
    );
  }

  // Render appropriate cursor variant with Suspense
  const renderCursorVariant = () => {
    const CursorFallback = () => (
      <div aria-hidden="true">
        <EnhancedCustomCursor isVisible={isVisible} />
      </div>
    );

    switch (variant) {
      case 'enhanced':
        return (
          <Suspense fallback={<CursorFallback />}>
            <div aria-hidden="true">
              <EnhancedCursor isVisible={isVisible} />
            </div>
          </Suspense>
        );

      case 'minimal':
        return (
          <Suspense fallback={<CursorFallback />}>
            <div aria-hidden="true">
              <MinimalCursor isVisible={isVisible} />
            </div>
          </Suspense>
        );

      case 'gaming':
        return (
          <Suspense fallback={<CursorFallback />}>
            <div aria-hidden="true">
              <GamingCursor isVisible={isVisible} />
            </div>
          </Suspense>
        );

      case 'control':
      default:
        return (
          <div aria-hidden="true">
            <EnhancedCustomCursor isVisible={isVisible} />
          </div>
        );
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
