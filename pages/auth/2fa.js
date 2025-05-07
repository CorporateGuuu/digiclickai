import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import TwoFactorVerification from '../../components/TwoFactorAuth/TwoFactorVerification';
import styles from '../../styles/AuthPages.module.css';

export default function TwoFactorAuthPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');
  const [methods, setMethods] = useState(null);
  const router = useRouter();
  const { callbackUrl } = router.query;

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getSession();
        
        if (!session) {
          router.replace('/auth/signin');
          return;
        }
        
        if (!session.requiresTwoFactor) {
          router.replace(callbackUrl || '/');
          return;
        }
        
        setUserId(session.user.id);
        setEmail(session.user.email);
        setMethods(session.twoFactorMethods);
        setLoading(false);
      } catch (err) {
        console.error('Error checking session:', err);
        setError('An error occurred while checking your session');
        setLoading(false);
      }
    }
    
    checkSession();
  }, [router, callbackUrl]);

  if (loading) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Two-Factor Authentication | MDTS Tech</title>
        </Head>
        <div className={styles.formContainer}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Two-Factor Authentication | MDTS Tech</title>
        </Head>
        <div className={styles.formContainer}>
          <div className={styles.error}>
            <p>{error}</p>
            <button
              className={styles.button}
              onClick={() => router.push('/auth/signin')}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Two-Factor Authentication | MDTS Tech</title>
        {/* Add DUO Web SDK if DUO is enabled */}
        {methods?.duo_enabled && (
          <script src="https://api-XXXX.duosecurity.com/frame/hosted/Duo-Web-v2.min.js"></script>
        )}
      </Head>
      <div className={styles.formContainer}>
        <TwoFactorVerification
          userId={userId}
          email={email}
          methods={methods}
          callbackUrl={callbackUrl}
        />
      </div>
    </div>
  );
}
