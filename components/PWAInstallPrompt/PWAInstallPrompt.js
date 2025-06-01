import { useState, useEffect } from 'react';
import styles from './PWAInstallPrompt.module.css';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if the device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt
      setShowPrompt(true);
    });

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
    };
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null);
      setShowPrompt(false);
    });
  };

  const handleCloseClick = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className={styles.installPrompt}>
      <div className={styles.promptContent}>
        <div className={styles.promptIcon}>
          <img src="/icons/mdts-icon.svg" alt="MDTS App Icon" />
        </div>
        <div className={styles.promptText}>
          <h3>Install MDTS App</h3>
          <p>
            {isIOS
              ? 'To install this app on your iPhone: tap the Share button then "Add to Home Screen"'
              : 'Install our app for a better experience'}
          </p>
        </div>
        <div className={styles.promptActions}>
          {!isIOS && (
            <button className={styles.installButton} onClick={handleInstallClick}>
              Install
            </button>
          )}
          <button className={styles.closeButton} onClick={handleCloseClick}>
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
