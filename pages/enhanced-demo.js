import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

/**
 * Enhanced Demo Page
 * Demonstrates your original CSS enhanced with DigiClick AI cursor integration
 */
export default function EnhancedDemo() {
  return (
    <>
      <Head>
        <title>Enhanced CSS Demo - DigiClick AI</title>
        <meta name="description" content="See how your original CSS is enhanced with DigiClick AI cursor interactions" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&family=Poppins:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Layout showCursor={true} cursorTheme="default">
        <div className="enhanced-demo-page">
          
          {/* Your Original Hero Section - Enhanced */}
          <section className="hero glow-trigger">
            <h1 className="glow-text">Your Original Design</h1>
            <p>Enhanced with DigiClick AI cursor interactions</p>
            <a href="#features" className="cta pulse-box">
              Experience Enhancement
            </a>
            <a href="#comparison" className="cta-secondary">
              See Comparison
            </a>
          </section>

          {/* Navigation Example */}
          <nav className="demo-nav">
            <a href="#home" className="nav-link">Home</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#services" className="nav-link">Services</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>

          {/* Features Section */}
          <section className="features-section" id="features">
            <div className="container">
              <h2 className="glow-text">Enhanced Features</h2>
              <p>Your original CSS structure with advanced cursor interactions</p>
              
              <div className="features-grid">
                <div className="feature-card pulse-box">
                  <h3>Original Design Preserved</h3>
                  <p>Your clean CSS structure is maintained while adding advanced interactions</p>
                  <button className="cta">Learn More</button>
                </div>

                <div className="feature-card glow-trigger">
                  <h3>Smart Cursor Detection</h3>
                  <p>Automatically detects interactive elements and changes cursor appearance</p>
                  <button className="cta-secondary">Try It</button>
                </div>

                <div className="feature-card pulse-box glow-trigger">
                  <h3>Performance Optimized</h3>
                  <p>Smooth 60fps animations with GPU acceleration and memory management</p>
                  <button className="cta">View Details</button>
                </div>
              </div>
            </div>
          </section>

          {/* Comparison Section */}
          <section className="comparison-section" id="comparison">
            <div className="container">
              <h2 className="glow-text">Before vs After</h2>
              
              <div className="comparison-grid">
                <div className="comparison-item">
                  <h3>Your Original CSS</h3>
                  <div className="code-block">
                    <pre>{`
.hero {
  text-align: center;
  padding: 5rem 2rem;
}

.cta {
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #00d4ff, #7b2cbf);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-family: 'Orbitron', sans-serif;
  transition: transform 0.3s;
}

.cta:hover {
  transform: scale(1.05);
}
                    `}</pre>
                  </div>
                </div>

                <div className="comparison-item">
                  <h3>Enhanced Version</h3>
                  <div className="code-block">
                    <pre>{`
.hero {
  text-align: center;
  padding: 5rem 2rem;
  cursor: none; /* Custom cursor integration */
  transition: background-color 0.3s ease;
}

.cta {
  /* Your original styles preserved */
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #00d4ff, #7b2cbf);
  color: white;
  border-radius: 50px;
  font-family: 'Orbitron', sans-serif;
  
  /* Enhanced features */
  cursor: none;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cta:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 0 25px rgba(123, 44, 191, 0.5);
  animation: gradientFlow 2s ease infinite;
}
                    `}</pre>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Demo */}
          <section className="interactive-demo">
            <div className="container">
              <h2 className="glow-text">Try the Interactions</h2>
              <p>Move your cursor around to experience the enhanced effects</p>
              
              <div className="demo-elements">
                <div className="demo-group">
                  <h4>Button Interactions</h4>
                  <button className="cta">Primary CTA</button>
                  <button className="cta-secondary">Secondary CTA</button>
                  <div className="demo-note">
                    <small>Watch for pointer cursor with "CLICK" labels</small>
                  </div>
                </div>

                <div className="demo-group">
                  <h4>Text Interactions</h4>
                  <h3 className="glow-text">Hover over this heading</h3>
                  <p className="interactive-text">And this paragraph text</p>
                  <div className="demo-note">
                    <small>Notice the text cursor mode</small>
                  </div>
                </div>

                <div className="demo-group glow-trigger">
                  <h4>Special Zones</h4>
                  <div className="pulse-box">
                    <p>This entire area has enhanced glow effects</p>
                    <button className="cta">Interactive Button</button>
                  </div>
                  <div className="demo-note">
                    <small>Enhanced cursor glow in this zone</small>
                  </div>
                </div>

                <div className="demo-group">
                  <h4>Form Elements</h4>
                  <input type="text" className="form-input" placeholder="Try typing here" />
                  <textarea className="form-input" placeholder="Or here" rows="3"></textarea>
                  <button className="cta">Submit</button>
                  <div className="demo-note">
                    <small>Form elements trigger pointer cursor</small>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="demo-footer">
            <div className="container">
              <p>© 2025 DigiClick AI - Enhanced CSS Demo</p>
              <nav>
                <a href="/" className="nav-link">← Back to Home</a>
                <a href="/cursor-demo" className="nav-link">Full Cursor Demo →</a>
              </nav>
            </div>
          </footer>
        </div>

        {/* Enhanced Styles */}
        <style jsx>{`
          .enhanced-demo-page {
            background: linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #2c2c2c 100%);
            color: #e0e0e0;
            font-family: 'Poppins', sans-serif;
            min-height: 100vh;
          }

          /* Your enhanced hero section */
          .hero {
            text-align: center;
            padding: 5rem 2rem;
            cursor: none;
            position: relative;
            transition: background-color 0.3s ease;
            min-height: 80vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .hero:hover {
            background-color: rgba(0, 212, 255, 0.02);
          }

          .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
          }

          .hero p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
          }

          /* Your enhanced CTA button */
          .cta {
            display: inline-block;
            padding: 1rem 2rem;
            background: linear-gradient(45deg, #00d4ff, #7b2cbf);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-family: 'Orbitron', sans-serif;
            cursor: none;
            border: none;
            margin: 0 0.5rem;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            box-shadow: 
              0 0 15px rgba(0, 212, 255, 0.3),
              0 4px 15px rgba(0, 0, 0, 0.1);
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
            position: relative;
            overflow: hidden;
            z-index: 1;
          }

          .cta:hover {
            transform: scale(1.05) translateY(-2px);
            box-shadow: 
              0 0 25px rgba(123, 44, 191, 0.5),
              0 8px 25px rgba(0, 0, 0, 0.2);
            background: linear-gradient(45deg, #00d4ff, #7b2cbf, #00d4ff);
            background-size: 200% 200%;
            animation: gradientFlow 2s ease infinite;
          }

          @keyframes gradientFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          /* Demo navigation */
          .demo-nav {
            background: rgba(0, 0, 0, 0.5);
            padding: 1rem 2rem;
            text-align: center;
            backdrop-filter: blur(10px);
          }

          .nav-link {
            color: #00d4ff;
            text-decoration: none;
            font-family: 'Orbitron', sans-serif;
            font-weight: 600;
            cursor: none;
            transition: all 0.3s ease;
            margin: 0 1rem;
            position: relative;
            padding: 0.5rem 1rem;
          }

          .nav-link:hover {
            color: #7b2cbf;
            text-shadow: 0 0 10px rgba(123, 44, 191, 0.5);
            transform: translateY(-2px);
          }

          /* Sections */
          .features-section,
          .comparison-section,
          .interactive-demo {
            padding: 4rem 2rem;
            border-top: 1px solid rgba(0, 212, 255, 0.1);
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            text-align: center;
          }

          .features-grid,
          .comparison-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
          }

          .feature-card,
          .comparison-item {
            background: linear-gradient(45deg, #2c2c2c, #3a3a3a);
            padding: 2rem;
            border-radius: 15px;
            border: 1px solid rgba(0, 212, 255, 0.2);
            transition: all 0.3s ease;
          }

          .glow-text {
            background: linear-gradient(45deg, #00d4ff, #7b2cbf);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
            font-family: 'Orbitron', sans-serif;
            cursor: none;
          }

          .pulse-box {
            animation: pulseGlow 2s ease-in-out infinite;
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 10px;
            cursor: none;
            transition: all 0.3s ease;
            padding: 1rem;
          }

          @keyframes pulseGlow {
            0%, 100% {
              box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
              transform: scale(1.01);
            }
          }

          .cta-secondary {
            display: inline-block;
            padding: 1rem 2rem;
            background: transparent;
            color: #00d4ff;
            text-decoration: none;
            border: 2px solid #00d4ff;
            border-radius: 50px;
            font-family: 'Orbitron', sans-serif;
            font-weight: 600;
            cursor: none;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0 0.5rem;
          }

          .cta-secondary:hover {
            color: white;
            background: linear-gradient(45deg, #00d4ff, #7b2cbf);
            border-color: #7b2cbf;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 212, 255, 0.3);
          }

          .code-block {
            background: #1a1a1a;
            border-radius: 10px;
            padding: 1rem;
            margin: 1rem 0;
            text-align: left;
            overflow-x: auto;
          }

          .code-block pre {
            color: #e0e0e0;
            font-family: 'Courier New', monospace;
            font-size: 0.8rem;
            line-height: 1.4;
            margin: 0;
          }

          .demo-elements {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
          }

          .demo-group {
            background: rgba(0, 0, 0, 0.3);
            padding: 2rem;
            border-radius: 15px;
            border: 1px solid rgba(0, 212, 255, 0.2);
          }

          .form-input {
            cursor: none;
            transition: all 0.3s ease;
            border: 2px solid rgba(0, 212, 255, 0.2);
            border-radius: 8px;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.1);
            color: #e0e0e0;
            font-family: 'Poppins', sans-serif;
            width: 100%;
            margin: 0.5rem 0;
          }

          .form-input:focus {
            border-color: #00d4ff;
            box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
            outline: none;
            background: rgba(0, 0, 0, 0.2);
          }

          .demo-note {
            margin-top: 1rem;
            opacity: 0.7;
          }

          .demo-footer {
            background: linear-gradient(45deg, #1a1a1a, #2c2c2c);
            padding: 2rem;
            text-align: center;
            border-top: 1px solid rgba(0, 212, 255, 0.2);
          }

          .interactive-text {
            cursor: none;
            transition: all 0.3s ease;
          }

          .interactive-text:hover {
            color: #00d4ff;
            text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
          }

          @media (max-width: 768px) {
            .hero {
              padding: 3rem 1rem;
            }
            
            .hero h1 {
              font-size: 2rem;
            }
            
            .features-grid,
            .comparison-grid,
            .demo-elements {
              grid-template-columns: 1fr;
            }
            
            .cta,
            .cta-secondary {
              display: block;
              margin: 0.5rem 0;
            }
          }
        `}</style>
      </Layout>
    </>
  );
}
