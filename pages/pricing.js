import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useAuth } from '../contexts/AuthContext';
import { usePricingPlans } from '../hooks/useContentLoader';
import Chatbot from '../components/Chatbot/Chatbot';
import SkeletonLoader from '../components/LoadingStates/SkeletonLoader';

const PricingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { data: pricingData, loading: pricingLoading, error: pricingError } = usePricingPlans();
  const [animationsInitialized, setAnimationsInitialized] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(() => {
    // Apply DigiClick AI theme
    document.body.classList.add('digiclick-theme');

    // Initialize GSAP animations
    if (typeof window !== 'undefined' && window.gsap && !animationsInitialized) {
      initializeAnimations();
      setAnimationsInitialized(true);
    }

    // Track page view
    trackPageView();

    return () => {
      document.body.classList.remove('digiclick-theme');
    };
  }, [animationsInitialized]);

  // Initialize animations when pricing data loads
  useEffect(() => {
    if (pricingData && pricingData.items && window.gsap && animationsInitialized) {
      animatePricingCards();
    }
  }, [pricingData, animationsInitialized]);

  const initializeAnimations = () => {
    const { gsap, ScrollTrigger } = window;
    
    if (!gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    // Pricing section animations
    gsap.fromTo('.pricing h1', 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
    );

    gsap.fromTo('.billing-toggle', 
      { opacity: 0, scale: 0.8 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.8, 
        delay: 0.3, 
        ease: 'back.out(1.7)' 
      }
    );
  };

  const animatePricingCards = () => {
    const { gsap } = window;
    if (!gsap) return;

    gsap.fromTo('.pricing-item', 
      { opacity: 0, y: 100 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.pricing-grid',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  };

  const trackPageView = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          page: '/pricing',
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
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = href;
    }
  };

  const handlePlanSelection = async (plan) => {
    setSelectedPlan(plan);
    
    // Track plan selection
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          event: 'plan_selected',
          plan: plan.title,
          price: plan.price,
          billingCycle
        })
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }

    // Redirect to contact or checkout
    if (plan.price === 'Contact Us' || plan.title.toLowerCase().includes('enterprise')) {
      window.location.href = '/contact?plan=' + encodeURIComponent(plan.title);
    } else {
      // For paid plans, redirect to checkout or contact
      window.location.href = '/contact?plan=' + encodeURIComponent(plan.title) + '&billing=' + billingCycle;
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "DigiClick AI Pricing Plans",
    "description": "Premium AI-driven web design and automation solutions with flexible pricing options.",
    "brand": {
      "@type": "Brand",
      "name": "DigiClick AI"
    },
    "offers": pricingData?.items?.map(plan => ({
      "@type": "Offer",
      "name": plan.title,
      "price": plan.price.replace(/[^0-9]/g, '') || "0",
      "priceCurrency": "USD",
      "description": plan.description,
      "availability": "https://schema.org/InStock"
    })) || []
  };

  // Default pricing plans for fallback
  const defaultPricingPlans = [
    {
      id: 1,
      title: "Starter AI",
      price: "$999",
      monthlyPrice: "$999",
      yearlyPrice: "$9,990",
      description: "Perfect for small businesses looking to integrate AI into their digital presence.",
      features: [
        "AI-Powered Website Design",
        "Basic Automation Setup",
        "5 AI Models Integration",
        "Email Support",
        "1 Month Free Updates",
        "Basic Analytics Dashboard",
        "Mobile Responsive Design",
        "SEO Optimization"
      ],
      popular: false,
      buttonText: "Get Started",
      color: "#00d4ff"
    },
    {
      id: 2,
      title: "Pro AI",
      price: "$1,999",
      monthlyPrice: "$1,999",
      yearlyPrice: "$19,990",
      description: "Ideal for growing companies ready to scale with advanced AI automation.",
      features: [
        "Everything in Starter AI",
        "Advanced Automation Workflows",
        "15 AI Models Integration",
        "Priority Support",
        "3 Months Free Updates",
        "Advanced Analytics & Insights",
        "Custom AI Chatbot",
        "API Integration",
        "Performance Monitoring",
        "A/B Testing Tools"
      ],
      popular: true,
      buttonText: "Most Popular",
      color: "#7b2cbf"
    },
    {
      id: 3,
      title: "Enterprise AI",
      price: "Contact Us",
      monthlyPrice: "Contact Us",
      yearlyPrice: "Contact Us",
      description: "Custom solutions for large enterprises with complex AI requirements.",
      features: [
        "Everything in Pro AI",
        "Unlimited AI Models",
        "Custom AI Development",
        "Dedicated Account Manager",
        "24/7 Premium Support",
        "Unlimited Updates",
        "White-label Solutions",
        "Advanced Security Features",
        "Custom Integrations",
        "Training & Consultation",
        "SLA Guarantee",
        "Multi-tenant Architecture"
      ],
      popular: false,
      buttonText: "Contact Sales",
      color: "#ff6b6b"
    }
  ];

  const pricingPlans = pricingData?.items || defaultPricingPlans;

  // Update prices based on billing cycle
  const getDisplayPrice = (plan) => {
    if (plan.price === 'Contact Us') return plan.price;
    return billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getSavingsText = (plan) => {
    if (plan.price === 'Contact Us' || billingCycle === 'monthly') return '';
    const monthly = parseInt(plan.monthlyPrice.replace(/[^0-9]/g, ''));
    const yearly = parseInt(plan.yearlyPrice.replace(/[^0-9]/g, ''));
    const savings = Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100);
    return savings > 0 ? `Save ${savings}%` : '';
  };

  return (
    <>
      <Head>
        <title>DigiClick AI Pricing - Choose Your AI Journey</title>
        <meta name="description" content="Explore DigiClick AI's flexible pricing plans for AI-driven web design and automation solutions. From startups to enterprises, find the perfect AI package for your business needs." />
        <meta name="keywords" content="AI web design pricing, automation plans, DigiClick AI, AI solutions cost, web development pricing, artificial intelligence services" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DigiClick AI" />
        
        {/* Open Graph */}
        <meta property="og:title" content="DigiClick AI Pricing - Choose Your AI Journey" />
        <meta property="og:description" content="Flexible pricing plans for AI-driven web design and automation solutions. Transform your business with our AI-powered packages." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_APP_URL}/pricing`} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_APP_URL}/assets/pricing-og-image.png`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DigiClick AI Pricing - Choose Your AI Journey" />
        <meta name="twitter:description" content="Flexible pricing plans for AI-driven solutions." />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_APP_URL}/assets/pricing-twitter-image.png`} />
        
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

      <div className="pricing-page-container">
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
          <a href="/pricing" onClick={(e) => handleNavClick(e, '/pricing')} className="active">Pricing</a>
          <a href="/contact" onClick={(e) => handleNavClick(e, '/contact')}>Contact</a>
          {isAuthenticated ? (
            <a href="/dashboard" onClick={(e) => handleNavClick(e, '/dashboard')}>Dashboard</a>
          ) : (
            <a href="/login" onClick={(e) => handleNavClick(e, '/login')}>Login</a>
          )}
        </nav>

        {/* Pricing Section */}
        <section className="pricing" id="pricing">
          <div className="container">
            <h1 className="glow-text">Choose Your AI Journey</h1>
            <p className="pricing-subtitle">
              Transform your business with our AI-powered solutions. 
              Choose the plan that fits your needs and scale as you grow.
            </p>

            {/* Billing Toggle */}
            <div className="billing-toggle">
              <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
              <div className="toggle-switch" onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}>
                <div className={`toggle-slider ${billingCycle === 'yearly' ? 'yearly' : ''}`}></div>
              </div>
              <span className={billingCycle === 'yearly' ? 'active' : ''}>
                Yearly <span className="savings-badge">Save up to 20%</span>
              </span>
            </div>
            
            <div className="pricing-grid" id="pricingGrid">
              {pricingLoading ? (
                <SkeletonLoader type="pricing" count={3} />
              ) : pricingError ? (
                <div className="error-message">
                  <p>Unable to load pricing plans at the moment. Please try again later.</p>
                  <button onClick={() => window.location.reload()} className="cta-button">
                    Retry
                  </button>
                </div>
              ) : (
                pricingPlans.map((plan, index) => (
                  <div 
                    key={plan.id || index} 
                    className={`pricing-item ${plan.popular ? 'popular' : ''}`}
                    style={{ '--accent-color': plan.color }}
                  >
                    {plan.popular && <div className="popular-badge">Most Popular</div>}
                    
                    <div className="pricing-header">
                      <h2>{plan.title}</h2>
                      <div className="price-container">
                        <div className="price">{getDisplayPrice(plan)}</div>
                        {plan.price !== 'Contact Us' && (
                          <div className="price-period">
                            /{billingCycle === 'yearly' ? 'year' : 'month'}
                          </div>
                        )}
                        {getSavingsText(plan) && (
                          <div className="savings-text">{getSavingsText(plan)}</div>
                        )}
                      </div>
                      <p className="plan-description">{plan.description}</p>
                    </div>

                    <div className="pricing-features">
                      <ul>
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex}>
                            <span className="feature-icon">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pricing-footer">
                      <button 
                        className={`cta-button ${plan.popular ? 'primary' : 'secondary'}`}
                        onClick={() => handlePlanSelection(plan)}
                      >
                        {plan.buttonText || 'Get Started'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FAQ Section */}
            <div className="pricing-faq">
              <h2>Frequently Asked Questions</h2>
              <div className="faq-grid">
                <div className="faq-item">
                  <h3>Can I change plans later?</h3>
                  <p>Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                </div>
                <div className="faq-item">
                  <h3>Is there a free trial?</h3>
                  <p>We offer a 14-day free consultation to discuss your needs and demonstrate our AI capabilities.</p>
                </div>
                <div className="faq-item">
                  <h3>What's included in support?</h3>
                  <p>All plans include technical support. Pro and Enterprise plans get priority and dedicated support.</p>
                </div>
                <div className="faq-item">
                  <h3>Do you offer custom solutions?</h3>
                  <p>Yes, our Enterprise plan includes fully custom AI solutions tailored to your specific requirements.</p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="trust-indicators">
              <h2>Why Choose DigiClick AI?</h2>
              <div className="trust-grid">
                <div className="trust-item">
                  <div className="trust-icon">🔒</div>
                  <h3>Secure & Reliable</h3>
                  <p>Enterprise-grade security with 99.9% uptime guarantee</p>
                </div>
                <div className="trust-item">
                  <div className="trust-icon">⚡</div>
                  <h3>Fast Implementation</h3>
                  <p>Get up and running in days, not months</p>
                </div>
                <div className="trust-item">
                  <div className="trust-icon">🎯</div>
                  <h3>Proven Results</h3>
                  <p>500+ successful projects with 98% client satisfaction</p>
                </div>
                <div className="trust-item">
                  <div className="trust-icon">🚀</div>
                  <h3>Scalable Solutions</h3>
                  <p>Grow from startup to enterprise with our flexible platform</p>
                </div>
              </div>
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

export default PricingPage;
