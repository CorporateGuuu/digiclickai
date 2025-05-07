import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import { useState } from 'react';

export default function Wholesale() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send the form data to your server
    // For this demo, we'll just simulate a successful submission
    setFormStatus({
      submitted: true,
      success: true,
      message: 'Thank you for your interest in our Wholesale Program! A representative will contact you within 1-2 business days.'
    });
    
    // Reset form after submission
    setFormData({
      businessName: '',
      contactName: '',
      email: '',
      phone: '',
      businessType: '',
      message: ''
    });
  };
  
  return (
    <>
      <Head>
        <title>Wholesale Program - Midas Technical Solutions</title>
        <meta name="description" content="Join the Midas Technical Solutions Wholesale Program for exclusive pricing, bulk discounts, and dedicated support for your repair business." />
      </Head>
      
      <Layout title="Wholesale Program - Midas Technical Solutions" description="Join the Midas Technical Solutions Wholesale Program for exclusive pricing, bulk discounts, and dedicated support for your repair business.">

        <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Wholesale Program</h1>
          
          <section style={{ marginBottom: '3rem' }}>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Welcome to the Midas Technical Solutions Wholesale Program! We offer special pricing and benefits for repair shops, 
              educational institutions, and businesses that purchase in bulk. Join our program to access exclusive discounts, 
              priority support, and more.
            </p>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1.5rem',
              marginTop: '2rem'
            }}>
              <div style={{ 
                padding: '1.5rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0066cc' }}>Competitive Pricing</h3>
                <p>Access wholesale pricing on all our products with tiered discounts based on order volume.</p>
              </div>
              
              <div style={{ 
                padding: '1.5rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0066cc' }}>Dedicated Support</h3>
                <p>Get priority technical support and a dedicated account manager for your business needs.</p>
              </div>
              
              <div style={{ 
                padding: '1.5rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0066cc' }}>Bulk Ordering</h3>
                <p>Place bulk orders easily with our streamlined ordering process and inventory management.</p>
              </div>
              
              <div style={{ 
                padding: '1.5rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0066cc' }}>Fast Shipping</h3>
                <p>Benefit from expedited shipping options and priority processing for wholesale orders.</p>
              </div>
            </div>
          </section>
          
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Who Qualifies?</h2>
            <ul style={{ lineHeight: '1.6', marginLeft: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Repair shops and service centers</li>
              <li style={{ marginBottom: '0.5rem' }}>Educational institutions (schools, colleges, universities)</li>
              <li style={{ marginBottom: '0.5rem' }}>Corporate IT departments</li>
              <li style={{ marginBottom: '0.5rem' }}>Resellers and distributors</li>
              <li style={{ marginBottom: '0.5rem' }}>Manufacturers requiring components</li>
            </ul>
          </section>
          
          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Apply for Wholesale Account</h2>
            
            {formStatus.submitted && formStatus.success ? (
              <div style={{ 
                backgroundColor: '#d1e7dd', 
                color: '#0f5132', 
                padding: '1rem', 
                borderRadius: '0.25rem',
                marginBottom: '1rem'
              }}>
                {formStatus.message}
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <label htmlFor="businessName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Business Name *</label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ced4da',
                        borderRadius: '0.25rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contactName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Contact Name *</label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ced4da',
                        borderRadius: '0.25rem'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ced4da',
                        borderRadius: '0.25rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ced4da',
                        borderRadius: '0.25rem'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="businessType" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Business Type *</label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ced4da',
                      borderRadius: '0.25rem'
                    }}
                  >
                    <option value="">Select Business Type</option>
                    <option value="repair_shop">Repair Shop</option>
                    <option value="educational">Educational Institution</option>
                    <option value="corporate">Corporate IT</option>
                    <option value="reseller">Reseller/Distributor</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Additional Information</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell us about your business and your typical order volume"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ced4da',
                      borderRadius: '0.25rem'
                    }}
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#0066cc',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '1rem'
                  }}
                >
                  Submit Application
                </button>
              </form>
            )}
          </section>
        </div>
      
</Layout>
    </>
  );
}
