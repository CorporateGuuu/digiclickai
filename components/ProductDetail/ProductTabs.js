import React, { useState } from 'react';
import styles from './ProductTabs.module.css';

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className={styles.productTabs}>
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'description' ? styles.active : ''}`}
          onClick={() => setActiveTab('description')}
        >
          Description
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'specifications' ? styles.active : ''}`}
          onClick={() => setActiveTab('specifications')}
        >
          Specifications
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'shipping' ? styles.active : ''}`}
          onClick={() => setActiveTab('shipping')}
        >
          Shipping & Returns
        </button>
      </div>
      
      <div className={styles.tabContent}>
        {activeTab === 'description' && (
          <div className={styles.description}>
            <p>{product.description || 'No description available for this product.'}</p>
            
            {/* Additional content for demo purposes */}
            <p>This high-quality replacement part is designed to restore your device to its original functionality. Our parts undergo rigorous testing to ensure they meet or exceed OEM specifications.</p>
            
            <h3>Features:</h3>
            <ul>
              <li>100% compatible with your device</li>
              <li>Tested for optimal performance</li>
              <li>Easy installation with proper tools</li>
              <li>30-day warranty included</li>
            </ul>
          </div>
        )}
        
        {activeTab === 'specifications' && (
          <div className={styles.specifications}>
            <table className={styles.specTable}>
              <tbody>
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  value && key !== 'id' && key !== 'product_id' && (
                    <tr key={key}>
                      <th>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>
                      <td>{value}</td>
                    </tr>
                  )
                ))}
                
                {/* Additional specs for demo purposes */}
                <tr>
                  <th>Compatibility</th>
                  <td>iPhone 13 Pro, iPhone 13 Pro Max</td>
                </tr>
                <tr>
                  <th>Material</th>
                  <td>OLED Display</td>
                </tr>
                <tr>
                  <th>Resolution</th>
                  <td>2532 x 1170 pixels</td>
                </tr>
                <tr>
                  <th>Dimensions</th>
                  <td>146.7 x 71.5 mm</td>
                </tr>
                <tr>
                  <th>Warranty</th>
                  <td>30 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'shipping' && (
          <div className={styles.shipping}>
            <h3>Shipping Information</h3>
            <p>We ship all orders within 24 hours of purchase (excluding weekends and holidays). Standard shipping typically takes 3-5 business days, while expedited shipping options are available at checkout.</p>
            
            <h3>Return Policy</h3>
            <p>If you're not completely satisfied with your purchase, you can return it within 30 days of delivery for a full refund or exchange. Please note that items must be in their original condition and packaging.</p>
            
            <h3>Warranty</h3>
            <p>All our products come with a 30-day warranty against manufacturing defects. If your item arrives damaged or stops working within the warranty period, please contact our customer service team for assistance.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
