import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';

function QualityStandards() {
  return (
    <Layout
      title="Quality Standards - Midas Technical Solutions"
      description="Learn about MDTS's commitment to quality, our rigorous testing processes, and the standards we maintain for all our products."
    >
      <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Quality Standards</h1>
        
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Our Commitment to Quality</h2>
          
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            At Midas Technical Solutions, quality is at the core of everything we do. We understand that when you're repairing valuable devices, the quality of parts can make the difference between a successful repair and a costly mistake. That's why we maintain rigorous quality standards for all products we sell.
          </p>
          
          <p style={{ lineHeight: '1.6' }}>
            Our commitment to quality extends throughout our entire operation, from sourcing and testing to packaging and shipping. We work directly with manufacturers and suppliers who share our dedication to excellence, and we continuously monitor and improve our processes to ensure you receive only the best products.
          </p>
        </section>
        
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Product Categories and Standards</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>OEM Parts</h3>
            <p style={{ lineHeight: '1.6' }}>
              Our Original Equipment Manufacturer (OEM) parts are sourced directly from the original manufacturers or their authorized distributors. These parts are identical to those used in the original device assembly and meet or exceed the manufacturer's specifications.
            </p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Premium Aftermarket Parts</h3>
            <p style={{ lineHeight: '1.6' }}>
              Our Premium Aftermarket parts are manufactured to meet or exceed OEM specifications. These parts undergo rigorous testing to ensure they provide performance comparable to OEM parts, often at a more competitive price point. We select only the highest quality aftermarket parts from trusted manufacturers with proven track records.
            </p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Standard Aftermarket Parts</h3>
            <p style={{ lineHeight: '1.6' }}>
              Our Standard Aftermarket parts offer a cost-effective solution while still meeting our quality requirements. While these parts may not have all the features or exact specifications of OEM parts, they are thoroughly tested to ensure reliable performance for standard repairs.
            </p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Repair Tools</h3>
            <p style={{ lineHeight: '1.6' }}>
              We select repair tools based on durability, precision, and ergonomics. Our professional-grade tools are designed to withstand the demands of frequent use while providing the precision needed for delicate repairs. Each tool is tested for functionality and quality before being added to our inventory.
            </p>
          </div>
        </section>
        
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Quality Assurance Process</h2>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '1rem' 
            }}>
              <div style={{ 
                minWidth: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: '#0066cc', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '1.25rem'
              }}>
                1
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Supplier Qualification</h3>
                <p style={{ lineHeight: '1.6' }}>
                  We carefully vet all suppliers through a rigorous qualification process. We evaluate their manufacturing capabilities, quality control processes, compliance with industry standards, and track record of reliability. We only partner with suppliers who demonstrate a consistent commitment to quality.
                </p>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '1rem' 
            }}>
              <div style={{ 
                minWidth: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: '#0066cc', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '1.25rem'
              }}>
                2
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Incoming Inspection</h3>
                <p style={{ lineHeight: '1.6' }}>
                  All incoming products undergo a thorough inspection upon arrival at our facility. Our quality control team checks for physical defects, packaging integrity, and proper labeling. Random samples from each batch are selected for more detailed testing.
                </p>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '1rem' 
            }}>
              <div style={{ 
                minWidth: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: '#0066cc', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '1.25rem'
              }}>
                3
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Functional Testing</h3>
                <p style={{ lineHeight: '1.6' }}>
                  Sample products from each batch undergo functional testing to verify performance. For electronic components, this includes electrical testing, compatibility verification, and performance evaluation. For tools, we test durability, precision, and functionality.
                </p>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '1rem' 
            }}>
              <div style={{ 
                minWidth: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: '#0066cc', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '1.25rem'
              }}>
                4
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Quality Documentation</h3>
                <p style={{ lineHeight: '1.6' }}>
                  We maintain detailed records of all quality tests and inspections. This documentation helps us track product performance over time, identify potential issues before they affect customers, and continuously improve our quality standards.
                </p>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '1rem' 
            }}>
              <div style={{ 
                minWidth: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: '#0066cc', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '1.25rem'
              }}>
                5
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Continuous Monitoring</h3>
                <p style={{ lineHeight: '1.6' }}>
                  We continuously monitor product performance through customer feedback, return rates, and regular testing of inventory. This allows us to quickly identify and address any quality issues that may arise.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Certifications and Compliance</h2>
          
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            We ensure that our products comply with relevant industry standards and regulations. Where applicable, our products carry certifications such as:
          </p>
          
          <ul style={{ 
            marginBottom: '1rem', 
            paddingLeft: '1.5rem',
            lineHeight: '1.6'
          }}>
            <li>RoHS (Restriction of Hazardous Substances)</li>
            <li>REACH (Registration, Evaluation, Authorization and Restriction of Chemicals)</li>
            <li>CE (Conformité Européenne)</li>
            <li>FCC (Federal Communications Commission)</li>
            <li>UL (Underwriters Laboratories)</li>
          </ul>
          
          <p style={{ lineHeight: '1.6' }}>
            These certifications help ensure that our products meet safety, environmental, and performance standards.
          </p>
        </section>
        
        <section style={{ 
          backgroundColor: '#f0f7ff', 
          padding: '1.5rem', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Our Quality Guarantee</h2>
          
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            We stand behind the quality of our products with our comprehensive warranty policy. If any product fails to meet our quality standards or performs differently than described, we will replace it or provide a refund according to our <Link href="/returns" style={{ color: '#0066cc', textDecoration: 'none' }}>Returns & Warranty Policy</Link>.
          </p>
          
          <p style={{ lineHeight: '1.6' }}>
            If you have any questions about our quality standards or would like more information about a specific product, please <Link href="/contact" style={{ color: '#0066cc', textDecoration: 'none' }}>contact us</Link>. Our technical support team is always ready to assist you.
          </p>
        </section>
      </div>
    </Layout>
  );
}

export default QualityStandards;
