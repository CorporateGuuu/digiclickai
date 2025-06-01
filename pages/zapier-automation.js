import React from 'react';
import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';

const ZapierAutomationPage = () => {
  const [formType, setFormType] = useState('support');
  const [formData, setFormData] = useState({
    // Support request form
    name: '',
    email: '',
    subject: '',
    message: '',
    
    // Product review form
    productId: 'prod-123',
    productName: 'iPhone 13 Pro Screen',
    rating: 5,
    reviewText: '',
    customerName: '',
    
    // Low inventory form
    productIdInventory: 'prod-456',
    productNameInventory: 'Samsung Galaxy S21 Battery',
    quantity: 3,
    threshold: 5
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      let endpoint;
      let payload;
      
      if (formType === 'support') {
        endpoint = '/api/zapier/webhooks?event=support_request';
        payload = {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        };
      } else if (formType === 'review') {
        endpoint = '/api/zapier/webhooks?event=product_review';
        payload = {
          productId: formData.productId,
          productName: formData.productName,
          rating: parseInt(formData.rating),
          reviewText: formData.reviewText,
          customerName: formData.customerName
        };
      } else if (formType === 'inventory') {
        endpoint = '/api/zapier/webhooks?event=low_inventory';
        payload = {
          id: formData.productIdInventory,
          name: formData.productNameInventory,
          quantity: parseInt(formData.quantity),
          threshold: parseInt(formData.threshold)
        };
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      setResult({
        success: data.success,
        message: data.message || (data.success ? 'Request sent successfully!' : 'Failed to send request')
      });
    } catch (error) {
      console.error('Error sending request:', error);
      setResult({
        success: false,
        message: error.message || 'An error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Zapier Automation | MDTS Tech</title>
        <meta name="description" content="Test Zapier automation integrations" />
      </Head>

      <Layout title="Zapier Automation | MDTS Tech" description="Test Zapier automation integrations">

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Zapier Automation</h1>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { id: 'support', label: 'Support Request' },
                { id: 'review', label: 'Product Review' },
                { id: 'inventory', label: 'Low Inventory Alert' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setFormType(type.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: formType === type.id ? '#0066cc' : '#f0f0f0',
                    color: formType === type.id ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          
          {result && (
            <div style={{ 
              padding: '15px', 
              marginBottom: '20px', 
              borderRadius: '4px',
              backgroundColor: result.success ? '#d4edda' : '#f8d7da',
              color: result.success ? '#155724' : '#721c24',
              border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              <p>{result.message}</p>
              {!result.success && (
                <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                  Note: This feature requires a Zapier webhook to be set up.
                </p>
              )}
            </div>
          )}
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            {formType === 'support' && (
              <>
                <h2 style={{ marginBottom: '20px' }}>Submit a Support Request</h2>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        resize: 'vertical'
                      }}
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
                    {loading ? 'Sending...' : 'Submit Support Request'}
                  </button>
                </form>
              </>
            )}
            
            {formType === 'review' && (
              <>
                <h2 style={{ marginBottom: '20px' }}>Submit a Product Review</h2>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Product
                    </label>
                    <select
                      name="productId"
                      value={formData.productId}
                      onChange={(e) => {
                        const selectedProduct = e.target.value === 'prod-123' 
                          ? 'iPhone 13 Pro Screen' 
                          : 'Samsung Galaxy S21 Battery';
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          productId: e.target.value,
                          productName: selectedProduct
                        }));
                      }}
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    >
                      <option value="prod-123">iPhone 13 Pro Screen</option>
                      <option value="prod-456">Samsung Galaxy S21 Battery</option>
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      required
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Rating
                    </label>
                    <select
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    >
                      {[5, 4, 3, 2, 1].map(rating => (
                        <option key={rating} value={rating}>
                          {rating} Star{rating !== 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Review
                    </label>
                    <textarea
                      name="reviewText"
                      value={formData.reviewText}
                      onChange={handleChange}
                      required
                      rows={5}
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        resize: 'vertical'
                      }}
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
                    {loading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </>
            )}
            
            {formType === 'inventory' && (
              <>
                <h2 style={{ marginBottom: '20px' }}>Simulate Low Inventory Alert</h2>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Product
                    </label>
                    <select
                      name="productIdInventory"
                      value={formData.productIdInventory}
                      onChange={(e) => {
                        const selectedProduct = e.target.value === 'prod-123' 
                          ? 'iPhone 13 Pro Screen' 
                          : 'Samsung Galaxy S21 Battery';
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          productIdInventory: e.target.value,
                          productNameInventory: selectedProduct
                        }));
                      }}
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    >
                      <option value="prod-456">Samsung Galaxy S21 Battery</option>
                      <option value="prod-123">iPhone 13 Pro Screen</option>
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Current Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="0"
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Threshold
                    </label>
                    <input
                      type="number"
                      name="threshold"
                      value={formData.threshold}
                      onChange={handleChange}
                      required
                      min="1"
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    <p style={{ marginTop: '5px', fontSize: '0.9rem', color: '#666' }}>
                      Alert will be triggered if quantity is below threshold
                    </p>
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
                    {loading ? 'Sending...' : 'Send Inventory Alert'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      
</Layout>
    </div>
  );
};

export default ZapierAutomationPage;
