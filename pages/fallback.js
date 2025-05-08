import React from 'react';
import Head from 'next/head';

export default function FallbackPage() {
  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <Head>
        <title>DigiClick AI - Coming Soon</title>
        <meta name="description" content="DigiClick AI - Your digital solutions partner" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: '#333',
          marginBottom: '1rem'
        }}>
          DigiClick AI
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#666',
          marginBottom: '2rem'
        }}>
          We're working on something amazing. Our website will be available soon.
        </p>
        
        <div style={{
          padding: '2rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#444', marginBottom: '1rem' }}>
            Our Services
          </h2>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0,
            textAlign: 'left',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #ddd' }}>Digital Solutions</li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #ddd' }}>AI Integration</li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #ddd' }}>Web Development</li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #ddd' }}>Mobile Applications</li>
            <li style={{ padding: '0.5rem 0' }}>E-commerce Solutions</li>
          </ul>
        </div>
        
        <p style={{ fontSize: '1rem', color: '#888' }}>
          Contact us at: <a href="mailto:info@digiclickai.shop" style={{ color: '#0070f3', textDecoration: 'none' }}>
            info@digiclickai.shop
          </a>
        </p>
      </main>
      
      <footer style={{ 
        marginTop: '4rem', 
        padding: '2rem 0', 
        borderTop: '1px solid #eaeaea',
        color: '#888',
        fontSize: '0.9rem'
      }}>
        &copy; {new Date().getFullYear()} DigiClick AI. All rights reserved.
      </footer>
    </div>
  );
}
