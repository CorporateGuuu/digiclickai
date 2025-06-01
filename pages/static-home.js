import React, { useEffect, useRef } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useAuth } from '../contexts/AuthContext';
import Chatbot from '../components/Chatbot/Chatbot';
import ParticlesBackground, { ParticlePresets } from '../components/ParticlesBackground/ParticlesBackground';

const StaticHome = () => {
  const { isAuthenticated, user } = useAuth();
  const heroRef = useRef(null);

  useEffect(() => {
    // Apply DigiClick AI theme
    document.body.classList.add('digiclick-theme');

    // Initialize GSAP animations when component mounts
    if (typeof window !== 'undefined' && window.gsap) {
      initializeAnimations();
    }

    // Track page view
    trackPageView();

    return () => {
      document.body.classList.remove('digiclick-theme');
    };
  }, []);

  const initializeAnimations = () => {
    const { gsap, ScrollTrigger } = window;
    
    if (!gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    // Hero animation
    gsap.fromTo('.hero h1', 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
    );

    gsap.fromTo('.hero p', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power2.out' }
    );

    gsap.fromTo('.cta-button', 
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.8, delay: 0.6, ease: 'back.out(1.7)' }
    );

    // Navigation animation
    gsap.fromTo('nav a', 
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.2 }
    );
  };

  const trackPageView = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          page: '/static-home',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  };

  const handleNavClick = (e, href) => {
    e.preventDefault();
    
    if (href.startsWith('#')) {
      // Smooth scroll for anchor links
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to other pages
      window.location.href = href;
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DigiClick AI",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://digiclick.ai",
    "logo": `${process.env.NEXT_PUBLIC_APP_URL}/assets/logo.png`,
    "description": "AI-driven web design and automation solutions for innovative businesses",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-123-456-7890",
      "contactType": "customer service",
      "email": "info@digiclick.ai"
    },
    "sameAs": [
      "https://twitter.com/digiclickai",
      "https://linkedin.com/company/digiclick-ai"
    ]
  };

  return (
    <>
      <Head>
        <title>DigiClick AI - Transform Your Business with AI</title>
        <meta name="description" content="Discover DigiClick AI's AI-driven web design and automation solutions for innovative businesses. Transform your digital presence with cutting-edge AI technology." />
        <meta name="keywords" content="AI web design, automation, DigiClick AI, artificial intelligence, web development, digital transformation" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DigiClick AI" />
        
        {/* Open Graph */}
        <meta property="og:title" content="DigiClick AI - Transform Your Business with AI" />
        <meta property="og:description" content="AI-driven web design and automation solutions for innovative businesses" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_APP_URL}/static-home`} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_APP_URL}/assets/og-image.png`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DigiClick AI - Transform Your Business with AI" />
        <meta name="twitter:description" content="AI-driven web design and automation solutions for innovative businesses" />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_APP_URL}/assets/twitter-image.png`} />
        
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
              gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
            `}
          </Script>
        </>
      )}

      <div className="static-home-container">
        {/* Header */}
        <header>
          <h1>DigiClick AI</h1>
          {isAuthenticated && (
            <div className="user-info">
              Welcome, {user?.name || 'User'}
            </div>
          )}
        </header>

        {/* Navigation */}
        <nav>
          <a href="/" onClick={(e) => handleNavClick(e, '/')}>Home</a>
          <a href="/about" onClick={(e) => handleNavClick(e, '/about')}>About</a>
          <a href="/services" onClick={(e) => handleNavClick(e, '/services')}>Services</a>
          <a href="/portfolio" onClick={(e) => handleNavClick(e, '/portfolio')}>Portfolio</a>
          <a href="/demo-theme" onClick={(e) => handleNavClick(e, '/demo-theme')}>Demo</a>
          <a href="/pricing" onClick={(e) => handleNavClick(e, '/pricing')}>Pricing</a>
          <a href="/contact" onClick={(e) => handleNavClick(e, '/contact')}>Contact</a>
          {isAuthenticated ? (
            <a href="/dashboard" onClick={(e) => handleNavClick(e, '/dashboard')}>Dashboard</a>
          ) : (
            <a href="/login" onClick={(e) => handleNavClick(e, '/login')}>Login</a>
          )}
        </nav>

        {/* Hero Section */}
        <section className="hero" ref={heroRef}>
          <div className="hero-content">
            <h1 className="glow-text">Transform Your Business with AI</h1>
            <p>
              Leverage AI-driven web design and automation to create seamless, 
              futuristic digital experiences that drive results and innovation.
            </p>
            <div className="hero-actions">
              <a href="/demo-theme" className="cta-button">
                Explore AI Solutions
              </a>
              <a href="/contact" className="cta-button secondary">
                Get Started Today
              </a>
            </div>
          </div>
          
          {/* Particles Background */}
          <ParticlesBackground
            id="particles-js"
            config={ParticlePresets.default}
            className="particles-background"
          />
        </section>

        {/* Features Preview */}
        <section className="features-preview">
          <div className="container">
            <h2>Why Choose DigiClick AI?</h2>
            <div className="features-grid">
              <div className="feature-item pulse-box">
                <div className="feature-icon">🤖</div>
                <h3>AI-Powered Design</h3>
                <p>Cutting-edge artificial intelligence creates stunning, responsive websites tailored to your brand.</p>
              </div>
              <div className="feature-item pulse-box">
                <div className="feature-icon">⚡</div>
                <h3>Smart Automation</h3>
                <p>Streamline your workflows with intelligent automation that saves time and increases efficiency.</p>
              </div>
              <div className="feature-item pulse-box">
                <div className="feature-icon">📊</div>
                <h3>Data-Driven Insights</h3>
                <p>Make informed decisions with AI-powered analytics and predictive insights.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <h2>Ready to Transform Your Digital Presence?</h2>
            <p>Join thousands of businesses already using AI to revolutionize their operations.</p>
            <div className="cta-actions">
              <a href="/contact" className="cta-button">Start Your AI Journey</a>
              <a href="/demo-theme" className="cta-button secondary">View Live Demo</a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer>
          <div className="footer-content">
            <div className="footer-info">
              <p>© 2025 DigiClick AI. All rights reserved.</p>
              <div className="footer-links">
                <a href="mailto:info@digiclick.ai">info@digiclick.ai</a>
                <span>|</span>
                <a href="tel:+1234567890">(123) 456-7890</a>
              </div>
            </div>
            <div className="footer-social">
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="LinkedIn">💼</a>
              <a href="#" aria-label="GitHub">🐙</a>
            </div>
          </div>
        </footer>

        {/* Enhanced Chatbot */}
        <Chatbot />
      </div>


    </>
  );
};

export default StaticHome;
