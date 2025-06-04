import React, { useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';

// Analytics tracking functions
const DigiClickAnalytics = {
  // Initialize Google Analytics
  init: (googleAnalyticsId) => {
    if (typeof window !== 'undefined' && googleAnalyticsId) {
      window.gtag = window.gtag || function() {
        (window.gtag.q = window.gtag.q || []).push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', googleAnalyticsId, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        send_page_view: true
      });
    }
  },

  // Track page views
  trackPageView: (pathname, userId = null) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID, {
        page_path: pathname,
        user_id: userId,
        custom_map: {
          custom_dimension_1: 'user_type',
          custom_dimension_2: 'cursor_variant'
        }
      });
      
      // Track custom events
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: pathname,
        user_id: userId
      });
    }
  },

  // Track custom events
  trackEvent: (eventName, parameters = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        event_category: parameters.category || 'engagement',
        event_label: parameters.label || '',
        value: parameters.value || 0,
        custom_parameter_1: parameters.cursor_variant || 'default',
        custom_parameter_2: parameters.ab_test_id || 'control',
        ...parameters
      });
    }
  },

  // Track cursor interactions
  trackCursorInteraction: (interactionType, element, variant = 'default') => {
    DigiClickAnalytics.trackEvent('cursor_interaction', {
      category: 'cursor_system',
      label: `${interactionType}_${element}`,
      cursor_variant: variant,
      interaction_type: interactionType,
      element_type: element
    });
  },

  // Track AI feature usage
  trackAIFeature: (featureType, details = {}) => {
    DigiClickAnalytics.trackEvent('ai_feature_usage', {
      category: 'ai_features',
      label: featureType,
      feature_type: featureType,
      ...details
    });
  },

  // Track conversion events
  trackConversion: (conversionType, value = 0) => {
    DigiClickAnalytics.trackEvent('conversion', {
      category: 'conversions',
      label: conversionType,
      value: value,
      conversion_type: conversionType
    });
  },

  // Track performance metrics
  trackPerformance: (metricName, value, unit = 'ms') => {
    DigiClickAnalytics.trackEvent('performance_metric', {
      category: 'performance',
      label: metricName,
      value: value,
      metric_name: metricName,
      unit: unit
    });
  },

  // Track errors
  trackError: (errorType, errorMessage, errorStack = '') => {
    DigiClickAnalytics.trackEvent('error', {
      category: 'errors',
      label: errorType,
      error_type: errorType,
      error_message: errorMessage,
      error_stack: errorStack,
      fatal: false
    });
  }
};

// React component for analytics integration
export default function DigiClickAnalyticsComponent({ googleAnalyticsId }) {
  const router = useRouter();

  useEffect(() => {
    // Initialize analytics when component mounts
    if (googleAnalyticsId) {
      DigiClickAnalytics.init(googleAnalyticsId);
    }

    // Track route changes
    const handleRouteChange = (url) => {
      DigiClickAnalytics.trackPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Track Core Web Vitals
    if (typeof window !== 'undefined' && 'web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((metric) => DigiClickAnalytics.trackPerformance('CLS', metric.value));
        getFID((metric) => DigiClickAnalytics.trackPerformance('FID', metric.value));
        getFCP((metric) => DigiClickAnalytics.trackPerformance('FCP', metric.value));
        getLCP((metric) => DigiClickAnalytics.trackPerformance('LCP', metric.value));
        getTTFB((metric) => DigiClickAnalytics.trackPerformance('TTFB', metric.value));
      }).catch(() => {
        // Fallback if web-vitals is not available
        console.log('Web Vitals not available');
      });
    }

    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [googleAnalyticsId, router.events]);

  // Don't render analytics in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_ANALYTICS) {
    return null;
  }

  if (!googleAnalyticsId) {
    return null;
  }

  return (
    <>
      {/* Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId}', {
              page_path: window.location.pathname,
              send_page_view: true,
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });
          `
        }}
      />

      {/* Custom Analytics for DigiClick AI */}
      <Script
        id="digiclick-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // DigiClick AI Custom Analytics
            window.DigiClickAnalytics = {
              trackPageView: function(pathname, userId) {
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || 'GA_MEASUREMENT_ID'}', {
                    page_path: pathname,
                    user_id: userId
                  });
                  window.gtag('event', 'page_view', {
                    page_title: document.title,
                    page_location: window.location.href,
                    page_path: pathname,
                    user_id: userId
                  });
                }
              },
              trackEvent: function(eventName, parameters) {
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', eventName, parameters || {});
                }
              }
            };

            // Track initial page load
            if (typeof window !== 'undefined') {
              window.addEventListener('load', function() {
                window.DigiClickAnalytics.trackEvent('page_load_complete', {
                  category: 'performance',
                  label: 'initial_load',
                  value: Math.round(performance.now())
                });
              });
              
              // Track scroll depth
              let maxScroll = 0;
              window.addEventListener('scroll', function() {
                const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
                  maxScroll = scrollPercent;
                  window.DigiClickAnalytics.trackEvent('scroll_depth', {
                    category: 'engagement',
                    label: scrollPercent + '_percent',
                    value: scrollPercent
                  });
                }
              });
              
              // Track time on page
              let startTime = Date.now();
              window.addEventListener('beforeunload', function() {
                const timeOnPage = Math.round((Date.now() - startTime) / 1000);
                window.DigiClickAnalytics.trackEvent('time_on_page', {
                  category: 'engagement',
                  label: 'session_duration',
                  value: timeOnPage
                });
              });
            }
          `
        }}
      />
    </>
  );
}

// Export the analytics functions for use in other components
export { DigiClickAnalytics };
