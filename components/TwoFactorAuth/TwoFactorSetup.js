import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from './TwoFactorAuth.module.css';

const TwoFactorSetup = () => {
  const { data: session } = useSession();
  const [settings, setSettings] = useState({
    enabled: false,
    preferred_method: null,
    email_enabled: false,
    sms_enabled: false,
    duo_enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchSettings();
      fetchUserPhone();
    }
  }, [session]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/2fa/settings');

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to fetch 2FA settings');
      }
    } catch (err) {
      setError('An error occurred while fetching 2FA settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPhone = async () => {
    try {
      const response = await fetch('/api/user/profile');

      if (response.ok) {
        const data = await response.json();
        setPhoneNumber(data.user.phone_number || '');
      }
    } catch (err) {
      console.error('Error fetching user phone number:', err);
    }
  };

  const handleToggle2FA = async () => {
    try {
      setError('');
      setSuccess('');

      // If enabling 2FA, make sure at least one method is selected
      if (!settings.enabled && !settings.email_enabled && !settings.sms_enabled && !settings.duo_enabled) {
        setError('Please enable at least one verification method');
        return;
      }

      const response = await fetch('/api/user/2fa/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          enabled: !settings.enabled,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setSuccess(settings.enabled ? '2FA has been disabled' : '2FA has been enabled');

        // Generate backup codes if enabling 2FA
        if (!settings.enabled) {
          generateBackupCodes();
        }
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to update 2FA settings');
      }
    } catch (err) {
      setError('An error occurred while updating 2FA settings');
      console.error(err);
    }
  };

  const handleMethodToggle = async (method) => {
    try {
      setError('');
      setSuccess('');

      // Check if phone number is provided for SMS
      if (method === 'sms' && !settings.sms_enabled && !phoneNumber) {
        setError('Please add a phone number in your profile before enabling SMS verification');
        return;
      }

      const updatedSettings = {
        ...settings,
        [`${method}_enabled`]: !settings[`${method}_enabled`],
      };

      // If disabling the preferred method, reset it
      if (settings.preferred_method === method && !updatedSettings[`${method}_enabled`]) {
        updatedSettings.preferred_method = null;
      }

      // If enabling the first method, set it as preferred
      if (!settings.email_enabled && !settings.sms_enabled && !settings.duo_enabled && updatedSettings[`${method}_enabled`]) {
        updatedSettings.preferred_method = method;
      }

      const response = await fetch('/api/user/2fa/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setSuccess(`${method.toUpperCase()} verification has been ${updatedSettings[`${method}_enabled`] ? 'enabled' : 'disabled'}`);
      } else {
        const error = await response.json();
        setError(error.message || `Failed to update ${method} settings`);
      }
    } catch (err) {
      setError(`An error occurred while updating ${method} settings`);
      console.error(err);
    }
  };

  const handlePreferredMethodChange = async (method) => {
    try {
      setError('');
      setSuccess('');

      // Make sure the method is enabled
      if (!settings[`${method}_enabled`]) {
        setError(`${method.toUpperCase()} verification is not enabled`);
        return;
      }

      const response = await fetch('/api/user/2fa/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          preferred_method: method,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setSuccess(`${method.toUpperCase()} is now your preferred verification method`);
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to update preferred method');
      }
    } catch (err) {
      setError('An error occurred while updating preferred method');
      console.error(err);
    }
  };

  const generateBackupCodes = async () => {
    try {
      setError('');
      setSuccess('');

      const response = await fetch('/api/user/2fa/backup-codes', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setBackupCodes(data.codes);
        setShowBackupCodes(true);
        setSuccess('Backup codes generated successfully');
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to generate backup codes');
      }
    } catch (err) {
      setError('An error occurred while generating backup codes');
      console.error(err);
    }
  };

  const testVerification = async (method) => {
    try {
      setError('');
      setSuccess('');

      const response = await fetch('/api/user/2fa/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method }),
      });

      if (response.ok) {
        setSuccess(`Test verification sent to your ${method === 'email' ? 'email' : 'phone'}`);
      } else {
        const error = await response.json();
        setError(error.message || `Failed to send test ${method} verification`);
      }
    } catch (err) {
      setError(`An error occurred while sending test ${method} verification`);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading 2FA settings...</p>
      </div>
    );
  }

  return (
    <div className={styles.twoFactorSetup}>
      <h2>Two-Factor Authentication</h2>
      <p className={styles.description}>
        Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
      </p>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.toggleContainer}>
        <label className={styles.toggle}>
          <span>Enable Two-Factor Authentication</span>
          <div className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={handleToggle2FA}
            />
            <span className={styles.slider}></span>
          </div>
        </label>
      </div>

      <div className={styles.methodsContainer}>
        <h3>Verification Methods</h3>
        <p>Choose one or more verification methods:</p>

        <div className={styles.method}>
          <label className={styles.toggle}>
            <span>Email Verification</span>
            <div className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={settings.email_enabled}
                onChange={() => handleMethodToggle('email')}
              />
              <span className={styles.slider}></span>
            </div>
          </label>
          <p className={styles.methodDescription}>
            Receive verification codes via email at {session?.user?.email}
          </p>
          {settings.email_enabled && (
            <button
              className={styles.testButton}
              onClick={() => testVerification('email')}
            >
              Send Test Email
            </button>
          )}
        </div>

        <div className={styles.method}>
          <label className={styles.toggle}>
            <span>SMS Verification</span>
            <div className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={settings.sms_enabled}
                onChange={() => handleMethodToggle('sms')}
              />
              <span className={styles.slider}></span>
            </div>
          </label>
          <p className={styles.methodDescription}>
            Receive verification codes via SMS at {phoneNumber || 'No phone number added'}
            {!phoneNumber && (
              <Link href="/user/profile" className={styles.addPhoneLink}>
                Add phone number
              </Link>
            )}
          </p>
          {settings.sms_enabled && (
            <button
              className={styles.testButton}
              onClick={() => testVerification('sms')}
            >
              Send Test SMS
            </button>
          )}
        </div>

        <div className={styles.method}>
          <label className={styles.toggle}>
            <span>DUO Security</span>
            <div className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={settings.duo_enabled}
                onChange={() => handleMethodToggle('duo')}
              />
              <span className={styles.slider}></span>
            </div>
          </label>
          <p className={styles.methodDescription}>
            Use DUO Security mobile app for push notifications
          </p>
          {settings.duo_enabled && (
            <a
              href="https://duo.com/product/multi-factor-authentication-mfa/duo-mobile-app"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.duoLink}
            >
              Download DUO Mobile App
            </a>
          )}
        </div>
      </div>

      {(settings.email_enabled || settings.sms_enabled || settings.duo_enabled) && (
        <div className={styles.preferredMethod}>
          <h3>Preferred Method</h3>
          <p>Select your preferred verification method:</p>

          <div className={styles.radioGroup}>
            {settings.email_enabled && (
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="preferred_method"
                  value="email"
                  checked={settings.preferred_method === 'email'}
                  onChange={() => handlePreferredMethodChange('email')}
                />
                <span>Email</span>
              </label>
            )}

            {settings.sms_enabled && (
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="preferred_method"
                  value="sms"
                  checked={settings.preferred_method === 'sms'}
                  onChange={() => handlePreferredMethodChange('sms')}
                />
                <span>SMS</span>
              </label>
            )}

            {settings.duo_enabled && (
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="preferred_method"
                  value="duo"
                  checked={settings.preferred_method === 'duo'}
                  onChange={() => handlePreferredMethodChange('duo')}
                />
                <span>DUO Security</span>
              </label>
            )}
          </div>
        </div>
      )}

      {settings.enabled && (
        <div className={styles.backupCodes}>
          <h3>Backup Codes</h3>
          <p>
            Backup codes can be used to access your account if you cannot receive verification codes.
            Each code can only be used once.
          </p>

          <button
            className={styles.generateButton}
            onClick={generateBackupCodes}
          >
            Generate New Backup Codes
          </button>

          {showBackupCodes && backupCodes.length > 0 && (
            <div className={styles.codesContainer}>
              <p className={styles.warning}>
                Save these backup codes in a secure location. They will not be shown again!
              </p>

              <div className={styles.codes}>
                {backupCodes.map((code, index) => (
                  <div key={index} className={styles.code}>
                    {code}
                  </div>
                ))}
              </div>

              <button
                className={styles.printButton}
                onClick={() => window.print()}
              >
                Print Backup Codes
              </button>

              <button
                className={styles.closeButton}
                onClick={() => setShowBackupCodes(false)}
              >
                I've Saved These Codes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;
