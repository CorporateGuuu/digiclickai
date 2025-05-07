import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';

function ShippingPolicy() {
  return (
    <>
      <Head>
        <title>Shipping Policy - Midas Technical Solutions</title>
        <meta name="description" content="Learn about our shipping options, delivery times, and international shipping policies at Midas Technical Solutions." />
      </Head>

      <Layout title="Shipping Policy - Midas Technical Solutions" description="Learn about our shipping options, delivery times, and international shipping policies at Midas Technical Solutions.">

        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Shipping Policy</h1>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Domestic Shipping</h2>
            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
              Midas Technical Solutions ships to all 50 United States and U.S. territories. We offer several shipping options to meet your needs:
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f7ff' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Shipping Method</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Estimated Delivery Time</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Standard Shipping</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>3-5 business days</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>$5.99 (Free on orders over $1,000)</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Expedited Shipping</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>2 business days</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>$9.99</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Next Day Shipping</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>1 business day</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>$19.99</td>
                </tr>
              </tbody>
            </table>

            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
              <strong>Processing Time:</strong> Most orders are processed within 1 business day. Orders placed after 2:00 PM EST may be processed the following business day.
            </p>

            <p style={{ lineHeight: '1.6' }}>
              <strong>Business Days:</strong> Monday through Friday, excluding federal holidays.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>International Shipping</h2>
            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
              We ship to most countries worldwide. International shipping rates and delivery times vary by location.
            </p>

            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Standard International:</strong> 7-14 business days, rates calculated at checkout based on destination and package weight
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Express International:</strong> 3-5 business days, rates calculated at checkout based on destination and package weight
              </li>
            </ul>

            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
              <strong>Important Note:</strong> International customers are responsible for all duties, import taxes, and customs fees. These are not included in the shipping cost and will be collected by the delivery carrier or customs office.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Order Tracking</h2>
            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
              Once your order ships, you will receive a confirmation email with tracking information. You can also track your order by:
            </p>

            <ol style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
              <li style={{ marginBottom: '0.5rem' }}>Logging into your account and viewing your order history</li>
              <li style={{ marginBottom: '0.5rem' }}>Clicking the tracking link in your shipping confirmation email</li>
              <li style={{ marginBottom: '0.5rem' }}>Contacting our customer service team with your order number</li>
            </ol>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Shipping Restrictions</h2>
            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
              Some products cannot be shipped to certain locations due to local regulations or shipping carrier restrictions. These include:
            </p>

            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
              <li style={{ marginBottom: '0.5rem' }}>Lithium batteries to some international destinations</li>
              <li style={{ marginBottom: '0.5rem' }}>Certain chemicals and adhesives to specific regions</li>
              <li style={{ marginBottom: '0.5rem' }}>Products that violate local import regulations</li>
            </ul>

            <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
              If you have questions about shipping restrictions to your location, please <Link href="/contact" style={{ color: '#0066cc' }}>contact us</Link> before placing your order.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Shipping Address</h2>
            <p style={{ lineHeight: '1.6' }}>
              It is the customer's responsibility to provide accurate shipping information. We are not responsible for orders shipped to incorrect addresses provided by the customer. If a package is returned to us due to an incorrect address, the customer will be responsible for any reshipping costs.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Questions About Shipping?</h2>
            <p style={{ lineHeight: '1.6' }}>
              If you have any questions about our shipping policies or need assistance with a specific order, please <Link href="/contact" style={{ color: '#0066cc' }}>contact our customer service team</Link>.
            </p>
          </section>
        </div>

      </Layout>
    </>
  );
}

export default React.memo(ShippingPolicy);
