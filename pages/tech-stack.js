import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/TechStack.module.css';

export default function TechStack() {
  return (
    <>
      <Head>
        <title>Our Tech Stack | MDTS - Midas Technical Solutions</title>
        <meta name="description" content="Learn about the technologies we use to build and maintain our e-commerce platform." />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Our Technology Stack</h1>
          <p>The cutting-edge technologies that power our e-commerce platform</p>
        </div>

        <section id="frontend" className={styles.section}>
          <h2>Frontend Technologies</h2>
          <div className={styles.techGrid}>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <img src="/images/tech/react.svg" alt="React" />
              </div>
              <h3>React</h3>
              <p>A JavaScript library for building user interfaces with reusable components</p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <img src="/images/tech/nextjs.svg" alt="Next.js" />
              </div>
              <h3>Next.js</h3>
              <p>React framework for server-side rendering and static site generation</p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <img src="/images/tech/css.svg" alt="CSS Modules" />
              </div>
              <h3>CSS Modules</h3>
              <p>Locally scoped CSS for component-based styling</p>
            </div>
          </div>
        </section>

        <section id="backend" className={styles.section}>
          <h2>Backend Technologies</h2>
          <div className={styles.techGrid}>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <img src="/images/tech/nodejs.svg" alt="Node.js" />
              </div>
              <h3>Node.js</h3>
              <p>JavaScript runtime for building scalable server-side applications</p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <img src="/images/tech/express.svg" alt="Express.js" />
              </div>
              <h3>Express.js</h3>
              <p>Web application framework for Node.js</p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <img src="/images/tech/nextauth.png" alt="NextAuth.js" />
              </div>
              <h3>NextAuth.js</h3>
              <p>Authentication for Next.js applications</p>
            </div>
          </div>
        </section>

        <section id="database" className={styles.section}>
          <h2>Database Solutions</h2>
          <div className={styles.techGrid}>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <img src="/images/tech/postgresql.svg" alt="PostgreSQL" />
              </div>
              <h3>PostgreSQL</h3>
              <p>Advanced open-source relational database</p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <img src="/images/tech/supabase.svg" alt="Supabase" />
              </div>
              <h3>Supabase</h3>
              <p>Open-source Firebase alternative with PostgreSQL</p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <img src="/images/tech/prisma.svg" alt="Prisma" />
              </div>
              <h3>Prisma</h3>
              <p>Next-generation ORM for Node.js and TypeScript</p>
            </div>
          </div>
        </section>

        <section id="cloud" className={styles.section}>
          <h2>Cloud Infrastructure</h2>
          <div className={styles.techGrid}>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <img src="/images/tech/vercel.svg" alt="Vercel" />
              </div>
              <h3>Vercel</h3>
              <p>Platform for frontend frameworks and static sites</p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <img src="/images/tech/aws.svg" alt="AWS" />
              </div>
              <h3>AWS</h3>
              <p>Comprehensive cloud computing platform</p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <img src="/images/tech/cloudflare.svg" alt="Cloudflare" />
              </div>
              <h3>Cloudflare</h3>
              <p>Content delivery network and DDoS protection</p>
            </div>
          </div>
        </section>

        <section id="security" className={styles.section}>
          <h2>Security Measures</h2>
          <div className={styles.techGrid}>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <img src="/images/tech/cloudflare.svg" alt="Cloudflare WAF" />
              </div>
              <h3>Cloudflare WAF</h3>
              <p>Web Application Firewall for protection against attacks</p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <img src="/images/tech/duo.svg" alt="Duo Security" />
              </div>
              <h3>Duo Security</h3>
              <p>Two-factor authentication provider</p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <img src="/images/tech/stripe.svg" alt="Stripe" />
              </div>
              <h3>Stripe</h3>
              <p>Secure payment processing infrastructure</p>
            </div>
          </div>
        </section>

        <div className={styles.cta}>
          <h2>Want to learn more about our technology?</h2>
          <p>Contact our development team for more information about our tech stack and implementation.</p>
          <Link href="/contact" className={styles.ctaButton}>
            Contact Us
          </Link>
        </div>
      </div>
    </>
  );
}
