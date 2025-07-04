'use client';

import React, { useState } from 'react';
import Header from '../../components/Header';
import styles from './contact.module.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    service: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus('success');
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        company: '',
        message: '',
        service: ''
      });
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <Header />
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.heroTitle} ${styles.glowText}`}>
            Let's Build the Future <span className={styles.accent}>Together</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Ready to transform your business with AI? Get in touch with our experts 
            and discover how we can help you achieve your goals.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <div className={styles.contactGrid}>
            {/* Contact Form */}
            <div className={`${styles.formContainer} ${styles.pulseBox}`}>
              <h2 className={`${styles.formTitle} ${styles.glowText}`}>
                Start Your AI Journey
              </h2>
              <p className={styles.formSubtitle}>
                Tell us about your project and we'll get back to you within 24 hours.
              </p>
              
              {submitStatus === 'success' && (
                <div className={styles.successMessage}>
                  <p>Thank you! Your message has been sent successfully. We'll be in touch soon.</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="Enter your email address"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="company" className={styles.label}>Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter your company name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="service" className={styles.label}>Service Interest</label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="">Select a service</option>
                    <option value="ai-automation">AI Process Automation</option>
                    <option value="web-development">AI Web Development</option>
                    <option value="analytics">Intelligent Analytics</option>
                    <option value="consulting">AI Consulting</option>
                    <option value="custom">Custom AI Solutions</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.label}>Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className={styles.textarea}
                    placeholder="Tell us about your project and requirements"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ''}`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className={styles.contactInfo}>
              <div className={`${styles.infoCard} ${styles.pulseBox}`}>
                <div className={styles.infoIcon}>
                  <div className={styles.glowOrb}></div>
                </div>
                <h3 className={styles.infoTitle}>Get in Touch</h3>
                <p className={styles.infoDescription}>
                  Ready to discuss your AI transformation? Our team is here to help.
                </p>
                <div className={styles.contactDetails}>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>Email:</span>
                    <span className={styles.contactValue}>hello@digiclickai.com</span>
                  </div>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>Phone:</span>
                    <span className={styles.contactValue}>+1 (555) 123-4567</span>
                  </div>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>Response Time:</span>
                    <span className={styles.contactValue}>Within 24 hours</span>
                  </div>
                </div>
              </div>

              <div className={`${styles.infoCard} ${styles.pulseBox}`}>
                <div className={styles.infoIcon}>
                  <div className={styles.glowOrb}></div>
                </div>
                <h3 className={styles.infoTitle}>Why Choose Us?</h3>
                <ul className={styles.benefitsList}>
                  <li>Expert AI development team</li>
                  <li>Proven track record of success</li>
                  <li>Custom solutions for your needs</li>
                  <li>Ongoing support and maintenance</li>
                  <li>Competitive pricing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={`${styles.ctaTitle} ${styles.glowText}`}>
            Ready to Get Started?
          </h2>
          <p className={styles.ctaDescription}>
            Join hundreds of businesses that have transformed their operations with our AI solutions.
          </p>
          <div className={styles.ctaButtons}>
            <a href="/services" className={`${styles.primaryButton} ${styles.ctaButton}`}>
              Explore Our Services
            </a>
            <a href="/about" className={`${styles.secondaryButton} ${styles.navLink}`}>
              Learn More About Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
