import React from 'react';
import styles from './Security.module.css';

const SecurityBadge = () => {
  return (
    <div className={styles.securityBadge}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
      <span>
        Protected by Cloudflare | <a href="https://www.cloudflare.com/trust-hub/privacy-and-data-protection/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
      </span>
    </div>
  );
};

export default SecurityBadge;
