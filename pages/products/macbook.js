import React from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import ProductList from '../../components/ProductList/ProductList';

// Sample MacBook parts data
const macbookParts = [
  {
    id: 401,
    name: 'MacBook Pro Keyboard Replacement',
    category: 'MacBook Parts',
    price: 129.99,
    discount_percentage: 10,
    imageUrl: '/images/placeholder.svg',
    badge: '10% OFF'
  },
  {
    id: 402,
    name: 'MacBook Air Battery',
    category: 'MacBook Parts',
    price: 89.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg'
  },
  {
    id: 403,
    name: 'MacBook Pro Retina Display',
    category: 'MacBook Parts',
    price: 299.99,
    discount_percentage: 15,
    imageUrl: '/images/placeholder.svg',
    badge: '15% OFF'
  },
  {
    id: 404,
    name: 'MacBook Trackpad Replacement',
    category: 'MacBook Parts',
    price: 79.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg'
  }
];

function MacBookParts() {
  return (
    <Layout
      title="MacBook Parts"
      description="High-quality MacBook replacement parts for all models. Keyboards, batteries, displays, trackpads, and more."
    >
      <div className="container" style={{ padding: '40px 20px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>MacBook Parts</h1>
        <p style={{ marginBottom: '2rem' }}>
          Find high-quality replacement parts for all MacBook models. We offer keyboards, batteries,
          displays, trackpads, and more to help you repair your MacBook.
        </p>

        <ProductList products={macbookParts} title="MacBook Replacement Parts" />
      </div>
    </Layout>
  );
}

export default React.memo(MacBookParts);
