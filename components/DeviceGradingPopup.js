import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/DeviceGradingPopup.module.css';

export default function DeviceGradingPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Check if the user has already seen the popup
    const hasSeenPopup = localStorage.getItem('hasSeenGradingPopup');
    
    if (!hasSeenPopup) {
      // Show popup after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
    // Remember that the user has seen the popup
    localStorage.setItem('hasSeenGradingPopup', 'true');
  };
  
  const handleLearnMore = () => {
    router.push('/device-grading');
    handleClose();
  };
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContainer}>
        <button className={styles.closeButton} onClick={handleClose}>
          &times;
        </button>
        
        <div className={styles.popupHeader}>
          <h2>Device Grading System</h2>
          <p>Learn about our standardized grading system for devices and parts</p>
        </div>
        
        <div className={styles.popupContent}>
          <div className={styles.gradingCards}>
            <div className={styles.gradingCard}>
              <div className={styles.gradeBadge} style={{ backgroundColor: '#4CAF50' }}>Grade A</div>
              <h3>Excellent</h3>
              <p>Like new condition with no visible wear</p>
            </div>
            
            <div className={styles.gradingCard}>
              <div className={styles.gradeBadge} style={{ backgroundColor: '#2196F3' }}>Grade B</div>
              <h3>Good</h3>
              <p>Minor wear but fully functional</p>
            </div>
            
            <div className={styles.gradingCard}>
              <div className={styles.gradeBadge} style={{ backgroundColor: '#FFC107' }}>Grade C</div>
              <h3>Fair</h3>
              <p>Noticeable wear but working properly</p>
            </div>
            
            <div className={styles.gradingCard}>
              <div className={styles.gradeBadge} style={{ backgroundColor: '#F44336' }}>Grade D</div>
              <h3>Poor</h3>
              <p>Significant wear with possible issues</p>
            </div>
          </div>
          
          <div className={styles.popupInfo}>
            <p>
              At MDTS, we use a standardized grading system to evaluate the condition of devices and parts.
              This ensures transparency and fair pricing for all our customers.
            </p>
            
            <p>
              Whether you're buying a refurbished device or selling through our LCD Buyback Program,
              understanding our grading system helps you make informed decisions.
            </p>
          </div>
        </div>
        
        <div className={styles.popupFooter}>
          <button className={styles.learnMoreButton} onClick={handleLearnMore}>
            Learn More
          </button>
          
          <Link href="/lcd-buyback" className={styles.buybackButton}>
            LCD Buyback Program
          </Link>
        </div>
      </div>
    </div>
  );
}
