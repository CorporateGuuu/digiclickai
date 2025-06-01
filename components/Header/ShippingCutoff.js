import React, { useState, useEffect } from 'react';
import styles from './ShippingCutoff.module.css';

const ShippingCutoff = () => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isCutoffPassed, setIsCutoffPassed] = useState(false);
  
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentSecond = now.getSeconds();
      
      // Set cutoff time to 3:00 PM EST
      const cutoffHour = 15; // 3 PM
      
      // Check if it's a weekend
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      
      // If it's a weekend or after cutoff time, show next business day
      if (isWeekend || (currentHour >= cutoffHour)) {
        setIsCutoffPassed(true);
        return;
      }
      
      // Calculate remaining time until cutoff
      const hoursRemaining = cutoffHour - currentHour - 1;
      const minutesRemaining = 59 - currentMinute;
      const secondsRemaining = 59 - currentSecond;
      
      // Format the time remaining
      setTimeRemaining(`${hoursRemaining}h ${minutesRemaining}m ${secondsRemaining}s`);
      setIsCutoffPassed(false);
    };
    
    // Calculate initially
    calculateTimeRemaining();
    
    // Update every second
    const timer = setInterval(calculateTimeRemaining, 1000);
    
    // Clean up on unmount
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className={styles.shippingCutoff}>
      <div className={styles.icon}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>
      <div className={styles.content}>
        {isCutoffPassed ? (
          <div>
            <div className={styles.label}>Order now for next business day shipping</div>
            <div className={styles.info}>Orders placed now will ship on the next business day</div>
          </div>
        ) : (
          <div>
            <div className={styles.label}>Order within <span className={styles.time}>{timeRemaining}</span> for same-day shipping</div>
            <div className={styles.info}>Orders placed before 3:00 PM EST ship today</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingCutoff;
