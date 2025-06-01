import React from 'react';
import Head from 'next/head';
import styles from '../styles/LcdBuyback.module.css';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';

export default function LcdBuyback() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    deviceType: '',
    deviceModel: '',
    condition: '',
    quantity: 1,
    email: '',
    phone: '',
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitStatus('');

    try {
      // Send email notification
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'midastechnicalsolutions@gmail.com',
          subject: 'New LCD Buyback Request',
          formData
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage('Your request has been submitted successfully! We will contact you shortly with a quote.');
        setFormData({
          deviceType: '',
          deviceModel: '',
          condition: '',
          quantity: 1,
          email: '',
          phone: '',
          comments: ''
        });
      } else {
        setSubmitStatus('error');
        setSubmitMessage('There was an error submitting your request. Please try again or contact us directly.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setSubmitMessage('There was an error submitting your request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout
      title="LCD Buyback Program - Midas Technical Solutions"
      description="Sell your old LCD screens and get cash back with our LCD Buyback Program. Fast, easy, and competitive prices."
    >
      {/* Custom breadcrumb only for LCD Buyback page */}
      <div className={styles.breadcrumb}>
        <div className={styles.container}>
          <span>Home</span> &gt; <span className={styles.active}>LCD Buyback</span>
        </div>
      </div>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>LCD Buyback Program</h1>
            <p>Turn your old LCD screens into cash! We buy broken, used, and new LCD screens for iPhones, Samsung, iPads, and more.</p>
            <button className={styles.heroButton}>Get Started</button>
          </div>
        </section>

        <section className={styles.infoSection}>
          <div className={styles.container}>
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>💰</div>
                <h3>Competitive Pricing</h3>
                <p>We offer some of the best prices in the industry for your used and broken LCD screens.</p>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>🚚</div>
                <h3>Free Shipping</h3>
                <p>We provide free shipping labels for all buyback orders over $1000.</p>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>⚡</div>
                <h3>Fast Payment</h3>
                <p>Get paid within 48 hours of us receiving and verifying your LCD screens.</p>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>♻️</div>
                <h3>Eco-Friendly</h3>
                <p>Help the environment by recycling your old LCD screens instead of throwing them away.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.formSection}>
          <div className={styles.container}>
            <div className={styles.formWrapper}>
              <h2>Submit Your Device Details</h2>
              <p>Fill out the form below to get an instant quote for your LCD screens.</p>

              <form className={styles.buybackForm} onSubmit={handleSubmit}>
                {submitMessage && (
                  <div className={`${styles.formMessage} ${styles[submitStatus]}`}>
                    {submitMessage}
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label htmlFor="deviceType">Device Type</label>
                  <select
                    id="deviceType"
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Device Type</option>
                    <option value="iphone">iPhone</option>
                    <option value="samsung">Samsung</option>
                    <option value="ipad">iPad</option>
                    <option value="macbook">MacBook</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="deviceModel">Device Model</label>
                  <input
                    type="text"
                    id="deviceModel"
                    name="deviceModel"
                    placeholder="e.g., iPhone 13 Pro, Galaxy S22"
                    value={formData.deviceModel}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="condition">Condition</label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Condition</option>
                    <option value="new">New/Like New</option>
                    <option value="good">Good (Minor Scratches)</option>
                    <option value="fair">Fair (Visible Wear)</option>
                    <option value="broken">Broken (Still Powers On)</option>
                    <option value="damaged">Damaged (Does Not Power On)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="comments">Additional Comments (Optional)</label>
                  <textarea
                    id="comments"
                    name="comments"
                    rows="3"
                    placeholder="Any additional information about your LCD screens"
                    value={formData.comments}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Get Quote'}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className={styles.faqSection}>
          <div className={styles.container}>
            <h2>Frequently Asked Questions</h2>

            <div className={styles.faqGrid}>
              <div className={styles.faqItem}>
                <h3>What types of LCD screens do you buy?</h3>
                <p>We buy LCD screens for iPhones, Samsung phones, iPads, MacBooks, and other popular devices. Both working and non-working screens are accepted.</p>
              </div>

              <div className={styles.faqItem}>
                <h3>How is the value determined?</h3>
                <p>The value is determined based on the device model, condition of the screen, and current market demand. We strive to offer competitive prices.</p>
              </div>

              <div className={styles.faqItem}>
                <h3>How do I ship my LCD screens to you?</h3>
                <p>After accepting our quote, we'll provide shipping instructions and a prepaid shipping label for orders over $1000. For smaller orders, you can use your preferred shipping method.</p>
              </div>

              <div className={styles.faqItem}>
                <h3>How will I get paid?</h3>
                <p>We offer payment via PayPal, direct bank transfer, or store credit (with a 10% bonus). Payments are processed within 48 hours after we receive and verify your LCD screens.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
