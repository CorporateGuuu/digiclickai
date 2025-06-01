import React from 'react';
import Link from 'next/link';
import styles from '../../styles/Account.module.css';

const AccountOverview = ({ session }) => {
  // Mock data for the overview
  const overviewData = {
    orders: 5,
    wishlistItems: 8,
    savedAddresses: 2,
    recentActivity: [
      {
        id: 1,
        type: 'order',
        title: 'Order Placed',
        description: 'Order #12345 for $199.99',
        date: '2023-06-15T14:30:00Z'
      },
      {
        id: 2,
        type: 'wishlist',
        title: 'Item Added to Wishlist',
        description: 'iPhone 13 Pro OLED Screen',
        date: '2023-06-10T09:15:00Z'
      },
      {
        id: 3,
        type: 'address',
        title: 'Address Updated',
        description: 'Shipping address updated',
        date: '2023-06-05T16:45:00Z'
      }
    ]
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <h2>Account Overview</h2>
      
      <div className={styles.overviewGrid}>
        <div className={styles.overviewCard}>
          <h3>Orders</h3>
          <div className={styles.value}>{overviewData.orders}</div>
          <p>View your order history</p>
          <Link href="/account?tab=orders">
            View Orders
          </Link>
        </div>
        
        <div className={styles.overviewCard}>
          <h3>Wishlist</h3>
          <div className={styles.value}>{overviewData.wishlistItems}</div>
          <p>Items saved for later</p>
          <Link href="/account?tab=wishlist">
            View Wishlist
          </Link>
        </div>
        
        <div className={styles.overviewCard}>
          <h3>Addresses</h3>
          <div className={styles.value}>{overviewData.savedAddresses}</div>
          <p>Saved shipping addresses</p>
          <Link href="/account?tab=addresses">
            Manage Addresses
          </Link>
        </div>
      </div>
      
      <div className={styles.recentActivity}>
        <h3>Recent Activity</h3>
        
        {overviewData.recentActivity.map(activity => (
          <div key={activity.id} className={styles.activityItem}>
            <div className={styles.activityIcon}>
              {activity.type === 'order' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              )}
              
              {activity.type === 'wishlist' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              )}
              
              {activity.type === 'address' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              )}
            </div>
            
            <div className={styles.activityContent}>
              <h4>{activity.title}</h4>
              <p>{activity.description}</p>
              <div className={styles.activityDate}>{formatDate(activity.date)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountOverview;
