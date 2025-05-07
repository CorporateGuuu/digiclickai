import React from 'react';
import Layout from '../../components/Layout/Layout';
import ProductList from '../../components/ProductList/ProductList';

// Sample repair tools data
const repairTools = [
  {
    id: 501,
    name: 'Professional Repair Tool Kit',
    category: 'Tools',
    price: 89.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg',
    badge: 'Best Seller'
  },
  {
    id: 502,
    name: 'Precision Screwdriver Set',
    category: 'Tools',
    price: 49.99,
    discount_percentage: 10,
    imageUrl: '/images/placeholder.svg',
    badge: '10% OFF'
  },
  {
    id: 503,
    name: 'Heat Gun for Repairs',
    category: 'Tools',
    price: 69.99,
    discount_percentage: 15,
    imageUrl: '/images/placeholder.svg',
    badge: '15% OFF'
  },
  {
    id: 504,
    name: 'Anti-Static Wrist Strap',
    category: 'Tools',
    price: 9.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg'
  },
  {
    id: 505,
    name: 'LCD Screen Separator Machine',
    category: 'Tools',
    price: 199.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg'
  },
  {
    id: 506,
    name: 'Soldering Iron Kit',
    category: 'Tools',
    price: 59.99,
    discount_percentage: 0,
    imageUrl: '/images/placeholder.svg'
  }
];

function RepairTools() {
  return (
    <Layout
      title="Repair Tools - Midas Technical Solutions"
      description="Professional repair tools for electronics. Screwdriver sets, heat guns, soldering equipment, and more."
    >
      <div className="container" style={{ padding: '40px 20px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Repair Tools</h1>
        <p style={{ marginBottom: '2rem' }}>
          Find professional-grade tools for all your electronics repair needs. We offer precision screwdriver sets,
          heat guns, soldering equipment, and more to help you with your repairs.
        </p>

        <ProductList products={repairTools} title="Professional Repair Tools" />
      </div>
    </Layout>
  );
}

export default React.memo(RepairTools);
