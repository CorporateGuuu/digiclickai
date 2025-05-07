import React from 'react';
import Layout from '../../components/Layout/Layout';
import ProductList from '../../components/ProductList/ProductList';

// Sample iPhone parts data
const iphoneParts = [
  {
    id: 101,
    name: 'iPhone 13 Pro OLED Screen',
    category: 'iPhone Parts',
    price: 129.99,
    discount_percentage: 10,
    imageUrl: '/images/placeholder.svg',
    badge: 'Best Seller'
  },
  {
    id: 102,
    name: 'iPhone 12 LCD Screen',
    category: 'iPhone Parts',
    price: 89.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg'
  },
  {
    id: 103,
    name: 'iPhone 11 Battery Replacement',
    category: 'iPhone Parts',
    price: 49.99,
    discount_percentage: 15,
    imageUrl: '/images/placeholder.svg',
    badge: '15% OFF'
  },
  {
    id: 104,
    name: 'iPhone X Charging Port Flex',
    category: 'iPhone Parts',
    price: 29.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg'
  }
];

function IPhoneParts() {
  return (
    <Layout
      title="iPhone Parts - Midas Technical Solutions"
      description="High-quality iPhone replacement parts for all models. Screens, batteries, charging ports, and more."
    >
      <div className="container" style={{ padding: '40px 20px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>iPhone Parts</h1>
        <p style={{ marginBottom: '2rem' }}>
          Find high-quality replacement parts for all iPhone models. We offer screens, batteries,
          charging ports, cameras, and more to help you repair your iPhone.
        </p>

        <ProductList products={iphoneParts} title="iPhone Replacement Parts" />
      </div>
    </Layout>
  );
}

export default React.memo(IPhoneParts);
