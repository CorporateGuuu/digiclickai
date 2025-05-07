import React from 'react';
import { useState, useEffect } from 'react';
import styles from './PWAManager.module.css';

const PWAManager = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // Register service worker and periodic sync
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          // Register service worker
          const registration = await navigator.serviceWorker.register('/sw.js');
          // // // console.log('Service Worker registered with scope:', registration.scope);

          // Register for periodic sync if supported
          if ('periodicSync' in registration) {
            // Check if we have permission
            const status = await navigator.permissions.query({
              name: 'periodic-background-sync',
            });

            if (status.state === 'granted') {
              try {
                // Register for periodic content updates (every 24 hours)
                await registration.periodicSync.register('update-content', {
                  minInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
                });
                // // // console.log('Periodic sync registered');
              } catch (syncError) {
                console.error('Periodic sync registration failed:', syncError);
              }
            }
          }
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      });
    }
  }, []);

  // Handle PWA install prompt
  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone ||
                         document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);

    // Store the install prompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);

      // Only show the install banner if not already installed
      // and if the user hasn't dismissed it recently
      const lastDismissed = localStorage.getItem('pwaInstallDismissed');
      const showAgain = !lastDismissed ||
                        (Date.now() - parseInt(lastDismissed)) > (7 * 24 * 60 * 60 * 1000); // 7 days

      if (!isStandalone && showAgain) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      // // // console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);

      // Show notification prompt if permission is not granted or denied
      if (
        Notification.permission === 'default' &&
        !localStorage.getItem('notificationPromptDismissed')
      ) {
        // Wait a bit before showing the prompt
        const timer = setTimeout(() => {
          setShowNotificationPrompt(true);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Handle install button click
  const handleInstall = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;

    // Reset the install prompt variable
    setInstallPrompt(null);

    if (choiceResult.outcome === 'accepted') {
      // // // console.log('User accepted the install prompt');
    } else {
      // // // console.log('User dismissed the install prompt');
    }

    // Hide the banner
    setShowInstallBanner(false);
  };

  // Handle dismiss button click
  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    // Remember that the user dismissed the prompt
    localStorage.setItem('pwaInstallDismissed', Date.now().toString());
  };

  // Handle notification permission request
  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      setShowNotificationPrompt(false);

      if (permission === 'granted') {
        // Subscribe to push notifications
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const registration = await navigator.serviceWorker.ready;

          // In a real app, you would send this subscription to your server
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
          });

          // // // console.log('User is subscribed:', subscription);

          // Example notification
          setTimeout(() => {
            new Notification('Notifications Enabled', {
              body: 'You will now receive updates about your orders and special offers.',
              icon: '/icons/icon-192x192.png'
            });
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Handle dismiss notification prompt
  const handleDismissNotifications = () => {
    setShowNotificationPrompt(false);
    localStorage.setItem('notificationPromptDismissed', 'true');
  };

  // Helper function to convert base64 to Uint8Array for VAPID key
  const urlBase64ToUint8Array = (base64String) => {
    if (!base64String) return new Uint8Array();

    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  };

  return (
    <>
      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className={styles.installBanner}>
          <div className={styles.installContent}>
            <div className={styles.installIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            <div className={styles.installText}>
              <h3>Add to Home Screen</h3>
              <p>Install our app for a better experience</p>
            </div>
          </div>

          <div className={styles.installActions}>
            <button
              className={styles.installButton}
              onClick={handleInstall}
            >
              Install
            </button>
            <button
              className={styles.dismissButton}
              onClick={handleDismissInstall}
            >
              Not Now
            </button>
          </div>
        </div>
      )}

      {/* Notification Permission Prompt */}
      {showNotificationPrompt && notificationPermission === 'default' && (
        <div className={styles.notificationPrompt}>
          <div className={styles.notificationContent}>
            <div className={styles.notificationIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <div className={styles.notificationText}>
              <h3>Enable Notifications</h3>
              <p>Get updates on your orders and special offers</p>
            </div>
          </div>

          <div className={styles.notificationActions}>
            <button
              className={styles.enableButton}
              onClick={handleEnableNotifications}
            >
              Enable
            </button>
            <button
              className={styles.dismissButton}
              onClick={handleDismissNotifications}
            >
              No Thanks
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAManager;
