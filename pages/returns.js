import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';

function ReturnsWarranty() {
  return (
    <>
      <Head>
        <title>Returns & Warranty Policy - Midas Technical Solutions</title>
        <meta name="description" content="Learn about our returns process, warranty coverage, and refund policies at Midas Technical Solutions." />
      </Head>

      <Layout title="Returns & Warranty Policy - Midas Technical Solutions" description="Learn about our returns process, warranty coverage, and refund policies at Midas Technical Solutions.">

        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Returns & Warranty Policy</h1>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Returns Policy</h2>
            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
              At Midas Technical Solutions, we want you to be completely satisfied with your purchase. If you're not satisfied, we offer a straightforward return policy to ensure a positive shopping experience.
            </p>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>Return Eligibility</h3>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>30-Day Return Period:</strong> Items may be returned within 30 days of receipt.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>New, Unopened Items:</strong> Products must be in original, unopened packaging for a full refund.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Opened Items:</strong> Products that have been opened but are in original condition may be eligible for exchange or store credit.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Defective Items:</strong> Defective products can be returned for replacement or refund within the warranty period.
              </li>
            </ul>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>Non-Returnable Items</h3>
            <p style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>
              The following items cannot be returned:
            </p>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Custom-cut adhesives and screen protectors</li>
              <li style={{ marginBottom: '0.5rem' }}>Software and digital downloads</li>
              <li style={{ marginBottom: '0.5rem' }}>Items marked as "Final Sale" or "Non-Returnable"</li>
              <li style={{ marginBottom: '0.5rem' }}>Products showing signs of misuse or installation attempts</li>
            </ul>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>Return Process</h3>
            <ol style={{ marginLeft: '1.5rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Initiate Return:</strong> Log into your account and select the order containing the item(s) you wish to return. Follow the prompts to generate a return authorization.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Packaging:</strong> Pack the item(s) securely in the original packaging if possible.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Shipping:</strong> Use the provided return shipping label or ship the item to the address provided in the return authorization.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Processing:</strong> Once we receive your return, we'll inspect the item and process your refund or exchange within 5-7 business days.
              </li>
            </ol>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>Refunds</h3>
            <p style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>
              Refunds will be issued to the original payment method used for the purchase:
            </p>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Credit Card Refunds:</strong> 3-5 business days to process after we receive and inspect the return.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>PayPal/Digital Wallet Refunds:</strong> 1-2 business days to process.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Store Credit:</strong> Issued immediately upon approval of return.
              </li>
            </ul>

            <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
              <strong>Note:</strong> Original shipping charges are non-refundable unless the return is due to our error or a defective product.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Warranty Policy</h2>
            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
              Midas Technical Solutions stands behind the quality of our products with comprehensive warranty coverage.
            </p>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>Standard Warranty Coverage</h3>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Replacement Parts:</strong> 90-day warranty against manufacturing defects.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Premium/OEM Parts:</strong> 180-day to 1-year warranty (varies by product).
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Tools & Equipment:</strong> 1-year warranty against manufacturing defects.
              </li>
            </ul>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>What's Covered</h3>
            <p style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>
              Our warranty covers:
            </p>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Manufacturing defects</li>
              <li style={{ marginBottom: '0.5rem' }}>Parts that fail under normal use</li>
              <li style={{ marginBottom: '0.5rem' }}>Items that don't match the advertised description</li>
            </ul>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>What's Not Covered</h3>
            <p style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>
              Our warranty does not cover:
            </p>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Damage from improper installation</li>
              <li style={{ marginBottom: '0.5rem' }}>Normal wear and tear</li>
              <li style={{ marginBottom: '0.5rem' }}>Damage from misuse, accidents, or modifications</li>
              <li style={{ marginBottom: '0.5rem' }}>Consumable items (adhesives, cleaning supplies, etc.)</li>
            </ul>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>Warranty Claim Process</h3>
            <ol style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Contact Us:</strong> Reach out to our customer service team with your order number and a description of the issue.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Documentation:</strong> Provide photos or videos of the defective item as requested.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Evaluation:</strong> Our technical team will evaluate your claim and provide instructions for replacement or repair.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Resolution:</strong> Depending on the situation, we'll provide a replacement, repair, or refund.
              </li>
            </ol>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Need Assistance?</h2>
            <p style={{ lineHeight: '1.6' }}>
              If you have questions about returns or warranty claims, please <Link href="/contact" style={{ color: '#0066cc' }}>contact our customer service team</Link>. We're here to help ensure your satisfaction with our products.
            </p>
          </section>
        </div>
      
</Layout>
    </>
  );
}

export default React.memo(ReturnsWarranty);
