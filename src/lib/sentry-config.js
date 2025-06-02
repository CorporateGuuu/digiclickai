/**
 * Sentry Error Tracking Configuration for DigiClick AI
 * Comprehensive error monitoring with A/B testing and cursor system integration
 */

import * as Sentry from '@sentry/nextjs';

// Environment configuration
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const RELEASE_VERSION = process.env.NEXT_PUBLIC_RELEASE_VERSION || 'unknown';
const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_APP_URL;

// Sentry configuration
export const sentryConfig = {
  dsn: SENTRY_DSN,
  environment: ENVIRONMENT,
  release: RELEASE_VERSION,
  
  // Performance monitoring
  tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
  
  // Session replay for debugging
  replaysSessionSampleRate: ENVIRONMENT === 'production' ? 0.01 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out development errors
    if (ENVIRONMENT === 'development') {
      console.log('Sentry Event:', event);
    }
    
    // Filter out known non-critical errors
    const ignoredErrors = [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Network request failed',
      'Loading chunk',
      'ChunkLoadError'
    ];
    
    if (event.exception) {
      const error = event.exception.values[0];
      if (error && ignoredErrors.some(ignored => 
        error.value?.includes(ignored) || error.type?.includes(ignored)
      )) {
        return null;
      }
    }
    
    return event;
  },
  
  // Enhanced context
  initialScope: {
    tags: {
      component: 'digiclick-ai',
      deployment_url: DEPLOYMENT_URL
    }
  },
  
  // Integration configuration
  integrations: [
    new Sentry.BrowserTracing({
      // Cursor system performance monitoring
      tracingOrigins: [
        'localhost',
        /^https:\/\/digiclickai\.netlify\.app/,
        /^https:\/\/digiclick-ai-backend\.onrender\.com/
      ],
      
      // Custom routing for Next.js
      routingInstrumentation: Sentry.nextRouterInstrumentation,
      
      // Performance monitoring for cursor interactions
      beforeNavigate: context => {
        return {
          ...context,
          tags: {
            ...context.tags,
            cursor_variant: getCursorVariant(),
            ab_test_id: getABTestId()
          }
        };
      }
    }),
    
    new Sentry.Replay({
      // Mask sensitive data
      maskAllText: false,
      maskAllInputs: true,
      blockAllMedia: false,
      
      // Session replay configuration
      sessionSampleRate: ENVIRONMENT === 'production' ? 0.01 : 0.1,
      errorSampleRate: 1.0,
      
      // Privacy settings
      maskTextSelector: '[data-sensitive]',
      blockSelector: '[data-private]'
    })
  ]
};

// Initialize Sentry
export function initializeSentry() {
  if (!SENTRY_DSN) {
    console.warn('⚠️ Sentry DSN not configured - error tracking disabled');
    return;
  }
  
  Sentry.init(sentryConfig);
  
  // Set up global error handlers
  setupGlobalErrorHandlers();
  
  // Set up cursor system monitoring
  setupCursorSystemMonitoring();
  
  // Set up A/B testing monitoring
  setupABTestingMonitoring();
  
  console.log('✅ Sentry error tracking initialized');
}

