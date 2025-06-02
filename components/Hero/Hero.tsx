import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';

interface HeroProps {
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ className = '' }) => {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP animations
    if (typeof window !== 'undefined' && window.gsap) {
      const { gsap } = window;
      
      // Set initial states
      gsap.set([titleRef.current, subtitleRef.current, ctaRef.current], {
        opacity: 0,
        y: 50
      });

      // Create timeline
      const tl = gsap.timeline({ delay: 0.5 });
      
      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
      })
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.5")
      .to(ctaRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out"
      }, "-=0.3");

      // Floating animation for the hero section
      gsap.to(heroRef.current, {
        y: -10,
        duration: 3,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      });
    }
  }, []);

  return (
    <section ref={heroRef} className={`${styles.hero} ${className}`}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 ref={titleRef} className={`${styles.title} glow-text`}>
            Transform Your Business with{' '}
            <span className={styles.accent}>AI Automation</span>
          </h1>
          
          <p ref={subtitleRef} className={styles.subtitle}>
            Experience the future of intelligent workflows and digital excellence. 
            DigiClick AI crafts cutting-edge automation solutions that revolutionize 
            how businesses operate in the digital age.
          </p>

          <div ref={ctaRef} className={styles.ctaContainer}>
            <Link href="/contact" className={`${styles.primaryCta} cta-button`}>
              Start Your AI Journey
            </Link>
            <Link href="/services" className={`${styles.secondaryCta} nav-link`}>
              Explore Services
            </Link>
          </div>

          <div className={styles.features}>
            <div className={`${styles.feature} pulse-box`}>
              <div className={styles.featureIcon}>🤖</div>
              <span>AI-Powered</span>
            </div>
            <div className={`${styles.feature} pulse-box`}>
              <div className={styles.featureIcon}>⚡</div>
              <span>Lightning Fast</span>
            </div>
            <div className={`${styles.feature} pulse-box`}>
              <div className={styles.featureIcon}>🔒</div>
              <span>Secure & Reliable</span>
            </div>
          </div>
        </div>

        <div className={styles.visualContainer}>
          <div className={styles.glowOrb}></div>
          <div className={styles.floatingElements}>
            <div className={`${styles.floatingElement} ${styles.element1}`}></div>
            <div className={`${styles.floatingElement} ${styles.element2}`}></div>
            <div className={`${styles.floatingElement} ${styles.element3}`}></div>
            <div className={`${styles.floatingElement} ${styles.element4}`}></div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollArrow}></div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
};

export default Hero;
