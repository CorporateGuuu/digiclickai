import React from 'react';
import Head from 'next/head';

export default function HomePage() {
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <Head>
        <title>DigiClick AI - Digital Solutions</title>
        <meta name="description" content="DigiClick AI - Your digital solutions partner" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem 0',
        borderBottom: '1px solid #eaeaea'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#0070f3' }}>
          DigiClick AI
        </div>
        <nav>
          <ul style={{
            display: 'flex',
            listStyle: 'none',
            gap: '1.5rem',
            margin: 0,
            padding: 0
          }}>
            <li><a href="#" style={{ color: '#333', textDecoration: 'none' }}>Home</a></li>
            <li><a href="#" style={{ color: '#333', textDecoration: 'none' }}>Products</a></li>
            <li><a href="#" style={{ color: '#333', textDecoration: 'none' }}>Services</a></li>
            <li><a href="#" style={{ color: '#333', textDecoration: 'none' }}>About</a></li>
            <li><a href="#" style={{ color: '#333', textDecoration: 'none' }}>Contact</a></li>
          </ul>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          backgroundColor: '#f5f9ff',
          borderRadius: '8px',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#333',
            marginBottom: '1rem'
          }}>
            Welcome to DigiClick AI
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: '#666',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Your partner for innovative digital solutions. We provide cutting-edge technology services to help your business grow.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem'
          }}>
            <button style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              Our Products
            </button>
            <button style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              color: '#0070f3',
              border: '1px solid #0070f3',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              Contact Us
            </button>
          </div>
        </section>

        {/* Services Section */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>Our Services</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              { title: 'Digital Solutions', description: 'Comprehensive digital solutions for modern businesses' },
              { title: 'AI Integration', description: 'Integrate AI into your business processes for better efficiency' },
              { title: 'Web Development', description: 'Custom web development services for your unique needs' },
              { title: 'Mobile Applications', description: 'Native and cross-platform mobile app development' },
              { title: 'E-commerce Solutions', description: 'Complete e-commerce solutions to grow your online business' },
              { title: 'Digital Marketing', description: 'Strategic digital marketing to reach your target audience' }
            ].map((service, index) => (
              <div key={index} style={{
                padding: '1.5rem',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease',
              }}>
                <h3 style={{ color: '#0070f3', marginBottom: '0.5rem' }}>{service.title}</h3>
                <p style={{ color: '#666' }}>{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: '#0070f3',
          color: 'white',
          borderRadius: '8px',
          marginBottom: '3rem'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Ready to Transform Your Business?</h2>
          <p style={{ marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Contact us today to learn how our digital solutions can help your business grow and succeed in the digital age.
          </p>
          <button style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'white',
            color: '#0070f3',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            Get Started
          </button>
        </section>
      </main>

      <footer style={{
        marginTop: '4rem',
        padding: '2rem 0',
        borderTop: '1px solid #eaeaea',
        color: '#888',
        fontSize: '0.9rem',
        textAlign: 'center'
      }}>
        <p>
          &copy; {new Date().getFullYear()} DigiClick AI. All rights reserved.
        </p>
        <p style={{ marginTop: '1rem' }}>
          Contact us at: <a href="mailto:info@digiclickai.shop" style={{ color: '#0070f3', textDecoration: 'none' }}>
            info@digiclickai.shop
          </a>
        </p>
      </footer>
    </div>
  );
}
