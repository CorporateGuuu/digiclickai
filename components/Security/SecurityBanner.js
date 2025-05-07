import React from 'react';
import Link from 'next/link';
import styles from './Security.module.css';

const SecurityBanner = () => {
  return (
    <div className={styles.securityBanner}>
      This site is protected by Cloudflare and uses encryption to safeguard your data.
      <Link href="/privacy" target="_blank" rel="noopener noreferrer">Learn more</Link>
    </div>
  );
};

export default SecurityBanner;
