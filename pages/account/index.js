import React from 'react';
import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Account.module.css';

// Dashboard components
import AccountSidebar from '../../components/Account/AccountSidebar';
import AccountOverview from '../../components/Account/AccountOverview';
import OrderHistory from '../../components/Account/OrderHistory';
import SavedAddresses from '../../components/Account/SavedAddresses';
import AccountPreferences from '../../components/Account/AccountPreferences';
import WishlistItems from '../../components/Account/WishlistItems';

// Admin components
import AdminIntegrations from '../../components/Admin/AdminIntegrations';
import InventoryManagement from '../../components/Admin/InventoryManagement';

export default function AccountDashboard() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const router = useRouter();

  // Get the active tab from the URL query or default to 'overview'
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // If the user is not authenticated, redirect to the login page
    if (!loading && !session) {
      router.push('/auth/signin?callbackUrl=/account');
    }

    // Set active tab based on URL query
    if (router.query.tab) {
      setActiveTab(router.query.tab);
    }
  }, [session, loading, router]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.push(`/account?tab=${tab}`, undefined, { shallow: true });
  };

  // If the page is loading or the user is not authenticated, show a loading state
  if (loading || !session) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading account information...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Account | MDTS - Midas Technical Solutions</title>
        <meta name="description" content="Manage your account, orders, addresses, and preferences at MDTS - Midas Technical Solutions" />
      </Head>

      <div className="container">
        <div className={styles.accountHeader}>
          <h1>My Account</h1>
          <p>Welcome back, {session.user.name || session.user.email}!</p>
        </div>

        <div className={styles.accountDashboard}>
          {/* Sidebar with navigation */}
          <AccountSidebar activeTab={activeTab} onTabChange={handleTabChange} />

          {/* Main content area */}
          <div className={styles.accountContent}>
            {activeTab === 'overview' && <AccountOverview session={session} />}
            {activeTab === 'orders' && <OrderHistory />}
            {activeTab === 'addresses' && <SavedAddresses />}
            {activeTab === 'preferences' && <AccountPreferences />}
            {activeTab === 'wishlist' && <WishlistItems />}

            {/* Admin tabs */}
            {activeTab === 'integrations' && <AdminIntegrations />}
            {activeTab === 'inventory' && <InventoryManagement />}
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
        destination: '/auth/signin?callbackUrl=/account',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
