import React from 'react';

export default function Offline() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#121212',
      color: '#fff',
      textAlign: 'center',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>You're Offline</h1>
      <p>It seems you are not connected to the internet.</p>
      <p>Please check your connection and try again.</p>
      <p>Some features may be limited while offline.</p>
    </div>
  );
}
