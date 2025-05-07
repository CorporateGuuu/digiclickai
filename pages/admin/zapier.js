import React from 'react';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';

const ZapierAdminPage = () => {
  const [zapierStatus, setZapierStatus] = useState('not_configured');
  const [activeTab, setActiveTab] = useState('webhooks');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [webhooks, setWebhooks] = useState([
    { id: 'new_order', name: 'New Order', url: '', enabled: false, lastTriggered: null },
    { id: 'low_inventory', name: 'Low Inventory Alert', url: '', enabled: false, lastTriggered: null },
    { id: 'new_customer', name: 'New Customer', url: '', enabled: false, lastTriggered: null },
    { id: 'abandoned_cart', name: 'Abandoned Cart', url: '', enabled: false, lastTriggered: null },
    { id: 'product_review', name: 'Product Review', url: '', enabled: false, lastTriggered: null },
    { id: 'support_request', name: 'Support Request', url: '', enabled: false, lastTriggered: null }
  ]);
  const [automations, setAutomations] = useState([
    {
      id: 'auto-1',
      name: 'Order Confirmation Email',
      description: 'Send an email when a new order is placed',
      trigger: 'New Order',
      action: 'Send Email',
      enabled: true,
      lastRun: '2023-05-15 14:32:45'
    },
    {
      id: 'auto-2',
      name: 'Low Stock Notification',
      description: 'Notify team when product stock is low',
      trigger: 'Low Inventory Alert',
      action: 'Send Slack Message',
      enabled: true,
      lastRun: '2023-05-14 09:15:22'
    },
    {
      id: 'auto-3',
      name: 'Welcome Email Sequence',
      description: 'Send welcome emails to new customers',
      trigger: 'New Customer',
      action: 'Add to Email Sequence',
      enabled: false,
      lastRun: null
    },
    {
      id: 'auto-4',
      name: 'Abandoned Cart Recovery',
      description: 'Send reminder email for abandoned carts',
      trigger: 'Abandoned Cart',
      action: 'Send Email',
      enabled: true,
      lastRun: '2023-05-15 10:45:18'
    }
  ]);
  const [logs, setLogs] = useState([
    {
      id: 'log-1',
      event: 'New Order',
      status: 'success',
      message: 'Order #ORD-5289 processed successfully',
      timestamp: '2023-05-15 14:32:45'
    },
    {
      id: 'log-2',
      event: 'Low Inventory Alert',
      status: 'success',
      message: 'Low stock alert for "iPhone 13 Pro Screen" sent to Slack',
      timestamp: '2023-05-14 09:15:22'
    },
    {
      id: 'log-3',
      event: 'Abandoned Cart',
      status: 'success',
      message: 'Reminder email sent for cart #CART-1234',
      timestamp: '2023-05-15 10:45:18'
    },
    {
      id: 'log-4',
      event: 'Product Review',
      status: 'error',
      message: 'Failed to process review: Webhook returned 404',
      timestamp: '2023-05-13 16:22:10'
    }
  ]);

  // Simulate checking Zapier configuration status
  useEffect(() => {
    const checkZapierConfig = async () => {
      // In a real app, you would check if the Zapier webhooks are configured
      const hasZapierConfig = process.env.ZAPIER_WEBHOOK_NEW_ORDER &&
        process.env.ZAPIER_WEBHOOK_LOW_INVENTORY;

      setZapierStatus(hasZapierConfig ? 'configured' : 'not_configured');

      // If configured, update webhook URLs
      if (hasZapierConfig) {
        setWebhooks(prev => prev.map(webhook => ({
          ...webhook,
          url: process.env[`ZAPIER_WEBHOOK_${webhook.id.toUpperCase()}`] || '',
          enabled: !!process.env[`ZAPIER_WEBHOOK_${webhook.id.toUpperCase()}`]
        })));
      }
    };

    checkZapierConfig();
  }, []);

  const handleWebhookChange = (id, field, value) => {
    setWebhooks(prev => prev.map(webhook =>
      webhook.id === id ? { ...webhook, [field]: value } : webhook
    ));
  };

  const handleSaveWebhooks = async () => {
    setLoading(true);
    setError('');

    try {
      // In a real app, this would save the webhooks to your backend
      // For demo purposes, we'll simulate a successful save

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update status
      setZapierStatus('configured');

      alert('Zapier webhooks saved successfully!');
    } catch (err) {
      console.error('Error saving Zapier webhooks:', err);
      setError('Failed to save Zapier webhooks');
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async (webhookId) => {
    const webhook = webhooks.find(w => w.id === webhookId);

    if (!webhook || !webhook.url) {
      alert('Please enter a webhook URL first');
      return;
    }

    setLoading(true);

    try {
      // In a real app, this would send a test payload to the webhook
      // For demo purposes, we'll simulate a successful test

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update last triggered time
      setWebhooks(prev => prev.map(w =>
        w.id === webhookId ? { ...w, lastTriggered: new Date().toISOString() } : w
      ));

      // Add a log entry
      const newLog = {
        id: `log-${Date.now()}`,
        event: webhook.name,
        status: 'success',
        message: `Test payload sent to ${webhook.name} webhook`,
        timestamp: new Date().toLocaleString()
      };

      setLogs(prev => [newLog, ...prev]);

      alert(`Test payload sent to ${webhook.name} webhook successfully!`);
    } catch (err) {
      console.error('Error testing webhook:', err);

      // Add an error log entry
      const errorLog = {
        id: `log-${Date.now()}`,
        event: webhook.name,
        status: 'error',
        message: `Failed to send test payload: ${err.message}`,
        timestamp: new Date().toLocaleString()
      };

      setLogs(prev => [errorLog, ...prev]);

      alert(`Failed to test webhook: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutomation = (id) => {
    setAutomations(prev => prev.map(automation =>
      automation.id === id ? { ...automation, enabled: !automation.enabled } : automation
    ));
  };

  const renderWebhooksTab = () => (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <h2>Zapier Webhooks</h2>
      <p style={{ marginBottom: '20px' }}>
        Configure webhook URLs for different events to trigger Zapier automations.
      </p>

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Event</th>
            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Webhook URL</th>
            <th style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid #ddd' }}>Enabled</th>
            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Last Triggered</th>
            <th style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid #ddd' }}>Test</th>
          </tr>
        </thead>
        <tbody>
          {webhooks.map(webhook => (
            <tr key={webhook.id}>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                {webhook.name}
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                <input
                  type="text"
                  value={webhook.url}
                  onChange={(e) => handleWebhookChange(webhook.id, 'url', e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={webhook.enabled}
                  onChange={(e) => handleWebhookChange(webhook.id, 'enabled', e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px'
                  }}
                />
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleString() : 'Never'}
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                <button
                  onClick={() => handleTestWebhook(webhook.id)}
                  disabled={!webhook.url || loading}
                  style={{
                    backgroundColor: webhook.url ? '#0066cc' : '#f0f0f0',
                    color: webhook.url ? 'white' : '#999',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: webhook.url && !loading ? 'pointer' : 'not-allowed'
                  }}
                >
                  Test
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSaveWebhooks}
          disabled={loading}
          style={{
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Saving...' : 'Save Webhooks'}
        </button>
      </div>
    </div>
  );

  const renderAutomationsTab = () => (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <h2>Zapier Automations</h2>
      <p style={{ marginBottom: '20px' }}>
        Manage your Zapier automations that are connected to your store.
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Automation</th>
            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Trigger</th>
            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Action</th>
            <th style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid #ddd' }}>Status</th>
            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Last Run</th>
          </tr>
        </thead>
        <tbody>
          {automations.map(automation => (
            <tr key={automation.id}>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                <div style={{ fontWeight: '500' }}>{automation.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '3px' }}>{automation.description}</div>
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                {automation.trigger}
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                {automation.action}
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                  <input
                    type="checkbox"
                    checked={automation.enabled}
                    onChange={() => handleToggleAutomation(automation.id)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: automation.enabled ? '#2196F3' : '#ccc',
                      transition: '.4s',
                      borderRadius: '34px'
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '""',
                        height: '16px',
                        width: '16px',
                        left: automation.enabled ? '30px' : '4px',
                        bottom: '4px',
                        backgroundColor: 'white',
                        transition: '.4s',
                        borderRadius: '50%'
                      }}
                    ></span>
                  </span>
                </label>
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                {automation.lastRun || 'Never'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
        <p style={{ marginBottom: '15px' }}>Need to create a new automation?</p>
        <a
          href="https://zapier.com/app/editor/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Create Zap in Zapier
        </a>
      </div>
    </div>
  );

  const renderLogsTab = () => (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <h2>Zapier Activity Logs</h2>
      <p style={{ marginBottom: '20px' }}>
        View recent activity and events triggered by your Zapier integrations.
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Timestamp</th>
            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Event</th>
            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Message</th>
            <th style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid #ddd' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap' }}>
                {log.timestamp}
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                {log.event}
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                {log.message}
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                <span style={{
                  backgroundColor: log.status === 'success' ? '#d4edda' : '#f8d7da',
                  color: log.status === 'success' ? '#155724' : '#721c24',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.85rem'
                }}>
                  {log.status === 'success' ? 'Success' : 'Error'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <Head>
        <title>Zapier Automation | MDTS Tech Admin</title>
        <meta name="description" content="Manage Zapier automations for MDTS Tech Store" />
      </Head>

      <AdminLayout>
        <h1>Zapier Automation</h1>
        <p style={{ marginBottom: '30px' }}>
          Connect your store to Zapier to automate workflows and integrate with other apps.
        </p>

        {zapierStatus === 'not_configured' ? (
          renderWebhooksTab()
        ) : (
          <>
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #ddd' }}>
                <button
                  onClick={() => setActiveTab('webhooks')}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    color: '#333',
                    border: 'none',
                    borderBottom: activeTab === 'webhooks' ? '2px solid #0066cc' : '2px solid transparent',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'webhooks' ? '500' : 'normal'
                  }}
                >
                  Webhooks
                </button>
                <button
                  onClick={() => setActiveTab('automations')}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    color: '#333',
                    border: 'none',
                    borderBottom: activeTab === 'automations' ? '2px solid #0066cc' : '2px solid transparent',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'automations' ? '500' : 'normal'
                  }}
                >
                  Automations
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    color: '#333',
                    border: 'none',
                    borderBottom: activeTab === 'logs' ? '2px solid #0066cc' : '2px solid transparent',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'logs' ? '500' : 'normal'
                  }}
                >
                  Activity Logs
                </button>
              </div>
            </div>

            {activeTab === 'webhooks' && renderWebhooksTab()}
            {activeTab === 'automations' && renderAutomationsTab()}
            {activeTab === 'logs' && renderLogsTab()}
          </>
        )}
      </AdminLayout>
    </>
  );
};

export default ZapierAdminPage;
