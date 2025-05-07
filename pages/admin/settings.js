import React from 'react';
import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import styles from '../../styles/AdminPages.module.css';

export default function AdminSettings() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    store_name: '',
    store_email: '',
    store_phone: '',
    store_address: '',
    currency: 'USD',
    tax_rate: 0,
  });

  // Shipping settings
  const [shippingSettings, setShippingSettings] = useState({
    enable_shipping: true,
    free_shipping_threshold: 500,
    shipping_rates: [
      { name: 'Standard Shipping', price: 5.99, days: '3-5' },
      { name: 'Express Shipping', price: 12.99, days: '1-2' },
    ],
  });

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    enable_stripe: true,
    stripe_publishable_key: '',
    stripe_secret_key: '',
    enable_paypal: false,
    paypal_client_id: '',
    paypal_secret: '',
  });

  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    email_from: '',
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_password: '',
    smtp_secure: true,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    enable_2fa: false,
    enable_captcha: false,
    captcha_site_key: '',
    captcha_secret_key: '',
    password_min_length: 8,
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_number: true,
    password_require_special: true,
  });

  const router = useRouter();

  useEffect(() => {
    fetchSettings();
  }, [activeTab]);

  async function fetchSettings() {
    try {
      setLoading(true);

      // Fetch settings based on active tab
      const response = await fetch(`/api/admin/settings/${activeTab}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${activeTab} settings`);
      }

      const data = await response.json();

      // Update state based on active tab
      switch (activeTab) {
        case 'general':
          setGeneralSettings(data.settings);
          break;
        case 'shipping':
          setShippingSettings(data.settings);
          break;
        case 'payment':
          setPaymentSettings(data.settings);
          break;
        case 'email':
          setEmailSettings(data.settings);
          break;
        case 'security':
          setSecuritySettings(data.settings);
          break;
      }

      setLoading(false);
    } catch (error) {
      console.error(`Error fetching ${activeTab} settings:`, error);
      setError(`Failed to load ${activeTab} settings. Please try again.`);
      setLoading(false);
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setSuccess('');
      setError('');

      // Get current settings based on active tab
      let settings;
      switch (activeTab) {
        case 'general':
          settings = generalSettings;
          break;
        case 'shipping':
          settings = shippingSettings;
          break;
        case 'payment':
          settings = paymentSettings;
          break;
        case 'email':
          settings = emailSettings;
          break;
        case 'security':
          settings = securitySettings;
          break;
      }

      // Save settings
      const response = await fetch(`/api/admin/settings/${activeTab}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save ${activeTab} settings`);
      }

      setSuccess(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings saved successfully!`);
      setSaving(false);

      // Refresh settings
      fetchSettings();
    } catch (error) {
      console.error(`Error saving ${activeTab} settings:`, error);
      setError(`Failed to save ${activeTab} settings. Please try again.`);
      setSaving(false);
    }
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: name === 'tax_rate' ? parseFloat(value) : value,
    });
  };

  const handleShippingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShippingSettings({
      ...shippingSettings,
      [name]: type === 'checkbox' ? checked : name === 'free_shipping_threshold' ? parseFloat(value) : value,
    });
  };

  const handleShippingRateChange = (index, field, value) => {
    const updatedRates = [...shippingSettings.shipping_rates];
    updatedRates[index] = {
      ...updatedRates[index],
      [field]: field === 'price' ? parseFloat(value) : value,
    };
    setShippingSettings({
      ...shippingSettings,
      shipping_rates: updatedRates,
    });
  };

  const addShippingRate = () => {
    setShippingSettings({
      ...shippingSettings,
      shipping_rates: [
        ...shippingSettings.shipping_rates,
        { name: 'New Shipping Option', price: 0, days: '3-5' },
      ],
    });
  };

  const removeShippingRate = (index) => {
    const updatedRates = [...shippingSettings.shipping_rates];
    updatedRates.splice(index, 1);
    setShippingSettings({
      ...shippingSettings,
      shipping_rates: updatedRates,
    });
  };

  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentSettings({
      ...paymentSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleEmailChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: type === 'checkbox' ? checked : name === 'smtp_port' ? parseInt(value) : value,
    });
  };

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings({
      ...securitySettings,
      [name]: type === 'checkbox' ? checked : name === 'password_min_length' ? parseInt(value) : value,
    });
  };

  const renderGeneralSettings = () => (
    <div className={styles.settingsForm}>
      <div className={styles.formGroup}>
        <label htmlFor="store_name">Store Name</label>
        <input
          type="text"
          id="store_name"
          name="store_name"
          value={generalSettings.store_name}
          onChange={handleGeneralChange}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="store_email">Store Email</label>
        <input
          type="email"
          id="store_email"
          name="store_email"
          value={generalSettings.store_email}
          onChange={handleGeneralChange}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="store_phone">Store Phone</label>
        <input
          type="text"
          id="store_phone"
          name="store_phone"
          value={generalSettings.store_phone}
          onChange={handleGeneralChange}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="store_address">Store Address</label>
        <textarea
          id="store_address"
          name="store_address"
          value={generalSettings.store_address}
          onChange={handleGeneralChange}
          className={styles.textarea}
          rows={3}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="currency">Currency</label>
        <select
          id="currency"
          name="currency"
          value={generalSettings.currency}
          onChange={handleGeneralChange}
          className={styles.select}
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="CAD">CAD (C$)</option>
          <option value="AUD">AUD (A$)</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="tax_rate">Tax Rate (%)</label>
        <input
          type="number"
          id="tax_rate"
          name="tax_rate"
          value={generalSettings.tax_rate}
          onChange={handleGeneralChange}
          className={styles.input}
          min="0"
          step="0.01"
        />
      </div>
    </div>
  );

  const renderShippingSettings = () => (
    <div className={styles.settingsForm}>
      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="enable_shipping"
            checked={shippingSettings.enable_shipping}
            onChange={handleShippingChange}
          />
          Enable Shipping
        </label>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="free_shipping_threshold">Free Shipping Threshold ($)</label>
        <input
          type="number"
          id="free_shipping_threshold"
          name="free_shipping_threshold"
          value={shippingSettings.free_shipping_threshold}
          onChange={handleShippingChange}
          className={styles.input}
          min="0"
          step="0.01"
        />
        <p className={styles.helpText}>Set to 0 to disable free shipping</p>
      </div>

      <h3>Shipping Rates</h3>

      {shippingSettings.shipping_rates.map((rate, index) => (
        <div key={index} className={styles.shippingRate}>
          <div className={styles.formGroup}>
            <label htmlFor={`rate_name_${index}`}>Shipping Option Name</label>
            <input
              type="text"
              id={`rate_name_${index}`}
              value={rate.name}
              onChange={(e) => handleShippingRateChange(index, 'name', e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor={`rate_price_${index}`}>Price ($)</label>
              <input
                type="number"
                id={`rate_price_${index}`}
                value={rate.price}
                onChange={(e) => handleShippingRateChange(index, 'price', e.target.value)}
                className={styles.input}
                min="0"
                step="0.01"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor={`rate_days_${index}`}>Delivery Time (days)</label>
              <input
                type="text"
                id={`rate_days_${index}`}
                value={rate.days}
                onChange={(e) => handleShippingRateChange(index, 'days', e.target.value)}
                className={styles.input}
                placeholder="e.g. 3-5"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeShippingRate(index)}
            className={styles.removeButton}
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addShippingRate}
        className={styles.addButton}
      >
        Add Shipping Option
      </button>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className={styles.settingsForm}>
      <div className={styles.paymentSection}>
        <h3>Stripe</h3>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="enable_stripe"
              checked={paymentSettings.enable_stripe}
              onChange={handlePaymentChange}
            />
            Enable Stripe Payments
          </label>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="stripe_publishable_key">Stripe Publishable Key</label>
          <input
            type="text"
            id="stripe_publishable_key"
            name="stripe_publishable_key"
            value={paymentSettings.stripe_publishable_key}
            onChange={handlePaymentChange}
            className={styles.input}
            disabled={!paymentSettings.enable_stripe}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="stripe_secret_key">Stripe Secret Key</label>
          <input
            type="password"
            id="stripe_secret_key"
            name="stripe_secret_key"
            value={paymentSettings.stripe_secret_key}
            onChange={handlePaymentChange}
            className={styles.input}
            disabled={!paymentSettings.enable_stripe}
          />
        </div>
      </div>

      <div className={styles.paymentSection}>
        <h3>PayPal</h3>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="enable_paypal"
              checked={paymentSettings.enable_paypal}
              onChange={handlePaymentChange}
            />
            Enable PayPal Payments
          </label>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="paypal_client_id">PayPal Client ID</label>
          <input
            type="text"
            id="paypal_client_id"
            name="paypal_client_id"
            value={paymentSettings.paypal_client_id}
            onChange={handlePaymentChange}
            className={styles.input}
            disabled={!paymentSettings.enable_paypal}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="paypal_secret">PayPal Secret</label>
          <input
            type="password"
            id="paypal_secret"
            name="paypal_secret"
            value={paymentSettings.paypal_secret}
            onChange={handlePaymentChange}
            className={styles.input}
            disabled={!paymentSettings.enable_paypal}
          />
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className={styles.settingsForm}>
      <div className={styles.formGroup}>
        <label htmlFor="email_from">From Email Address</label>
        <input
          type="email"
          id="email_from"
          name="email_from"
          value={emailSettings.email_from}
          onChange={handleEmailChange}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="smtp_host">SMTP Host</label>
        <input
          type="text"
          id="smtp_host"
          name="smtp_host"
          value={emailSettings.smtp_host}
          onChange={handleEmailChange}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="smtp_port">SMTP Port</label>
        <input
          type="number"
          id="smtp_port"
          name="smtp_port"
          value={emailSettings.smtp_port}
          onChange={handleEmailChange}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="smtp_user">SMTP Username</label>
        <input
          type="text"
          id="smtp_user"
          name="smtp_user"
          value={emailSettings.smtp_user}
          onChange={handleEmailChange}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="smtp_password">SMTP Password</label>
        <input
          type="password"
          id="smtp_password"
          name="smtp_password"
          value={emailSettings.smtp_password}
          onChange={handleEmailChange}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="smtp_secure"
            checked={emailSettings.smtp_secure}
            onChange={handleEmailChange}
          />
          Use Secure Connection (TLS)
        </label>
      </div>

      <button
        type="button"
        className={styles.testButton}
        onClick={() => alert('Test email functionality will be implemented soon.')}
      >
        Send Test Email
      </button>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className={styles.settingsForm}>
      <div className={styles.securitySection}>
        <h3>Two-Factor Authentication</h3>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="enable_2fa"
              checked={securitySettings.enable_2fa}
              onChange={handleSecurityChange}
            />
            Enable Two-Factor Authentication
          </label>
          <p className={styles.helpText}>
            Require administrators to use two-factor authentication when logging in
          </p>
        </div>
      </div>

      <div className={styles.securitySection}>
        <h3>CAPTCHA Protection</h3>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="enable_captcha"
              checked={securitySettings.enable_captcha}
              onChange={handleSecurityChange}
            />
            Enable CAPTCHA on Forms
          </label>
          <p className={styles.helpText}>
            Add CAPTCHA verification to login, registration, and contact forms
          </p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="captcha_site_key">reCAPTCHA Site Key</label>
          <input
            type="text"
            id="captcha_site_key"
            name="captcha_site_key"
            value={securitySettings.captcha_site_key}
            onChange={handleSecurityChange}
            className={styles.input}
            disabled={!securitySettings.enable_captcha}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="captcha_secret_key">reCAPTCHA Secret Key</label>
          <input
            type="password"
            id="captcha_secret_key"
            name="captcha_secret_key"
            value={securitySettings.captcha_secret_key}
            onChange={handleSecurityChange}
            className={styles.input}
            disabled={!securitySettings.enable_captcha}
          />
        </div>
      </div>

      <div className={styles.securitySection}>
        <h3>Password Requirements</h3>

        <div className={styles.formGroup}>
          <label htmlFor="password_min_length">Minimum Password Length</label>
          <input
            type="number"
            id="password_min_length"
            name="password_min_length"
            value={securitySettings.password_min_length}
            onChange={handleSecurityChange}
            className={styles.input}
            min="6"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="password_require_uppercase"
              checked={securitySettings.password_require_uppercase}
              onChange={handleSecurityChange}
            />
            Require Uppercase Letter
          </label>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="password_require_lowercase"
              checked={securitySettings.password_require_lowercase}
              onChange={handleSecurityChange}
            />
            Require Lowercase Letter
          </label>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="password_require_number"
              checked={securitySettings.password_require_number}
              onChange={handleSecurityChange}
            />
            Require Number
          </label>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="password_require_special"
              checked={securitySettings.password_require_special}
              onChange={handleSecurityChange}
            />
            Require Special Character
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Settings | Admin Dashboard</title>
      </Head>

      <AdminLayout>
        <div className={styles.pageHeader}>
          <h1>Settings</h1>
        </div>

        <div className={styles.settingsContainer}>
          <div className={styles.settingsTabs}>
            <button
              className={`${styles.tabButton} ${activeTab === 'general' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'shipping' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Shipping
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'payment' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              Payment
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'email' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('email')}
            >
              Email
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'security' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </div>

          <div className={styles.settingsContent}>
            {success && <div className={styles.successMessage}>{success}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}

            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading settings...</p>
              </div>
            ) : (
              <>
                {activeTab === 'general' && renderGeneralSettings()}
                {activeTab === 'shipping' && renderShippingSettings()}
                {activeTab === 'payment' && renderPaymentSettings()}
                {activeTab === 'email' && renderEmailSettings()}
                {activeTab === 'security' && renderSecuritySettings()}

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className={styles.saveButton}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin?callbackUrl=/admin/settings',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}
