import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import DigiClickLayout from '../components/DigiClickLayout';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import Footer from '../components/Footer/Footer';
import styles from '../styles/Home.module.css';

export default function EnhancedHome() {
  const particlesRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize particles.js
  useEffect(() => {
    const initializeParticles = () => {
      if (typeof window !== 'undefined' && window.particlesJS) {
        window.particlesJS('particles-js', {
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#00d4ff' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: false },
            size: { value: 3, random: true },
            line_linked: {
              enable: true,
              distance: 150,
              color: '#00d4ff',
              opacity: 0.4,
              width: 1
            },
            move: {
              enable: true,
              speed: 6,
              direction: 'none',
              random: false,
              straight: false,
              out_mode: 'out',
              bounce: false
            }
          },
          interactivity: {
            detect_on: 'canvas',
            events: {
              onhover: { enable: true, mode: 'repulse' },
              onclick: { enable: true, mode: 'push' },
              resize: true
            }
          },
          retina_detect: true
        });
        setIsLoaded(true);
      }
    };

    // Try to initialize immediately if particles.js is already loaded
    initializeParticles();

    // Set up a listener for when particles.js loads
    const checkParticles = setInterval(() => {
      if (typeof window !== 'undefined' && window.particlesJS) {
        initializeParticles();
        clearInterval(checkParticles);
      }
    }, 100);

    return () => clearInterval(checkParticles);
  }, []);

  // GSAP animations
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gsap && isLoaded) {
      const { gsap } = window;
      
      // Floating animation for service cards
      gsap.to('.service-card', {
        y: -10,
        duration: 2,
        ease: 'power2.inOut',
        stagger: 0.2,
        yoyo: true,
        repeat: -1
      });
    }
  }, [isLoaded]);

  const services = [
    {
      title: 'AI Web Design',
      description: 'Cutting-edge websites powered by artificial intelligence',
      icon: '🎨',
      features: ['Responsive Design', 'AI-Optimized UX', 'Performance Focused']
    },
    {
      title: 'Automation Solutions',
      description: 'Streamline your business processes with intelligent automation',
      icon: '⚡',
      features: ['Workflow Automation', 'Data Processing', 'Integration APIs']
    },
    {
      title: 'AI Consulting',
      description: 'Strategic guidance for your AI transformation journey',
      icon: '🧠',
      features: ['Strategy Planning', 'Implementation', 'Training & Support']
    }
  ];

  return (
    <DigiClickLayout
      title="Premium AI Web Design & Automation"
      description="Digiclick AI crafts exquisite, AI-powered websites and automations that redefine digital excellence."
      showCursor={true}
      showParticles={true}
      showChatbot={true}
      cursorTheme="default"
      className={styles.container}
    >
      {/* Particles Background - Enhanced for cursor interaction */}
      <div id="particles-js" ref={particlesRef} className={`${styles.particlesContainer} cursor-interactive`}></div>

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Services Section */}
      <section className={`${styles.services} section`}>
        <div className={styles.container}>
          <h2 className={`${styles.sectionTitle} glow-text`}>Our AI-Powered Services</h2>
          <p className={styles.sectionSubtitle}>
            Discover how our cutting-edge AI solutions can transform your business
          </p>
          
          <div className={styles.servicesGrid}>
            {services.map((service, index) => (
              <div key={index} className={`${styles.serviceCard} service-card pulse-box`}>
                <div className={styles.serviceIcon}>{service.icon}</div>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <p className={styles.serviceDescription}>{service.description}</p>
                <ul className={styles.serviceFeatures}>
                  {service.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <button className={`${styles.serviceButton} cta-button`}>
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`${styles.cta} section`}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={`${styles.ctaTitle} glow-text`}>
              Ready to Transform Your Business?
            </h2>
            <p className={styles.ctaDescription}>
              Join hundreds of businesses that have revolutionized their operations with our AI solutions.
            </p>
            <div className={styles.ctaButtons}>
              <a href="/contact" className={`${styles.primaryButton} cta-button`}>
                Get Started Today
              </a>
              <a href="/demo" className={`${styles.secondaryButton} nav-link`}>
                Schedule Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </DigiClickLayout>
  );
}
