import React from 'react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';

const NotionContentPage = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contentType, setContentType] = useState('Blog');

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/notion/content?type=${contentType}`);
        const data = await response.json();

        if (data.success) {
          setContent(data.pages || []);
        } else {
          throw new Error(data.message || 'Failed to fetch content');
        }
      } catch (err) {
        console.error('Error fetching content:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentType]);

  return (
    <div>
      <Head>
        <title>Notion Content | MDTS Tech</title>
        <meta name="description" content="Content managed with Notion" />
      </Head>

      <Layout title="Notion Content | MDTS Tech" description="Content managed with Notion">

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Notion Content</h1>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Blog', 'FAQ', 'Page'].map(type => (
                <button
                  key={type}
                  onClick={() => setContentType(type)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: contentType === type ? '#0066cc' : '#f0f0f0',
                    color: contentType === type ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading content...</p>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              color: '#e53e3e',
              padding: '20px',
              backgroundColor: '#fed7d7',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p>Error: {error}</p>
              <p>Note: This page requires a Notion integration to be set up.</p>
            </div>
          ) : content.length === 0 ? (
            <p style={{ textAlign: 'center' }}>No content found. Please add content to your Notion database.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {content.map(page => (
                <div key={page.id} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  {page.featuredImage && (
                    <div style={{ height: '200px', overflow: 'hidden' }}>
                      <img
                        src={page.featuredImage}
                        alt={page.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div style={{ padding: '20px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{page.title}</h2>
                    {page.publishDate && (
                      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>
                        {new Date(page.publishDate).toLocaleDateString()}
                      </p>
                    )}
                    {page.author && (
                      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>
                        By {page.author}
                      </p>
                    )}
                    {page.excerpt && (
                      <p style={{ marginBottom: '20px' }}>{page.excerpt}</p>
                    )}
                    <a
                      href={`/notion-content/${page.id}`}
                      style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        backgroundColor: '#0066cc',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px'
                      }}
                    >
                      Read More
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      
</Layout>
    </div>
  );
};

export default NotionContentPage;
