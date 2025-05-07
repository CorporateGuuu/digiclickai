import React from 'react';
import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { MarketplaceIntegration } from '../../components/Marketplace';
import InventoryImport from '../../components/Admin/InventoryImport';
import styles from '../../styles/Admin.module.css';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // If the user is not authenticated or not an admin, redirect to the login page
    if (!loading && (!session || !session.user.isAdmin)) {
      router.push('/auth/signin?callbackUrl=/admin');
    }
  }, [session, loading, router]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // If the page is loading or the user is not authenticated, show a loading state
  if (loading || !session) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If the user is not an admin, show an access denied message
  if (!session.user.isAdmin) {
    return (
      <div className="container">
        <div className="error-container">
          <h1>Access Denied</h1>
          <p>You do not have permission to access this page.</p>
          <Link href="/">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | MDTS - Midas Technical Solutions</title>
        <meta name="description" content="Admin dashboard for MDTS - Midas Technical Solutions" />
      </Head>

      <div className="container">
        <div className={styles.adminHeader}>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {session.user.name || session.user.email}!</p>
        </div>

        <div className={styles.adminDashboard}>
          {/* Sidebar with navigation */}
          <div className={styles.adminSidebar}>
            <nav className={styles.adminNav}>
              <div
                className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
                onClick={() => handleTabChange('overview')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Dashboard
              </div>

              <div
                className={`${styles.navItem} ${activeTab === 'products' ? styles.active : ''}`}
                onClick={() => handleTabChange('products')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                Products
              </div>

              <div
                className={`${styles.navItem} ${activeTab === 'inventory' ? styles.active : ''}`}
                onClick={() => handleTabChange('inventory')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                Inventory
              </div>

              <div
                className={`${styles.navItem} ${activeTab === 'orders' ? styles.active : ''}`}
                onClick={() => handleTabChange('orders')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Orders
              </div>

              <div
                className={`${styles.navItem} ${activeTab === 'customers' ? styles.active : ''}`}
                onClick={() => handleTabChange('customers')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Customers
              </div>

              <div
                className={`${styles.navItem} ${activeTab === 'marketplaces' ? styles.active : ''}`}
                onClick={() => handleTabChange('marketplaces')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                Marketplaces
              </div>

              <div
                className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
                onClick={() => handleTabChange('settings')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Settings
              </div>
            </nav>
          </div>

          {/* Main content area */}
          <div className={styles.adminContent}>
            {activeTab === 'overview' && (
              <div className={styles.adminOverview}>
                <h2>Dashboard Overview</h2>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <h3>Total Orders</h3>
                    <div className={styles.statValue}>128</div>
                    <div className={`${styles.statChange} ${styles.positive}`}>+12% from last month</div>
                  </div>

                  <div className={styles.statCard}>
                    <h3>Total Revenue</h3>
                    <div className={styles.statValue}>$12,458.75</div>
                    <div className={`${styles.statChange} ${styles.positive}`}>+8% from last month</div>
                  </div>

                  <div className={styles.statCard}>
                    <h3>Total Customers</h3>
                    <div className={styles.statValue}>543</div>
                    <div className={`${styles.statChange} ${styles.positive}`}>+5% from last month</div>
                  </div>

                  <div className={styles.statCard}>
                    <h3>Conversion Rate</h3>
                    <div className={styles.statValue}>3.2%</div>
                    <div className={`${styles.statChange} ${styles.negative}`}>-0.5% from last month</div>
                  </div>
                </div>

                <div className={styles.recentActivity}>
                  <h3>Recent Activity</h3>
                  <div className={styles.activityList}>
                    <div className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                      </div>
                      <div className={styles.activityContent}>
                        <h4>New Order #1234</h4>
                        <p>John Doe purchased iPhone 13 Pro Screen</p>
                        <div className={styles.activityTime}>2 hours ago</div>
                      </div>
                    </div>

                    <div className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div className={styles.activityContent}>
                        <h4>New Customer</h4>
                        <p>Jane Smith created an account</p>
                        <div className={styles.activityTime}>3 hours ago</div>
                      </div>
                    </div>

                    <div className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                      </div>
                      <div className={styles.activityContent}>
                        <h4>Order Status Updated</h4>
                        <p>Order #1230 changed from Processing to Shipped</p>
                        <div className={styles.activityTime}>5 hours ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'marketplaces' && (
              <div className={styles.marketplacesTab}>
                <h2>Marketplace Integrations</h2>
                <p className={styles.tabDescription}>
                  Connect and manage your marketplace accounts to synchronize inventory, orders, and listings.
                </p>

                {/* Marketplace Integration Component */}
                <MarketplaceIntegration />
              </div>
            )}

            {activeTab === 'products' && (
              <div className={styles.productsTab}>
                <h2>Products Management</h2>
                <p className={styles.tabDescription}>
                  This section is under development. Check back soon for product management features.
                </p>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className={styles.inventoryTab}>
                <h2>Inventory Management</h2>
                <p className={styles.tabDescription}>
                  Import inventory data from 4seller.com or other sources, and manage your stock levels.
                </p>

                <InventoryImport />
              </div>
            )}

            {activeTab === 'orders' && (
              <div className={styles.ordersTab}>
                <h2>Orders Management</h2>
                <p className={styles.tabDescription}>
                  This section is under development. Check back soon for order management features.
                </p>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className={styles.customersTab}>
                <h2>Customers Management</h2>
                <p className={styles.tabDescription}>
                  This section is under development. Check back soon for customer management features.
                </p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className={styles.settingsTab}>
                <h2>Admin Settings</h2>
                <p className={styles.tabDescription}>
                  This section is under development. Check back soon for admin settings features.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Server-side authentication check
export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin?callbackUrl=/admin',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
