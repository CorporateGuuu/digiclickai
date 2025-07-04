export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(18, 18, 18, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
        padding: '1rem 2rem',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          background: 'linear-gradient(45deg, #00d4ff, #7b2cbf)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          DigiClick AI
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="/" style={{ color: '#00d4ff', textDecoration: 'none' }}>Home</a>
          <a href="/about" style={{ color: '#e0e0e0', textDecoration: 'none' }}>About</a>
          <a href="/services" style={{ color: '#e0e0e0', textDecoration: 'none' }}>Services</a>
          <a href="/contact" style={{ color: '#e0e0e0', textDecoration: 'none' }}>Contact</a>
          <a
            href="/contact"
            style={{
              background: 'linear-gradient(45deg, #00d4ff, #7b2cbf)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{
        textAlign: 'center',
        padding: '8rem 2rem 4rem',
        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(123, 44, 191, 0.1) 100%)'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          background: 'linear-gradient(45deg, #00d4ff, #7b2cbf)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1.5rem',
          fontWeight: '900'
        }}>
          Transform Your Business with <span style={{ color: '#7b2cbf' }}>AI</span>
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: '#b0b0b0',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          Leverage AI-driven web design and automation to create seamless,
          futuristic digital experiences that drive results and innovation.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/services"
            style={{
              background: 'linear-gradient(45deg, #00d4ff, #7b2cbf)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.1rem'
            }}
          >
            Explore AI Solutions
          </a>
          <a
            href="/contact"
            style={{
              border: '2px solid #00d4ff',
              color: '#00d4ff',
              padding: '1rem 2rem',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.1rem'
            }}
          >
            Get Started Today
          </a>
        </div>
      </header>

      {/* Services Section */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 2rem' }}>
        <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #00d4ff, #7b2cbf)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Our AI-Powered Services
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#b0b0b0', marginBottom: '3rem' }}>
            Comprehensive solutions designed to revolutionize your business operations
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            <div style={{
              background: 'rgba(0, 212, 255, 0.05)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: '15px',
              padding: '2rem',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(45deg, #00d4ff, #7b2cbf)',
                borderRadius: '50%',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🎨</span>
              </div>
              <h3 style={{ color: '#00d4ff', marginBottom: '1rem', fontSize: '1.5rem' }}>AI Web Design</h3>
              <p style={{ color: '#b0b0b0', lineHeight: '1.6' }}>
                Cutting-edge websites powered by artificial intelligence with responsive design and AI-optimized UX.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                <li style={{ color: '#c0c0c0', padding: '0.25rem 0' }}>✓ Responsive Design</li>
                <li style={{ color: '#c0c0c0', padding: '0.25rem 0' }}>✓ AI-Optimized UX</li>
                <li style={{ color: '#c0c0c0', padding: '0.25rem 0' }}>✓ Performance Focused</li>
              </ul>
            </div>

            <div style={{
              background: 'rgba(123, 44, 191, 0.05)',
              border: '1px solid rgba(123, 44, 191, 0.2)',
              borderRadius: '15px',
              padding: '2rem',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(45deg, #7b2cbf, #00d4ff)',
                borderRadius: '50%',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.5rem' }}>⚡</span>
              </div>
              <h3 style={{ color: '#7b2cbf', marginBottom: '1rem', fontSize: '1.5rem' }}>Automation Solutions</h3>
              <p style={{ color: '#b0b0b0', lineHeight: '1.6' }}>
                Streamline your business processes with intelligent automation and workflow optimization.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                <li style={{ color: '#c0c0c0', padding: '0.25rem 0' }}>✓ Workflow Automation</li>
                <li style={{ color: '#c0c0c0', padding: '0.25rem 0' }}>✓ Data Processing</li>
                <li style={{ color: '#c0c0c0', padding: '0.25rem 0' }}>✓ Integration APIs</li>
              </ul>
            </div>

            <div style={{
              background: 'rgba(0, 212, 255, 0.05)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: '15px',
              padding: '2rem',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(45deg, #00d4ff, #7b2cbf)',
                borderRadius: '50%',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🧠</span>
              </div>
              <h3 style={{ color: '#00d4ff', marginBottom: '1rem', fontSize: '1.5rem' }}>AI Consulting</h3>
              <p style={{ color: '#b0b0b0', lineHeight: '1.6' }}>
                Strategic guidance for your AI transformation journey with expert implementation support.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                <li style={{ color: '#c0c0c0', padding: '0.25rem 0' }}>✓ Strategy Planning</li>
                <li style={{ color: '#c0c0c0', padding: '0.25rem 0' }}>✓ Implementation</li>
                <li style={{ color: '#c0c0c0', padding: '0.25rem 0' }}>✓ Training & Support</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(123, 44, 191, 0.1) 100%)',
          borderRadius: '20px',
          marginBottom: '4rem'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #00d4ff, #7b2cbf)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Ready to Transform Your Business?
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#b0b0b0', marginBottom: '2rem' }}>
            Join hundreds of businesses that have revolutionized their operations with our AI solutions.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/contact"
              style={{
                background: 'linear-gradient(45deg, #00d4ff, #7b2cbf)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '1.1rem'
              }}
            >
              Get Started Today
            </a>
            <a
              href="/about"
              style={{
                border: '2px solid #00d4ff',
                color: '#00d4ff',
                padding: '1rem 2rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '1.1rem'
              }}
            >
              Learn More About Us
            </a>
          </div>
        </section>
      </main>

      <footer style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem 0' }}>
        <p style={{ color: '#888' }}>
          © 2024 DigiClick AI. Transforming businesses with artificial intelligence.
        </p>
      </footer>
    </div>
  );
}
