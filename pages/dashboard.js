import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import UserDashboard from '../components/UserDashboard';

const DashboardPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#121212',
        color: '#00d4ff'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null; // Will redirect
  }

  return (
    <>
      <Head>
        <title>Dashboard - DigiClick AI</title>
        <meta name="description" content="Your personal DigiClick AI dashboard" />
      </Head>
      <UserDashboard />
    </>
  );
};

export default DashboardPage;
