import React from 'react';
import { useEffect, useRef } from 'react';
import Script from 'next/script';
import styles from './Security.module.css';

const Turnstile = ({ onVerify, onError, action }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    // Function to render the Turnstile widget
    const renderTurnstile = () => {
      if (!window.turnstile || !containerRef.current) return;

      // Remove existing widget if it exists
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.warn('Failed to remove Turnstile widget:', error);
        }
        widgetIdRef.current = null;
      }

      // Render the widget
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
          theme: 'light',
          action: action || 'generic_action',
          callback: (token) => {
            if (onVerify) onVerify(token);
          },
          'error-callback': (error) => {
            console.error('Turnstile error:', error);
            if (onError) onError(error);
          },
        });
      } catch (error) {
        console.error('Failed to render Turnstile widget:', error);
        if (onError) onError('Failed to render security widget');
      }
    };

    // If turnstile is already loaded, render immediately
    if (window.turnstile) {
      renderTurnstile();
    } else {
      // Otherwise, wait for the script to load
      window.onloadTurnstileCallback = renderTurnstile;
    }

    // Cleanup function
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.warn('Failed to remove Turnstile widget during cleanup:', error);
        }
        widgetIdRef.current = null;
      }
    };
  }, [onVerify, onError, action]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
        async
        defer
        strategy="afterInteractive"
      />
      <div ref={containerRef} className={styles.turnstileContainer}></div>
    </>
  );
};

export default Turnstile;
