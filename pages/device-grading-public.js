import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout/Layout';
import styles from '../styles/DeviceGrading.module.css';

export default function DeviceGradingPublicPage() {
  const [activeTab, setActiveTab] = useState('lcd');
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  return (
    <Layout>
      <Head>
        <title>Device Grading System | MDTS - Midas Technical Solutions</title>
        <meta name="description" content="Learn about our device grading system for LCD buyback and trade-ins at MDTS - Midas Technical Solutions." />
      </Head>
      
      <main className="main-content">
        <div className="container">
          <div className={styles.gradingHeader}>
            <h1>Device Grading System</h1>
            <p>
              At MDTS, we use a standardized grading system to ensure transparency and consistency
              in our device evaluations. Whether you're buying a refurbished device or selling through
              our LCD Buyback Program, understanding our grading system helps you make informed decisions.
            </p>
          </div>
          
          <div className={styles.gradingTabs}>
            <button 
              className={`${styles.gradingTab} ${activeTab === 'lcd' ? styles.active : ''}`}
              onClick={() => handleTabChange('lcd')}
            >
              LCD Screens
            </button>
            <button 
              className={`${styles.gradingTab} ${activeTab === 'devices' ? styles.active : ''}`}
              onClick={() => handleTabChange('devices')}
            >
              Complete Devices
            </button>
            <button 
              className={`${styles.gradingTab} ${activeTab === 'batteries' ? styles.active : ''}`}
              onClick={() => handleTabChange('batteries')}
            >
              Batteries
            </button>
          </div>
          
          <div className={styles.gradingContent}>
            {activeTab === 'lcd' && (
              <div className={styles.gradingSection}>
                <h2>LCD Screen Grading</h2>
                <p>
                  Our LCD screen grading is based on visual appearance, functionality, and overall quality.
                  Each grade represents a different level of condition and value.
                </p>
                
                <div className={styles.gradingCards}>
                  <div className={styles.gradingCard}>
                    <div className={styles.gradeBadge} style={{ backgroundColor: '#4CAF50' }}>Grade A</div>
                    <h3>Grade A (Excellent)</h3>
                    <ul>
                      <li>100% functional with no issues</li>
                      <li>No visible scratches or marks</li>
                      <li>Perfect touch functionality</li>
                      <li>No discoloration or burn-in</li>
                      <li>Original OEM quality</li>
                    </ul>
                    <div className={styles.gradeImages}>
                      <img src="/images/grading/lcd-a1.jpg" alt="Grade A LCD Example 1" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                      <img src="/images/grading/lcd-a2.jpg" alt="Grade A LCD Example 2" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                    </div>
                  </div>
                  
                  <div className={styles.gradingCard}>
                    <div className={styles.gradeBadge} style={{ backgroundColor: '#2196F3' }}>Grade B</div>
                    <h3>Grade B (Good)</h3>
                    <ul>
                      <li>100% functional</li>
                      <li>Minor scratches (not visible when screen is on)</li>
                      <li>Full touch functionality</li>
                      <li>Slight discoloration may be present</li>
                      <li>May be aftermarket high-quality</li>
                    </ul>
                    <div className={styles.gradeImages}>
                      <img src="/images/grading/lcd-b1.jpg" alt="Grade B LCD Example 1" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                      <img src="/images/grading/lcd-b2.jpg" alt="Grade B LCD Example 2" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                    </div>
                  </div>
                  
                  <div className={styles.gradingCard}>
                    <div className={styles.gradeBadge} style={{ backgroundColor: '#FFC107' }}>Grade C</div>
                    <h3>Grade C (Fair)</h3>
                    <ul>
                      <li>Fully functional</li>
                      <li>Visible scratches when screen is on</li>
                      <li>Touch functionality works</li>
                      <li>May have noticeable discoloration</li>
                      <li>Typically aftermarket</li>
                    </ul>
                    <div className={styles.gradeImages}>
                      <img src="/images/grading/lcd-c1.jpg" alt="Grade C LCD Example 1" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                      <img src="/images/grading/lcd-c2.jpg" alt="Grade C LCD Example 2" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                    </div>
                  </div>
                  
                  <div className={styles.gradingCard}>
                    <div className={styles.gradeBadge} style={{ backgroundColor: '#F44336' }}>Grade D</div>
                    <h3>Grade D (Poor)</h3>
                    <ul>
                      <li>Functional but with issues</li>
                      <li>Heavy scratches or cracks</li>
                      <li>Touch may have dead spots</li>
                      <li>Significant discoloration or burn-in</li>
                      <li>Low-quality aftermarket</li>
                    </ul>
                    <div className={styles.gradeImages}>
                      <img src="/images/grading/lcd-d1.jpg" alt="Grade D LCD Example 1" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                      <img src="/images/grading/lcd-d2.jpg" alt="Grade D LCD Example 2" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                    </div>
                  </div>
                </div>
                
                <div className={styles.gradingNote}>
                  <h3>Note on LCD Buyback</h3>
                  <p>
                    When selling your LCD screens through our <Link href="/lcd-buyback">LCD Buyback Program</Link>,
                    the grade assigned will directly impact the buyback value. Higher grades receive better prices.
                    We accept all grades from A to D, but screens with severe damage beyond Grade D may not be eligible.
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'devices' && (
              <div className={styles.gradingSection}>
                <h2>Complete Device Grading</h2>
                <p>
                  Our complete device grading considers the overall condition, functionality, cosmetic appearance,
                  and battery health. This applies to smartphones, tablets, and laptops.
                </p>
                
                <div className={styles.gradingCards}>
                  <div className={styles.gradingCard}>
                    <div className={styles.gradeBadge} style={{ backgroundColor: '#4CAF50' }}>Grade A</div>
                    <h3>Grade A (Excellent)</h3>
                    <ul>
                      <li>Like new condition</li>
                      <li>No visible scratches or marks</li>
                      <li>100% functional with no issues</li>
                      <li>Battery health above 90%</li>
                      <li>All components original and working</li>
                    </ul>
                    <div className={styles.gradeImages}>
                      <img src="/images/grading/device-a1.jpg" alt="Grade A Device Example 1" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                      <img src="/images/grading/device-a2.jpg" alt="Grade A Device Example 2" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                    </div>
                  </div>
                  
                  <div className={styles.gradingCard}>
                    <div className={styles.gradeBadge} style={{ backgroundColor: '#2196F3' }}>Grade B</div>
                    <h3>Grade B (Good)</h3>
                    <ul>
                      <li>Good condition with minor wear</li>
                      <li>Light scratches on body or screen</li>
                      <li>Fully functional</li>
                      <li>Battery health 80-90%</li>
                      <li>All components working properly</li>
                    </ul>
                    <div className={styles.gradeImages}>
                      <img src="/images/grading/device-b1.jpg" alt="Grade B Device Example 1" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                      <img src="/images/grading/device-b2.jpg" alt="Grade B Device Example 2" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                    </div>
                  </div>
                  
                  <div className={styles.gradingCard}>
                    <div className={styles.gradeBadge} style={{ backgroundColor: '#FFC107' }}>Grade C</div>
                    <h3>Grade C (Fair)</h3>
                    <ul>
                      <li>Noticeable wear and tear</li>
                      <li>Visible scratches or minor dents</li>
                      <li>Functional with minor issues</li>
                      <li>Battery health 70-80%</li>
                      <li>May have non-original components</li>
                    </ul>
                    <div className={styles.gradeImages}>
                      <img src="/images/grading/device-c1.jpg" alt="Grade C Device Example 1" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                      <img src="/images/grading/device-c2.jpg" alt="Grade C Device Example 2" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                    </div>
                  </div>
                  
                  <div className={styles.gradingCard}>
                    <div className={styles.gradeBadge} style={{ backgroundColor: '#F44336' }}>Grade D</div>
                    <h3>Grade D (Poor)</h3>
                    <ul>
                      <li>Heavy wear and tear</li>
                      <li>Significant scratches, dents, or cracks</li>
                      <li>Functional but with multiple issues</li>
                      <li>Battery health below 70%</li>
                      <li>Multiple non-original components</li>
                    </ul>
                    <div className={styles.gradeImages}>
                      <img src="/images/grading/device-d1.jpg" alt="Grade D Device Example 1" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                      <img src="/images/grading/device-d2.jpg" alt="Grade D Device Example 2" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'batteries' && (
              <div className={styles.gradingSection}>
                <h2>Battery Grading</h2>
                <p>
                  Battery grading is based on capacity retention, cycle count, and physical condition.
                  We test all batteries thoroughly before assigning a grade.
                </p>
                
                <div className={styles.gradingCards}>
                  <div className={styles.gradingCard}>
                    <div className={styles.gradeBadge} style={{ backgroundColor: '#4CAF50' }}>Grade A</div>
                    <h3>Grade A (Excellent)</h3>
                    <ul>
                      <li>90-100% capacity retention</li>
                      <li>Low cycle count</li>
                      <li>No swelling or physical damage</li>
                      <li>Excellent voltage stability</li>
                      <li>Original OEM battery</li>
                    </ul>
                  </div>
                  
                  <div className={styles.gradingCard}>
                    <div className={styles.gradeBadge} style={{ backgroundColor: '#2196F3' }}>Grade B</div>
                    <h3>Grade B (Good)</h3>
                    <ul>
                      <li>80-89% capacity retention</li>
                      <li>Moderate cycle count</li>
                      <li>No physical damage</li>
                      <li>Good voltage stability</li>
                      <li>Original or high-quality replacement</li>
                    </ul>
                  </div>
                  
                  <div className={styles.gradingCard}>
                    <div className={styles.gradeBadge} style={{ backgroundColor: '#FFC107' }}>Grade C</div>
                    <h3>Grade C (Fair)</h3>
                    <ul>
                      <li>70-79% capacity retention</li>
                      <li>High cycle count</li>
                      <li>No significant physical issues</li>
                      <li>Acceptable voltage stability</li>
                      <li>May be aftermarket replacement</li>
                    </ul>
                  </div>
                  
                  <div className={styles.gradingCard}>
                    <div className={styles.gradeBadge} style={{ backgroundColor: '#F44336' }}>Grade D</div>
                    <h3>Grade D (Poor)</h3>
                    <ul>
                      <li>Below 70% capacity retention</li>
                      <li>Very high cycle count</li>
                      <li>Minor swelling may be present</li>
                      <li>Poor voltage stability</li>
                      <li>Typically aftermarket replacement</li>
                    </ul>
                  </div>
                </div>
                
                <div className={styles.gradingNote}>
                  <h3>Battery Safety</h3>
                  <p>
                    We do not accept batteries with visible damage, leakage, or severe swelling as they pose safety risks.
                    All batteries are tested for capacity and performance before grading.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.gradingCTA}>
            <h2>Ready to Sell or Trade In?</h2>
            <p>
              Whether you're looking to sell your old devices or trade them in for an upgrade,
              our fair grading system ensures you get the best value for your electronics.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/lcd-buyback" className={styles.primaryButton}>
                LCD Buyback Program
              </Link>
              <Link href="/auth/signin?callbackUrl=/device-system" className={styles.secondaryButton}>
                View In-Stock Devices
              </Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
