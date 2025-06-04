import React from 'react';
import Head from 'next/head';

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)',
      color: '#e0e0e0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <Head>
        <title>DigiClick AI - Premium AI Web Design & Automation Solutions</title>
        <meta name="description" content="Transform your business with DigiClick AI's cutting-edge automation solutions." />
      </Head>

      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #00d4ff 0%, #7b2cbf 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          DigiClick AI
        </h1>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#00d4ff' }}>
          Create. Manage. Automate. Grow.
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#b0b0b0', maxWidth: '600px' }}>
          Transform your business with DigiClick AI's cutting-edge automation solutions.
          Experience our enhanced cursor system, AI-powered websites, and intelligent business automation.
        </p>
        <button style={{
          marginTop: '2rem',
          padding: '1rem 2rem',
          background: 'linear-gradient(45deg, #00d4ff, #7b2cbf)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          fontWeight: '600'
        }}>
          Get Started
        </button>
      </div>
    </div>
  );
}
