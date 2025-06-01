import React from 'react';
import styles from './TrustBadges.module.css';

const TrustBadges = () => {
  return (
    <section className={styles.trustBadges}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.badge}>
            <div className={styles.icon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div className={styles.content}>
              <h3>Secure Payments</h3>
              <p>Your payment information is processed securely</p>
            </div>
          </div>
          
          <div className={styles.badge}>
            <div className={styles.icon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 8v4l3 3"></path>
              </svg>
            </div>
            <div className={styles.content}>
              <h3>24/7 Support</h3>
              <p>Round-the-clock assistance for your inquiries</p>
            </div>
          </div>
          
          <div className={styles.badge}>
            <div className={styles.icon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <div className={styles.content}>
              <h3>Fast Shipping</h3>
              <p>Quick delivery with tracking on all orders</p>
            </div>
          </div>
          
          <div className={styles.badge}>
            <div className={styles.icon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
            </div>
            <div className={styles.content}>
              <h3>Satisfaction Guarantee</h3>
              <p>30-day money-back guarantee on all products</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
