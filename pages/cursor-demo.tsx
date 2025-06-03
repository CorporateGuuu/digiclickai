import React from 'react';
import Head from 'next/head';
import { DigiClickLayout } from '../components/Layout';
import styles from '../styles/CursorDemo.module.css';

const CursorDemo: React.FC = () => {
  return (
    <DigiClickLayout showCursor={true} cursorTheme="default">
      <Head>
        <title>Enhanced Cursor Demo | DigiClick AI</title>
        <meta name="description" content="Experience DigiClick AI's enhanced custom cursor with GSAP animations and advanced interactions" />
      </Head>

      <div className={styles.demo}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <h1 className="glow-text">Enhanced Cursor Demo</h1>
        </section>

        {/* Interactive Elements Grid */}
        <section className={styles.grid}>
          <div className={styles.gridItem}>
            <h2>CTA Buttons</h2>
            <p>Hover over these buttons to see scale and glow effects</p>
            <button className="cta-button">Primary CTA</button>
            <button className="cta-button" style={{ marginLeft: '1rem' }}>
              Secondary CTA
            </button>
          </div>

          <div className={styles.gridItem}>
            <h2>Navigation Links</h2>
            <p>Subtle scale and color changes for navigation</p>
            <nav className={styles.nav}>
              <a href="#" className="nav-link">Home</a>
              <a href="#" className="nav-link">About</a>
              <a href="#" className="nav-link">Services</a>
              <a href="#" className="nav-link">Contact</a>
            </nav>
          </div>

          <div className={styles.gridItem}>
            <h2>Glow Text</h2>
            <p>Enhanced glow effects for highlighted text</p>
            <h3 className="glow-text">AI-Powered Solutions</h3>
            <h3 className="glow-text">Future Technology</h3>
            <h3 className="glow-text">Innovation Hub</h3>
          </div>

          <div className={styles.gridItem}>
            <h2>Pulse Boxes</h2>
            <p>Pulsing animation for interactive containers</p>
            <div className="pulse-box">
              <h4>Interactive Container</h4>
              <p>This box pulses when you hover over it</p>
            </div>
          </div>

          <div className={styles.gridItem}>
            <h2>Glow Triggers</h2>
            <p>Custom glow effects for special elements</p>
            <div className="glow-trigger" style={{ 
              padding: '2rem', 
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '10px',
              background: 'rgba(0, 212, 255, 0.05)'
            }}>
              <h4>Special Element</h4>
              <p>Triggers intense glow effects</p>
            </div>
          </div>

          <div className={styles.gridItem}>
            <h2>Mixed Elements</h2>
            <p>Combination of different interactive elements</p>
            <div className="pulse-box glow-trigger" style={{ marginBottom: '1rem' }}>
              <span className="glow-text">Combined Effects</span>
            </div>
            <button className="cta-button">Action Button</button>
          </div>
        </section>

        {/* Performance Section */}
        <section className={styles.performance}>
          <h2 className="glow-text">Performance Features</h2>
          <div className={styles.features}>
            <div className="pulse-box">
              <h3>60fps Animations</h3>
              <p>Smooth GSAP-powered animations optimized for performance</p>
            </div>
            <div className="pulse-box">
              <h3>Touch Detection</h3>
              <p>Automatically disabled on touch devices for better UX</p>
            </div>
            <div className="pulse-box">
              <h3>GPU Acceleration</h3>
              <p>Hardware-accelerated transforms for optimal performance</p>
            </div>
          </div>
        </section>

        {/* Trail Demo */}
        <section className={styles.trail}>
          <h2 className="glow-text">Particle Trail System</h2>
          <p>Move your mouse around to see the dynamic particle trail effects</p>
          <div className={styles.trailArea}>
            <div className="glow-trigger" style={{
              width: '200px',
              height: '200px',
              border: '2px solid #00d4ff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '2rem auto',
              background: 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)'
            }}>
              <span className="glow-text">Trail Zone</span>
            </div>
          </div>
        </section>

        {/* Click Effects Demo */}
        <section className={styles.clicks}>
          <h2 className="glow-text">Click Animation Effects</h2>
          <p>Click anywhere to see ripple effects and cursor animations</p>
          <div className={styles.clickArea}>
            <button className="cta-button" style={{ margin: '1rem' }}>
              Click Me
            </button>
            <div className="pulse-box glow-trigger" style={{ 
              display: 'inline-block', 
              margin: '1rem',
              padding: '2rem'
            }}>
              <span className="glow-text">Click Zone</span>
            </div>
            <button className="cta-button" style={{ margin: '1rem' }}>
              Try This Too
            </button>
          </div>
        </section>

        {/* Theme Variations */}
        <section className={styles.themes}>
          <h2 className="glow-text">Theme Variations</h2>
          <p>The cursor system supports multiple themes</p>
          <div className={styles.themeGrid}>
            <div className="pulse-box">
              <h4>Default Theme</h4>
              <p>Futuristic AI theme with cyan and purple accents</p>
            </div>
            <div className="pulse-box">
              <h4>Minimal Theme</h4>
              <p>Clean and simple cursor design</p>
            </div>
            <div className="pulse-box">
              <h4>Neon Theme</h4>
              <p>Bright neon green effects</p>
            </div>
            <div className="pulse-box">
              <h4>Corporate Theme</h4>
              <p>Professional dark theme</p>
            </div>
          </div>
        </section>

        {/* Instructions */}
        <section className={styles.instructions}>
          <h2 className="glow-text">How to Use</h2>
          <div className={styles.instructionGrid}>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className="glow-trigger" style={{ 
            textAlign: 'center', 
            padding: '2rem',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '10px'
          }}>
            <h3 className="glow-text">DigiClick AI Enhanced Cursor System</h3>
            <p>Powered by GSAP animations and optimized for performance</p>
            <button className="cta-button">
              Implement in Your Project
            </button>
          </div>
        </footer>
      </div>
    </DigiClickLayout>
  );
};

export default CursorDemo;
