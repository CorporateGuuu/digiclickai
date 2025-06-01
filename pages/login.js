import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import Chatbot from '../components/Chatbot/Chatbot';

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Apply DigiClick AI theme
    document.body.classList.add('digiclick-theme');

    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push('/dashboard');
    }

    // Track page view
    trackPageView();

    return () => {
      document.body.classList.remove('digiclick-theme');
    };
  }, [isAuthenticated, router]);

  const trackPageView = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          page: '/login',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password, rememberMe);
      
      if (result.success) {
        // Redirect to dashboard or intended page
        const redirectUrl = router.query.redirect || '/dashboard';
        router.push(redirectUrl);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // Implement Google OAuth login
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleNavClick = (e, href) => {
    e.preventDefault();
    
    if (href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(href);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Login - DigiClick AI",
    "description": "Access your DigiClick AI account to manage AI automation demos and analytics.",
    "url": `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "DigiClick AI",
      "url": process.env.NEXT_PUBLIC_APP_URL
    }
  };

  return (
    <>
      <Head>
        <title>Login - DigiClick AI</title>
        <meta name="description" content="Log in to your DigiClick AI account to manage AI automation demos and analytics." />
        <meta name="keywords" content="DigiClick AI login, AI automation, client dashboard, sign in" />
        <meta name="robots" content="noindex, nofollow" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Poppins:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* GSAP Scripts */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
        strategy="beforeInteractive"
      />

      {/* Google Analytics */}
      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
            `}
          </Script>
        </>
      )}

      <div className="login-page-container">
        {/* Header */}
        <header>
          <h1>DigiClick AI</h1>
        </header>

        {/* Navigation */}
        <nav>
          <a href="/" onClick={(e) => handleNavClick(e, '/')}>Home</a>
          <a href="/about" onClick={(e) => handleNavClick(e, '/about')}>About</a>
          <a href="/services" onClick={(e) => handleNavClick(e, '/services')}>Services</a>
          <a href="/portfolio" onClick={(e) => handleNavClick(e, '/portfolio')}>Portfolio</a>
          <a href="/demo-theme" onClick={(e) => handleNavClick(e, '/demo-theme')}>Demo</a>
          <a href="/pricing" onClick={(e) => handleNavClick(e, '/pricing')}>Pricing</a>
          <a href="/contact" onClick={(e) => handleNavClick(e, '/contact')}>Contact</a>
          <a href="/login" onClick={(e) => handleNavClick(e, '/login')} className="active">Login</a>
        </nav>

        {/* Login Section */}
        <section className="login" id="login">
          <div className="container">
            <div className="login-form-container">
              <div className="login-header">
                <h1 className="glow-text">Welcome Back</h1>
                <p className="login-subtitle">
                  Access your AI automation dashboard and manage your demos
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />
                    <span className="checkmark"></span>
                    Remember me
                  </label>
                  
                  <Link href="/auth/forgot-password" className="forgot-password-link">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="cta-button login-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Social Login */}
              <div className="social-login">
                <div className="divider">
                  <span>OR</span>
                </div>
                
                <button
                  type="button"
                  className="google-login-button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="google-icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>

              {/* Sign Up Link */}
              <div className="auth-footer">
                <p>
                  Don't have an account?{' '}
                  <Link href="/auth/register" className="signup-link">
                    Sign Up
                  </Link>
                </p>
              </div>

              {/* Security Badge */}
              <div className="security-badge">
                <div className="security-icon">🔒</div>
                <div className="security-text">
                  <strong>Secure Login</strong>
                  <span>Your data is protected with enterprise-grade security</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer>
          <div className="footer-content">
            <div className="footer-info">
              <p>© 2025 DigiClick AI. All rights reserved.</p>
              <div className="footer-links">
                <a href="mailto:info@digiclick.ai">info@digiclick.ai</a>
                <span>|</span>
                <a href="tel:+1234567890">(123) 456-7890</a>
              </div>
            </div>
          </div>
        </footer>

        {/* Enhanced Chatbot */}
        <Chatbot />
      </div>
    </>
  );
};

export default LoginPage;
