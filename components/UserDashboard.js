import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/api';
import styles from '../styles/UserDashboard.module.css';

const UserDashboard = () => {
  const { user, apiCall, logout } = useAuth();
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDemos = async () => {
      try {
        setLoading(true);
        const response = await apiCall('/api/user/demos');
        
        if (response.success) {
          setDemos(response.data.data || []);
        } else {
          setError(response.error || 'Failed to load your demos');
        }
      } catch (err) {
        setError('Failed to load your demos');
        console.error('User demos fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserDemos();
    }
  }, [user, apiCall]);

  const handleLogout = () => {
    logout();
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
    <div className={styles.dashboard}>
      <div className={styles.container}>
        {/* Dashboard Header */}
        <div className={styles.dashboardHeader}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>
              Welcome back, <span className={styles.userName}>{user.name}</span>
            </h1>
            <p className={styles.welcomeSubtitle}>
              Manage your AI projects and demo schedules
            </p>
          </div>
          
          <div className={styles.userActions}>
            <div className={styles.userInfo}>
              <span className={styles.userEmail}>{user.email}</span>
              <span className={styles.userRole}>{user.role}</span>
            </div>
            <button 
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              Logout
            </button>
          </div>
        </div>

        {/* User Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{demos.length}</h3>
              <p className={styles.statLabel}>Demo Requests</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⚡</div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{user.role === 'admin' ? 'Admin' : 'Member'}</h3>
              <p className={styles.statLabel}>Account Type</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🚀</div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>Active</h3>
              <p className={styles.statLabel}>Status</p>
            </div>
          </div>
        </div>

        {/* Demo Requests Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Demo Requests</h2>
          
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading your demo requests...</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className={styles.retryButton}
              >
                Try Again
              </button>
            </div>
          ) : demos.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📋</div>
              <h3>No Demo Requests Yet</h3>
              <p>You haven't scheduled any demos yet. Contact us to schedule your first AI automation demo!</p>
              <a href="#contact" className={styles.scheduleButton}>
                Schedule a Demo
              </a>
            </div>
          ) : (
            <div className={styles.demosGrid}>
              {demos.map((demo, index) => (
                <div key={demo._id || index} className={styles.demoCard}>
                  <div className={styles.demoHeader}>
                    <h3 className={styles.demoTitle}>Demo Request</h3>
                    <span className={styles.demoDate}>
                      {formatDate(demo.createdAt)}
                    </span>
                  </div>
                  
                  <div className={styles.demoContent}>
                    <div className={styles.demoField}>
                      <span className={styles.fieldLabel}>Scheduled Time:</span>
                      <span className={styles.fieldValue}>{demo.demoTime}</span>
                    </div>
                    
                    {demo.company && (
                      <div className={styles.demoField}>
                        <span className={styles.fieldLabel}>Company:</span>
                        <span className={styles.fieldValue}>{demo.company}</span>
                      </div>
                    )}
                    
                    {demo.phone && (
                      <div className={styles.demoField}>
                        <span className={styles.fieldLabel}>Phone:</span>
                        <span className={styles.fieldValue}>{demo.phone}</span>
                      </div>
                    )}
                    
                    {demo.requirements && (
                      <div className={styles.demoField}>
                        <span className={styles.fieldLabel}>Requirements:</span>
                        <span className={styles.fieldValue}>{demo.requirements}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.demoFooter}>
                    <span className={styles.demoStatus}>Pending</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <a href="#contact" className={styles.actionCard}>
              <div className={styles.actionIcon}>📧</div>
              <h3>Contact Us</h3>
              <p>Get in touch for new projects</p>
            </a>
            
            <a href="#services" className={styles.actionCard}>
              <div className={styles.actionIcon}>🔧</div>
              <h3>Our Services</h3>
              <p>Explore our AI solutions</p>
            </a>
            
            <a href="#portfolio" className={styles.actionCard}>
              <div className={styles.actionIcon}>💼</div>
              <h3>Portfolio</h3>
              <p>View our successful projects</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
