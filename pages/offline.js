import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Offline.module.css';

function Offline() {
  return (
    <>
      <Head>
        <title>Offline | MDTS - Midas Technical Solutions</title>
        <meta name="description" content="You are currently offline. Please check your internet connection." />
      </Head>

      <div className={styles.offlineContainer}>
        <div className={styles.offlineContent}>
          <div className={styles.offlineIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
              <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>
          </div>

          <h1 className={styles.offlineTitle}>You're Offline</h1>
          <p className={styles.offlineMessage}>
            It looks like you've lost your internet connection. Please check your connection and try again.
          </p>

          <div className={styles.offlineActions}>
            <button
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6"></path>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              Retry
            </button>

            <Link href="/" className={styles.homeButton}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Go Home
            </Link>
          </div>

          <div className={styles.offlineTips}>
            <h2>While you're offline, you can still:</h2>
            <ul>
              <li>View previously visited pages that have been cached</li>
              <li>Browse your order history if you've viewed it before</li>
              <li>Check your wishlist if you've viewed it before</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default React.memo(Offline);
