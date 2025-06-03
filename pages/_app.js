import React, { useEffect } from 'react';
import Head from 'next/head';
import { AuthProvider } from '../contexts/AuthContext';
import { ABTestProvider } from '../src/contexts/ABTestContext';
import Layout from '../components/Layout';
import ABTestCursorManager from '../src/components/cursor/ABTestCursorManager';
import { initializeSentry } from '../src/lib/sentry-config';
import { initializeCoreWebVitalsMonitoring } from '../src/lib/core-web-vitals-monitor';
import { initializeAccessibility } from '../src/lib/accessibility-manager';

// Load GSAP globally for enhanced cursor system
if (typeof window !== 'undefined') {
  import('gsap').then((gsap) => {
    window.gsap = gsap.gsap || gsap.default;
  });
}

// Simple global CSS
const globalStyles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body {
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    background-color: #fff;
    color: #333;
    line-height: 1.6;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: pointer;
  }
`;

// Try to import global styles, but don't fail if they don't exist
try {
  require('../styles/globals.css');
} catch (e) {
  console.warn('globals.css not found, using inline styles');
}

function AppContent({ Component, pageProps }) {
  useEffect(() => {
    // Initialize monitoring systems
    if (typeof window !== 'undefined') {
      // Initialize Sentry error tracking
      initializeSentry();

      // Initialize Sentry RUM
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        const Sentry = require('@sentry/react');
        const { BrowserTracing } = require('@sentry/tracing');
        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          integrations: [new BrowserTracing()],
          tracesSampleRate: 1.0,
        });
      }

      // Initialize Core Web Vitals monitoring
      initializeCoreWebVitalsMonitoring();

      // Initialize Accessibility Manager
      initializeAccessibility();

      // Register service worker for PWA
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          }).catch(error => {
            console.error('Service Worker registration failed:', error);
          });
        });
      }

      console.log('✅ DigiClick AI monitoring and accessibility systems initialized');
    }
  }, []);

  return (
    <AuthProvider>
      <ABTestProvider>
        <div className="app-wrapper">
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="theme-color" content="#121212" />
            <link rel="shortcut icon" href="/favicon.ico" />
            <style>{globalStyles}</style>
          </Head>

          {/* A/B Test Cursor Manager */}
          <ABTestCursorManager>
            {/* Enhanced Layout without cursor (handled by A/B test manager) */}
            <Layout showCursor={false}>
              <Component {...pageProps} />
            </Layout>
          </ABTestCursorManager>
        </div>
      </ABTestProvider>
    </AuthProvider>
  );
}

function MyApp({ Component, pageProps }) {
  // DigiClick AI uses its own authentication system
  return <AppContent Component={Component} pageProps={pageProps} />;
}

export default MyApp;
