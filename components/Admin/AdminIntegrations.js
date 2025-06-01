import React, { useState } from 'react';
import styles from '../../styles/Admin.module.css';

const AdminIntegrations = () => {
  // Zapier integration state
  const [zapierStatus, setZapierStatus] = useState('connected');
  const [zapierKey, setZapierKey] = useState('zap_123456789abcdef');
  const [zapierWebhooks, setZapierWebhooks] = useState([
    { id: 1, name: 'New Order', url: 'https://hooks.zapier.com/hooks/catch/123456/abcdef/', active: true },
    { id: 2, name: 'Low Inventory Alert', url: 'https://hooks.zapier.com/hooks/catch/123456/ghijkl/', active: true },
    { id: 3, name: 'Customer Support Request', url: 'https://hooks.zapier.com/hooks/catch/123456/mnopqr/', active: false }
  ]);

  // Notion integration state
  const [notionStatus, setNotionStatus] = useState('connected');
  const [notionKey, setNotionKey] = useState('secret_123456789abcdef');
  const [notionDatabases, setNotionDatabases] = useState([
    { id: 1, name: 'Inventory', databaseId: 'abc123def456', active: true },
    { id: 2, name: 'Orders', databaseId: 'ghi789jkl012', active: true },
    { id: 3, name: 'Customers', databaseId: 'mno345pqr678', active: false }
  ]);

  // n8n integration state
  const [n8nStatus, setN8nStatus] = useState('connected');
  const [n8nUrl, setN8nUrl] = useState('https://n8n.mdtstech.store');
  const [n8nKey, setN8nKey] = useState('n8n_api_123456789abcdef');
  const [n8nWorkflows, setN8nWorkflows] = useState([
    { id: 1, name: 'Order Processing', workflowId: 'wf_123456', active: true },
    { id: 2, name: 'Inventory Sync', workflowId: 'wf_234567', active: true },
    { id: 3, name: 'Customer Notifications', workflowId: 'wf_345678', active: true },
    { id: 4, name: 'Supplier Orders', workflowId: 'wf_456789', active: false }
  ]);

  // 4seller integration state
  const [fourSellerStatus, setFourSellerStatus] = useState('connected');
  const [fourSellerKey, setFourSellerKey] = useState('4s_api_123456789abcdef');
  const [fourSellerStores, setFourSellerStores] = useState([
    { id: 1, name: 'Main Store', storeId: 'store_123456', active: true },
    { id: 2, name: 'Wholesale Store', storeId: 'store_234567', active: false }
  ]);

  // Marketplace integrations state
  const [amazonStatus, setAmazonStatus] = useState('connected');
  const [ebayStatus, setEbayStatus] = useState('connected');
  const [tiktokStatus, setTiktokStatus] = useState('disconnected');

  const [amazonAccounts, setAmazonAccounts] = useState([
    { id: 1, name: 'US Marketplace', accountId: 'amzn_123456', active: true },
    { id: 2, name: 'Canada Marketplace', accountId: 'amzn_234567', active: false }
  ]);

  const [ebayAccounts, setEbayAccounts] = useState([
    { id: 1, name: 'Main eBay Store', accountId: 'ebay_123456', active: true }
  ]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('automation');

  const handleZapierConnect = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setZapierStatus('connected');
      setLoading(false);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleNotionConnect = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setNotionStatus('connected');
      setLoading(false);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleZapierDisconnect = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setZapierStatus('disconnected');
      setLoading(false);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleNotionDisconnect = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setNotionStatus('disconnected');
      setLoading(false);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };

  // n8n handlers
  const handleN8nConnect = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setN8nStatus('connected');
      setLoading(false);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleN8nDisconnect = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setN8nStatus('disconnected');
      setLoading(false);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };

  // 4seller handlers
  const handleFourSellerConnect = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setFourSellerStatus('connected');
      setLoading(false);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleFourSellerDisconnect = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setFourSellerStatus('disconnected');
      setLoading(false);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };

  // Marketplace handlers
  const handleAmazonConnect = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setAmazonStatus('connected');
      setLoading(false);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleAmazonDisconnect = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setAmazonStatus('disconnected');
      setLoading(false);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleEbayConnect = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setEbayStatus('connected');
      setLoading(false);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleEbayDisconnect = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setEbayStatus('disconnected');
      setLoading(false);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleTiktokConnect = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setTiktokStatus('connected');
      setLoading(false);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleTiktokDisconnect = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setTiktokStatus('disconnected');
      setLoading(false);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };

  // Toggle functions
  const toggleZapierWebhook = (id) => {
    setZapierWebhooks(prevWebhooks =>
      prevWebhooks.map(webhook =>
        webhook.id === id ? { ...webhook, active: !webhook.active } : webhook
      )
    );
  };

  const toggleNotionDatabase = (id) => {
    setNotionDatabases(prevDatabases =>
      prevDatabases.map(database =>
        database.id === id ? { ...database, active: !database.active } : database
      )
    );
  };

  const toggleN8nWorkflow = (id) => {
    setN8nWorkflows(prevWorkflows =>
      prevWorkflows.map(workflow =>
        workflow.id === id ? { ...workflow, active: !workflow.active } : workflow
      )
    );
  };

  const toggleFourSellerStore = (id) => {
    setFourSellerStores(prevStores =>
      prevStores.map(store =>
        store.id === id ? { ...store, active: !store.active } : store
      )
    );
  };

  const toggleAmazonAccount = (id) => {
    setAmazonAccounts(prevAccounts =>
      prevAccounts.map(account =>
        account.id === id ? { ...account, active: !account.active } : account
      )
    );
  };

  const toggleEbayAccount = (id) => {
    setEbayAccounts(prevAccounts =>
      prevAccounts.map(account =>
        account.id === id ? { ...account, active: !account.active } : account
      )
    );
  };

  return (
    <div className={styles.adminSection}>
      <h2>Integrations</h2>
      <p className={styles.sectionDescription}>
        Connect your store with third-party services to automate workflows and manage data.
      </p>

      {success && (
        <div className={styles.successMessage}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <p>Integration settings updated successfully!</p>
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>{error}</p>
        </div>
      )}

      <div className={styles.integrationCards}>
        {/* Zapier Integration */}
        <div className={styles.integrationCard}>
          <div className={styles.integrationHeader}>
            <div className={styles.integrationLogo}>
              <img src="/images/zapier-logo.png" alt="Zapier Logo" />
            </div>
            <div className={styles.integrationInfo}>
              <h3>Zapier</h3>
              <p>Connect your store with 3,000+ apps</p>
              <div className={styles.integrationStatus}>
                <span className={`${styles.statusIndicator} ${zapierStatus === 'connected' ? styles.connected : styles.disconnected}`}></span>
                <span>{zapierStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>

          <div className={styles.integrationBody}>
            {zapierStatus === 'connected' ? (
              <>
                <div className={styles.integrationField}>
                  <label>API Key</label>
                  <div className={styles.apiKeyField}>
                    <input
                      type="password"
                      value={zapierKey}
                      readOnly
                    />
                    <button
                      className={styles.copyButton}
                      onClick={() => {
                        navigator.clipboard.writeText(zapierKey);
                        setSuccess(true);
                        setTimeout(() => setSuccess(false), 3000);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className={styles.webhooksList}>
                  <h4>Active Webhooks</h4>
                  {zapierWebhooks.map(webhook => (
                    <div key={webhook.id} className={styles.webhookItem}>
                      <div className={styles.webhookInfo}>
                        <span className={styles.webhookName}>{webhook.name}</span>
                        <span className={styles.webhookUrl}>{webhook.url}</span>
                      </div>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={webhook.active}
                          onChange={() => toggleZapierWebhook(webhook.id)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  className={styles.disconnectButton}
                  onClick={handleZapierDisconnect}
                  disabled={loading}
                >
                  {loading ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </>
            ) : (
              <div className={styles.connectContainer}>
                <p>Connect your Zapier account to automate workflows and integrate with thousands of apps.</p>
                <button
                  className={styles.connectButton}
                  onClick={handleZapierConnect}
                  disabled={loading}
                >
                  {loading ? 'Connecting...' : 'Connect with Zapier'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notion Integration */}
        <div className={styles.integrationCard}>
          <div className={styles.integrationHeader}>
            <div className={styles.integrationLogo}>
              <img src="/images/notion-logo.png" alt="Notion Logo" />
            </div>
            <div className={styles.integrationInfo}>
              <h3>Notion</h3>
              <p>Sync your store data with Notion databases</p>
              <div className={styles.integrationStatus}>
                <span className={`${styles.statusIndicator} ${notionStatus === 'connected' ? styles.connected : styles.disconnected}`}></span>
                <span>{notionStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>

          <div className={styles.integrationBody}>
            {notionStatus === 'connected' ? (
              <>
                <div className={styles.integrationField}>
                  <label>API Key</label>
                  <div className={styles.apiKeyField}>
                    <input
                      type="password"
                      value={notionKey}
                      readOnly
                    />
                    <button
                      className={styles.copyButton}
                      onClick={() => {
                        navigator.clipboard.writeText(notionKey);
                        setSuccess(true);
                        setTimeout(() => setSuccess(false), 3000);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className={styles.databasesList}>
                  <h4>Connected Databases</h4>
                  {notionDatabases.map(database => (
                    <div key={database.id} className={styles.databaseItem}>
                      <div className={styles.databaseInfo}>
                        <span className={styles.databaseName}>{database.name}</span>
                        <span className={styles.databaseId}>{database.databaseId}</span>
                      </div>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={database.active}
                          onChange={() => toggleNotionDatabase(database.id)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  className={styles.disconnectButton}
                  onClick={handleNotionDisconnect}
                  disabled={loading}
                >
                  {loading ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </>
            ) : (
              <div className={styles.connectContainer}>
                <p>Connect your Notion workspace to sync inventory, orders, and customer data.</p>
                <button
                  className={styles.connectButton}
                  onClick={handleNotionConnect}
                  disabled={loading}
                >
                  {loading ? 'Connecting...' : 'Connect with Notion'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.integrationHelp}>
        <h3>Need help with integrations?</h3>
        <p>Check out our <a href="/docs/integrations" target="_blank">integration documentation</a> or <a href="/contact" target="_blank">contact support</a> for assistance.</p>
      </div>
    </div>
  );
};

export default AdminIntegrations;
