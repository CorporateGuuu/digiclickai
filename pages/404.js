import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <Head>
        <title>404 - Page Not Found | DigiClick AI</title>
        <meta name="description" content="The page you are looking for does not exist." />
      </Head>
      
      <h1 style={{ 
        fontSize: '3rem', 
        marginBottom: '1rem',
        color: '#0070f3'
      }}>
        404
      </h1>
      
      <h2 style={{ 
        fontSize: '1.5rem', 
        marginBottom: '2rem',
        color: '#333'
      }}>
        Page Not Found
      </h2>
      
      <p style={{ 
        fontSize: '1.1rem', 
        marginBottom: '2rem',
        maxWidth: '500px',
        color: '#666'
      }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <Link href="/" style={{
        display: 'inline-block',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#0070f3',
        color: 'white',
        borderRadius: '4px',
        textDecoration: 'none',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease'
      }}>
        Return to Homepage
      </Link>
    </div>
  );
}
