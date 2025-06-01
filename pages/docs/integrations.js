import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout/Layout';
import styles from '../../styles/Docs.module.css';

export default function IntegrationsPage() {
  return (
    <Layout>
      <Head>
        <title>Integrations | MDTS - Midas Technical Solutions</title>
        <meta name="description" content="Learn about the integrations available with MDTS - Midas Technical Solutions." />
      </Head>

      <main className="main-content">
        <div className="container">
          <div className={styles.docsContainer}>
            <div className={styles.docsSidebar}>
              <h3>Documentation</h3>
              <ul>
                <li>
                  <Link href="/docs">Getting Started</Link>
                </li>
                <li>
                  <Link href="/docs/api">API Reference</Link>
                </li>
                <li className={styles.active}>
                  <Link href="/docs/integrations">Integrations</Link>
                </li>
                <li>
                  <Link href="/docs/faq">FAQ</Link>
                </li>
              </ul>
            </div>

            <div className={styles.docsContent}>
              <h1>Integrations</h1>
              
              <section className={styles.section}>
                <h2>Available Integrations</h2>
                <p>
                  MDTS offers seamless integration with various platforms and services to enhance your business operations.
                  Below are the key integrations currently available:
                </p>
              </section>

              <section className={styles.section}>
                <h2>4seller.com Integration</h2>
                <div className={styles.integrationCard}>
                  <div className={styles.integrationLogo}>
                    <img src="/images/integrations/4seller-logo.png" alt="4seller.com Logo" />
                  </div>
                  <div className={styles.integrationContent}>
                    <h3>4seller.com</h3>
                    <p>
                      Integrate your 4seller.com inventory with MDTS to synchronize product listings, inventory levels, and orders.
                      This integration allows for real-time updates between platforms, ensuring consistent inventory management.
                    </p>
                    <h4>Key Features:</h4>
                    <ul>
                      <li>Automatic inventory synchronization</li>
                      <li>Order status updates across platforms</li>
                      <li>Product information consistency</li>
                      <li>Centralized inventory management</li>
                    </ul>
                    <div className={styles.integrationActions}>
                      <Link href="/account?tab=integrations" className={styles.primaryButton}>
                        Connect 4seller.com
                      </Link>
                      <a href="https://www.4seller.com/" target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>
                        Learn More
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <h2>n8n.io Integration</h2>
                <div className={styles.integrationCard}>
                  <div className={styles.integrationLogo}>
                    <img src="/images/integrations/n8n-logo.png" alt="n8n.io Logo" />
                  </div>
                  <div className={styles.integrationContent}>
                    <h3>n8n.io</h3>
                    <p>
                      Connect MDTS with n8n.io to create powerful automation workflows. n8n is a workflow automation tool
                      that allows you to connect MDTS with hundreds of other applications and services.
                    </p>
                    <h4>Key Features:</h4>
                    <ul>
                      <li>Custom workflow automation</li>
                      <li>Trigger actions based on MDTS events</li>
                      <li>Connect with hundreds of other services</li>
                      <li>No-code/low-code automation builder</li>
                    </ul>
                    <div className={styles.integrationActions}>
                      <Link href="/account?tab=integrations" className={styles.primaryButton}>
                        Connect n8n.io
                      </Link>
                      <a href="https://n8n.io/" target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>
                        Learn More
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <h2>Marketplace Integrations</h2>
                <div className={styles.integrationGrid}>
                  <div className={styles.integrationGridItem}>
                    <img src="/images/integrations/ebay-logo.png" alt="eBay Logo" />
                    <h3>eBay</h3>
                    <p>Sync your eBay listings with MDTS inventory</p>
                    <Link href="/account?tab=integrations" className={styles.gridItemButton}>
                      Connect
                    </Link>
                  </div>
                  
                  <div className={styles.integrationGridItem}>
                    <img src="/images/integrations/amazon-logo.png" alt="Amazon Logo" />
                    <h3>Amazon</h3>
                    <p>Manage Amazon listings through MDTS</p>
                    <Link href="/account?tab=integrations" className={styles.gridItemButton}>
                      Connect
                    </Link>
                  </div>
                  
                  <div className={styles.integrationGridItem}>
                    <img src="/images/integrations/tiktok-logo.png" alt="TikTok Shop Logo" />
                    <h3>TikTok Shop</h3>
                    <p>Integrate TikTok Shop with MDTS</p>
                    <Link href="/account?tab=integrations" className={styles.gridItemButton}>
                      Connect
                    </Link>
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <h2>API Integration</h2>
                <p>
                  For custom integrations, MDTS provides a comprehensive API that allows you to connect
                  your systems directly with our platform. Our API documentation provides all the details
                  you need to build custom integrations.
                </p>
                <div className={styles.apiBox}>
                  <h3>API Documentation</h3>
                  <p>
                    Our API documentation includes detailed information about endpoints, authentication,
                    request/response formats, and example code in various programming languages.
                  </p>
                  <Link href="/docs/api" className={styles.primaryButton}>
                    View API Documentation
                  </Link>
                </div>
              </section>

              <section className={styles.section}>
                <h2>Need Help?</h2>
                <p>
                  If you need assistance setting up any integration or have questions about how to connect
                  your existing systems with MDTS, our support team is here to help.
                </p>
                <div className={styles.supportBox}>
                  <div className={styles.supportOption}>
                    <h3>Contact Support</h3>
                    <p>Email us at <a href="mailto:support@mdtstech.store">support@mdtstech.store</a></p>
                    <p>Call us at <a href="tel:+12403510511">+1 (240) 351-0511</a></p>
                  </div>
                  <div className={styles.supportOption}>
                    <h3>Schedule a Consultation</h3>
                    <p>Book a call with our integration specialists to discuss your specific needs.</p>
                    <a href="https://calendly.com/mdtstech" target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>
                      Schedule Now
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
