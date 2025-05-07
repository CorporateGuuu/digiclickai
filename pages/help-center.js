import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';

function HelpCenter() {
  return (
    <Layout
      title="Help Center - Midas Technical Solutions"
      description="Find answers to common questions, troubleshooting guides, and support resources at the MDTS Help Center."
    >
      <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Help Center</h1>
        
        <p style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
          Welcome to the MDTS Help Center. Find answers to common questions, troubleshooting guides, and support resources to help you with your repair needs.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {/* FAQ Card */}
          <div style={{ 
            border: '1px solid #eee', 
            borderRadius: '8px', 
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            height: '100%'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              color: '#0066cc'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <h2 style={{ fontSize: '1.25rem', marginLeft: '0.75rem' }}>Frequently Asked Questions</h2>
            </div>
            <p style={{ marginBottom: '1.5rem', color: '#444' }}>
              Find answers to common questions about orders, shipping, returns, and more.
            </p>
            <Link href="/faq" style={{ 
              color: '#0066cc', 
              textDecoration: 'none',
              fontWeight: '500',
              display: 'inline-block'
            }}>
              View FAQs →
            </Link>
          </div>
          
          {/* Shipping Card */}
          <div style={{ 
            border: '1px solid #eee', 
            borderRadius: '8px', 
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            height: '100%'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              color: '#0066cc'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="22" height="18" rx="2" ry="2"></rect>
                <line x1="1" y1="9" x2="23" y2="9"></line>
              </svg>
              <h2 style={{ fontSize: '1.25rem', marginLeft: '0.75rem' }}>Shipping Information</h2>
            </div>
            <p style={{ marginBottom: '1.5rem', color: '#444' }}>
              Learn about our shipping options, delivery times, and tracking information.
            </p>
            <Link href="/shipping" style={{ 
              color: '#0066cc', 
              textDecoration: 'none',
              fontWeight: '500',
              display: 'inline-block'
            }}>
              View Shipping Policy →
            </Link>
          </div>
          
          {/* Returns Card */}
          <div style={{ 
            border: '1px solid #eee', 
            borderRadius: '8px', 
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            height: '100%'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              color: '#0066cc'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 14l6-6"></path>
                <circle cx="9" cy="8" r="2"></circle>
                <circle cx="15" cy="14" r="2"></circle>
                <path d="M19 3h-4a2 2 0 0 0-2 2v4"></path>
                <path d="M5 21h4a2 2 0 0 0 2-2v-4"></path>
              </svg>
              <h2 style={{ fontSize: '1.25rem', marginLeft: '0.75rem' }}>Returns & Warranty</h2>
            </div>
            <p style={{ marginBottom: '1.5rem', color: '#444' }}>
              Understand our return policy, warranty coverage, and refund process.
            </p>
            <Link href="/returns" style={{ 
              color: '#0066cc', 
              textDecoration: 'none',
              fontWeight: '500',
              display: 'inline-block'
            }}>
              View Returns Policy →
            </Link>
          </div>
          
          {/* Payment Methods Card */}
          <div style={{ 
            border: '1px solid #eee', 
            borderRadius: '8px', 
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            height: '100%'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              color: '#0066cc'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              <h2 style={{ fontSize: '1.25rem', marginLeft: '0.75rem' }}>Payment Methods</h2>
            </div>
            <p style={{ marginBottom: '1.5rem', color: '#444' }}>
              Learn about the payment options we accept and our secure payment process.
            </p>
            <Link href="/payment-methods" style={{ 
              color: '#0066cc', 
              textDecoration: 'none',
              fontWeight: '500',
              display: 'inline-block'
            }}>
              View Payment Methods →
            </Link>
          </div>
          
          {/* Repair Guides Card */}
          <div style={{ 
            border: '1px solid #eee', 
            borderRadius: '8px', 
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            height: '100%'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              color: '#0066cc'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
              <h2 style={{ fontSize: '1.25rem', marginLeft: '0.75rem' }}>Repair Guides</h2>
            </div>
            <p style={{ marginBottom: '1.5rem', color: '#444' }}>
              Access step-by-step repair guides and tutorials for various devices.
            </p>
            <Link href="/blog" style={{ 
              color: '#0066cc', 
              textDecoration: 'none',
              fontWeight: '500',
              display: 'inline-block'
            }}>
              View Repair Guides →
            </Link>
          </div>
          
          {/* Contact Us Card */}
          <div style={{ 
            border: '1px solid #eee', 
            borderRadius: '8px', 
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            height: '100%'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              color: '#0066cc'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <h2 style={{ fontSize: '1.25rem', marginLeft: '0.75rem' }}>Contact Support</h2>
            </div>
            <p style={{ marginBottom: '1.5rem', color: '#444' }}>
              Need more help? Contact our customer support team for assistance.
            </p>
            <Link href="/contact" style={{ 
              color: '#0066cc', 
              textDecoration: 'none',
              fontWeight: '500',
              display: 'inline-block'
            }}>
              Contact Us →
            </Link>
          </div>
        </div>
        
        <section style={{ 
          backgroundColor: '#f0f7ff', 
          padding: '2rem', 
          borderRadius: '8px',
          marginBottom: '3rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Technical Support</h2>
          <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Our technical support team is available to help you with any questions or issues you may have with your repair parts or tools.
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '1.5rem' 
          }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Email Support</h3>
              <p style={{ color: '#444' }}>
                Email us at <a href="mailto:support@mdtstech.store" style={{ color: '#0066cc', textDecoration: 'none' }}>support@mdtstech.store</a>
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Response within 24 hours</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Phone Support</h3>
              <p style={{ color: '#444' }}>
                Call us at <a href="tel:+12403510511" style={{ color: '#0066cc', textDecoration: 'none' }}>+1 (240) 351-0511</a>
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Mon-Fri, 9AM-10PM EST</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Live Chat</h3>
              <p style={{ color: '#444' }}>
                Chat with our support team in real-time
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Available during business hours</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default HelpCenter;
