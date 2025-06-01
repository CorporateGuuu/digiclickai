import { useEffect } from 'react';
import styles from '../styles/ZIndexFix.module.css';

const FixHiddenElement = () => {
  useEffect(() => {
    // Function to fix the hidden element
    const fixHiddenElement = () => {
      try {
        // Target the specific element using the XPath
        const element = document.querySelector('body > div:nth-child(2) > div > div:nth-child(2)');

        if (element) {
          // Check if the element is a notification prompt before applying the fix
          const isNotificationPrompt = element.classList.contains('PWAManager_notificationPrompt__oTArC');

          if (!isNotificationPrompt) {
            // Apply the fix class only if it's not a notification prompt
            element.classList.add(styles.fixHiddenElement);
            // console.log('Fixed hidden element successfully');
          } else {
            // For notification prompts, ensure they're visible
            element.classList.add(styles.notificationFix);
            // console.log('Notification prompt visibility ensured');
          }
        } else {
          // console.log('Hidden element not found');
        }
      } catch (error) {
        console.error('Error fixing hidden element:', error);
      }
    };

    // Run the fix after a short delay to ensure the DOM is fully loaded
    const timer = setTimeout(fixHiddenElement, 1000);

    // Run the fix again on window resize
    window.addEventListener('resize', fixHiddenElement);

    // Clean up
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', fixHiddenElement);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default FixHiddenElement;
