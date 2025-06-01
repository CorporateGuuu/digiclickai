import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import CustomCursor from './CustomCursor';
import Chatbot from './Chatbot/Chatbot';
import ErrorBoundary from './ErrorBoundary/ErrorBoundary';
import ParticlesBackground from './ParticlesBackground/ParticlesBackground';

/**
 * DigiClick AI Layout Component
 * Enhanced layout with custom cursor, particles, and futuristic theme
 */
export default function DigiClickLayout({ 
  children, 
  title, 
  description,
  showParticles = true,
  showCursor = true,
  showChatbot = true,
  className = '',
  cursorTheme = 'default'
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('dark');

  // Page metadata
  const pageTitle = title 
    ? `${title} | DigiClick AI` 
    : 'DigiClick AI - AI Automation Solutions';
    
  const pageDescription = description || 
    'Transform your business with DigiClick AI\'s cutting-edge automation solutions. Experience the future of AI-powered workflows and intelligent automation.';

  // Initialize layout
  useEffect(() => {
    // Apply DigiClick AI theme
    document.body.classList.add('digiclick-theme');
    document.documentElement.setAttribute('data-theme', theme);
    
    // Set loading state
    setIsLoading(false);

    // Track page view
    trackPageView();

    return () => {
      document.body.classList.remove('digiclick-theme');
    };
  }, [theme]);

  // Analytics tracking
  const trackPageView = async () => {
    try {
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: router.pathname,
            title: pageTitle,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            userId: user?.id || null
          })
        });
      }
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  };

  // Handle route changes
  useEffect(() => {
    const handleRouteChange = (url) => {
      // Track route changes
      trackPageView();
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageTitle,
    "description": pageDescription,
    "url": `${process.env.NEXT_PUBLIC_APP_URL}${router.pathname}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "DigiClick AI",
      "url": process.env.NEXT_PUBLIC_APP_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": "DigiClick AI",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png`
      }
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading DigiClick AI...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#121212" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_APP_URL}/images/og-digiclick-ai.jpg`} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_APP_URL}${router.pathname}`} />
        <meta property="og:site_name" content="DigiClick AI" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_APP_URL}/images/og-digiclick-ai.jpg`} />
        <meta name="twitter:creator" content="@DigiClickAI" />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DigiClick AI" />
        <meta name="keywords" content="AI automation, artificial intelligence, workflow automation, business automation, DigiClick AI" />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_APP_URL}${router.pathname}`} />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Poppins:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/orbitron.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/poppins.woff2" as="font" type="font/woff2" crossOrigin="" />
      </Head>

      {/* GSAP Scripts */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"
        strategy="beforeInteractive"
      />

      {/* Google Analytics */}
      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}', {
                page_title: '${pageTitle}',
                page_location: '${process.env.NEXT_PUBLIC_APP_URL}${router.pathname}'
              });
            `}
          </Script>
        </>
      )}

      <div className={`digiclick-layout ${className}`} data-theme={theme}>
        {/* Particles Background */}
        {showParticles && (
          <ErrorBoundary>
            <ParticlesBackground />
          </ErrorBoundary>
        )}

        {/* Custom Cursor */}
        {showCursor && (
          <ErrorBoundary>
            <CustomCursor theme={cursorTheme} />
          </ErrorBoundary>
        )}

        {/* Main Content */}
        <main className="main-content">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>

        {/* Enhanced Chatbot */}
        {showChatbot && (
          <ErrorBoundary>
            <Chatbot />
          </ErrorBoundary>
        )}

        {/* Skip Navigation for Accessibility */}
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .digiclick-theme {
          background: #121212;
          color: #e0e0e0;
          font-family: 'Poppins', sans-serif;
          min-height: 100vh;
        }

        .digiclick-layout {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .main-content {
          position: relative;
          z-index: 1;
        }

        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #2c2c2c 100%);
          color: #e0e0e0;
          font-family: 'Orbitron', sans-serif;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(0, 212, 255, 0.3);
          border-top: 3px solid #00d4ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .skip-nav {
          position: absolute;
          top: -40px;
          left: 6px;
          background: #00d4ff;
          color: #121212;
          padding: 8px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 600;
          z-index: 10000;
          transition: top 0.3s ease;
        }

        .skip-nav:focus {
          top: 6px;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Focus styles for accessibility */
        *:focus {
          outline: 2px solid #00d4ff;
          outline-offset: 2px;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          
          html {
            scroll-behavior: auto;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .digiclick-theme {
            background: #000000;
            color: #ffffff;
          }
        }

        /* Print styles */
        @media print {
          .digiclick-layout {
            background: white !important;
            color: black !important;
          }
          
          .skip-nav,
          .loading-screen {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
