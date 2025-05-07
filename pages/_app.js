import React from 'react';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';

// Import global styles
import '../styles/globals.css';

function AppContent({ Component, pageProps }) {
  return (
    <div className="app-wrapper">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0066cc" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>

      <main>
        <Component {...pageProps} />
      </main>
    </div>
  );
}

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <AppContent Component={Component} pageProps={pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
