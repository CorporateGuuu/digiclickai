import React, { useEffect } from 'react';
import Head from 'next/head';
import Chatbot from '../components/Chatbot/Chatbot';

export default function DemoTheme() {
  useEffect(() => {
    // Apply DigiClick AI theme to body
    document.body.classList.add('digiclick-theme');

    // Cleanup function to remove theme class
    return () => {
      document.body.classList.remove('digiclick-theme');
    };
  }, []);

  return (
    <>
      <Head>
        <title>DigiClick AI - Enhanced Theme Demo</title>
        <meta name="description" content="Demonstration of the enhanced futuristic AI theme" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Poppins:wght@300;600&display=swap" rel="stylesheet" />
      </Head>

      {/* Header */}
      <header>
        <h1>DigiClick AI Enhanced Theme</h1>
      </header>

      {/* Navigation */}
      <nav>
        <a href="#home">Home</a>
        <a href="#services">Services</a>
        <a href="#pricing">Pricing</a>
        <a href="#team">Team</a>
        <a href="#contact">Contact</a>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <h1 className="glow-text">Welcome to the Future</h1>
        <p>Experience the power of AI-driven design and automation</p>
        <a href="#contact" className="cta-button">Get Started</a>
      </section>

      {/* Services Section */}
      <section id="services">
        <h2>Our AI-Powered Services</h2>
        <div className="pricing-grid">
          <div className="pricing-item pulse-box">
            <h3>AI Web Design</h3>
            <div className="price">$2,999</div>
            <ul>
              <li>Custom AI-crafted design</li>
              <li>Responsive layouts</li>
              <li>SEO optimization</li>
              <li>Performance optimization</li>
            </ul>
            <button className="cta-button">Choose Plan</button>
          </div>
          <div className="pricing-item pulse-box">
            <h3>Automation Suite</h3>
            <div className="price">$4,999</div>
            <ul>
              <li>Workflow automation</li>
              <li>AI chatbot integration</li>
              <li>Data analytics</li>
              <li>24/7 monitoring</li>
            </ul>
            <button className="cta-button">Choose Plan</button>
          </div>
          <div className="pricing-item pulse-box">
            <h3>Enterprise Solution</h3>
            <div className="price">$9,999</div>
            <ul>
              <li>Full AI ecosystem</li>
              <li>Custom integrations</li>
              <li>Dedicated support</li>
              <li>Scalable architecture</li>
            </ul>
            <button className="cta-button">Choose Plan</button>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team">
        <h2>Meet Our AI Experts</h2>
        <div className="team-grid">
          <div className="team-item">
            <img src="https://via.placeholder.com/200x200?text=AI+Expert+1" alt="Team Member 1" />
            <h3>Dr. Sarah Chen</h3>
            <p>AI Research Director</p>
            <p>Leading expert in machine learning and neural networks with 15+ years of experience.</p>
          </div>
          <div className="team-item">
            <img src="https://via.placeholder.com/200x200?text=AI+Expert+2" alt="Team Member 2" />
            <h3>Marcus Rodriguez</h3>
            <p>Automation Architect</p>
            <p>Specializes in creating intelligent automation systems that transform business operations.</p>
          </div>
          <div className="team-item">
            <img src="https://via.placeholder.com/200x200?text=AI+Expert+3" alt="Team Member 3" />
            <h3>Emily Watson</h3>
            <p>UX/AI Designer</p>
            <p>Combines human-centered design with AI capabilities to create intuitive experiences.</p>
          </div>
        </div>
      </section>

      {/* Dashboard Demo */}
      <section id="dashboard">
        <h2>AI Analytics Dashboard</h2>
        <div className="dashboard-table">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Current Value</th>
                <th>AI Prediction</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Website Traffic</td>
                <td>15,432</td>
                <td>18,500</td>
                <td>↗️ +19.8%</td>
              </tr>
              <tr>
                <td>Conversion Rate</td>
                <td>3.2%</td>
                <td>4.1%</td>
                <td>↗️ +28.1%</td>
              </tr>
              <tr>
                <td>User Engagement</td>
                <td>4:32</td>
                <td>5:45</td>
                <td>↗️ +26.9%</td>
              </tr>
              <tr>
                <td>Revenue</td>
                <td>$45,230</td>
                <td>$58,900</td>
                <td>↗️ +30.2%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact">
        <h2>Connect with Our AI Team</h2>
        <div className="mission-vision">
          <form>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <select>
              <option value="">Select Service</option>
              <option value="web-design">AI Web Design</option>
              <option value="automation">Automation Suite</option>
              <option value="enterprise">Enterprise Solution</option>
            </select>
            <textarea placeholder="Tell us about your project" rows="5" required></textarea>
            <button type="submit">Launch Your AI Project</button>
          </form>
          <div className="form-message success show">
            Thank you! Our AI team will contact you within 24 hours.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>© 2025 DigiClick AI. All rights reserved. | <a href="mailto:info@digiclick.ai">info@digiclick.ai</a> | (123) 456-7890</p>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </>
  );
}
