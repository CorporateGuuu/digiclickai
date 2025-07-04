import React from 'react';
import styles from './services.module.css';

export default function Services() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.heroTitle} ${styles.glowText}`}>
            AI-Powered Solutions for <span className={styles.accent}>Modern Business</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Transform your operations with our comprehensive suite of AI automation services designed to boost efficiency, reduce costs, and accelerate growth.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <h2 className={`${styles.sectionTitle} ${styles.centered} ${styles.glowText}`}>
            Our AI Services
          </h2>
          <p className={`${styles.sectionSubtitle} ${styles.centered}`}>
            Comprehensive AI solutions tailored to your business needs
          </p>
          
          <div className={styles.servicesGrid}>
            <div className={`${styles.serviceCard} ${styles.pulseBox}`}>
              <div className={styles.serviceIcon}>
                <div className={styles.glowOrb}></div>
              </div>
              <h3 className={styles.serviceTitle}>AI Process Automation</h3>
              <p className={styles.serviceDescription}>
                Streamline repetitive tasks and workflows with intelligent automation that learns and adapts to your business processes.
              </p>
              <ul className={styles.serviceFeatures}>
                <li>Document Processing</li>
                <li>Data Entry Automation</li>
                <li>Workflow Optimization</li>
                <li>Quality Assurance</li>
              </ul>
            </div>

            <div className={`${styles.serviceCard} ${styles.pulseBox}`}>
              <div className={styles.serviceIcon}>
                <div className={styles.glowOrb}></div>
              </div>
              <h3 className={styles.serviceTitle}>Intelligent Analytics</h3>
              <p className={styles.serviceDescription}>
                Transform raw data into actionable insights with AI-powered analytics and predictive modeling capabilities.
              </p>
              <ul className={styles.serviceFeatures}>
                <li>Predictive Analytics</li>
                <li>Real-time Dashboards</li>
                <li>Performance Metrics</li>
                <li>Trend Analysis</li>
              </ul>
            </div>

            <div className={`${styles.serviceCard} ${styles.pulseBox}`}>
              <div className={styles.serviceIcon}>
                <div className={styles.glowOrb}></div>
              </div>
              <h3 className={styles.serviceTitle}>Customer Experience AI</h3>
              <p className={styles.serviceDescription}>
                Enhance customer interactions with AI-powered chatbots, personalization engines, and support automation.
              </p>
              <ul className={styles.serviceFeatures}>
                <li>AI Chatbots</li>
                <li>Personalization</li>
                <li>Support Automation</li>
                <li>Sentiment Analysis</li>
              </ul>
            </div>

            <div className={`${styles.serviceCard} ${styles.pulseBox}`}>
              <div className={styles.serviceIcon}>
                <div className={styles.glowOrb}></div>
              </div>
              <h3 className={styles.serviceTitle}>Custom AI Solutions</h3>
              <p className={styles.serviceDescription}>
                Bespoke AI applications designed specifically for your unique business challenges and requirements.
              </p>
              <ul className={styles.serviceFeatures}>
                <li>Custom Development</li>
                <li>API Integration</li>
                <li>Scalable Architecture</li>
                <li>Ongoing Support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <div className={`${styles.processSection} ${styles.pulseBox}`}>
            <h2 className={`${styles.sectionTitle} ${styles.centered} ${styles.glowText}`}>
              Our Implementation Process
            </h2>
            <div className={styles.processSteps}>
              <div className={styles.processStep}>
                <div className={styles.stepNumber}>1</div>
                <h3 className={styles.stepTitle}>Discovery & Analysis</h3>
                <p className={styles.stepDescription}>
                  We analyze your current processes and identify automation opportunities.
                </p>
              </div>
              <div className={styles.processStep}>
                <div className={styles.stepNumber}>2</div>
                <h3 className={styles.stepTitle}>Strategy & Planning</h3>
                <p className={styles.stepDescription}>
                  Develop a comprehensive AI implementation roadmap tailored to your goals.
                </p>
              </div>
              <div className={styles.processStep}>
                <div className={styles.stepNumber}>3</div>
                <h3 className={styles.stepTitle}>Development & Testing</h3>
                <p className={styles.stepDescription}>
                  Build and rigorously test AI solutions in a controlled environment.
                </p>
              </div>
              <div className={styles.processStep}>
                <div className={styles.stepNumber}>4</div>
                <h3 className={styles.stepTitle}>Deployment & Training</h3>
                <p className={styles.stepDescription}>
                  Deploy solutions and train your team for optimal utilization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={`${styles.ctaTitle} ${styles.glowText}`}>
            Ready to Transform Your Business?
          </h2>
          <p className={styles.ctaDescription}>
            Let's discuss how our AI solutions can revolutionize your operations and drive unprecedented growth.
          </p>
          <div className={styles.ctaButtons}>
            <a href="/contact" className={`${styles.primaryButton} ${styles.ctaButton}`}>
              Get Started Today
            </a>
            <a href="/about" className={`${styles.secondaryButton} ${styles.navLink}`}>
              Learn More About Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
