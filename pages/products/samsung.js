import React from 'react';
import Layout from '../../components/Layout/Layout';
import ProductList from '../../components/ProductList/ProductList';

// Sample Samsung parts data
const samsungParts = [
  {
    id: 201,
    name: 'Samsung Galaxy S22 OLED Screen',
    category: 'Samsung Parts',
    price: 149.99,
    discount_percentage: 15,
    imageUrl: '/images/placeholder.svg',
    badge: '15% OFF'
  },
  {
    id: 202,
    name: 'Samsung Galaxy S21 Battery',
    category: 'Samsung Parts',
    price: 39.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg'
  },
  {
    id: 203,
    name: 'Samsung Galaxy Note 20 Charging Port',
    category: 'Samsung Parts',
    price: 24.99,
    discount_percentage: 10,
    imageUrl: '/images/placeholder.svg',
    badge: '10% OFF'
  },
  {
    id: 204,
    name: 'Samsung Galaxy A53 Camera Module',
    category: 'Samsung Parts',
    price: 59.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg'
  }
];

function SamsungParts() {
  return (
    <Layout
      title="Samsung Parts - Midas Technical Solutions"
      description="High-quality Samsung replacement parts for all models. Screens, batteries, charging ports, and more."
    >
      <div className="container" style={{ padding: '40px 20px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Samsung Parts</h1>
        <p style={{ marginBottom: '2rem' }}>
          Find high-quality replacement parts for all Samsung Galaxy models. We offer screens, batteries,
          charging ports, cameras, and more to help you repair your Samsung device.
        </p>

        <ProductList products={samsungParts} title="Samsung Replacement Parts" />
      </div>
    </Layout>
  );
}

export default React.memo(SamsungParts);
