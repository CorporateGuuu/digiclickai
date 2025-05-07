import React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

const EnhancedFooter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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
          </div>

          <div>
            <h3 className={styles.title}>Our Services</h3>
            <div className={styles.services}>
              <div className={styles.service}>
                <div className={styles.serviceIcon}>🚚</div>
                <div className={styles.serviceName}>Fast Shipping</div>
                <div className={styles.serviceDescription}>
                  Free shipping on orders over $1000
                </div>
              </div>

              <div className={styles.service}>
                <div className={styles.serviceIcon}>🔧</div>
                <div className={styles.serviceName}>Repair Guides</div>
                <div className={styles.serviceDescription}>
                  Step-by-step tutorials
                </div>
              </div>

              <div className={styles.service}>
                <div className={styles.serviceIcon}>💬</div>
                <div className={styles.serviceName}>Support</div>
                <div className={styles.serviceDescription}>
                  24/7 customer service
                </div>
              </div>

              <div className={styles.service}>
                <div className={styles.serviceIcon}>🔄</div>
                <div className={styles.serviceName}>Returns</div>
                <div className={styles.serviceDescription}>
                  30-day money back
                </div>
              </div>
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
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/blog">Repair Guides</Link></li>
              <li><Link href="/lcd-buyback">LCD Buyback Program</Link></li>
              <li><Link href="/wholesale">Wholesale Program</Link></li>
              <li><Link href="/careers">Careers</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3>Customer Service</h3>
            <ul className={styles.links}>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/shipping">Shipping Policy</Link></li>
              <li><Link href="/returns">Returns & Warranty</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3>Contact Us</h3>
            <ul className={styles.links}>
              <li>Vienna, VA 22182</li>
              <li>Phone: +1 (240) 351-0511</li>
              <li>Email: support@mdtstech.store</li>
              <li>Hours: Mon-Fri 9AM-10PM EST</li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} Midas Technical Solutions. All rights reserved.
          </div>

          <div className={styles.paymentMethods}>
            <div className={styles.paymentIcon}>Visa</div>
            <div className={styles.paymentIcon}>MC</div>
            <div className={styles.paymentIcon}>Amex</div>
            <div className={styles.paymentIcon}>PayPal</div>
            <div className={styles.paymentIcon}>Apple</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;
