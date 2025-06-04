import React from 'react';
import styles from './PortfolioHero.module.css';

const PortfolioHero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.logoContainer}>
        <img src="/images/darna-logo.png" alt="Darna Logo" className={styles.logo} />
      </div>
      <h1 className={styles.title}>UPCOMING</h1>
      <div className={styles.eventsGrid}>
        <div className={styles.eventCard}>
          <img src="/images/vip-tables.jpg" alt="VIP Tables" className={styles.eventImage} />
          <h3 className={styles.eventTitle}>VIP Tables</h3>
          <button className={styles.reserveButton}>RESERVE NOW</button>
        </div>
        <div className={styles.eventCard}>
          <img src="/images/timeless-tuesdays.jpg" alt="Timeless Tuesdays" className={styles.eventImage} />
          <h3 className={styles.eventTitle}>Tuesdays</h3>
          <button className={styles.reserveButton}>RESERVE NOW</button>
        </div>
        <div className={styles.eventCard}>
          <img src="/images/industry-wednesdays.jpg" alt="Industry Wednesdays" className={styles.eventImage} />
          <h3 className={styles.eventTitle}>Industry Wednesdays</h3>
          <button className={styles.reserveButton}>RESERVE NOW</button>
        </div>
        <div className={styles.eventCard}>
          <img src="/images/latin-thursdays.jpg" alt="Latin Thursdays" className={styles.eventImage} />
          <h3 className={styles.eventTitle}>Latin Thursdays</h3>
          <button className={styles.reserveButton}>RESERVE NOW</button>
        </div>
      </div>
    </section>
  );
};

export default PortfolioHero;
