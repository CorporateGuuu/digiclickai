import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { getServices, submitContactForm } from '../utils/api';
import AuthModal from '../components/AuthModal';
import Portfolio from '../components/Portfolio';
import styles from '../styles/Home.module.css';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    serviceInterest: ''
  });
  const [formStatus, setFormStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const particlesRef = useRef(null);
  const heroRef = useRef(null);
  const servicesRef = useRef(null);

  // Initialize particles.js
  useEffect(() => {
    const loadParticles = async () => {
      if (typeof window !== 'undefined') {
        try {
          // Load particles.js from CDN
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
          script.onload = () => {
            if (window.particlesJS) {
              window.particlesJS('particles-js', {
                particles: {
                  number: { value: 80, density: { enable: true, value_area: 800 } },
                  color: { value: '#00d4ff' },
                  shape: { type: 'circle' },
                  opacity: { value: 0.5, random: true },
                  size: { value: 3, random: true },
                  line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#7b2cbf',
                    opacity: 0.4,
                    width: 1
                  },
                  move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false
                  }
                },
                interactivity: {
                  detect_on: 'canvas',
                  events: {
                    onhover: { enable: true, mode: 'repulse' },
                    onclick: { enable: true, mode: 'push' }
                  },
                  modes: {
                    repulse: { distance: 100 },
                    push: { particles_nb: 4 }
                  }
                },
                retina_detect: true
              });
            }
          };
          document.head.appendChild(script);
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
          // Load GSAP from CDN
          const gsapScript = document.createElement('script');
          gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/gsap.min.js';

          const scrollTriggerScript = document.createElement('script');
          scrollTriggerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/ScrollTrigger.min.js';

          gsapScript.onload = () => {
            scrollTriggerScript.onload = () => {
              if (window.gsap) {
                window.gsap.registerPlugin(window.ScrollTrigger);

                // Hero animations - matching original timing
                window.gsap.from('.hero h1', {
                  opacity: 0,
                  y: 50,
                  duration: 1,
                  ease: 'power2.out'
                });
                window.gsap.from('.hero p', {
                  opacity: 0,
                  y: 50,
                  duration: 1,
                  delay: 0.5,
                  ease: 'power2.out'
                });
                window.gsap.from('.cta-button', {
                  opacity: 0,
                  scale: 0.8,
                  duration: 1,
                  delay: 1,
                  ease: 'elastic.out(1, 0.3)'
                });

                // Service cards animation
                window.gsap.utils.toArray('.service').forEach((service, i) => {
                  window.gsap.from(service, {
                    scrollTrigger: {
                      trigger: service,
                      start: 'top 80%',
                      end: 'bottom 20%',
                      toggleActions: 'play none none none'
                    },
                    opacity: 0,
                    y: 100,
                    duration: 1,
                    delay: i * 0.2,
                    ease: 'power2.out'
                  });
                });
              }
            };
            document.head.appendChild(scrollTriggerScript);
          };
          document.head.appendChild(gsapScript);
        } catch (error) {
          console.warn('GSAP failed to load:', error);
        }
      }
    };

    loadGSAP();
  }, []);

  // Fetch services from backend using API utility
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServices();
        if (response.success) {
          setServices(response.data.data || response.data || []);
        } else {
          // Fallback to default services if API fails
          setServices([
            { title: 'AI-Crafted Websites', description: 'Design visionary websites with AI-driven aesthetics that captivate and convert.' },
            { title: 'Predictive Marketing', description: 'Harness AI to anticipate trends and optimize campaigns for unparalleled results.' },
            { title: 'Intelligent SEO', description: 'Elevate your search rankings with AI-powered strategies and dynamic content.' },
            { title: 'Automation Ecosystems', description: 'Streamline operations with bespoke AI automation for seamless efficiency.' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback to default services
        setServices([
          { title: 'AI-Crafted Websites', description: 'Design visionary websites with AI-driven aesthetics that captivate and convert.' },
          { title: 'Predictive Marketing', description: 'Harness AI to anticipate trends and optimize campaigns for unparalleled results.' },
          { title: 'Intelligent SEO', description: 'Elevate your search rankings with AI-powered strategies and dynamic content.' },
          { title: 'Automation Ecosystems', description: 'Streamline operations with bespoke AI automation for seamless efficiency.' }
        ]);
      }
    };

    fetchServices();
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

    // Basic validation - matching original message style
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please complete all fields to launch your project.');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      // Submit using API utility
      const response = await submitContactForm({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        serviceInterest: formData.serviceInterest || 'General Inquiry'
      });

      if (response.success) {
        alert(`Your vision is received, ${formData.name}! We'll connect soon.`);
        setFormData({ name: '', email: '', message: '', serviceInterest: '' });
        setFormStatus('');
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Sorry, there was an error sending your message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Smooth scroll with easing to match original jQuery implementation
      const targetPosition = element.offsetTop;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1000;
      let start = null;

      function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
      }

      function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      }

      requestAnimationFrame(animation);
    }
  };

  // Authentication handlers
  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Digiclick AI - Premium AI Web Design & Automation</title>
        <meta name="description" content="Digiclick AI crafts exquisite, AI-powered websites and automations that redefine digital excellence." />
        <meta name="keywords" content="AI, web design, automation, digital marketing, premium websites" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />

        {/* Google Fonts - matching original */}
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Poppins:wght@300;600&display=swap" rel="stylesheet" />
      </Head>

      {/* Particles Background */}
      <div id="particles-js" ref={particlesRef} className={styles.particlesContainer}></div>

      {/* Header - matching original structure */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Digiclick AI</h1>
      </header>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a>
          <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Services</a>
          <a href="#portfolio" onClick={(e) => { e.preventDefault(); scrollToSection('portfolio'); }}>Portfolio</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
        </div>
        <div className={styles.navRight}>
          {isAuthenticated() ? (
            <>
              <span className={styles.welcomeText}>Welcome, {user?.name}</span>
              <button
                onClick={goToDashboard}
                className={styles.dashboardButton}
              >
                Dashboard
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('login')}
                className={styles.loginButton}
              >
                Login
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className={styles.registerButton}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section - matching original */}
      <section className={`${styles.hero} hero`} id="home">
        <h1>Elevate Your Digital Future</h1>
        <p>Digiclick AI crafts exquisite, AI-powered websites and automations that redefine digital excellence.</p>
        <a href="#contact" className={`${styles.ctaButton} cta-button`} onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>
          Unlock Your Vision
        </a>
      </section>

      {/* Services Section - dynamic from backend */}
      <section className={`${styles.services} services`} id="services">
        {services.map((service, index) => (
          <div key={index} className={`${styles.service} service`}>
            <h2>{service.title}</h2>
            <p>{service.description}</p>
          </div>
        ))}
      </section>

      {/* Portfolio Section */}
      <Portfolio />

      {/* Contact Section - matching original with service dropdown */}
      <section className={`${styles.contactForm} contact-form`} id="contact">
        <h2>Connect with the Future</h2>
        <form id="contactForm" onSubmit={handleSubmit}>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <select
            id="serviceInterest"
            name="serviceInterest"
            value={formData.serviceInterest}
            onChange={handleInputChange}
            className={styles.serviceSelect}
          >
            <option value="">Select Service</option>
            {services.map((service, index) => (
              <option key={index} value={service.title}>
                {service.title}
              </option>
            ))}
          </select>
          <textarea
            id="message"
            name="message"
            placeholder="Your Vision"
            rows="5"
            value={formData.message}
            onChange={handleInputChange}
            required
          ></textarea>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Launching...' : 'Launch Your Project'}
          </button>
        </form>
      </section>

      {/* Footer - matching original */}
      <footer className={styles.footer}>
        <p>© 2025 Digiclick AI. All rights reserved. | <a href="mailto:info@digiclick.ai">info@digiclick.ai</a> | (123) 456-7890</p>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </div>
  );
}
