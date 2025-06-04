import React, { useState, useEffect } from 'react';
import styles from './DigiClickLoading.module.css';

export default function DigiClickLoading({ 
  message = 'Loading DigiClick AI...',
  showProgress = true,
  showLogo = true,
  theme = 'dark',
  fullScreen = true 
}) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState(message);

  const loadingMessages = [
    'Initializing AI Systems...',
    'Loading Neural Networks...',
    'Calibrating Algorithms...',
    'Optimizing Performance...',
    'Preparing Interface...',
    'Almost Ready...'
  ];

  useEffect(() => {
    let progressInterval;
    let messageInterval;
    let messageIndex = 0;

    if (showProgress) {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
    }

    // Cycle through loading messages
    messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[messageIndex]);
    }, 1500);

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (messageInterval) clearInterval(messageInterval);
    };
  }, [showProgress]);

  const containerClass = fullScreen 
    ? `${styles.loadingContainer} ${styles.fullScreen}` 
    : styles.loadingContainer;

  return (
    <div className={`${containerClass} ${styles[theme]}`} role="status" aria-live="polite">
      <div className={styles.loadingContent}>
        {showLogo && (
          <div className={styles.logoContainer}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <svg 
                  width="60" 
                  height="60" 
                  viewBox="0 0 60 60" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.logoSvg}
                >
                  <circle 
                    cx="30" 
                    cy="30" 
                    r="25" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="none"
                    className={styles.logoCircle}
                  />
                  <path 
                    d="M20 30 L25 35 L40 20" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className={styles.logoCheck}
                  />
                </svg>
              </div>
              <div className={styles.logoText}>
                <span className={styles.logoMain}>DigiClick</span>
                <span className={styles.logoSub}>AI</span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.loadingAnimation}>
          <div className={styles.spinner}>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
          </div>
        </div>

        <div className={styles.loadingText}>
          <p className={styles.message}>{loadingText}</p>
          {showProgress && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <span className={styles.progressText}>
                {Math.round(Math.min(progress, 100))}%
              </span>
            </div>
          )}
        </div>

        <div className={styles.loadingDots}>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
      </div>

      {/* Accessibility */}
      <span className="sr-only">
        Loading DigiClick AI application. Please wait while we prepare your experience.
      </span>
    </div>
  );
}
