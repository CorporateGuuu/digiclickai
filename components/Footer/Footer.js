import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import ContactForm from '../ContactForm/ContactForm';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');

  // Available languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ar', name: 'العربية' },
  ];

  // Available currencies
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this to your API
    // For now, just show the confirmation message
    setSubscribed(true);
    setEmail('');

    // Reset the subscription message after 5 seconds
    setTimeout(() => {
      setSubscribed(false);
    }, 5000);
  };

  const openContactForm = () => {
    setIsContactFormOpen(true);
  };

  const closeContactForm = () => {
    setIsContactFormOpen(false);
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);

    // In a real app, this would update the app's language context
    // For now, just store in localStorage
    localStorage.setItem('preferredLanguage', newLanguage);
  };

  // Handle currency change
  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    setCurrency(newCurrency);

    // In a real app, this would update the app's currency context
    // For now, just store in localStorage
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  // Load saved preferences on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const savedCurrency = localStorage.getItem('preferredCurrency');

    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.newsletter}>
            <h3 className={styles.title}>Subscribe to Our Newsletter</h3>
            <p className={styles.description}>
              Stay updated with our latest products, promotions, and repair guides.
            </p>
            {subscribed ? (
              <div className={styles.subscriptionConfirmation}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p>Thank you for subscribing! You'll be notified of future marketing.</p>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Your email address"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className={styles.button}>
                  Subscribe
                </button>
              </form>
            )}
            <div className={styles.socialLinks}>
              <a href="https://www.instagram.com/mdtstech.store/" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="https://tiktok.com/@mdtstech" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/fitzgerald-amaniampong-0a2962324/" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                </svg>
              </a>
              <a href="https://youtube.com/channel/mdtstech" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className={styles.middle}>
          <div className={styles.column}>
            <h3>Shop</h3>
            <ul className={styles.links}>
              <li><Link href="/products/iphone">iPhone Parts</Link></li>
              <li><Link href="/products/samsung">Samsung Parts</Link></li>
              <li><Link href="/products/ipad">iPad Parts</Link></li>
              <li><Link href="/products/macbook">MacBook Parts</Link></li>
              <li><Link href="/products/tools">Repair Tools</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3>Information</h3>
            <ul className={styles.links}>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/lcd-buyback">LCD Buyback</Link></li>
              <li><Link href="/trade-off">Trade-Off</Link></li>
              <li><Link href="/finance">Financing</Link></li>
              <li><Link href="/gapp">Apple Parts Program</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3>Contact Us</h3>
            <ul className={styles.links}>
              <li>Phone: +1 (240) 351-0511</li>
              <li>Address: Vienna, VA 22182</li>
              <li>Email: support@mdtstech.store</li>
              <li>Hours: Mon-Fri 9AM-10PM EST</li>
              <li>
                <button onClick={openContactForm} className={styles.contactButton}>
                  Send us a message
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>



        <div className={styles.bottom}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} Midas Technical Solutions. All rights reserved.
          </div>

          <div className={styles.acceptedPayments}>
            <div className={styles.paymentMethods}>
              <div className={styles.paymentMethod}>
                <img src="/images/payments/visa.svg" alt="Visa" />
              </div>
              <div className={styles.paymentMethod}>
                <img src="/images/payments/mastercard.svg" alt="Mastercard" />
              </div>
              <div className={styles.paymentMethod}>
                <img src="/images/payments/amex.svg" alt="American Express" />
              </div>
              <div className={styles.paymentMethod}>
                <img src="/images/payments/paypal.svg" alt="PayPal" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <ContactForm isOpen={isContactFormOpen} onClose={closeContactForm} />
    </footer>
  );
};

export default Footer;
