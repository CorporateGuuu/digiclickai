import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './AdminLayout.module.css';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and has admin privileges
    // This is a simplified check - in a real app, you would verify with your backend
    const checkAuth = async () => {
      try {
        // For demo purposes, we'll just check if there's a session
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        // In a real app, you would check if the user has admin role
        const isAdmin = session && session.user;
        
        if (!isAdmin) {
          // Redirect to login if not authenticated
          router.push('/auth/signin?callbackUrl=/admin');
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Admin Panel</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <ul>
            <li className={router.pathname === '/admin' ? styles.active : ''}>
              <Link href="/admin">
                <span className={styles.navIcon}>📊</span>
                Dashboard
              </Link>
            </li>
            <li className={router.pathname === '/admin/products' ? styles.active : ''}>
              <Link href="/admin/products">
                <span className={styles.navIcon}>📱</span>
                Products
              </Link>
            </li>
            <li className={router.pathname === '/admin/orders' ? styles.active : ''}>
              <Link href="/admin/orders">
                <span className={styles.navIcon}>📦</span>
                Orders
              </Link>
            </li>
            <li className={router.pathname === '/admin/customers' ? styles.active : ''}>
              <Link href="/admin/customers">
                <span className={styles.navIcon}>👥</span>
                Customers
              </Link>
            </li>
            <li className={router.pathname === '/admin/notion' ? styles.active : ''}>
              <Link href="/admin/notion">
                <span className={styles.navIcon}>📝</span>
                Notion Integration
              </Link>
            </li>
            <li className={router.pathname === '/admin/zapier' ? styles.active : ''}>
              <Link href="/admin/zapier">
                <span className={styles.navIcon}>⚡</span>
                Zapier Automation
              </Link>
            </li>
            <li className={router.pathname === '/admin/settings' ? styles.active : ''}>
              <Link href="/admin/settings">
                <span className={styles.navIcon}>⚙️</span>
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.backToSite}>
            <span className={styles.navIcon}>🏠</span>
            Back to Site
          </Link>
        </div>
      </aside>
      <main className={styles.content}>
        <header className={styles.contentHeader}>
          <div className={styles.breadcrumbs}>
            <Link href="/admin">Admin</Link>
            {router.pathname !== '/admin' && (
              <>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span>{router.pathname.split('/').pop()}</span>
              </>
            )}
          </div>
          <div className={styles.userMenu}>
            <span className={styles.userAvatar}>👤</span>
            <span className={styles.userName}>Admin User</span>
          </div>
        </header>
        <div className={styles.contentBody}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
