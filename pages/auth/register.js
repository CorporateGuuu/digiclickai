import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import styles from '../../styles/AuthPages.module.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(null);
  const router = useRouter();

  // Handle countdown for redirect after successful registration
  useEffect(() => {
    if (redirectCountdown !== null) {
      if (redirectCountdown > 0) {
        const timer = setTimeout(() => {
          setRedirectCountdown(redirectCountdown - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        router.push('/');
      }
    }
  }, [redirectCountdown, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Sign in the user
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        setError('Registration successful, but sign-in failed. Please try signing in manually.');
        setLoading(false);
      } else {
        setSuccess(`Account created successfully! Welcome, ${name}. You will be redirected to the homepage in 5 seconds.`);
        setLoading(false);
        setRedirectCountdown(5);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <>
      <Head>
        <title>Register - Midas Technical Solutions</title>
        <meta name="description" content="Create a new account with Midas Technical Solutions." />
      </Head>



      <div className={styles.mainContent}>
        <div className={styles.authForm}>
          <h1>Register</h1>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="success-message">
              <p>{success}</p>
              {redirectCountdown !== null && (
                <p className="countdown">Redirecting in {redirectCountdown} seconds...</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <small>Password must be at least 8 characters long</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="auth-separator">
            <span>OR</span>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="btn btn-google"
            type="button"
          >
            Sign up with Google
          </button>

          <p className="auth-link">
            Already have an account? <Link href="/auth/signin">Sign In</Link>
          </p>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerTop}>
            <div className={styles.footerNewsletter}>
              <h3>Subscribe to Our Newsletter</h3>
              <p>Stay updated with our latest products, promotions, and repair guides.</p>
              <form className={styles.footerForm}>
                <input type="email" placeholder="Your email address" required />
                <button type="submit">Subscribe</button>
              </form>
            </div>

            <div>
              <h3>Our Services</h3>
              <div className={styles.footerServices}>
                <div className={styles.footerService}>
                  <div className={styles.footerServiceIcon}>🚚</div>
                  <div className={styles.footerServiceName}>Fast Shipping</div>
                  <div className={styles.footerServiceDescription}>Free shipping on orders over $1000</div>
                </div>

                <div className={styles.footerService}>
                  <div className={styles.footerServiceIcon}>🔧</div>
                  <div className={styles.footerServiceName}>Repair Guides</div>
                  <div className={styles.footerServiceDescription}>Step-by-step tutorials</div>
                </div>

                <div className={styles.footerService}>
                  <div className={styles.footerServiceIcon}>💬</div>
                  <div className={styles.footerServiceName}>Support</div>
                  <div className={styles.footerServiceDescription}>24/7 customer service</div>
                </div>

                <div className={styles.footerService}>
                  <div className={styles.footerServiceIcon}>🔄</div>
                  <div className={styles.footerServiceName}>Returns</div>
                  <div className={styles.footerServiceDescription}>30-day money back</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.footerMiddle}>
            <div className={styles.footerColumn}>
              <h3>Shop</h3>
              <ul className={styles.footerLinks}>
                <li><Link href="/products/iphone">iPhone Parts</Link></li>
                <li><Link href="/products/samsung">Samsung Parts</Link></li>
                <li><Link href="/products/ipad">iPad Parts</Link></li>
                <li><Link href="/products/macbook">MacBook Parts</Link></li>
                <li><Link href="/products/tools">Repair Tools</Link></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3>Information</h3>
              <ul className={styles.footerLinks}>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/blog">Repair Guides</Link></li>
                <li><Link href="/lcd-buyback">LCD Buyback Program</Link></li>
                <li><Link href="/wholesale">Wholesale Program</Link></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3>Customer Service</h3>
              <ul className={styles.footerLinks}>
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/shipping">Shipping Policy</Link></li>
                <li><Link href="/returns">Returns & Warranty</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms & Conditions</Link></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3>Contact Us</h3>
              <ul className={styles.footerLinks}>
                <li>Vienna, VA 22182</li>
                <li>Phone: +1 (240) 351-0511</li>
                <li>Email: support@mdtstech.store</li>
                <li>Hours: Mon-Fri 9AM-10PM EST</li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.footerCopyright}>
              &copy; {new Date().getFullYear()} Midas Technical Solutions. All rights reserved.
            </div>
            <div className={styles.footerPaymentMethods}>
              <div className={styles.footerPaymentIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div className={styles.footerPaymentIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="18" cy="12" r="3" />
                </svg>
              </div>
              <div className={styles.footerPaymentIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M12 9v6" />
                  <path d="M8 9h8" />
                </svg>
              </div>
              <div className={styles.footerPaymentIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className={styles.footerPaymentIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z" />
                  <path d="M12 16V8" />
                  <path d="M8 12h8" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
