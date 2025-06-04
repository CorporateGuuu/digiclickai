import React from 'react';
import styles from './HeroSection.module.css';

const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.backgroundAnimation}></div>
      <div className={styles.content}>
        <h1 className={styles.title}>Create. Manage. Automate. Grow.</h1>
        <button className={styles.ctaButton}>Book a demo →</button>
        <span className={styles.established}>EST 2022</span>
      </div>
    </section>
  );
};

export default HeroSection;
