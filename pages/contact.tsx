import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import DigiClickLayout from '../components/DigiClickLayout';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import styles from '../styles/Contact.module.css';

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    budget: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const formRef = useRef<HTMLFormElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP animations
    if (typeof window !== 'undefined' && window.gsap) {
      const { gsap } = window;
      
      // Animate form on load
      gsap.fromTo(formRef.current, 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: 'power3.out' }
      );

      // Animate hero section
      gsap.fromTo(heroRef.current, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage('Thank you for your message! We\'ll get back to you within 24 hours.');
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          service: '',
          budget: '',
          message: ''
        });
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Sorry, there was an error sending your message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    'AI Web Design',
    'Automation Solutions',
    'AI Consulting',
    'Custom Development',
    'Integration Services',
    'Other'
  ];

  const budgetRanges = [
    'Under $5,000',
    '$5,000 - $15,000',
    '$15,000 - $50,000',
    '$50,000 - $100,000',
    'Over $100,000',
    'Let\'s discuss'
  ];

  return (
    <DigiClickLayout
      title="Contact DigiClick AI"
      description="Get in touch with our AI automation experts. Let's discuss how we can transform your business with cutting-edge AI solutions."
      showCursor={true}
      showParticles={true}
      showChatbot={true}
      cursorTheme="default"
    >
      <Header />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div ref={heroRef} className={styles.heroContent}>
            <h1 className={`${styles.heroTitle} glow-text`}>
              Let's Build the Future <span className={styles.accent}>Together</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Ready to transform your business with AI? Our experts are here to help you 
              navigate your digital transformation journey.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.contactGrid}>
            {/* Contact Form */}
            <div className={styles.formContainer}>
              <h2 className={`${styles.formTitle} glow-text`}>Start Your AI Journey</h2>
              <p className={styles.formSubtitle}>
                Tell us about your project and we'll get back to you within 24 hours.
              </p>

              <form ref={formRef} onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={styles.input}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={styles.input}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="company" className={styles.label}>Company</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="Your company name"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone" className={styles.label}>Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="Your phone number"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="service" className={styles.label}>Service Interest</label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className={styles.select}
                    >
                      <option value="">Select a service</option>
                      {services.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="budget" className={styles.label}>Project Budget</label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className={styles.select}
                    >
                      <option value="">Select budget range</option>
                      {budgetRanges.map((range) => (
                        <option key={range} value={range}>
                          {range}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.label}>Project Details *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className={styles.textarea}
                    placeholder="Tell us about your project, goals, and how we can help..."
                  />
                </div>

                {submitStatus !== 'idle' && (
                  <div className={`${styles.submitMessage} ${styles[submitStatus]}`}>
                    {submitMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${styles.submitButton} cta-button`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className={styles.contactInfo}>
              <h3 className={`${styles.infoTitle} glow-text`}>Get in Touch</h3>
              <p className={styles.infoDescription}>
                Ready to discuss your project? We're here to help you succeed.
              </p>

              <div className={styles.contactMethods}>
                <div className={`${styles.contactMethod} pulse-box`}>
                  <div className={styles.methodIcon}>📧</div>
                  <div className={styles.methodInfo}>
                    <h4>Email Us</h4>
                    <p>hello@digiclick.ai</p>
                  </div>
                </div>

                <div className={`${styles.contactMethod} pulse-box`}>
                  <div className={styles.methodIcon}>📞</div>
                  <div className={styles.methodInfo}>
                    <h4>Call Us</h4>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className={`${styles.contactMethod} pulse-box`}>
                  <div className={styles.methodIcon}>💬</div>
                  <div className={styles.methodInfo}>
                    <h4>Live Chat</h4>
                    <p>Available 24/7</p>
                  </div>
                </div>
              </div>

              <div className={styles.responseTime}>
                <h4 className={styles.responseTitle}>Response Time</h4>
                <p className={styles.responseText}>
                  We typically respond to all inquiries within 24 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </DigiClickLayout>
  );
};

export default Contact;
