import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import { useState } from 'react';

// Sample FAQ data
const faqData = [
  {
    id: 1,
    category: 'Orders & Shipping',
    questions: [
      {
        question: 'How long does shipping take?',
        answer: 'Standard shipping typically takes 3-5 business days within the continental US. Expedited shipping options are available at checkout for 1-2 day delivery.'
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Yes, we ship to most countries worldwide. International shipping times vary by location, typically taking 7-14 business days. Additional customs fees may apply depending on your country.'
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order ships, you\'ll receive a confirmation email with tracking information. You can also track your order by logging into your account on our website.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, and Google Pay.'
      }
    ]
  },
  {
    id: 2,
    category: 'Products & Compatibility',
    questions: [
      {
        question: 'How do I know if a part is compatible with my device?',
        answer: 'Each product page lists compatible device models. You can also use our compatibility checker tool by entering your device model. If you\'re still unsure, contact our technical support team for assistance.'
      },
      {
        question: 'Are your parts OEM or aftermarket?',
        answer: 'We offer both OEM (Original Equipment Manufacturer) and high-quality aftermarket parts. The product description clearly indicates whether a part is OEM or aftermarket.'
      },
      {
        question: 'Do you provide installation instructions?',
        answer: 'Yes, most products include basic installation instructions. We also have detailed repair guides available on our blog for common repairs.'
      },
      {
        question: 'What tools do I need for repairs?',
        answer: 'Required tools vary by repair. Each product page lists recommended tools for installation. We also offer complete tool kits for different types of repairs.'
      }
    ]
  },
  {
    id: 3,
    category: 'Returns & Warranty',
    questions: [
      {
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for most items in new, unopened condition. Opened items may be eligible for exchange or store credit. Some items, like custom-cut adhesives, cannot be returned.'
      },
      {
        question: 'How do I request a return?',
        answer: 'To initiate a return, log into your account and select the order you wish to return. Follow the prompts to generate a return authorization and shipping label.'
      },
      {
        question: 'What warranty do you offer on parts?',
        answer: 'Most parts come with a 90-day warranty against manufacturing defects. Some premium parts offer extended warranties of up to 1 year. Warranty details are listed on each product page.'
      },
      {
        question: 'What if I receive a defective item?',
        answer: 'If you receive a defective item, contact our customer service within 7 days. We\'ll arrange for a replacement or refund. You may need to provide photos or video of the defect.'
      }
    ]
  },
  {
    id: 4,
    category: 'Technical Support',
    questions: [
      {
        question: 'Do you offer technical support for repairs?',
        answer: 'Yes, our technical support team is available Monday-Friday, 9AM-10PM EST to assist with installation questions and troubleshooting.'
      },
      {
        question: 'What if I need help during my repair?',
        answer: 'You can contact our technical support team via phone, email, or live chat. For complex issues, we may offer video support sessions.'
      },
      {
        question: 'Do you offer repair services?',
        answer: 'We primarily sell parts and tools, but we can recommend authorized repair centers in your area. For select customers, we offer mail-in repair services.'
      },
      {
        question: 'Where can I find repair guides?',
        answer: 'We publish detailed repair guides on our blog. You can also find video tutorials on our YouTube channel and links to manufacturer resources on product pages.'
      }
    ]
  }
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState(1);
  const [openQuestions, setOpenQuestions] = useState({});

  const toggleQuestion = (questionId) => {
    setOpenQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  return (
    <>
      <Head>
        <title>Frequently Asked Questions - Midas Technical Solutions</title>
        <meta name="description" content="Find answers to common questions about orders, shipping, returns, product compatibility, and technical support at Midas Technical Solutions." />
      </Head>

      <Layout title="Frequently Asked Questions - Midas Technical Solutions" description="Find answers to common questions about orders, shipping, returns, product compatibility, and technical support at Midas Technical Solutions.">

        <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Frequently Asked Questions</h1>

          <p style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
            Find answers to common questions about our products, ordering process, shipping, returns, and technical support.
            If you can't find the answer you're looking for, please <Link href="/contact" style={{ color: '#0066cc' }}>contact us</Link>.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            {/* Category sidebar */}
            <div style={{ flex: '0 0 250px' }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '8px',
                position: 'sticky',
                top: '20px'
              }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Categories</h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {faqData.map(category => (
                    <li key={category.id} style={{ marginBottom: '0.75rem' }}>
                      <button
                        onClick={() => setActiveCategory(category.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '0.5rem',
                          width: '100%',
                          textAlign: 'left',
                          cursor: 'pointer',
                          borderLeft: activeCategory === category.id ? '3px solid #0066cc' : '3px solid transparent',
                          paddingLeft: '0.75rem',
                          fontWeight: activeCategory === category.id ? '600' : '400',
                          color: activeCategory === category.id ? '#0066cc' : '#333'
                        }}
                      >
                        {category.category}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* FAQ content */}
            <div style={{ flex: '1 1 600px' }}>
              {faqData.find(cat => cat.id === activeCategory)?.questions.map((item, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '1rem',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={() => toggleQuestion(`${activeCategory}-${index}`)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '1rem',
                      backgroundColor: openQuestions[`${activeCategory}-${index}`] ? '#f0f7ff' : '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontWeight: '500',
                      fontSize: '1rem'
                    }}
                  >
                    {item.question}
                    <span style={{ fontSize: '1.25rem' }}>
                      {openQuestions[`${activeCategory}-${index}`] ? '−' : '+'}
                    </span>
                  </button>

                  {openQuestions[`${activeCategory}-${index}`] && (
                    <div style={{
                      padding: '1rem',
                      backgroundColor: '#f9f9f9',
                      borderTop: '1px solid #eee',
                      lineHeight: '1.6'
                    }}>
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{
            marginTop: '3rem',
            padding: '1.5rem',
            backgroundColor: '#f0f7ff',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Still Have Questions?</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Our customer support team is ready to help you with any questions or concerns.
            </p>
            <Link
              href="/contact"
              style={{
                display: 'inline-block',
                backgroundColor: '#0066cc',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.25rem',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      
</Layout>
    </>
  );
}
