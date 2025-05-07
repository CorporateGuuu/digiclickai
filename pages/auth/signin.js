import React, { useState, useEffect } from 'react';
import { signIn, getCsrfToken, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Turnstile, SecurityBadge, SecurityMessage } from '../../components/Security';
import { recordFailedLogin } from '../../lib/fraudPrevention';
import styles from '../../styles/AuthPages.module.css';
import Layout from '../../components/Layout/Layout';

export default function SignIn({ csrfToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [securityMessage, setSecurityMessage] = useState(null);
  const router = useRouter();
  const { callbackUrl, error: errorParam } = router.query;

  useEffect(() => {
    // Check if user is already signed in
    async function checkSession() {
      const session = await getSession();
      if (session) {
        router.replace(callbackUrl || '/');
      } else {
        setInitialLoading(false);
      }
    }

    checkSession();

    // Set error message from URL parameter
    if (errorParam) {
      if (errorParam === 'CredentialsSignin') {
        setError('Invalid email or password');
      } else {
        setError(errorParam);
      }
    }
  }, [router, callbackUrl, errorParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSecurityMessage(null);

    // Check if Turnstile token is present (skip in development)
    if (!turnstileToken && process.env.NODE_ENV !== 'development') {
      setError('Please complete the security check');
      setLoading(false);
      return;
    }

    try {
      // Skip Turnstile verification in development
      if (process.env.NODE_ENV !== 'development') {
        // Verify the Turnstile token
        const verifyResponse = await fetch('/api/security/verify-turnstile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: turnstileToken }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyData.success) {
          setError('Security check failed. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Proceed with sign in
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: callbackUrl || '/'
      });

      if (result.error) {
        // Record failed login attempt for fraud prevention
        // recordFailedLogin('client_ip', email);

        setError('Invalid email or password');
        setSecurityMessage({
          type: 'warning',
          message: 'Multiple failed login attempts may result in temporary account lockout.'
        });
        setLoading(false);
      } else if (result.url && result.url.includes('requiresTwoFactor=true')) {
        // Redirect to 2FA page
        router.push(`/auth/2fa${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`);
      } else {
        // Check if the callback URL is to the account page
        if (callbackUrl && callbackUrl.includes('/account')) {
          // Redirect to account page with a small delay to ensure session is properly set
          setTimeout(() => {
            router.push('/account');
          }, 500);
        } else {
          router.push(callbackUrl || '/');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: callbackUrl || '/' });
  };

  if (initialLoading) {
    return (
      <Layout
        title="Sign In - Midas Technical Solutions"
        description="Sign in to your Midas Technical Solutions account."
      >
        <div className={styles.mainContent}>
          <div className={styles.authForm}>
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Sign In - Midas Technical Solutions"
      description="Sign in to your Midas Technical Solutions account."
    >

      <div className={styles.mainContent}>
        <div className={styles.authForm}>
          <h1>Sign In</h1>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {securityMessage && (
            <SecurityMessage type={securityMessage.type}>
              {securityMessage.message}
            </SecurityMessage>
          )}

          <form onSubmit={handleSubmit}>
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="password-header">
                <label htmlFor="password">Password</label>
                <Link href="/auth/forgot-password" className="forgot-password-link">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Cloudflare Turnstile for bot protection */}
            <Turnstile
              onVerify={(token) => setTurnstileToken(token)}
              onError={() => setTurnstileToken('')}
              action="signin"
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || (!turnstileToken && process.env.NODE_ENV !== 'development')}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <SecurityBadge />

          <div className="auth-separator">
            <span>OR</span>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="btn btn-google"
            type="button"
          >
            Sign in with Google
          </button>

          <p className="auth-link">
            Don't have an account? <Link href="/auth/register">Register</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const csrfToken = await getCsrfToken(context);

  return {
    props: {
      csrfToken: csrfToken || null,
    },
  };
}