// Global error handlers
function setupGlobalErrorHandlers() {
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', event => {
    Sentry.captureException(event.reason, {
      tags: {
        error_type: 'unhandled_promise_rejection',
        cursor_variant: getCursorVariant(),
        ab_test_id: getABTestId()
      },
      extra: {
        promise: event.promise,
        reason: event.reason
      }
    });
  });
  
  // Global JavaScript errors
  window.addEventListener('error', event => {
    // Skip if already handled by Sentry
    if (event.error && event.error.__sentryProcessed) {
      return;
    }
    
    Sentry.captureException(event.error || new Error(event.message), {
      tags: {
        error_type: 'global_javascript_error',
        cursor_variant: getCursorVariant(),
        ab_test_id: getABTestId()
      },
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });
}

// Cursor system monitoring
function setupCursorSystemMonitoring() {
  // Monitor GSAP errors
  if (typeof window !== 'undefined') {
    const originalGSAPError = console.error;
    console.error = function(...args) {
      if (args.some(arg => typeof arg === 'string' && arg.includes('gsap'))) {
        Sentry.captureException(new Error(`GSAP Error: ${args.join(' ')}`), {
          tags: {
            error_type: 'gsap_error',
            cursor_variant: getCursorVariant(),
            component: 'cursor_system'
          },
          level: 'error'
        });
      }
      originalGSAPError.apply(console, args);
    };
  }
}

// A/B testing monitoring
function setupABTestingMonitoring() {
  // Monitor A/B testing errors
  if (typeof window !== 'undefined') {
    window.addEventListener('ab-test-error', event => {
      Sentry.captureException(new Error(`A/B Test Error: ${event.detail.message}`), {
        tags: {
          error_type: 'ab_test_error',
          test_id: event.detail.testId,
          variant: event.detail.variant,
          component: 'ab_testing'
        },
        extra: event.detail
      });
    });
  }
}

// Utility functions
function getCursorVariant() {
  if (typeof window === 'undefined') return 'unknown';
  
  try {
    const cookies = document.cookie.split(';');
    const abCookie = cookies.find(cookie => 
      cookie.trim().startsWith('ab_cursor-theme-optimization')
    );
    
    if (abCookie) {
      return abCookie.split('=')[1]?.trim() || 'unknown';
    }
    
    return 'control';
  } catch (error) {
    return 'unknown';
  }
}

function getABTestId() {
  return 'cursor-theme-optimization-v1';
}

// Custom error capture functions
export function captureCustomError(error, context = {}) {
  Sentry.captureException(error, {
    tags: {
      error_type: 'custom_error',
      cursor_variant: getCursorVariant(),
      ab_test_id: getABTestId(),
      ...context.tags
    },
    extra: {
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      url: window.location.href,
      ...context.extra
    },
    level: context.level || 'error'
  });
}

export function capturePerformanceIssue(metric, value, threshold, context = {}) {
  Sentry.captureMessage(`Performance Issue: ${metric}`, {
    level: 'warning',
    tags: {
      error_type: 'performance_issue',
      metric_name: metric,
      cursor_variant: getCursorVariant(),
      ab_test_id: getABTestId(),
      ...context.tags
    },
    extra: {
      metric_value: value,
      threshold,
      timestamp: new Date().toISOString(),
      ...context.extra
    }
  });
}

export function captureCursorSystemError(error, variant, context = {}) {
  Sentry.captureException(error, {
    tags: {
      error_type: 'cursor_system_error',
      cursor_variant: variant,
      ab_test_id: getABTestId(),
      component: 'cursor_system',
      ...context.tags
    },
    extra: {
      variant_details: context.variantDetails,
      animation_state: context.animationState,
      performance_metrics: context.performanceMetrics,
      ...context.extra
    },
    level: 'error'
  });
}

export function captureABTestingError(error, testId, variant, context = {}) {
  Sentry.captureException(error, {
    tags: {
      error_type: 'ab_testing_error',
      test_id: testId,
      variant: variant,
      component: 'ab_testing',
      ...context.tags
    },
    extra: {
      test_configuration: context.testConfiguration,
      user_assignment: context.userAssignment,
      analytics_data: context.analyticsData,
      ...context.extra
    },
    level: 'error'
  });
}

export function captureAPIError(error, endpoint, method, context = {}) {
  Sentry.captureException(error, {
    tags: {
      error_type: 'api_error',
      api_endpoint: endpoint,
      http_method: method,
      cursor_variant: getCursorVariant(),
      ab_test_id: getABTestId(),
      ...context.tags
    },
    extra: {
      request_data: context.requestData,
      response_data: context.responseData,
      status_code: context.statusCode,
      ...context.extra
    },
    level: 'error'
  });
}

// Performance monitoring
export function startPerformanceTransaction(name, operation = 'navigation') {
  return Sentry.startTransaction({
    name,
    op: operation,
    tags: {
      cursor_variant: getCursorVariant(),
      ab_test_id: getABTestId()
    }
  });
}

export function measureCursorPerformance(variant, callback) {
  const transaction = startPerformanceTransaction(
    `cursor-performance-${variant}`,
    'cursor-interaction'
  );
  
  const startTime = performance.now();
  
  try {
    const result = callback();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    transaction.setTag('variant', variant);
    transaction.setMeasurement('duration', duration, 'millisecond');
    
    // Alert if performance is poor
    if (duration > 16.67) { // 60fps threshold
      capturePerformanceIssue(
        'cursor_frame_time',
        duration,
        16.67,
        {
          tags: { variant },
          extra: { target_fps: 60 }
        }
      );
    }
    
    transaction.finish();
    return result;
    
  } catch (error) {
    transaction.setStatus('internal_error');
    transaction.finish();
    
    captureCursorSystemError(error, variant, {
      extra: { performance_measurement: true }
    });
    
    throw error;
  }
}

// User context management
export function setUserContext(user) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    ip_address: '{{auto}}',
    segment: user.segment || 'unknown'
  });
  
  Sentry.setTag('user_segment', user.segment || 'unknown');
  Sentry.setTag('user_type', user.type || 'visitor');
}

export function setABTestContext(testId, variant, userId) {
  Sentry.setTag('ab_test_id', testId);
  Sentry.setTag('ab_test_variant', variant);
  Sentry.setContext('ab_testing', {
    test_id: testId,
    variant: variant,
    user_id: userId,
    assignment_time: new Date().toISOString()
  });
}

export function setCursorContext(variant, performance) {
  Sentry.setTag('cursor_variant', variant);
  Sentry.setContext('cursor_system', {
    variant: variant,
    fps: performance?.fps,
    memory_usage: performance?.memoryUsage,
    response_time: performance?.responseTime,
    gsap_version: typeof gsap !== 'undefined' ? gsap.version : 'not_loaded'
  });
}

// Release management
export function createRelease(version, environment) {
  return Sentry.createRelease({
    version,
    environment,
    projects: ['digiclick-ai-frontend']
  });
}

export function finalizeRelease(version) {
  return Sentry.finalizeRelease(version);
}
