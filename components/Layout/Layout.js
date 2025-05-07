import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import UnifiedHeader from '../UnifiedHeader/UnifiedHeader';
import UnifiedFooter from '../UnifiedFooter/UnifiedFooter';
import DeviceGradingPopup from '../DeviceGradingPopup';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import ChatbotUI from '../Chatbot/ChatbotUI';
import WhatsAppButton from '../WhatsApp/WhatsAppButton';
import dynamic from 'next/dynamic';
import styles from './Layout.module.css';

// Dynamically import the PWA install prompt to avoid SSR issues
const PWAInstallPrompt = dynamic(
  () => import('../PWAInstallPrompt/PWAInstallPrompt'),
  { ssr: false }
);

export default function Layout({ children, title, description }) {
  const { data: session } = useSession();

  const pageTitle = title
    ? `${title} | MDTS`
    : 'MDTS';

  const pageDescription = description || 'MDTS offers high-quality mobile device parts and repair tools for professionals and DIY enthusiasts.';

  return (
    <div className={styles.layout}>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content="/images/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        <meta property="twitter:image" content="/images/og-image.jpg" />
      </Head>

      <ErrorBoundary>
        <UnifiedHeader />
      </ErrorBoundary>

      <main className={styles.main}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      <ErrorBoundary>
        <UnifiedFooter />
      </ErrorBoundary>

      {/* Show the device grading popup only for non-authenticated users */}
      {!session && (
        <ErrorBoundary>
          <DeviceGradingPopup />
        </ErrorBoundary>
      )}

      {/* Chatbot and WhatsApp buttons */}
      <ErrorBoundary>
        <ChatbotUI />
      </ErrorBoundary>

      <ErrorBoundary>
        <WhatsAppButton />
      </ErrorBoundary>

      {/* PWA Install Prompt */}
      <ErrorBoundary>
        <PWAInstallPrompt />
      </ErrorBoundary>
    </div>
  );
}
