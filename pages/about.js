import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';

function AboutUs() {
  return (
    <>
      <Head>
        <title>About Us - Midas Technical Solutions</title>
        <meta name="description" content="Learn about Midas Technical Solutions, your trusted partner for professional repair parts and tools." />
      </Head>
      
      <Layout title="About Us - Midas Technical Solutions" description="Learn about Midas Technical Solutions, your trusted partner for professional repair parts and tools.">

        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>About Midas Technical Solutions</h1>
          
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Our Story</h2>
            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
              Founded in 2015, Midas Technical Solutions began with a simple mission: to provide high-quality repair parts and tools 
              to professionals and DIY enthusiasts alike. What started as a small operation in Vienna, Virginia has grown into a 
              trusted supplier of electronics repair parts nationwide.
            </p>
            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
              Our founder, with over 15 years of experience in electronics repair, recognized the need for reliable parts and tools 
              that wouldn't break the bank. This vision has guided our company's growth and continues to drive our commitment to quality and service.
            </p>
          </section>
          
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Our Mission</h2>
            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
              At Midas Technical Solutions, our mission is to empower repair professionals and enthusiasts with the highest quality 
              parts and tools. We believe in extending the life of electronic devices through repair rather than replacement, 
              contributing to a more sustainable future.
            </p>
            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
              We're committed to providing exceptional customer service, technical support, and educational resources to help our 
              customers succeed in their repair endeavors.
            </p>
          </section>
          
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Why Choose Us</h2>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
              <li style={{ marginBottom: '0.5rem' }}>Quality Assurance: All our parts undergo rigorous testing to ensure reliability and performance.</li>
              <li style={{ marginBottom: '0.5rem' }}>Competitive Pricing: We offer fair prices without compromising on quality.</li>
              <li style={{ marginBottom: '0.5rem' }}>Expert Support: Our team of technicians is available to provide guidance and troubleshooting assistance.</li>
              <li style={{ marginBottom: '0.5rem' }}>Fast Shipping: Orders are processed quickly to minimize downtime for repair businesses.</li>
              <li style={{ marginBottom: '0.5rem' }}>Satisfaction Guarantee: We stand behind our products with a comprehensive return policy.</li>
            </ul>
          </section>
          
          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Our Team</h2>
            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
              Our team consists of experienced technicians, customer service representatives, and logistics specialists who work 
              together to ensure you receive the right parts when you need them. We're passionate about technology and committed 
              to helping you succeed in your repairs.
            </p>
            <p style={{ lineHeight: '1.6' }}>
              We're always looking for talented individuals to join our growing team. Check out our Careers page for current opportunities.
            </p>
          </section>
        </div>
      
</Layout>
    </>
  );
}

export default React.memo(AboutUs);
