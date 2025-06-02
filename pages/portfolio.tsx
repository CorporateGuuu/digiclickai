import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import styles from '../styles/Portfolio.module.css';

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    improvement: string;
    value: string;
  }[];
  roi: string;
  timeline: string;
  technologies: string[];
  image: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  pricing: string;
  timeline: string;
  icon: string;
}

const Portfolio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'demos' | 'cases' | 'services' | 'testimonials'>('demos');
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const demos = [
    {
      id: 'workflow-automation',
      title: 'Intelligent Workflow Automation',
      description: 'See how AI can streamline your business processes',
      features: ['Smart task routing', 'Automated approvals', 'Real-time monitoring'],
      interactive: true
    },
    {
      id: 'data-processing',
      title: 'AI-Powered Data Processing',
      description: 'Transform raw data into actionable insights',
      features: ['Automated data cleaning', 'Pattern recognition', 'Predictive analytics'],
      interactive: true
    },
    {
      id: 'customer-service',
      title: '24/7 AI Customer Support',
      description: 'Intelligent chatbot with human-like responses',
      features: ['Natural language processing', 'Multi-language support', 'Seamless handoffs'],
      interactive: true
    }
  ];

  const caseStudies: CaseStudy[] = [
    {
      id: 'ecommerce-automation',
      title: 'E-commerce Order Processing Automation',
      client: 'TechRetail Inc.',
      industry: 'E-commerce',
      challenge: 'Manual order processing was taking 4-6 hours daily, leading to delays and errors',
      solution: 'Implemented AI-powered order processing system with automated inventory management',
      results: [
        { metric: 'Processing Time', improvement: '85% reduction', value: 'From 4 hours to 36 minutes' },
        { metric: 'Error Rate', improvement: '92% reduction', value: 'From 8% to 0.6%' },
        { metric: 'Customer Satisfaction', improvement: '34% increase', value: 'From 78% to 95%' }
      ],
      roi: '340% ROI in 6 months',
      timeline: '8 weeks implementation',
      technologies: ['Python', 'TensorFlow', 'REST APIs', 'MongoDB'],
      image: '/images/case-study-ecommerce.jpg'
    },
    {
      id: 'healthcare-scheduling',
      title: 'Healthcare Appointment Optimization',
      client: 'MedCenter Group',
      industry: 'Healthcare',
      challenge: 'Complex scheduling system with high no-show rates and inefficient resource allocation',
      solution: 'AI-driven scheduling system with predictive analytics and automated reminders',
      results: [
        { metric: 'No-show Rate', improvement: '67% reduction', value: 'From 18% to 6%' },
        { metric: 'Resource Utilization', improvement: '45% increase', value: 'From 62% to 90%' },
        { metric: 'Patient Wait Time', improvement: '58% reduction', value: 'From 28 min to 12 min' }
      ],
      roi: '280% ROI in 8 months',
      timeline: '12 weeks implementation',
      technologies: ['Machine Learning', 'Node.js', 'PostgreSQL', 'SMS APIs'],
      image: '/images/case-study-healthcare.jpg'
    }
  ];

  const services: Service[] = [
    {
      id: 'ai-web-design',
      title: 'AI-Powered Web Design',
      description: 'Intelligent websites that adapt and optimize automatically',
      features: [
        'Dynamic content personalization',
        'Automated A/B testing',
        'Performance optimization',
        'User behavior analysis'
      ],
      pricing: 'Starting at $2,999',
      timeline: '4-6 weeks',
      icon: '🎨'
    },
    {
      id: 'automation-solutions',
      title: 'Business Process Automation',
      description: 'Streamline operations with intelligent automation',
      features: [
        'Workflow automation',
        'Data processing pipelines',
        'Integration with existing systems',
        'Real-time monitoring'
      ],
      pricing: 'Starting at $4,999',
      timeline: '6-8 weeks',
      icon: '⚙️'
    },
    {
      id: 'ai-consulting',
      title: 'AI Strategy Consulting',
      description: 'Expert guidance for your AI transformation journey',
      features: [
        'AI readiness assessment',
        'Custom strategy development',
        'Implementation roadmap',
        'ROI optimization'
      ],
      pricing: 'Starting at $1,999',
      timeline: '2-4 weeks',
      icon: '🧠'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'CTO, TechRetail Inc.',
      content: 'DigiClick AI transformed our operations completely. The automation system they built saved us 20 hours per week and increased our accuracy by 92%.',
      rating: 5,
      image: '/images/testimonial-sarah.jpg'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      title: 'Director, MedCenter Group',
      content: 'The AI scheduling system has revolutionized our patient experience. No-show rates dropped dramatically and our staff efficiency improved by 45%.',
      rating: 5,
      image: '/images/testimonial-michael.jpg'
    },
    {
      id: 3,
      name: 'Lisa Rodriguez',
      title: 'Operations Manager, LogiFlow',
      content: 'Working with DigiClick AI was seamless. They delivered exactly what they promised, on time and within budget. The ROI exceeded our expectations.',
      rating: 5,
      image: '/images/testimonial-lisa.jpg'
    }
  ];

  return (
    <Layout>
      <Head>
        <title>AI Automation Portfolio | DigiClick AI</title>
        <meta name="description" content="Explore our AI automation portfolio featuring interactive demos, case studies, and success stories from real clients." />
        <meta name="keywords" content="AI automation, portfolio, case studies, demos, business automation, artificial intelligence" />
      </Head>

      <div className={styles.portfolio}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={`${styles.heroTitle} glow-text`}>
              AI Automation <span className={styles.gradient}>Portfolio</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Discover how we've transformed businesses with intelligent automation solutions
            </p>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>150+</span>
                <span className={styles.statLabel}>Projects Completed</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>$2.5M+</span>
                <span className={styles.statLabel}>Client Savings</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>98%</span>
                <span className={styles.statLabel}>Success Rate</span>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className={styles.navigation}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'demos' ? styles.active : ''} nav-link`}
              onClick={() => setActiveTab('demos')}
            >
              Interactive Demos
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'cases' ? styles.active : ''} nav-link`}
              onClick={() => setActiveTab('cases')}
            >
              Case Studies
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'services' ? styles.active : ''} nav-link`}
              onClick={() => setActiveTab('services')}
            >
              Services
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'testimonials' ? styles.active : ''} nav-link`}
              onClick={() => setActiveTab('testimonials')}
            >
              Testimonials
            </button>
          </div>
        </section>

        {/* Content Sections */}
        <section className={styles.content}>
          {/* Interactive Demos */}
          {activeTab === 'demos' && (
            <div className={styles.demos}>
              <h2 className={styles.sectionTitle}>Interactive AI Demos</h2>
              <p className={styles.sectionSubtitle}>
                Experience our AI automation solutions firsthand
              </p>
              <div className={styles.demoGrid}>
                {demos.map((demo) => (
                  <div key={demo.id} className={styles.demoCard}>
                    <h3 className={styles.demoTitle}>{demo.title}</h3>
                    <p className={styles.demoDescription}>{demo.description}</p>
                    <ul className={styles.demoFeatures}>
                      {demo.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                    <button
                      className={`${styles.demoButton} cta-button`}
                      onClick={() => setSelectedDemo(demo.id)}
                    >
                      Try Demo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Case Studies */}
          {activeTab === 'cases' && (
            <div className={styles.caseStudies}>
              <h2 className={styles.sectionTitle}>Success Stories</h2>
              <p className={styles.sectionSubtitle}>
                Real results from real clients
              </p>
              <div className={styles.caseGrid}>
                {caseStudies.map((study) => (
                  <div key={study.id} className={styles.caseCard}>
                    <div className={styles.caseHeader}>
                      <h3 className={styles.caseTitle}>{study.title}</h3>
                      <div className={styles.caseClient}>
                        <span className={styles.clientName}>{study.client}</span>
                        <span className={styles.clientIndustry}>{study.industry}</span>
                      </div>
                    </div>
                    <div className={styles.caseContent}>
                      <div className={styles.caseSection}>
                        <h4>Challenge</h4>
                        <p>{study.challenge}</p>
                      </div>
                      <div className={styles.caseSection}>
                        <h4>Solution</h4>
                        <p>{study.solution}</p>
                      </div>
                      <div className={styles.caseResults}>
                        <h4>Results</h4>
                        <div className={styles.resultsGrid}>
                          {study.results.map((result, index) => (
                            <div key={index} className={styles.resultCard}>
                              <span className={styles.resultMetric}>{result.metric}</span>
                              <span className={styles.resultImprovement}>{result.improvement}</span>
                              <span className={styles.resultValue}>{result.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={styles.caseMeta}>
                        <span className={styles.roi}>{study.roi}</span>
                        <span className={styles.timeline}>{study.timeline}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {activeTab === 'services' && (
            <div className={styles.services}>
              <h2 className={styles.sectionTitle}>Our AI Services</h2>
              <p className={styles.sectionSubtitle}>
                Comprehensive AI solutions for every business need
              </p>
              <div className={styles.serviceGrid}>
                {services.map((service) => (
                  <div key={service.id} className={styles.serviceCard}>
                    <div className={styles.serviceIcon}>{service.icon}</div>
                    <h3 className={styles.serviceTitle}>{service.title}</h3>
                    <p className={styles.serviceDescription}>{service.description}</p>
                    <ul className={styles.serviceFeatures}>
                      {service.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                    <div className={styles.serviceMeta}>
                      <span className={styles.servicePricing}>{service.pricing}</span>
                      <span className={styles.serviceTimeline}>{service.timeline}</span>
                    </div>
                    <button className={`${styles.serviceButton} cta-button`}>
                      Get Started
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonials */}
          {activeTab === 'testimonials' && (
            <div className={styles.testimonials}>
              <h2 className={styles.sectionTitle}>Client Success Stories</h2>
              <p className={styles.sectionSubtitle}>
                Hear from our satisfied clients
              </p>
              <div className={styles.testimonialGrid}>
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className={styles.testimonialCard}>
                    <div className={styles.testimonialContent}>
                      <p>"{testimonial.content}"</p>
                    </div>
                    <div className={styles.testimonialAuthor}>
                      <div className={styles.authorInfo}>
                        <span className={styles.authorName}>{testimonial.name}</span>
                        <span className={styles.authorTitle}>{testimonial.title}</span>
                      </div>
                      <div className={styles.rating}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className={styles.star}>⭐</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Transform Your Business?</h2>
            <p className={styles.ctaSubtitle}>
              Let's discuss how AI automation can revolutionize your operations
            </p>
            <div className={styles.ctaButtons}>
              <button className={`${styles.primaryButton} cta-button`}>
                Schedule Consultation
              </button>
              <button className={`${styles.secondaryButton} cta-button`}>
                View Pricing
              </button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Portfolio;
