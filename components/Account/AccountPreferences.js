import React from 'react';
import { useState, useEffect } from 'react';
import { useTheme } from '../Theme/ThemeProvider';
import CurrencyConverter from './CurrencyConverter';
import styles from '../../styles/Account.module.css';

const AccountPreferences = () => {
  const { theme, changeTheme } = useTheme();

  const [preferences, setPreferences] = useState({
    emailNotifications: {
      orderUpdates: true,
      promotions: true,
      newProducts: false,
      blog: false
    },
    displayPreferences: {
      theme: 'light',
      currency: 'USD',
      language: 'en'
    },
    privacySettings: {
      shareDataForAnalytics: true,
      allowPersonalization: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Update preferences with current theme when component mounts
  useEffect(() => {
    setPreferences(prev => ({
      ...prev,
      displayPreferences: {
        ...prev.displayPreferences,
        theme: theme
      }
    }));
  }, [theme]);

  const handleEmailNotificationChange = (e) => {
    const { name, checked } = e.target;
    setPreferences({
      ...preferences,
      emailNotifications: {
        ...preferences.emailNotifications,
        [name]: checked
      }
    });
  };

  const handleDisplayPreferenceChange = (e) => {
    const { name, value } = e.target;

    // Update theme in ThemeProvider if theme is changed
    if (name === 'theme') {
      changeTheme(value);
    }

    setPreferences({
      ...preferences,
      displayPreferences: {
        ...preferences.displayPreferences,
        [name]: value
      }
    });
  };

  const handlePrivacySettingChange = (e) => {
    const { name, checked } = e.target;
    setPreferences({
      ...preferences,
      privacySettings: {
        ...preferences.privacySettings,
        [name]: checked
      }
    });
  };

  // Function to save preferences to localStorage
  const savePreferencesToStorage = (prefs) => {
    localStorage.setItem('userPreferences', JSON.stringify(prefs));
  };

  // Load preferences from localStorage on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        const parsedPrefs = JSON.parse(savedPreferences);
        setPreferences(parsedPrefs);
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Save preferences to localStorage
      savePreferencesToStorage(preferences);

      // In a real app, this would also call an API to save preferences
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));

      // If email notifications are enabled, send test notifications
      if (window.notificationCenter) {
        if (preferences.emailNotifications.orderUpdates) {
          window.notificationCenter.addNotification(
            'Order Updates Enabled',
            'You will now receive notifications about your order status and shipping updates.',
            'success'
          );
        }

        if (preferences.emailNotifications.promotions) {
          window.notificationCenter.addNotification(
            'Promotions Enabled',
            'You will now receive notifications about special offers and discounts.',
            'info'
          );
        }

        if (preferences.emailNotifications.newProducts) {
          window.notificationCenter.addNotification(
            'New Product Announcements Enabled',
            'You will now receive notifications when new products are added to our store.',
            'info'
          );
        }

        if (preferences.emailNotifications.blog) {
          window.notificationCenter.addNotification(
            'Blog Updates Enabled',
            'You will now receive notifications about new blog posts and repair guides.',
            'info'
          );
        }
      }

      setSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Account Preferences</h2>
      <p>Customize your account settings and preferences</p>

      <form className={styles.preferencesForm} onSubmit={handleSubmit}>
        {/* Email Notifications */}
        <div>
          <h3>Email Notifications</h3>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="orderUpdates"
              name="orderUpdates"
              checked={preferences.emailNotifications.orderUpdates}
              onChange={handleEmailNotificationChange}
            />
            <label htmlFor="orderUpdates">Order updates and shipping notifications</label>
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="promotions"
              name="promotions"
              checked={preferences.emailNotifications.promotions}
              onChange={handleEmailNotificationChange}
            />
            <label htmlFor="promotions">Promotions and discounts</label>
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="newProducts"
              name="newProducts"
              checked={preferences.emailNotifications.newProducts}
              onChange={handleEmailNotificationChange}
            />
            <label htmlFor="newProducts">New product announcements</label>
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="blog"
              name="blog"
              checked={preferences.emailNotifications.blog}
              onChange={handleEmailNotificationChange}
            />
            <label htmlFor="blog">Blog posts and repair guides</label>
          </div>
        </div>

        {/* Display Preferences */}
        <div>
          <h3>Display Preferences</h3>

          <div className={styles.formGroup}>
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              name="theme"
              value={preferences.displayPreferences.theme}
              onChange={handleDisplayPreferenceChange}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
            <p className={styles.helperText}>
              {preferences.displayPreferences.theme === 'light' ? 'Using light theme' :
                preferences.displayPreferences.theme === 'dark' ? 'Using dark theme' :
                  'Using your system preferences'}
            </p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              name="currency"
              value={preferences.displayPreferences.currency}
              onChange={handleDisplayPreferenceChange}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="BRL">BRL - Brazilian Real</option>
              <option value="RUB">RUB - Russian Ruble</option>
              <option value="KRW">KRW - South Korean Won</option>
              <option value="CHF">CHF - Swiss Franc</option>
              <option value="SGD">SGD - Singapore Dollar</option>
              <option value="NZD">NZD - New Zealand Dollar</option>
              <option value="MXN">MXN - Mexican Peso</option>
              <option value="HKD">HKD - Hong Kong Dollar</option>
              <option value="SEK">SEK - Swedish Krona</option>
              <option value="NOK">NOK - Norwegian Krone</option>
              <option value="DKK">DKK - Danish Krone</option>
              <option value="PLN">PLN - Polish Złoty</option>
              <option value="ZAR">ZAR - South African Rand</option>
              <option value="AED">AED - United Arab Emirates Dirham</option>
              <option value="SAR">SAR - Saudi Riyal</option>
              <option value="BTC">BTC - Bitcoin</option>
              <option value="ETH">ETH - Ethereum</option>
            </select>
            <p className={styles.helperText}>
              Currency conversion is applied at checkout based on current exchange rates
            </p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="language">Language</label>
            <select
              id="language"
              name="language"
              value={preferences.displayPreferences.language}
              onChange={handleDisplayPreferenceChange}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="pt">Português</option>
              <option value="ru">Русский</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          <div className={styles.divider}></div>

          {/* Currency Converter */}
          <CurrencyConverter />
        </div>

        {/* Privacy Settings */}
        <div>
          <h3>Privacy Settings</h3>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="shareDataForAnalytics"
              name="shareDataForAnalytics"
              checked={preferences.privacySettings.shareDataForAnalytics}
              onChange={handlePrivacySettingChange}
            />
            <label htmlFor="shareDataForAnalytics">
              Share anonymous usage data to help us improve our services
            </label>
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="allowPersonalization"
              name="allowPersonalization"
              checked={preferences.privacySettings.allowPersonalization}
              onChange={handlePrivacySettingChange}
            />
            <label htmlFor="allowPersonalization">
              Allow personalized product recommendations based on your browsing history
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <button
          type="submit"
          className={styles.saveButton}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>

        {success && (
          <div className={styles.successMessage}>
            Your preferences have been saved successfully.
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default AccountPreferences;
