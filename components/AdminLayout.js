import React from 'react';
import { useState, useEffect } from 'react';
import { useSession, getSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayoutSidebar from './AdminLayoutSidebar';
import AdminLayoutHeader from './AdminLayoutHeader';
import AdminLayoutLoading from './AdminLayoutLoading';
import styles from '../styles/AdminLayout.module.css';

const AdminLayout = ({ children }) => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      const session = await getSession();

      if (!session) {
        router.replace('/auth/signin?callbackUrl=' + router.asPath);
        return;
      }

      // Check if user is admin
      try {
        const response = await fetch('/api/admin/check-admin');
        const data = await response.json();

        if (!data.isAdmin) {
          router.replace('/');
          return;
        }

        setIsAdmin(true);
        setLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.replace('/');
      }
    }

    checkAdmin();
  }, [router]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (loading) {
    return <AdminLayoutLoading />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className={styles.adminLayout}>
      <AdminLayoutSidebar handleSignOut={handleSignOut} />
      <main className={styles.main}>
        <AdminLayoutHeader router={router} />
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
