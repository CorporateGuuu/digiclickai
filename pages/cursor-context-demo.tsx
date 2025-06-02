import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import styles from '../styles/CursorDemo.module.css';

const CursorContextDemo = () => {
  const [formData, setFormData] = useState({
    email: '',
    message: '',
    file: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Simple validation
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setValidationErrors(prev => ({
        ...prev,
        email: value && !emailRegex.test(value) ? 'Invalid email' : null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false);
      alert('Form submitted successfully!');
    }, 3000);
  };

  return (
    <>
      <Head>
        <title>Context-Aware Cursor Demo - DigiClick AI</title>
        <meta name="description" content="Test the enhanced context-aware cursor system with interactive elements" />
      </Head>

      <Layout>
        <div className={styles.demoContainer}>
          <div className={styles.header}>
            <h1 className="glow-text">Context-Aware Cursor Demo</h1>
            <p>Hover over different elements to see the enhanced cursor states in action</p>
          </div>

          {/* CTA Buttons Section */}
          <section className={styles.section}>
            <h2>CTA Buttons (Larger Glowing Circle)</h2>
            <div className={styles.buttonGroup}>
              <button className="cta-button" data-cursor="cta">
                Primary CTA Button
              </button>
              <button className="cta-button" data-cursor="cta" style={{ background: 'linear-gradient(45deg, #7b2cbf, #00d4ff)' }}>
                Secondary CTA
              </button>
            </div>
          </section>

          {/* Navigation Links Section */}
          <section className={styles.section}>
            <h2>Navigation Links (Arrow Pointer with Particle Trail)</h2>
            <nav className={styles.navDemo}>
              <a href="#" className="nav-link" data-cursor="nav">Home</a>
              <a href="#" className="nav-link" data-cursor="nav">About</a>
              <a href="#" className="nav-link" data-cursor="nav">Services</a>
              <a href="#" className="nav-link" data-cursor="nav">Contact</a>
            </nav>
          </section>

          {/* Text Input Section */}
          <section className={styles.section}>
            <h2>Text Inputs (I-beam with Typing Indicator)</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email Address:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  data-cursor="text"
                  placeholder="Enter your email"
                  className={validationErrors.email ? styles.error : ''}
                />
                {validationErrors.email && (
                  <span className={styles.errorText}>{validationErrors.email}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="message">Message:</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  data-cursor="text"
                  placeholder="Enter your message"
                  rows={4}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="file">File Upload:</label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  data-cursor="upload"
                  className="file-upload"
                />
              </div>

              <button 
                type="submit" 
                className={`cta-button ${isLoading ? 'loading' : ''}`}
                data-loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Form'}
              </button>
            </form>
          </section>

          {/* Interactive Cards Section */}
          <section className={styles.section}>
            <h2>Interactive Cards (Zoom Cursor with Pulsing Animation)</h2>
            <div className={styles.cardGrid}>
              <div className="card" data-cursor="zoom">
                <h3>AI Chatbot Development</h3>
                <p>Advanced conversational AI with natural language processing</p>
              </div>
              <div className="card" data-cursor="zoom">
                <h3>Process Automation</h3>
                <p>Streamline workflows with intelligent automation solutions</p>
              </div>
              <div className="card" data-cursor="zoom">
                <h3>Analytics Dashboard</h3>
                <p>Real-time insights and data visualization tools</p>
              </div>
            </div>
          </section>

          {/* Draggable Elements Section */}
          <section className={styles.section}>
            <h2>Draggable Elements (Custom Drag Cursor)</h2>
            <div className={styles.dragArea}>
              <div 
                className={styles.draggableItem}
                draggable="true"
                data-cursor="drag"
              >
                Drag me around!
              </div>
              <div 
                className={styles.draggableItem}
                draggable="true"
                data-cursor="drag"
              >
                I'm draggable too!
              </div>
            </div>
          </section>

          {/* Disabled Elements Section */}
          <section className={styles.section}>
            <h2>Disabled Elements (Crossed-out Cursor)</h2>
            <div className={styles.disabledGroup}>
              <button disabled className="disabled">
                Disabled Button
              </button>
              <input 
                type="text" 
                disabled 
                placeholder="Disabled input"
                className="disabled"
              />
              <select disabled className="disabled">
                <option>Disabled Select</option>
              </select>
            </div>
          </section>

          {/* Special Effects Section */}
          <section className={styles.section}>
            <h2>Special Effects</h2>
            <div className={styles.effectsGrid}>
              <div className="glow-text" data-cursor="glow">
                Glow Text Effect
              </div>
              <div className="pulse-box" data-cursor="pulse">
                Pulsing Container
              </div>
              <div className="glow-trigger" data-cursor="trigger">
                Special Trigger Element
              </div>
            </div>
          </section>

          {/* Performance Note */}
          <section className={styles.section}>
            <div className={styles.note}>
              <h3>Performance Features:</h3>
              <ul>
                <li>✅ 60fps GSAP animations with hardware acceleration</li>
                <li>✅ Touch device detection and automatic disable</li>
                <li>✅ Reduced motion support for accessibility</li>
                <li>✅ Memory cleanup and animation optimization</li>
                <li>✅ Context-aware state management</li>
              </ul>
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
};

export default CursorContextDemo;
