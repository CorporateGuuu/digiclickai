import React from 'react';
import Head from 'next/head';

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
  return (
    <div className="app-wrapper">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0070f3" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <style>{globalStyles}</style>
      </Head>

      <main>
        <Component {...pageProps} />
      </main>
    </div>
  );
}

function MyApp({ Component, pageProps }) {
  // Check if we have session in pageProps
  const { session, ...restPageProps } = pageProps || {};

  // Try to use SessionProvider if available
  try {
    const { SessionProvider } = require('next-auth/react');
    return (
      <SessionProvider session={session}>
        <AppContent Component={Component} pageProps={restPageProps} />
      </SessionProvider>
    );
  } catch (e) {
    // Fallback if next-auth is not available
    return <AppContent Component={Component} pageProps={pageProps} />;
  }
}

export default MyApp;
