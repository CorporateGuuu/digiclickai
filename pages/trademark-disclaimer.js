import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';

function TrademarkDisclaimer() {
  return (
    <Layout
      title="Trademark Disclaimer - Midas Technical Solutions"
      description="Read our trademark disclaimer regarding the use of third-party trademarks and brand names on the MDTS website."
    >
      <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Trademark Disclaimer</h1>
        
        <section style={{ marginBottom: '2rem' }}>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            The trademarks, service marks, and logos (collectively the "Trademarks") used and displayed on this website are registered and unregistered Trademarks of Midas Technical Solutions and others.
          </p>
          
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            Nothing on this website should be construed as granting, by implication, estoppel, or otherwise, any license or right to use any Trademark displayed on this website without the written permission of Midas Technical Solutions or the third party that owns the Trademark.
          </p>
          
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            Midas Technical Solutions aggressively enforces its intellectual property rights to the fullest extent of the law. The name Midas Technical Solutions, MDTS, the Midas Technical Solutions logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Midas Technical Solutions or its affiliates. You may not use such marks without the prior written permission of Midas Technical Solutions.
          </p>
        </section>
        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Third-Party Trademarks</h2>
          
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            All other trademarks, registered trademarks, product names and company names or logos mentioned on the website are the property of their respective owners. Reference to any products, services, processes, or other information by trade name, trademark, manufacturer, supplier, or otherwise does not constitute or imply endorsement, sponsorship, or recommendation by Midas Technical Solutions.
          </p>
          
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            Specifically, Midas Technical Solutions is not affiliated with, endorsed by, or sponsored by Apple Inc., Samsung Electronics Co., Ltd., or any other manufacturer whose products or parts are sold on our website. All manufacturer names, logos, product names, and trademarks are the property of their respective owners.
          </p>
          
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            The following is a non-exhaustive list of third-party trademarks that may appear on our website:
          </p>
          
          <ul style={{ 
            marginBottom: '1rem', 
            paddingLeft: '1.5rem',
            lineHeight: '1.6'
          }}>
            <li>Apple®, iPhone®, iPad®, MacBook®, and other Apple product names are trademarks of Apple Inc., registered in the U.S. and other countries.</li>
            <li>Samsung®, Galaxy®, and other Samsung product names are trademarks of Samsung Electronics Co., Ltd.</li>
            <li>Google®, Pixel®, and other Google product names are trademarks of Google LLC.</li>
            <li>Other product and company names mentioned herein may be trademarks of their respective owners.</li>
          </ul>
        </section>
        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Compatibility Statement</h2>
          
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            When we state that our products are "compatible" with a specific device or model, we are indicating that our products are designed to work with that device or model. This does not imply that our products are manufactured by, endorsed by, or affiliated with the original equipment manufacturer.
          </p>
          
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            Unless explicitly stated otherwise, the parts and accessories sold on our website are aftermarket products designed to be compatible with the referenced devices. They are not original equipment manufacturer (OEM) parts unless specifically labeled as "OEM" or "Genuine."
          </p>
        </section>
        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Apple Parts Program</h2>
          
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            Midas Technical Solutions is a participant in the Apple Independent Repair Provider Program. Through this program, we are authorized to offer genuine Apple parts for certain repairs. When we refer to "Genuine Apple Parts" or "GAPP" (Genuine Apple Parts Program), we are referring to parts obtained through this official program.
          </p>
          
          <p style={{ lineHeight: '1.6' }}>
            For more information about our participation in the Apple Independent Repair Provider Program, please visit our <Link href="/gapp" style={{ color: '#0066cc', textDecoration: 'none' }}>Apple Parts Program page</Link>.
          </p>
        </section>
        
        <section style={{ 
          backgroundColor: '#f0f7ff', 
          padding: '1.5rem', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Contact Information</h2>
          
          <p style={{ lineHeight: '1.6' }}>
            If you have any questions about our trademark usage or would like to report potential trademark infringement, please contact us at:
          </p>
          
          <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
            Midas Technical Solutions<br />
            Vienna, VA 22182<br />
            Email: legal@mdtstech.store<br />
            Phone: +1 (240) 351-0511
          </p>
        </section>
      </div>
    </Layout>
  );
}

export default TrademarkDisclaimer;
