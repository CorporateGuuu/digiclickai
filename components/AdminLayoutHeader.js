import React from 'react';
import styles from '../styles/AdminLayout.module.css';
import { useSession } from 'next-auth/react';

const AdminLayoutHeader = ({ router }) => {
  const { data: session } = useSession();

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className={styles.pageTitle}>
          {router.pathname === '/admin' && 'Dashboard'}
          {router.pathname === '/admin/products' && 'Products'}
          {router.pathname === '/admin/orders' && 'Orders'}
          {router.pathname === '/admin/customers' && 'Customers'}
          {router.pathname === '/admin/marketplace' && 'Marketplace Integration'}
          {router.pathname === '/admin/settings' && 'Settings'}
        </h1>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{session?.user?.name || 'Admin'}</span>
          <span className={styles.userEmail}>{session?.user?.email || 'admin@mdtstech.store'}</span>
        </div>
      </div>
    </header>
  );
};

export default AdminLayoutHeader;
