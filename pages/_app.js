import React, { useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { AuthProvider } from '../contexts/AuthContext';

// Dynamic import for client-side only cursor
const EnhancedCustomCursor = dynamic(
  () => import('../components/CustomCursor/EnhancedCustomCursor'),
  { ssr: false }
);

// Dynamic import for analytics
const DigiClickAnalyticsComponent = dynamic(
  () => import('../components/DigiClickAnalytics'),
  { ssr: false }
);

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
    console.log('✅ DigiClick AI app initialized');
  }, []);

  return (
    <AuthProvider>
      <div className="app-wrapper">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="theme-color" content="#121212" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <style>{globalStyles}</style>
        </Head>

        {/* Analytics */}
        <DigiClickAnalyticsComponent googleAnalyticsId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />

        {/* Enhanced Custom Cursor */}
        <EnhancedCustomCursor theme="default" />

        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}

function MyApp({ Component, pageProps }) {
  // DigiClick AI uses its own authentication system
  return <AppContent Component={Component} pageProps={pageProps} />;
}

export default MyApp;
