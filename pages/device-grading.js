import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';
import Layout from '../components/Layout/Layout';
import styles from '../styles/DeviceGrading.module.css';

export default function DeviceGradingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('lcd');

  // Redirect based on authentication status
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      // If not authenticated, redirect to public version
      router.replace('/device-grading-public');
    }
  }, [status, router]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <Layout>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            flexDirection: 'column'
          }}>
            <div style={{
              border: '4px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '50%',
              borderTop: '4px solid #0066cc',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              marginBottom: '1rem'
            }}></div>
            <p>Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // If not authenticated, don't render anything (will be redirected)
  if (status === 'unauthenticated') {
    return null;
  }

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
              At MDTS, we use a standardized grading system to evaluate the condition of devices and parts.
              This ensures transparency and fair pricing for all our customers.
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
                      <img src="/images/grading/lcd-a1.jpg" alt="Grade A LCD Example 1" />
                      <img src="/images/grading/lcd-a2.jpg" alt="Grade A LCD Example 2" />
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
                      <img src="/images/grading/lcd-b1.jpg" alt="Grade B LCD Example 1" />
                      <img src="/images/grading/lcd-b2.jpg" alt="Grade B LCD Example 2" />
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
                      <img src="/images/grading/lcd-c1.jpg" alt="Grade C LCD Example 1" />
                      <img src="/images/grading/lcd-c2.jpg" alt="Grade C LCD Example 2" />
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
                      <img src="/images/grading/lcd-d1.jpg" alt="Grade D LCD Example 1" />
                      <img src="/images/grading/lcd-d2.jpg" alt="Grade D LCD Example 2" />
                    </div>
                  </div>
                </div>

                <div className={styles.gradingNote}>
                  <h3>LCD Buyback Program</h3>
                  <p>
                    We buy back LCD screens in all conditions. The grade of your LCD will determine the buyback value.
                    Submit your LCD screens through our <Link href="/lcd-buyback">LCD Buyback Program</Link> to receive a quote.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'devices' && (
              <div className={styles.gradingSection}>
                <h2>Complete Device Grading</h2>

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
                      <img src="/images/grading/device-a1.jpg" alt="Grade A Device Example 1" />
                      <img src="/images/grading/device-a2.jpg" alt="Grade A Device Example 2" />
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
                      <img src="/images/grading/device-b1.jpg" alt="Grade B Device Example 1" />
                      <img src="/images/grading/device-b2.jpg" alt="Grade B Device Example 2" />
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
                      <img src="/images/grading/device-c1.jpg" alt="Grade C Device Example 1" />
                      <img src="/images/grading/device-c2.jpg" alt="Grade C Device Example 2" />
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
                      <img src="/images/grading/device-d1.jpg" alt="Grade D Device Example 1" />
                      <img src="/images/grading/device-d2.jpg" alt="Grade D Device Example 2" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'batteries' && (
              <div className={styles.gradingSection}>
                <h2>Battery Grading</h2>

                <div className={styles.gradingCards}>
                  <div className={styles.gradingCard}>
                    <div className={styles.gradeBadge} style={{ backgroundColor: '#4CAF50' }}>Grade A</div>
                    <h3>Grade A (Excellent)</h3>
                    <ul>
                      <li>90-100% capacity</li>
                      <li>No swelling or damage</li>
                      <li>Original OEM battery</li>
                      <li>Less than 100 charge cycles</li>
                      <li>Holds charge perfectly</li>
                    </ul>
                  </div>

                  <div className={styles.gradingCard}>
                    <div className={styles.gradeBadge} style={{ backgroundColor: '#2196F3' }}>Grade B</div>
                    <h3>Grade B (Good)</h3>
                    <ul>
                      <li>80-90% capacity</li>
                      <li>No visible damage</li>
                      <li>OEM or high-quality replacement</li>
                      <li>100-300 charge cycles</li>
                      <li>Holds charge well</li>
                    </ul>
                  </div>

                  <div className={styles.gradingCard}>
                    <div className={styles.gradeBadge} style={{ backgroundColor: '#FFC107' }}>Grade C</div>
                    <h3>Grade C (Fair)</h3>
                    <ul>
                      <li>70-80% capacity</li>
                      <li>Minor wear but no damage</li>
                      <li>May be aftermarket</li>
                      <li>300-500 charge cycles</li>
                      <li>Holds charge but drains faster</li>
                    </ul>
                  </div>

                  <div className={styles.gradingCard}>
                    <div className={styles.gradeBadge} style={{ backgroundColor: '#F44336' }}>Grade D</div>
                    <h3>Grade D (Poor)</h3>
                    <ul>
                      <li>Below 70% capacity</li>
                      <li>May show signs of swelling</li>
                      <li>Typically aftermarket</li>
                      <li>Over 500 charge cycles</li>
                      <li>Poor charge retention</li>
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
              <Link href="/device-system?instock=1" className={styles.secondaryButton}>
                View In-Stock Devices
              </Link>
            </div>
          </div>

          <div className={styles.gradingNote} style={{ marginTop: '3rem' }}>
            <h3>Exclusive Access for Registered Users</h3>
            <p>
              As a registered user, you have exclusive access to our complete inventory of graded devices.
              Visit our <Link href="/device-system">Device Inventory System</Link> to browse all available devices,
              filter by grade, and place orders directly.
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}

// Server-side authentication check
export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/device-grading-public',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
