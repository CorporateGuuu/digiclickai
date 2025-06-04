import React from 'react';
import Head from 'next/head';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>DigiClick AI - Premium AI Web Design & Automation Solutions</title>
        <meta name="description" content="Transform your business with DigiClick AI's cutting-edge automation solutions. Experience our enhanced cursor system, AI-powered websites, and intelligent business automation." />
        <meta name="keywords" content="DigiClick AI, AI automation, enhanced cursor system, AI web design, business automation, artificial intelligence" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #0a0a0a 100%)',
        color: '#e0e0e0',
        fontFamily: "'Poppins', sans-serif",
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Background Animation */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
          animation: 'pulse 6s ease-in-out infinite',
          zIndex: 1
        }} />

        {/* Main Content */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '1200px' }}>
            {/* Logo/Brand */}
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 900,
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #00d4ff 0%, #7b2cbf 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
                lineHeight: 1.1
              }}>
                DigiClick AI
              </h1>
            </div>

            {/* Hero Message */}
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                fontWeight: 700,
                color: '#00d4ff',
                marginBottom: '1.5rem',
                textShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
              }}>
                Create. Manage. Automate. Grow.
              </h2>

              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                color: '#b0b0b0',
                lineHeight: 1.6,
                maxWidth: '600px',
                margin: '0 auto 2rem',
                fontWeight: 400
              }}>
                Transform your business with DigiClick AI's cutting-edge automation solutions.
                Experience our enhanced cursor system, AI-powered websites, and intelligent business automation.
              </p>
            </div>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '3rem'
            }}>
              <button style={{
                background: 'linear-gradient(45deg, #00d4ff, #7b2cbf)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '50px',
                fontFamily: "'Orbitron', monospace",
                fontWeight: 600,
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                minWidth: '200px'
              }}>
                Get Started
              </button>

              <button style={{
                background: 'transparent',
                color: '#00d4ff',
                border: '2px solid #00d4ff',
                padding: '1rem 2rem',
                borderRadius: '50px',
                fontFamily: "'Orbitron', monospace",
                fontWeight: 600,
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                minWidth: '200px'
              }}>
                Learn More
              </button>
            </div>

            {/* Features */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
              marginTop: '4rem'
            }}>
              {[
                { icon: '🤖', title: 'AI Automation', desc: 'Intelligent business process automation' },
                { icon: '🎯', title: 'Custom Cursor', desc: 'Enhanced user experience with 60fps performance' },
                { icon: '📊', title: 'Analytics Dashboard', desc: 'Comprehensive tracking and insights' },
                { icon: '🚀', title: 'Performance', desc: 'Optimized for speed and accessibility' }
              ].map((feature, index) => (
                <div key={index} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  borderRadius: '15px',
                  padding: '2rem',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                  <h3 style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#00d4ff',
                    marginBottom: '0.5rem'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.7;
            }
            50% {
              transform: scale(1.1);
              opacity: 1;
            }
          }

          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 212, 255, 0.4) !important;
          }

          .feature-card:hover {
            transform: translateY(-5px);
            border-color: #00d4ff;
            box-shadow: 0 10px 30px rgba(0, 212, 255, 0.2);
          }

          @media (max-width: 768px) {
            .cta-buttons {
              flex-direction: column;
              align-items: center;
            }

            button {
              width: 100%;
              max-width: 300px;
            }
          }
        `}</style>
      </div>
    </>
  );
}
