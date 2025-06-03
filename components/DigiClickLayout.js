import React from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import CustomCursor from './CustomCursor';
import Chatbot from './Chatbot/Chatbot';
import ErrorBoundary from './ErrorBoundary/ErrorBoundary';
import ParticlesBackground from './ParticlesBackground/ParticlesBackground';
import DigiClickSEO from './DigiClickSEO';
import DigiClickAnalytics from './DigiClickAnalytics';
import DigiClickLoading from './DigiClickLoading';
import DigiClickGlobalStyles from './DigiClickGlobalStyles';
import Header from './Header/Header';

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
  const [isLoading, setIsLoading] = React.useState(true);
  const [theme, setTheme] = React.useState('dark');

  React.useEffect(() => {
    document.body.classList.add('digiclick-theme');
    document.documentElement.setAttribute('data-theme', theme);
    setIsLoading(false);
    DigiClickAnalytics.trackPageView(router.pathname, user?.id);
    return () => {
      document.body.classList.remove('digiclick-theme');
    };
  }, [theme, router.pathname, user]);

  if (isLoading) {
    return <DigiClickLoading />;
  }

  return (
    <>
      <DigiClickSEO title={title} description={description} pathname={router.pathname} />
      <DigiClickAnalytics googleAnalyticsId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
      <div className={`digiclick-layout ${className}`} data-theme={theme}>
        <Header />
        {showParticles && (
          <ErrorBoundary>
            <ParticlesBackground />
          </ErrorBoundary>
        )}
        {showCursor && (
          <ErrorBoundary>
            <CustomCursor theme={cursorTheme} />
          </ErrorBoundary>
        )}
        <main className="main-content">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        {showChatbot && (
          <ErrorBoundary>
            <Chatbot />
          </ErrorBoundary>
        )}
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
      </div>
      <DigiClickGlobalStyles />
    </>
  );
}
