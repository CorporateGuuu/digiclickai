import React, { useEffect, useRef } from 'react';
import Head from 'next/head';
import { DigiClickLayout } from '../components/Layout';
import styles from '../styles/About.module.css';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

const About: React.FC = () => {
  const missionRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP animations
    if (typeof window !== 'undefined' && window.gsap) {
      const { gsap } = window;
      
      // Animate sections on scroll
      gsap.fromTo(missionRef.current, 
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: missionRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo(visionRef.current, 
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: visionRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo('.team-member', 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: 'power3.out',
          stagger: 0.2,
          scrollTrigger: {
            trigger: teamRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }
  }, []);

  const teamMembers: TeamMember[] = [
    {
      name: 'Alex Chen',
      role: 'CEO & AI Strategist',
      bio: 'Visionary leader with 15+ years in AI and automation. Former Google AI researcher passionate about democratizing AI for businesses.',
      image: '/images/team/alex-chen.jpg',
      social: {
        linkedin: 'https://linkedin.com/in/alexchen',
        twitter: 'https://twitter.com/alexchen'
      }
    },
    {
      name: 'Sarah Rodriguez',
      role: 'CTO & Lead Developer',
      bio: 'Full-stack architect specializing in scalable AI solutions. MIT graduate with expertise in machine learning and cloud infrastructure.',
      image: '/images/team/sarah-rodriguez.jpg',
      social: {
        linkedin: 'https://linkedin.com/in/sarahrodriguez',
        github: 'https://github.com/sarahrodriguez'
      }
    },
    {
      name: 'Marcus Johnson',
      role: 'Head of Design',
      bio: 'Award-winning UX designer focused on human-centered AI interfaces. Creates intuitive experiences that bridge technology and user needs.',
      image: '/images/team/marcus-johnson.jpg',
      social: {
        linkedin: 'https://linkedin.com/in/marcusjohnson',
        twitter: 'https://twitter.com/marcusdesign'
      }
    }
  ];

  return (
    <DigiClickLayout
      title="About DigiClick AI"
      description="Learn about our mission to transform businesses through cutting-edge AI automation solutions and meet our expert team."
      showCursor={true}
      showParticles={true}
      showChatbot={true}
      cursorTheme="default"
    >
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={`${styles.heroTitle} glow-text`}>
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
        <div className={styles.container}>
          <div ref={missionRef} className={`${styles.missionVision} pulse-box`}>
            <div className={styles.content}>
              <h2 className={`${styles.sectionTitle} glow-text`}>Our Mission</h2>
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
        <div className={styles.container}>
          <div ref={visionRef} className={`${styles.missionVision} ${styles.reverse} pulse-box`}>
            <div className={styles.visual}>
              <div className={styles.glowOrb}></div>
            </div>
            <div className={styles.content}>
              <h2 className={`${styles.sectionTitle} glow-text`}>Our Vision</h2>
              <p className={styles.description}>
                A world where AI seamlessly integrates into every business process, 
                creating a future where human creativity and artificial intelligence 
                work in perfect harmony. We envision organizations that are more agile, 
                innovative, and capable of adapting to the rapidly evolving digital landscape.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={`${styles.sectionTitle} ${styles.centered} glow-text`}>
            Meet Our Expert Team
          </h2>
          <p className={`${styles.sectionSubtitle} ${styles.centered}`}>
            Passionate innovators dedicated to pushing the boundaries of AI technology
          </p>
          
          <div ref={teamRef} className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <div key={index} className={`${styles.teamMember} team-member pulse-box`}>
                <div className={styles.memberImage}>
                  <img src={member.image} alt={member.name} />
                  <div className={styles.imageOverlay}></div>
                </div>
                <div className={styles.memberInfo}>
                  <h3 className={styles.memberName}>{member.name}</h3>
                  <p className={styles.memberRole}>{member.role}</p>
                  <p className={styles.memberBio}>{member.bio}</p>
                  {member.social && (
                    <div className={styles.socialLinks}>
                      {member.social.linkedin && (
                        <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className={`${styles.socialLink} glow-trigger`}>
                          LinkedIn
                        </a>
                      )}
                      {member.social.twitter && (
                        <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className={`${styles.socialLink} glow-trigger`}>
                          Twitter
                        </a>
                      )}
                      {member.social.github && (
                        <a href={member.social.github} target="_blank" rel="noopener noreferrer" className={`${styles.socialLink} glow-trigger`}>
                          GitHub
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2 className={`${styles.ctaTitle} glow-text`}>
            Ready to Join the AI Revolution?
          </h2>
          <p className={styles.ctaDescription}>
            Let's work together to transform your business with cutting-edge AI solutions.
          </p>
          <div className={styles.ctaButtons}>
            <a href="/contact" className={`${styles.primaryButton} cta-button`}>
              Start Your Journey
            </a>
            <a href="/services" className={`${styles.secondaryButton} nav-link`}>
              Explore Services
            </a>
          </div>
        </div>
      </section>
    </DigiClickLayout>
  );
};

export default About;
