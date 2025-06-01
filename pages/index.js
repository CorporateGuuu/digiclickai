import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const particlesRef = useRef(null);
  const heroRef = useRef(null);
  const servicesRef = useRef(null);

  // Initialize particles.js
  useEffect(() => {
    const loadParticles = async () => {
      if (typeof window !== 'undefined') {
        try {
          const particlesJS = (await import('particles.js')).default;

          if (particlesRef.current && window.particlesJS) {
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
          }
        } catch (error) {
          console.warn('Particles.js failed to load:', error);
        }
      }
    };

    loadParticles();
  }, []);

  // Initialize GSAP animations
  useEffect(() => {
    const loadGSAP = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { gsap } = await import('gsap');
          const { ScrollTrigger } = await import('gsap/ScrollTrigger');

          gsap.registerPlugin(ScrollTrigger);

          // Hero animations
          gsap.fromTo(heroRef.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
          );

          // Service cards animation
          gsap.fromTo('.service-card',
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.2,
              scrollTrigger: {
                trigger: servicesRef.current,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        } catch (error) {
          console.warn('GSAP failed to load:', error);
        }
      }
    };

    loadGSAP();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormStatus('');

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFormStatus('Thank you! Your message has been sent successfully.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setFormStatus('Sorry, there was an error sending your message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>DigiClick AI - Elevate Your Digital Future</title>
        <meta name="description" content="Transform your business with AI-powered digital solutions. Expert web development, predictive marketing, and intelligent automation." />
        <meta name="keywords" content="AI, digital marketing, web development, automation, SEO, artificial intelligence" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />

        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Poppins:wght@300;400;600&display=swap" rel="stylesheet" />

        {/* External Scripts */}
        <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js" async></script>
      </Head>

      {/* Particles Background */}
      <div id="particles-js" ref={particlesRef} className={styles.particlesContainer}></div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <span className={styles.logoText}>DigiClick AI</span>
          </div>
          <nav className={styles.nav}>
            <ul className={styles.navList}>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a></li>
              <li><a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Services</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="home" className={styles.hero} ref={heroRef}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Elevate Your <span className={styles.highlight}>Digital Future</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Transform your business with AI-powered solutions that drive growth,
              enhance efficiency, and unlock unprecedented opportunities in the digital landscape.
            </p>
            <button
              className={styles.ctaButton}
              onClick={() => scrollToSection('contact')}
            >
              Start Your Transformation
            </button>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className={styles.services} ref={servicesRef}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Our AI-Powered Services</h2>
            <div className={styles.servicesGrid}>
              <div className={`${styles.serviceCard} service-card`}>
                <div className={styles.serviceIcon}>🌐</div>
                <h3 className={styles.serviceTitle}>AI-Crafted Websites</h3>
                <p className={styles.serviceDescription}>
                  Intelligent web development that adapts to user behavior and optimizes
                  performance automatically using machine learning algorithms.
                </p>
              </div>

              <div className={`${styles.serviceCard} service-card`}>
                <div className={styles.serviceIcon}>📊</div>
                <h3 className={styles.serviceTitle}>Predictive Marketing</h3>
                <p className={styles.serviceDescription}>
                  Harness the power of AI to predict market trends, customer behavior,
                  and optimize your marketing campaigns for maximum ROI.
                </p>
              </div>

              <div className={`${styles.serviceCard} service-card`}>
                <div className={styles.serviceIcon}>🔍</div>
                <h3 className={styles.serviceTitle}>Intelligent SEO</h3>
                <p className={styles.serviceDescription}>
                  AI-driven SEO strategies that continuously adapt to search engine
                  algorithms and competitor movements for sustained rankings.
                </p>
              </div>

              <div className={`${styles.serviceCard} service-card`}>
                <div className={styles.serviceIcon}>⚡</div>
                <h3 className={styles.serviceTitle}>Automation Ecosystems</h3>
                <p className={styles.serviceDescription}>
                  Complete business process automation using AI to streamline operations,
                  reduce costs, and eliminate repetitive tasks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className={styles.contact}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Get In Touch</h2>
            <p className={styles.contactSubtitle}>
              Ready to transform your business? Let's discuss how our AI-powered solutions can help you achieve your goals.
            </p>

            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  rows="5"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Message'}
              </button>

              {formStatus && (
                <div className={`${styles.formStatus} ${formStatus.includes('error') || formStatus.includes('Please') ? styles.error : styles.success}`}>
                  {formStatus}
                </div>
              )}
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerLogo}>
              <span className={styles.logoText}>DigiClick AI</span>
            </div>
            <div className={styles.footerInfo}>
              <p>&copy; {new Date().getFullYear()} DigiClick AI. All rights reserved.</p>
              <p>
                Contact us at: <a href="mailto:info@digiclickai.shop" className={styles.footerLink}>
                  info@digiclickai.shop
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
