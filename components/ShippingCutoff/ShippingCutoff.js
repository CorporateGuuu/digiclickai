import React, { useState, useEffect } from 'react';
import styles from './ShippingCutoff.module.css';

const ShippingCutoff = () => {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();

      // Get today's cutoff time (7:30 PM EST)
      const cutoffTime = new Date(now);
      cutoffTime.setHours(19, 30, 0, 0); // 7:30 PM

      // Convert to EST (UTC-5)
      const estOffset = -5 * 60; // EST offset in minutes
      const localOffset = now.getTimezoneOffset(); // Local offset in minutes
      const offsetDiff = localOffset + estOffset; // Difference between local and EST

      // Adjust cutoff time to local time
      cutoffTime.setMinutes(cutoffTime.getMinutes() + offsetDiff);

      // If current time is past cutoff, set cutoff to tomorrow
      if (now > cutoffTime) {
        cutoffTime.setDate(cutoffTime.getDate() + 1);
      }

      // Calculate time difference
      const diff = cutoffTime - now;

      if (diff <= 0) {
        setIsExpired(true);
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      // Convert to hours, minutes, seconds
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time with leading zeros
  const formatTime = (time) => {
    return time.toString().padStart(2, '0');
  };

  // Convert to 12-hour format
  const format12Hour = (hours, minutes, seconds) => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${hours12}:${formatTime(minutes)}:${formatTime(seconds)} ${period}`;
  };

  return (
    <div className={styles.shippingCutoff}>
      <div className={styles.cutoffMessage}>
        Express shipping cuts off at 7:30 PM EST today. Please plan accordingly!
      </div>
      <div className={styles.cutoffTimer}>
        <div className={styles.timerDisplay}>
          <span className={styles.timerDigits}>
            {format12Hour(timeRemaining.hours, timeRemaining.minutes, timeRemaining.seconds)}
          </span>
        </div>
        <div className={styles.shippingMethod}>
          <span className={styles.methodName}>FedEx Standard Overnight</span>
          <span className={styles.freeShipping}>
            <strong>FREE</strong> when you spend over $1,000.00
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShippingCutoff;
