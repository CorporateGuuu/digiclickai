import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';

function PaymentMethods() {
  return (
    <Layout
      title="Payment Methods - Midas Technical Solutions"
      description="Learn about the payment options available at MDTS, including credit cards, PayPal, cryptocurrency, and financing options."
    >
      <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Payment Methods</h1>
        
        <p style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
          At Midas Technical Solutions, we offer a variety of secure payment options to make your shopping experience as convenient as possible.
        </p>
        
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Credit & Debit Cards</h2>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            We accept all major credit and debit cards for your convenience:
          </p>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{ 
              padding: '1rem', 
              border: '1px solid #eee', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              width: '180px'
            }}>
              <img 
                src="/images/payment/visa.png" 
                alt="Visa" 
                style={{ height: '30px', marginRight: '0.75rem' }}
              />
              <span style={{ fontWeight: '500' }}>Visa</span>
            </div>
            <div style={{ 
              padding: '1rem', 
              border: '1px solid #eee', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              width: '180px'
            }}>
              <img 
                src="/images/payment/mastercard.png" 
                alt="Mastercard" 
                style={{ height: '30px', marginRight: '0.75rem' }}
              />
              <span style={{ fontWeight: '500' }}>Mastercard</span>
            </div>
            <div style={{ 
              padding: '1rem', 
              border: '1px solid #eee', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              width: '180px'
            }}>
              <img 
                src="/images/payment/amex.png" 
                alt="American Express" 
                style={{ height: '30px', marginRight: '0.75rem' }}
              />
              <span style={{ fontWeight: '500' }}>American Express</span>
            </div>
            <div style={{ 
              padding: '1rem', 
              border: '1px solid #eee', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              width: '180px'
            }}>
              <img 
                src="/images/payment/discover.png" 
                alt="Discover" 
                style={{ height: '30px', marginRight: '0.75rem' }}
              />
              <span style={{ fontWeight: '500' }}>Discover</span>
            </div>
          </div>
          <p style={{ lineHeight: '1.6' }}>
            All credit card information is encrypted using industry-standard SSL technology to ensure your personal information remains secure.
          </p>
        </section>
        
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Digital Wallets</h2>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            For added convenience, we support popular digital payment methods:
          </p>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{ 
              padding: '1rem', 
              border: '1px solid #eee', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              width: '180px'
            }}>
              <img 
                src="/images/payment/paypal.png" 
                alt="PayPal" 
                style={{ height: '30px', marginRight: '0.75rem' }}
              />
              <span style={{ fontWeight: '500' }}>PayPal</span>
            </div>
            <div style={{ 
              padding: '1rem', 
              border: '1px solid #eee', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              width: '180px'
            }}>
              <img 
                src="/images/payment/applepay.png" 
                alt="Apple Pay" 
                style={{ height: '30px', marginRight: '0.75rem' }}
              />
              <span style={{ fontWeight: '500' }}>Apple Pay</span>
            </div>
            <div style={{ 
              padding: '1rem', 
              border: '1px solid #eee', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              width: '180px'
            }}>
              <img 
                src="/images/payment/googlepay.png" 
                alt="Google Pay" 
                style={{ height: '30px', marginRight: '0.75rem' }}
              />
              <span style={{ fontWeight: '500' }}>Google Pay</span>
            </div>
          </div>
        </section>
        
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Cryptocurrency</h2>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            We're proud to accept cryptocurrency payments for all purchases:
          </p>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{ 
              padding: '1rem', 
              border: '1px solid #eee', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              width: '180px'
            }}>
              <img 
                src="/images/payment/bitcoin.png" 
                alt="Bitcoin" 
                style={{ height: '30px', marginRight: '0.75rem' }}
              />
              <span style={{ fontWeight: '500' }}>Bitcoin</span>
            </div>
            <div style={{ 
              padding: '1rem', 
              border: '1px solid #eee', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              width: '180px'
            }}>
              <img 
                src="/images/payment/ethereum.png" 
                alt="Ethereum" 
                style={{ height: '30px', marginRight: '0.75rem' }}
              />
              <span style={{ fontWeight: '500' }}>Ethereum</span>
            </div>
            <div style={{ 
              padding: '1rem', 
              border: '1px solid #eee', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              width: '180px'
            }}>
              <img 
                src="/images/payment/litecoin.png" 
                alt="Litecoin" 
                style={{ height: '30px', marginRight: '0.75rem' }}
              />
              <span style={{ fontWeight: '500' }}>Litecoin</span>
            </div>
          </div>
          <p style={{ lineHeight: '1.6' }}>
            Cryptocurrency payments are processed through a secure payment gateway. Exchange rates are locked in at the time of purchase.
          </p>
        </section>
        
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Purchase Orders</h2>
          <p style={{ lineHeight: '1.6' }}>
            We accept purchase orders from qualified businesses, educational institutions, and government agencies. To set up a purchase order account, please contact our business sales team at <a href="mailto:business@mdtstech.store" style={{ color: '#0066cc', textDecoration: 'none' }}>business@mdtstech.store</a> or call <a href="tel:+12403510511" style={{ color: '#0066cc', textDecoration: 'none' }}>+1 (240) 351-0511</a>.
          </p>
        </section>
        
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Financing Options</h2>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            For larger purchases, we offer flexible financing options through our financing partners. Qualified customers can enjoy:
          </p>
          <ul style={{ 
            marginBottom: '1rem', 
            paddingLeft: '1.5rem',
            lineHeight: '1.6'
          }}>
            <li>0% interest for up to 12 months on qualifying purchases</li>
            <li>Easy monthly payment plans</li>
            <li>Quick approval process</li>
            <li>No prepayment penalties</li>
          </ul>
          <p style={{ lineHeight: '1.6' }}>
            To learn more about our financing options, please visit our <Link href="/financing" style={{ color: '#0066cc', textDecoration: 'none' }}>Financing page</Link>.
          </p>
        </section>
        
        <section style={{ 
          backgroundColor: '#f0f7ff', 
          padding: '1.5rem', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Payment Security</h2>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            Your security is our priority. All payment information is encrypted using industry-standard SSL technology. We are PCI DSS compliant and never store your full credit card information on our servers.
          </p>
          <p style={{ lineHeight: '1.6' }}>
            If you have any questions or concerns about our payment methods or security, please <Link href="/contact" style={{ color: '#0066cc', textDecoration: 'none' }}>contact us</Link>.
          </p>
        </section>
      </div>
    </Layout>
  );
}

export default PaymentMethods;
