import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const CursorDemo = () => {
  return (
    <>
      <Head>
        <title>Custom Cursor Demo - DigiClick AI</title>
        <meta name="description" content="Experience DigiClick AI's futuristic custom cursor with interactive effects and animations." />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Poppins:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="cursor-demo-page">
        {/* Header */}
        <header>
          <h1>DigiClick AI</h1>
          <nav>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/services">Services</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </header>

        {/* Demo Content */}
        <main className="demo-content">
          <section className="hero-section">
            <h1 className="glow-text">Custom Cursor Demo</h1>
            <p className="hero-subtitle">
              Experience our futuristic cursor with particle trails, interactive effects, and smooth animations
            </p>
          </section>

          <section className="interactive-elements">
            <h2>Interactive Elements</h2>
            <div className="elements-grid">
              
              {/* Buttons */}
              <div className="demo-card">
                <h3>Buttons & CTAs</h3>
                <div className="button-group">
                  <button className="cta-button">Primary Button</button>
                  <button className="secondary-button">Secondary Button</button>
                  <button className="pulse-box">Pulse Effect</button>
                </div>
              </div>

              {/* Links */}
              <div className="demo-card">
                <h3>Navigation Links</h3>
                <div className="link-group">
                  <a href="#demo1" className="nav-link">Demo Link 1</a>
                  <a href="#demo2" className="nav-link">Demo Link 2</a>
                  <a href="#demo3" className="nav-link">Demo Link 3</a>
                </div>
              </div>

              {/* Text Elements */}
              <div className="demo-card">
                <h3>Text Elements</h3>
                <h1>Heading 1 - Hover for text cursor</h1>
                <h2>Heading 2 - Interactive text</h2>
                <p>Regular paragraph text with cursor effects when hovering over text content.</p>
              </div>

              {/* Form Elements */}
              <div className="demo-card">
                <h3>Form Elements</h3>
                <div className="form-group">
                  <input type="text" placeholder="Text input field" />
                  <textarea placeholder="Textarea field"></textarea>
                  <select>
                    <option>Select option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                </div>
              </div>

              {/* Special Effects */}
              <div className="demo-card glow-trigger">
                <h3>Special Glow Effect</h3>
                <p>This entire card has a glow trigger class for enhanced cursor effects.</p>
                <div className="interactive pulse-box">
                  <span>Hover me for pulse effects!</span>
                </div>
              </div>

              {/* Movement Area */}
              <div className="demo-card movement-area">
                <h3>Movement Playground</h3>
                <p>Move your cursor around this area to see the particle trail effects in action.</p>
                <div className="movement-zone">
                  <div className="target-dot"></div>
                  <div className="target-dot"></div>
                  <div className="target-dot"></div>
                </div>
              </div>

            </div>
          </section>

          <section className="cursor-features">
            <h2>Cursor Features</h2>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">✨</div>
                <h4>Particle Trails</h4>
                <p>Dynamic particle trails that follow your cursor with velocity-based sizing</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <h4>Smart Detection</h4>
                <p>Automatically detects interactive elements and changes cursor appearance</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💫</div>
                <h4>Click Effects</h4>
                <p>Beautiful ripple effects and animations on click interactions</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🌈</div>
                <h4>Multiple States</h4>
                <p>Different cursor styles for buttons, text, and special elements</p>
              </div>
            </div>
          </section>

          <section className="instructions">
            <h2>Try These Interactions</h2>
            <ul>
              <li>🖱️ <strong>Move your cursor</strong> around to see the particle trail</li>
              <li>🔘 <strong>Hover over buttons</strong> to see the pointer state with "CLICK" label</li>
              <li>📝 <strong>Hover over text</strong> to see the text cursor state</li>
              <li>✨ <strong>Hover over glow elements</strong> to see enhanced effects</li>
              <li>👆 <strong>Click anywhere</strong> to see ripple effects</li>
              <li>⚡ <strong>Move quickly</strong> to see velocity-based trail sizing</li>
            </ul>
          </section>
        </main>

        {/* Footer */}
        <footer>
          <p>© 2025 DigiClick AI. Custom Cursor Demo</p>
          <Link href="/">← Back to Home</Link>
        </footer>
      </div>

      <style jsx>{`
        .cursor-demo-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #2c2c2c 100%);
          color: #e0e0e0;
          font-family: 'Poppins', sans-serif;
        }

        header {
          background: linear-gradient(45deg, #1a1a1a, #2c2c2c);
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(0, 212, 255, 0.2);
        }

        header h1 {
          font-family: 'Orbitron', sans-serif;
          color: #00d4ff;
          text-shadow: 0 0 10px #00d4ff;
          margin: 0;
        }

        nav {
          display: flex;
          gap: 2rem;
        }

        nav a {
          color: #00d4ff;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        nav a:hover {
          color: #7b2cbf;
          text-shadow: 0 0 10px #7b2cbf;
        }

        .demo-content {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 4rem;
        }

        .glow-text {
          font-family: 'Orbitron', sans-serif;
          font-size: 3rem;
          background: linear-gradient(45deg, #00d4ff, #7b2cbf);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
          margin-bottom: 1rem;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
        }

        .interactive-elements h2,
        .cursor-features h2,
        .instructions h2 {
          font-family: 'Orbitron', sans-serif;
          color: #00d4ff;
          font-size: 2rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .elements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .demo-card {
          background: linear-gradient(45deg, #2c2c2c, #3a3a3a);
          padding: 2rem;
          border-radius: 15px;
          border: 1px solid rgba(0, 212, 255, 0.2);
          transition: all 0.3s ease;
        }

        .demo-card:hover {
          border-color: rgba(123, 44, 191, 0.5);
          transform: translateY(-5px);
        }

        .demo-card h3 {
          font-family: 'Orbitron', sans-serif;
          color: #00d4ff;
          margin-bottom: 1rem;
        }

        .button-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .cta-button {
          background: linear-gradient(45deg, #00d4ff, #7b2cbf);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 10px;
          font-family: 'Orbitron', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .secondary-button {
          background: transparent;
          color: #00d4ff;
          border: 2px solid #00d4ff;
          padding: 1rem 2rem;
          border-radius: 10px;
          font-family: 'Orbitron', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pulse-box {
          background: linear-gradient(45deg, #7b2cbf, #00d4ff);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 10px;
          font-family: 'Orbitron', sans-serif;
          font-weight: 600;
          cursor: pointer;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .link-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .nav-link {
          color: #00d4ff;
          text-decoration: none;
          font-weight: 600;
          padding: 0.5rem 0;
          border-bottom: 1px solid transparent;
          transition: all 0.3s ease;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          background: rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(0, 212, 255, 0.2);
          border-radius: 8px;
          padding: 1rem;
          color: #e0e0e0;
          font-family: 'Poppins', sans-serif;
        }

        .movement-area {
          position: relative;
          min-height: 200px;
        }

        .movement-zone {
          position: relative;
          height: 150px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
          display: flex;
          justify-content: space-around;
          align-items: center;
        }

        .target-dot {
          width: 20px;
          height: 20px;
          background: #00d4ff;
          border-radius: 50%;
          box-shadow: 0 0 20px #00d4ff;
          animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
          0% { box-shadow: 0 0 20px #00d4ff; }
          100% { box-shadow: 0 0 40px #00d4ff, 0 0 60px #00d4ff; }
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .feature-item {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(45deg, #2c2c2c, #3a3a3a);
          border-radius: 15px;
          border: 1px solid rgba(0, 212, 255, 0.2);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          filter: drop-shadow(0 0 10px #00d4ff);
        }

        .feature-item h4 {
          font-family: 'Orbitron', sans-serif;
          color: #00d4ff;
          margin-bottom: 1rem;
        }

        .instructions {
          background: linear-gradient(45deg, #2c2c2c, #3a3a3a);
          padding: 3rem;
          border-radius: 15px;
          border: 1px solid rgba(0, 212, 255, 0.2);
          margin-bottom: 4rem;
        }

        .instructions ul {
          list-style: none;
          padding: 0;
        }

        .instructions li {
          padding: 1rem 0;
          border-bottom: 1px solid rgba(0, 212, 255, 0.1);
          font-size: 1.1rem;
        }

        footer {
          background: linear-gradient(45deg, #1a1a1a, #2c2c2c);
          padding: 2rem;
          text-align: center;
          border-top: 1px solid rgba(0, 212, 255, 0.2);
        }

        footer a {
          color: #00d4ff;
          text-decoration: none;
          margin-left: 2rem;
        }

        @media (max-width: 768px) {
          header {
            flex-direction: column;
            gap: 1rem;
          }

          .glow-text {
            font-size: 2rem;
          }

          .elements-grid {
            grid-template-columns: 1fr;
          }

          .demo-content {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default CursorDemo;
