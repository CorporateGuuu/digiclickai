import React from 'react';
import Header from '../../components/Header';
import styles from './about.module.css';

export default function About() {
  const teamMembers = [
    {
      name: 'Alex Chen',
      role: 'CEO & AI Strategist',
      bio: 'Visionary leader with 15+ years in AI and automation. Former Google AI researcher passionate about democratizing AI for businesses.',
      image: '/images/team/placeholder-1.jpg',
    },
    {
      name: 'Sarah Rodriguez',
      role: 'CTO & Lead Developer',
      bio: 'Full-stack architect specializing in scalable AI solutions. MIT graduate with expertise in machine learning and cloud infrastructure.',
      image: '/images/team/placeholder-2.jpg',
    },
    {
      name: 'Michael Thompson',
      role: 'Head of Innovation',
      bio: 'Creative technologist focused on emerging AI trends. Leads our R&D initiatives and drives product innovation.',
      image: '/images/team/placeholder-3.jpg',
    },
  ];

  return (
    <div className={styles.container}>
      <Header />
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.heroTitle} ${styles.glowText}`}>
            Pioneering the Future of <span className={styles.accent}>AI Automation</span>
          </h1>
          <p className={styles.heroSubtitle}>
            We're on a mission to democratize AI technology and empower businesses 
            to achieve unprecedented efficiency and innovation.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <div className={`${styles.missionVision} ${styles.pulseBox}`}>
            <div className={styles.content}>
              <h2 className={`${styles.sectionTitle} ${styles.glowText}`}>Our Mission</h2>
              <p className={styles.description}>
                To revolutionize how businesses operate by making advanced AI automation 
                accessible, intuitive, and transformative. We believe that every organization, 
                regardless of size, should have the power to leverage artificial intelligence 
                to streamline operations, enhance productivity, and unlock new possibilities.
              </p>
            </div>
            <div className={styles.visual}>
              <div className={styles.glowOrb}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <div className={`${styles.missionVision} ${styles.reverse} ${styles.pulseBox}`}>
            <div className={styles.content}>
              <h2 className={`${styles.sectionTitle} ${styles.glowText}`}>Our Vision</h2>
              <p className={styles.description}>
                A world where AI seamlessly integrates into every business process, 
                creating intelligent ecosystems that adapt, learn, and evolve. We envision 
                a future where technology amplifies human potential and drives sustainable 
                growth across all industries.
              </p>
            </div>
            <div className={styles.visual}>
              <div className={styles.glowOrb}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <h2 className={`${styles.sectionTitle} ${styles.centered} ${styles.glowText}`}>
            Meet Our Team
          </h2>
          <p className={`${styles.sectionSubtitle} ${styles.centered}`}>
            Passionate experts dedicated to pushing the boundaries of AI innovation
          </p>
          
          <div className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <div key={index} className={`${styles.teamCard} ${styles.pulseBox}`}>
                <div className={styles.teamImage}>
                  <div className={styles.imagePlaceholder}>
                    <span className={styles.initials}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className={styles.teamInfo}>
                  <h3 className={styles.teamName}>{member.name}</h3>
                  <p className={styles.teamRole}>{member.role}</p>
                  <p className={styles.teamBio}>{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <h2 className={`${styles.sectionTitle} ${styles.centered} ${styles.glowText}`}>
            Our Values
          </h2>
          <div className={styles.valuesGrid}>
            <div className={`${styles.valueCard} ${styles.pulseBox}`}>
              <div className={styles.valueIcon}>
                <div className={styles.glowOrb}></div>
              </div>
              <h3 className={styles.valueTitle}>Innovation</h3>
              <p className={styles.valueDescription}>
                Constantly pushing boundaries and exploring new possibilities in AI technology.
              </p>
            </div>
            
            <div className={`${styles.valueCard} ${styles.pulseBox}`}>
              <div className={styles.valueIcon}>
                <div className={styles.glowOrb}></div>
              </div>
              <h3 className={styles.valueTitle}>Excellence</h3>
              <p className={styles.valueDescription}>
                Delivering exceptional quality in every project with attention to detail.
              </p>
            </div>
            
            <div className={`${styles.valueCard} ${styles.pulseBox}`}>
              <div className={styles.valueIcon}>
                <div className={styles.glowOrb}></div>
              </div>
              <h3 className={styles.valueTitle}>Accessibility</h3>
              <p className={styles.valueDescription}>
                Making advanced AI technology accessible to businesses of all sizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={`${styles.ctaTitle} ${styles.glowText}`}>
            Ready to Join the AI Revolution?
          </h2>
          <p className={styles.ctaDescription}>
            Let's work together to transform your business with cutting-edge AI solutions.
          </p>
          <div className={styles.ctaButtons}>
            <a href="/contact" className={`${styles.primaryButton} ${styles.ctaButton}`}>
              Start Your Journey
            </a>
            <a href="/services" className={`${styles.secondaryButton} ${styles.navLink}`}>
              Explore Services
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
