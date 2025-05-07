import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.newsletter}>
        <h3>Newsletter Sign Up</h3>
        <form>
          <input type="email" placeholder="Enter E-mail Address" />
          <button type="submit">SEND</button>
        </form>
      </div>
      <div className={styles.services}>
        <div className={styles.serviceTile}>Lifetime Warranty on Parts</div>
        <div className={styles.serviceTile}>Ready to Sell Pre-Owned Devices</div>
        <div className={styles.serviceTile}>Retail Ready Accessories</div>
        <div className={styles.serviceTile}>Tools & Supplies for Your Business</div>
      </div>
      <div className={styles.links}>
        <div>
          <h4>GET TO KNOW US</h4>
          <ul>
            <li><Link href="/lcd-buyback">LCD Buyback Program</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4>NEED HELP?</h4>
          <ul>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/support">Support</Link></li>
          </ul>
        </div>
      </div>
      <div className={styles.payment}>
        <p>© 2025 Your Brand</p>
        <div className={styles.paymentLogos}>
          <img src="/payment-logos.png" alt="Payment Methods" />
        </div>
      </div>
    </footer>
  );
}
export default React.memo(Footer);
