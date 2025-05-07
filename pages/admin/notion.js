import React from 'react';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';

const NotionAdminPage = () => {
  const [contentType, setContentType] = useState('products');
  const [notionStatus, setNotionStatus] = useState('not_configured');
  const [notionData, setNotionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    apiKey: '',
    productsDbId: '',
    ordersDbId: '',
    customersDbId: '',
    contentDbId: ''
  });

  // Simulate checking Notion configuration status
  useEffect(() => {
    const checkNotionConfig = async () => {
      // In a real app, you would check if the Notion API key and database IDs are configured
      const hasNotionConfig = process.env.NOTION_API_KEY &&
        process.env.NOTION_PRODUCTS_DATABASE_ID;

      setNotionStatus(hasNotionConfig ? 'configured' : 'not_configured');

      // If configured, fetch some sample data
      if (hasNotionConfig) {
        await fetchNotionData(contentType);
      }
    };

    checkNotionConfig();
  }, [contentType]);

  const fetchNotionData = async (type) => {
    setLoading(true);
    setError('');

    try {
      // In a real app, this would be a real API call to your Notion endpoints
      // For demo purposes, we'll simulate a response

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      let data = [];

      if (type === 'products') {
        data = [
          { id: 'prod-1', name: 'iPhone 13 Pro Screen', price: 149.99, category: 'iPhone Parts', inStock: true },
          { id: 'prod-2', name: 'Samsung Galaxy S21 Battery', price: 49.99, category: 'Samsung Parts', inStock: true },
          { id: 'prod-3', name: 'iPad Pro 12.9" LCD', price: 299.99, category: 'iPad Parts', inStock: false },
        ];
      } else if (type === 'orders') {
        data = [
          { id: 'ord-1', orderNumber: 'ORD-5289', customer: 'John Smith', total: 245.99, status: 'Delivered' },
          { id: 'ord-2', orderNumber: 'ORD-5288', customer: 'Sarah Johnson', total: 189.50, status: 'Processing' },
        ];
      } else if (type === 'content') {
        data = [
          { id: 'blog-1', title: 'How to Replace Your iPhone Screen', type: 'Blog', publishDate: '2023-05-10' },
          { id: 'faq-1', title: 'Common Repair Questions', type: 'FAQ', publishDate: '2023-05-05' },
        ];
      }

      setNotionData(data);
    } catch (err) {
      console.error('Error fetching Notion data:', err);
      setError('Failed to fetch data from Notion');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In a real app, this would save the configuration to your backend
      // For demo purposes, we'll simulate a successful configuration

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update status
      setNotionStatus('configured');

      // Fetch initial data
      await fetchNotionData(contentType);

      alert('Notion configuration saved successfully!');
    } catch (err) {
      console.error('Error saving Notion configuration:', err);
      setError('Failed to save Notion configuration');
    } finally {
      setLoading(false);
    }
  };

  const renderConfigurationForm = () => (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <h2>Configure Notion Integration</h2>
      <p style={{ marginBottom: '20px' }}>
        Enter your Notion API key and database IDs to connect your Notion workspace.
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

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Notion API Key
          </label>
          <input
            type="text"
            name="apiKey"
            value={formData.apiKey}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
            Get this from <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer">Notion Integrations</a>
          </p>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Products Database ID
          </label>
          <input
            type="text"
            name="productsDbId"
            value={formData.productsDbId}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Orders Database ID
          </label>
          <input
            type="text"
            name="ordersDbId"
            value={formData.ordersDbId}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Customers Database ID
          </label>
          <input
            type="text"
            name="customersDbId"
            value={formData.customersDbId}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Content Database ID
          </label>
          <input
            type="text"
            name="contentDbId"
            value={formData.contentDbId}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );

  const renderNotionDashboard = () => (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setContentType('products')}
            style={{
              padding: '8px 16px',
              backgroundColor: contentType === 'products' ? '#0066cc' : '#f0f0f0',
              color: contentType === 'products' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Products
          </button>
          <button
            onClick={() => setContentType('orders')}
            style={{
              padding: '8px 16px',
              backgroundColor: contentType === 'orders' ? '#0066cc' : '#f0f0f0',
              color: contentType === 'orders' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Orders
          </button>
          <button
            onClick={() => setContentType('content')}
            style={{
              padding: '8px 16px',
              backgroundColor: contentType === 'content' ? '#0066cc' : '#f0f0f0',
              color: contentType === 'content' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Content
          </button>
        </div>

        <button
          onClick={() => setNotionStatus('not_configured')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            color: '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reconfigure
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #0066cc',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading data from Notion...</p>
        </div>
      ) : error ? (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h2>{contentType === 'products' ? 'Products' : contentType === 'orders' ? 'Orders' : 'Content'} from Notion</h2>

          {notionData.length === 0 ? (
            <p style={{ padding: '20px 0', textAlign: 'center' }}>No data found in Notion.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr>
                  {contentType === 'products' && (
                    <>
                      <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Price</th>
                      <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Category</th>
                      <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>In Stock</th>
                    </>
                  )}

                  {contentType === 'orders' && (
                    <>
                      <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Order #</th>
                      <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Customer</th>
                      <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Total</th>
                      <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Status</th>
                    </>
                  )}

                  {contentType === 'content' && (
                    <>
                      <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Title</th>
                      <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Type</th>
                      <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Published</th>
                    </>
                  )}

                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notionData.map(item => (
                  <tr key={item.id}>
                    {contentType === 'products' && (
                      <>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{item.name}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>${item.price.toFixed(2)}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{item.category}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                          <span style={{
                            backgroundColor: item.inStock ? '#d4edda' : '#f8d7da',
                            color: item.inStock ? '#155724' : '#721c24',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.85rem'
                          }}>
                            {item.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                      </>
                    )}

                    {contentType === 'orders' && (
                      <>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{item.orderNumber}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{item.customer}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>${item.total.toFixed(2)}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                          <span style={{
                            backgroundColor:
                              item.status === 'Delivered' ? '#d4edda' :
                                item.status === 'Processing' ? '#fff3cd' :
                                  item.status === 'Shipped' ? '#cce5ff' : '#f8d7da',
                            color:
                              item.status === 'Delivered' ? '#155724' :
                                item.status === 'Processing' ? '#856404' :
                                  item.status === 'Shipped' ? '#004085' : '#721c24',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.85rem'
                          }}>
                            {item.status}
                          </span>
                        </td>
                      </>
                    )}

                    {contentType === 'content' && (
                      <>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{item.title}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{item.type}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{new Date(item.publishDate).toLocaleDateString()}</td>
                      </>
                    )}

                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      <button
                        style={{
                          backgroundColor: '#0066cc',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '5px'
                        }}
                      >
                        View
                      </button>
                      <button
                        style={{
                          backgroundColor: '#f0f0f0',
                          color: '#333',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Sync
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );

  return (
    <>
      <Head>
        <title>Notion Integration | MDTS Tech Admin</title>
        <meta name="description" content="Manage Notion integration for MDTS Tech Store" />
      </Head>

      <AdminLayout>
        <h1>Notion Integration</h1>
        <p style={{ marginBottom: '30px' }}>
          Connect your Notion workspace to sync products, orders, and content.
        </p>

        {notionStatus === 'not_configured' ? renderConfigurationForm() : renderNotionDashboard()}
      </AdminLayout>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </>
  );
};

export default NotionAdminPage;
