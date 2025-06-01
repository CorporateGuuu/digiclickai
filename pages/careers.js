import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import Link from 'next/link';

// Sample job listings
const jobListings = [
  {
    id: 1,
    title: 'Technical Support Specialist',
    location: 'Vienna, VA',
    type: 'Full-time',
    description: 'Provide technical support to customers regarding repair parts and procedures. Troubleshoot issues and offer solutions.',
    requirements: [
      'Experience in electronics repair',
      'Strong customer service skills',
      'Technical knowledge of mobile devices and computers',
      'Excellent communication skills',
      'Problem-solving abilities'
    ]
  },
  {
    id: 2,
    title: 'Warehouse Associate',
    location: 'Vienna, VA',
    type: 'Full-time',
    description: 'Manage inventory, process orders, and ensure accurate shipping and receiving of products.',
    requirements: [
      'Previous warehouse experience preferred',
      'Attention to detail',
      'Ability to lift up to 50 lbs',
      'Basic computer skills',
      'Organizational skills'
    ]
  },
  {
    id: 3,
    title: 'E-commerce Marketing Specialist',
    location: 'Remote',
    type: 'Full-time',
    description: 'Develop and implement marketing strategies to drive online sales and brand awareness.',
    requirements: [
      'Experience in digital marketing',
      'Knowledge of SEO and SEM',
      'Social media marketing skills',
      'Analytics and reporting abilities',
      'E-commerce experience preferred'
    ]
  },
  {
    id: 4,
    title: 'Repair Technician',
    location: 'Vienna, VA',
    type: 'Full-time',
    description: 'Perform quality testing on repair parts and assist with technical content creation.',
    requirements: [
      'Experience repairing mobile devices and computers',
      'Knowledge of electronic components',
      'Attention to detail',
      'Technical writing skills a plus',
      'Certification in electronics repair preferred'
    ]
  }
];

function Careers() {
  return (
    <>
      <Head>
        <title>Careers - Midas Technical Solutions</title>
        <meta name="description" content="Join the Midas Technical Solutions team. Explore career opportunities in technical support, warehouse operations, marketing, and more." />
      </Head>

      <Layout title="Careers - Midas Technical Solutions" description="Join the Midas Technical Solutions team. Explore career opportunities in technical support, warehouse operations, marketing, and more.">

        <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Careers at Midas Technical Solutions</h1>

          <section style={{ marginBottom: '3rem' }}>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Join our growing team at Midas Technical Solutions! We're looking for talented individuals who are passionate
              about technology and customer service. As a company dedicated to providing high-quality repair parts and tools,
              we value innovation, integrity, and excellence in everything we do.
            </p>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Why Work With Us?</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#0066cc' }}>Growth Opportunities</h3>
                <p>Develop your skills and advance your career with our training and promotion opportunities.</p>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#0066cc' }}>Competitive Benefits</h3>
                <p>Enjoy competitive salaries, health insurance, paid time off, and retirement plans.</p>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#0066cc' }}>Collaborative Culture</h3>
                <p>Work in a supportive environment where teamwork and innovation are encouraged.</p>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#0066cc' }}>Work-Life Balance</h3>
                <p>We value your personal time and offer flexible scheduling options when possible.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Current Openings</h2>

            {jobListings.map(job => (
              <div key={job.id} style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                border: '1px solid #eee',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '600' }}>{job.title}</h3>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#e6f2ff',
                      color: '#0066cc',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      marginLeft: '0.5rem'
                    }}>
                      {job.type}
                    </span>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#f0f0f0',
                      color: '#666',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      marginLeft: '0.5rem'
                    }}>
                      {job.location}
                    </span>
                  </div>
                </div>

                <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>{job.description}</p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '500' }}>Requirements:</h4>
                  <ul style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
                    {job.requirements.map((req, index) => (
                      <li key={index} style={{ marginBottom: '0.25rem' }}>{req}</li>
                    ))}
                  </ul>
                </div>

                <Link href={`/careers/${job.id}`} style={{
                  display: 'inline-block',
                  backgroundColor: '#0066cc',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.25rem',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}>
                  Apply Now
                </Link>
              </div>
            ))}

            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Don't See a Position That Fits?</h3>
              <p style={{ marginBottom: '1rem' }}>
                We're always looking for talented individuals to join our team. Send your resume to
                <a href="mailto:careers@mdtstech.store" style={{ color: '#0066cc', marginLeft: '0.25rem' }}>
                  careers@mdtstech.store
                </a>
                and tell us how you can contribute to Midas Technical Solutions.
              </p>
            </div>
          </section>
        </div>
      
</Layout>
    </>
  );
}

export default React.memo(Careers);
