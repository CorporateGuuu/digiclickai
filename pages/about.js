import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useAuth } from '../contexts/AuthContext';
import { useTeamMembers } from '../hooks/useContentLoader';
import Chatbot from '../components/Chatbot/Chatbot';
import SkeletonLoader from '../components/LoadingStates/SkeletonLoader';
import LazyImage from '../components/LazyImage/LazyImage';

const AboutPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { data: teamData, loading: teamLoading, error: teamError } = useTeamMembers();
  const [animationsInitialized, setAnimationsInitialized] = useState(false);

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

  // Initialize animations when team data loads
  useEffect(() => {
    if (teamData && teamData.items && window.gsap && animationsInitialized) {
      animateTeamMembers();
    }
  }, [teamData, animationsInitialized]);

  const initializeAnimations = () => {
    const { gsap, ScrollTrigger } = window;

    if (!gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    // About section animations
    gsap.fromTo('.about h1',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
    );

    gsap.fromTo('.mission-vision',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.mission-vision',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  };

  const animateTeamMembers = () => {
    const { gsap } = window;
    if (!gsap) return;

    gsap.fromTo('.team-item',
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.team-grid',
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
          page: '/about',
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DigiClick AI",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://digiclick.ai",
    "logo": `${process.env.NEXT_PUBLIC_APP_URL}/assets/logo.png`,
    "description": "DigiClick AI empowers businesses with AI-driven web design and automation solutions.",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-123-456-7890",
      "contactType": "customer service",
      "email": "info@digiclick.ai"
    },
    "employee": teamData?.items?.map(member => ({
      "@type": "Person",
      "name": member.name,
      "jobTitle": member.role,
      "description": member.bio,
      "image": member.image
    })) || []
  };

  // Default team data for fallback
  const defaultTeamMembers = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      role: "AI Research Director",
      bio: "Leading expert in machine learning and neural networks with 15+ years of experience in AI research and development.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "Automation Architect",
      bio: "Specializes in creating intelligent automation systems that transform business operations and increase efficiency.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Emily Watson",
      role: "UX/AI Designer",
      bio: "Combines human-centered design principles with AI capabilities to create intuitive and engaging user experiences.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "David Kim",
      role: "Full-Stack Developer",
      bio: "Expert in modern web technologies and AI integration, building scalable applications that leverage cutting-edge AI.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
    }
  ];

  const teamMembers = teamData?.items || defaultTeamMembers;

  return (
    <>
      <Head>
        <title>About DigiClick AI - Our Mission, Vision & Team</title>
        <meta name="description" content="Learn about DigiClick AI's mission, vision, and expert team driving AI-powered web design and automation solutions for innovative businesses." />
        <meta name="keywords" content="DigiClick AI, AI web design, automation, about us, team, mission, vision, artificial intelligence experts" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DigiClick AI" />

        {/* Open Graph */}
        <meta property="og:title" content="About DigiClick AI - Our Mission, Vision & Team" />
        <meta property="og:description" content="Meet the expert team behind DigiClick AI's revolutionary AI-powered web design and automation solutions." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_APP_URL}/about`} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_APP_URL}/assets/about-og-image.png`} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About DigiClick AI - Our Mission, Vision & Team" />
        <meta name="twitter:description" content="Meet the expert team behind DigiClick AI's revolutionary AI solutions." />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_APP_URL}/assets/about-twitter-image.png`} />

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

      <div className="about-page-container">
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
          <a href="/about" onClick={(e) => handleNavClick(e, '/about')} className="active">About</a>
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

        {/* About Section */}
        <section className="about" id="about">
          <div className="container">
            <h1 className="glow-text">About DigiClick AI</h1>

            <div className="mission-vision">
              <div className="mission-vision-grid">
                <div className="mission-item pulse-box">
                  <h2>Our Mission</h2>
                  <p>
                    Empowering businesses with AI-driven innovation to create seamless,
                    futuristic digital experiences that drive growth, efficiency, and
                    competitive advantage in the digital age.
                  </p>
                </div>

                <div className="vision-item pulse-box">
                  <h2>Our Vision</h2>
                  <p>
                    Redefining the digital landscape with intelligent automation and
                    unparalleled creativity, making advanced AI technology accessible
                    to businesses of all sizes worldwide.
                  </p>
                </div>
              </div>
            </div>

            <div className="team-section">
              <h2>Meet Our Expert Team</h2>
              <p className="team-intro">
                Our diverse team of AI specialists, designers, and developers brings together
                decades of experience in artificial intelligence, web development, and digital innovation.
              </p>

              <div className="team-grid" id="teamGrid">
                {teamLoading ? (
                  <SkeletonLoader type="team" count={4} />
                ) : teamError ? (
                  <div className="error-message">
                    <p>Unable to load team members at the moment. Please try again later.</p>
                    <button onClick={() => window.location.reload()} className="cta-button">
                      Retry
                    </button>
                  </div>
                ) : (
                  teamMembers.map((member, index) => (
                    <div key={member.id || index} className="team-item">
                      <div className="team-image">
                        <LazyImage
                          src={member.image}
                          alt={member.name}
                          width={300}
                          height={300}
                          objectFit="cover"
                          className="team-photo"
                        />
                      </div>
                      <div className="team-content">
                        <h3>{member.name}</h3>
                        <p className="team-role">{member.role}</p>
                        <p className="team-bio">{member.bio}</p>
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="team-social"
                            aria-label={`${member.name}'s LinkedIn profile`}
                          >
                            💼 LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Company Stats */}
            <div className="company-stats">
              <h2>DigiClick AI by the Numbers</h2>
              <div className="stats-grid">
                <div className="stat-item pulse-box">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Projects Completed</div>
                </div>
                <div className="stat-item pulse-box">
                  <div className="stat-number">98%</div>
                  <div className="stat-label">Client Satisfaction</div>
                </div>
                <div className="stat-item pulse-box">
                  <div className="stat-number">50+</div>
                  <div className="stat-label">AI Models Deployed</div>
                </div>
                <div className="stat-item pulse-box">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Support Available</div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="about-cta">
              <h2>Ready to Transform Your Business?</h2>
              <p>
                Join hundreds of companies already leveraging our AI-powered solutions
                to revolutionize their digital presence and automate their operations.
              </p>
              <div className="cta-actions">
                <a href="/contact" className="cta-button">Get Started Today</a>
                <a href="/portfolio" className="cta-button secondary">View Our Work</a>
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

export default AboutPage;
