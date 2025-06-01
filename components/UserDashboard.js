import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/api';
import Chatbot from './Chatbot/Chatbot';
import SkeletonLoader from './LoadingStates/SkeletonLoader';

const UserDashboard = () => {
  const { user, apiCall, logout } = useAuth();
  const [demos, setDemos] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [pageViews, setPageViews] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const demoChartRef = useRef(null);
  const pageViewChartRef = useRef(null);
  const chartsInitialized = useRef(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch all dashboard data in parallel
        const [demosRes, analyticsRes, pageViewsRes, statsRes] = await Promise.all([
          apiCall('/api/user/demos'),
          apiCall('/api/user/analytics'),
          apiCall('/api/analytics/page-views'),
          apiCall('/api/user/stats')
        ]);

        // Handle demos
        if (demosRes.success) {
          setDemos(demosRes.data || []);
        }

        // Handle analytics
        if (analyticsRes.success) {
          setAnalytics(analyticsRes.data || []);
        }

        // Handle page views
        if (pageViewsRes.success) {
          setPageViews(pageViewsRes.data || []);
        }

        // Handle stats
        if (statsRes.success) {
          setStats(statsRes.data || {});
        }

        // Track page view
        await apiCall('/api/analytics/track', {
          method: 'POST',
          body: JSON.stringify({
            page: '/dashboard',
            timestamp: new Date().toISOString()
          })
        });

      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, apiCall]);

  // Initialize charts when data is available
  useEffect(() => {
    if (!loading && !chartsInitialized.current && typeof window !== 'undefined' && window.Chart) {
      initializeCharts();
      chartsInitialized.current = true;
    }
  }, [loading, analytics, pageViews]);

  const initializeCharts = () => {
    // Demo Analytics Chart
    if (demoChartRef.current && analytics.length > 0) {
      const ctx = demoChartRef.current.getContext('2d');
      new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: analytics.map(d => formatDate(d.demoTime)),
          datasets: [{
            label: 'Demo Views',
            data: analytics.map(d => d.views || 0),
            backgroundColor: 'rgba(0, 212, 255, 0.5)',
            borderColor: '#00d4ff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true }
          },
          plugins: {
            legend: {
              labels: {
                color: '#e0e0e0'
              }
            }
          }
        }
      });
    }

    // Page Views Chart
    if (pageViewChartRef.current && pageViews.length > 0) {
      const ctx = pageViewChartRef.current.getContext('2d');
      new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: pageViews.map(d => d.page || d.date),
          datasets: [{
            label: 'Page Views',
            data: pageViews.map(d => d.views || 0),
            backgroundColor: 'rgba(123, 44, 191, 0.2)',
            borderColor: '#7b2cbf',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true }
          },
          plugins: {
            legend: {
              labels: {
                color: '#e0e0e0'
              }
            }
          }
        }
      });
    }
  };

  const handleLogout = () => {
    logout();
  };

  const formatDemoDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.container}>
          <div className={styles.notAuthenticated}>
            <h2>Please log in to access your dashboard</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Client Dashboard - DigiClick AI</title>
        <meta name="description" content="Manage your AI automation demos and analytics with DigiClick AI's comprehensive client dashboard." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* Chart.js Script */}
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        strategy="beforeInteractive"
      />

      <div className="dashboard-page-container">
        {/* Header */}
        <header>
          <h1>DigiClick AI</h1>
          <div className="user-info">
            <span>Welcome, {user?.name || user?.email || 'User'}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </header>

        {/* Navigation */}
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/services">Services</a>
          <a href="/portfolio">Portfolio</a>
          <a href="/demo-theme">Demo</a>
          <a href="/pricing">Pricing</a>
          <a href="/contact">Contact</a>
          <a href="/dashboard" className="active">Dashboard</a>
        </nav>

        {/* Dashboard Content */}
        <section className="dashboard" id="dashboard">
          <div className="container">
            <div className="dashboard-header">
              <h1 className="glow-text">Client Dashboard</h1>
              <p className="dashboard-subtitle">
                Monitor your AI automation demos and track performance analytics
              </p>
            </div>

            {/* Dashboard Tabs */}
            <div className="dashboard-tabs">
              <button
                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`tab-button ${activeTab === 'demos' ? 'active' : ''}`}
                onClick={() => setActiveTab('demos')}
              >
                Demos
              </button>
              <button
                className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                Analytics
              </button>
              <button
                className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </div>

            {/* Error State */}
            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="cta-button">
                  Retry
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="dashboard-loading">
                <SkeletonLoader type="dashboard" count={3} />
              </div>
            )}

            {/* Dashboard Content */}
            {!loading && !error && (
              <div className="dashboard-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="overview-tab">
                    {/* Stats Cards */}
                    <div className="stats-grid">
                      <div className="stat-card pulse-box">
                        <div className="stat-icon">📊</div>
                        <div className="stat-value">{stats.totalDemos || demos.length}</div>
                        <div className="stat-label">Total Demos</div>
                      </div>
                      <div className="stat-card pulse-box">
                        <div className="stat-icon">👁️</div>
                        <div className="stat-value">{stats.totalViews || demos.reduce((sum, demo) => sum + (demo.views || 0), 0)}</div>
                        <div className="stat-label">Total Views</div>
                      </div>
                      <div className="stat-card pulse-box">
                        <div className="stat-icon">📈</div>
                        <div className="stat-value">{stats.avgViews || Math.round(demos.reduce((sum, demo) => sum + (demo.views || 0), 0) / (demos.length || 1))}</div>
                        <div className="stat-label">Avg Views</div>
                      </div>
                      <div className="stat-card pulse-box">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-value">{stats.conversionRate || '0%'}</div>
                        <div className="stat-label">Conversion Rate</div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="recent-activity">
                      <h3>Recent Activity</h3>
                      <div className="activity-list">
                        {demos.slice(0, 5).map((demo, index) => (
                          <div key={demo.id || index} className="activity-item">
                            <div className="activity-icon">🎬</div>
                            <div className="activity-content">
                              <div className="activity-title">{demo.name || demo.title}</div>
                              <div className="activity-time">{formatDemoDate(demo.demoTime || demo.scheduledAt)}</div>
                            </div>
                            <div className="activity-views">{demo.views || 0} views</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Demos Tab */}
                {activeTab === 'demos' && (
                  <div className="demos-tab">
                    <div className="demos-header">
                      <h3>Scheduled Demos</h3>
                      <button className="cta-button">Schedule New Demo</button>
                    </div>

                    <div className="demos-table-container">
                      <table className="demos-table">
                        <thead>
                          <tr>
                            <th>Demo Name</th>
                            <th>Scheduled Time</th>
                            <th>Views</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {demos.map((demo, index) => (
                            <tr key={demo.id || index}>
                              <td>{demo.name || demo.title}</td>
                              <td>{formatDemoDate(demo.demoTime || demo.scheduledAt)}</td>
                              <td>{demo.views || 0}</td>
                              <td>
                                <span className={`status-badge ${demo.status || 'scheduled'}`}>
                                  {demo.status || 'Scheduled'}
                                </span>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button className="action-btn edit">Edit</button>
                                  <button className="action-btn view">View</button>
                                  <button className="action-btn delete">Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <div className="analytics-tab">
                    <div className="charts-grid">
                      <div className="chart-container">
                        <h3>Demo Performance</h3>
                        <div className="chart-wrapper">
                          <canvas ref={demoChartRef} id="demoChart"></canvas>
                        </div>
                      </div>
                      <div className="chart-container">
                        <h3>Page Views</h3>
                        <div className="chart-wrapper">
                          <canvas ref={pageViewChartRef} id="pageViewChart"></canvas>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="settings-tab">
                    <div className="settings-section">
                      <h3>Account Settings</h3>
                      <div className="settings-form">
                        <div className="form-group">
                          <label>Name</label>
                          <input type="text" value={user?.name || ''} readOnly />
                        </div>
                        <div className="form-group">
                          <label>Email</label>
                          <input type="email" value={user?.email || ''} readOnly />
                        </div>
                        <div className="form-group">
                          <label>Plan</label>
                          <input type="text" value={user?.plan || 'Starter AI'} readOnly />
                        </div>
                      </div>
                    </div>

                    <div className="settings-section">
                      <h3>Preferences</h3>
                      <div className="settings-form">
                        <div className="form-group">
                          <label>
                            <input type="checkbox" defaultChecked />
                            Email notifications
                          </label>
                        </div>
                        <div className="form-group">
                          <label>
                            <input type="checkbox" defaultChecked />
                            Demo reminders
                          </label>
                        </div>
                        <div className="form-group">
                          <label>
                            <input type="checkbox" />
                            Marketing emails
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
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

export default UserDashboard;
