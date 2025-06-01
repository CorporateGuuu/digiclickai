import React from 'react';
import Image from 'next/image';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import Link from 'next/link';

// Sample blog posts data
const repairGuides = [
  {
    id: 1,
    title: 'How to Replace an iPhone Screen',
    excerpt: 'A step-by-step guide to replacing your iPhone screen at home with the right tools and parts.',
    date: 'June 15, 2023',
    image: '/images/placeholder.svg',
    category: 'iPhone Repairs'
  },
  {
    id: 2,
    title: 'Samsung Galaxy Battery Replacement Guide',
    excerpt: 'Learn how to safely replace the battery in your Samsung Galaxy phone to extend its life.',
    date: 'May 22, 2023',
    image: '/images/placeholder.svg',
    category: 'Samsung Repairs'
  },
  {
    id: 3,
    title: 'iPad Screen Repair: Professional Tips',
    excerpt: 'Professional technicians share their tips for successful iPad screen replacements.',
    date: 'April 10, 2023',
    image: '/images/placeholder.svg',
    category: 'iPad Repairs'
  },
  {
    id: 4,
    title: 'MacBook Keyboard Replacement Guide',
    excerpt: 'A comprehensive guide to replacing MacBook keyboards for different models.',
    date: 'March 5, 2023',
    image: '/images/placeholder.svg',
    category: 'MacBook Repairs'
  },
  {
    id: 5,
    title: 'Essential Tools for Electronics Repair',
    excerpt: 'The must-have tools for any electronics repair technician or enthusiast.',
    date: 'February 18, 2023',
    image: '/images/placeholder.svg',
    category: 'Tools & Equipment'
  },
  {
    id: 6,
    title: 'Troubleshooting Common iPhone Issues',
    excerpt: 'Learn how to diagnose and fix the most common iPhone problems.',
    date: 'January 30, 2023',
    image: '/images/placeholder.svg',
    category: 'Troubleshooting'
  }
];

function RepairGuides() {
  return (
    <>
      <Head>
        <title>Repair Guides - Midas Technical Solutions</title>
        <meta name="description" content="Step-by-step repair guides for phones, tablets, and laptops. Learn how to fix your devices with our expert tutorials." />
      </Head>
      
      <Layout title="Repair Guides - Midas Technical Solutions" description="Step-by-step repair guides for phones, tablets, and laptops. Learn how to fix your devices with our expert tutorials.">

        <div className="container" style={{ padding: '40px 20px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Repair Guides</h1>
          <p style={{ marginBottom: '2rem', maxWidth: '800px' }}>
            Welcome to our repair guides section! Here you'll find step-by-step tutorials, troubleshooting tips, 
            and expert advice to help you with your device repairs. Whether you're a professional technician or a DIY enthusiast, 
            our guides will help you complete repairs successfully.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            {repairGuides.map(guide => (
              <div key={guide.id} style={{ 
                border: '1px solid #eee', 
                borderRadius: '8px', 
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ height: '180px', overflow: 'hidden' }}>
                  <img 
                    src={guide.image} 
                    alt={guide.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '1.5rem', flex: '1', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#666', 
                    marginBottom: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>{guide.category}</span>
                    <span>{guide.date}</span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '600' }}>
                    {guide.title}
                  </h2>
                  <p style={{ color: '#444', marginBottom: '1rem', flex: '1' }}>
                    {guide.excerpt}
                  </p>
                  <Link href={`/blog/${guide.id}`} style={{ 
                    color: '#0066cc', 
                    textDecoration: 'none',
                    fontWeight: '500',
                    display: 'inline-block'
                  }}>
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      
</Layout>
    </>
  );
}

export default React.memo(RepairGuides);
