import React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Admin.module.css';
import { 
  getSearchHistory, 
  getPopularSearches, 
  getZeroResultSearches,
  getSearchConversionRate
} from '../../utils/searchAnalytics';

export default function SearchAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchData, setSearchData] = useState({
    recentSearches: [],
    popularSearches: [],
    zeroResultSearches: [],
    conversionRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is authenticated and is an admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !session.user.isAdmin) {
      router.push('/auth/signin?callbackUrl=/admin/search-analytics');
    }
  }, [session, status, router]);
  
  // Load search analytics data
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadAnalyticsData = () => {
      setIsLoading(true);
      
      try {
        // Get recent searches
        const recentSearches = getSearchHistory().slice(0, 20);
        
        // Get popular searches
        const popularSearches = getPopularSearches(10);
        
        // Get zero-result searches
        const zeroResultSearches = getZeroResultSearches().slice(0, 10);
        
        // Get conversion rate
        const conversionRate = getSearchConversionRate();
        
        setSearchData({
          recentSearches,
          popularSearches,
          zeroResultSearches,
          conversionRate
        });
      } catch (error) {
        console.error('Error loading search analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnalyticsData();
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(loadAnalyticsData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Format date for display
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // If loading or not authenticated, show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading search analytics...</p>
      </div>
    );
  }
  
  // If not authenticated, don't render anything (redirect is handled in useEffect)
  if (!session || !session.user.isAdmin) {
    return null;
  }
  
  return (
    <>
      <Head>
        <title>Search Analytics | MDTS Admin</title>
        <meta name="description" content="Search analytics dashboard for MDTS admin" />
      </Head>
      
      <div className={styles.adminContainer}>
        <div className={styles.adminSidebar}>
          <h2 className={styles.adminLogo}>MDTS Admin</h2>
          
          <nav className={styles.adminNav}>
            <Link href="/admin" className={styles.adminNavItem}>
              Dashboard
            </Link>
            <Link href="/admin/products" className={styles.adminNavItem}>
              Products
            </Link>
            <Link href="/admin/orders" className={styles.adminNavItem}>
              Orders
            </Link>
            <Link href="/admin/customers" className={styles.adminNavItem}>
              Customers
            </Link>
            <Link href="/admin/search-analytics" className={`${styles.adminNavItem} ${styles.active}`}>
              Search Analytics
            </Link>
          </nav>
        </div>
        
        <div className={styles.adminContent}>
          <header className={styles.adminHeader}>
            <h1>Search Analytics</h1>
            <div className={styles.adminUser}>
              <span>{session.user.name || session.user.email}</span>
            </div>
          </header>
          
          <div className={styles.adminTabs}>
            <button 
              className={`${styles.adminTab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`${styles.adminTab} ${activeTab === 'recent' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('recent')}
            >
              Recent Searches
            </button>
            <button 
              className={`${styles.adminTab} ${activeTab === 'popular' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('popular')}
            >
              Popular Searches
            </button>
            <button 
              className={`${styles.adminTab} ${activeTab === 'zero' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('zero')}
            >
              Zero Results
            </button>
          </div>
          
          <div className={styles.adminTabContent}>
            {activeTab === 'overview' && (
              <div className={styles.overviewTab}>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <h3>Total Searches</h3>
                    <div className={styles.statValue}>{searchData.recentSearches.length}</div>
                  </div>
                  
                  <div className={styles.statCard}>
                    <h3>Conversion Rate</h3>
                    <div className={styles.statValue}>{(searchData.conversionRate * 100).toFixed(2)}%</div>
                  </div>
                  
                  <div className={styles.statCard}>
                    <h3>Zero Result Searches</h3>
                    <div className={styles.statValue}>{searchData.zeroResultSearches.length}</div>
                  </div>
                  
                  <div className={styles.statCard}>
                    <h3>Unique Search Terms</h3>
                    <div className={styles.statValue}>
                      {new Set(searchData.recentSearches.map(s => s.query)).size}
                    </div>
                  </div>
                </div>
                
                <div className={styles.overviewCharts}>
                  <div className={styles.chartCard}>
                    <h3>Top 5 Searches</h3>
                    <div className={styles.barChart}>
                      {searchData.popularSearches.slice(0, 5).map((search, index) => (
                        <div key={index} className={styles.barChartItem}>
                          <div className={styles.barLabel}>{search.query}</div>
                          <div className={styles.barContainer}>
                            <div 
                              className={styles.bar} 
                              style={{ 
                                width: `${Math.min(100, (search.count / (searchData.popularSearches[0]?.count || 1)) * 100)}%` 
                              }}
                            ></div>
                            <div className={styles.barValue}>{search.count}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.chartCard}>
                    <h3>Top Zero Result Searches</h3>
                    <div className={styles.barChart}>
                      {searchData.zeroResultSearches.slice(0, 5).map((search, index) => (
                        <div key={index} className={styles.barChartItem}>
                          <div className={styles.barLabel}>{search.query}</div>
                          <div className={styles.barContainer}>
                            <div 
                              className={`${styles.bar} ${styles.redBar}`} 
                              style={{ 
                                width: `${Math.min(100, (search.count / (searchData.zeroResultSearches[0]?.count || 1)) * 100)}%` 
                              }}
                            ></div>
                            <div className={styles.barValue}>{search.count}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'recent' && (
              <div className={styles.recentTab}>
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Query</th>
                        <th>Timestamp</th>
                        <th>Results</th>
                        <th>Filters</th>
                        <th>Session ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchData.recentSearches.map((search, index) => (
                        <tr key={index}>
                          <td>{search.query}</td>
                          <td>{formatDate(search.timestamp)}</td>
                          <td>{search.resultsCount}</td>
                          <td>
                            {Object.keys(search.filters || {}).length > 0 ? (
                              <details>
                                <summary>View Filters</summary>
                                <pre>{JSON.stringify(search.filters, null, 2)}</pre>
                              </details>
                            ) : (
                              'None'
                            )}
                          </td>
                          <td>{search.sessionId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'popular' && (
              <div className={styles.popularTab}>
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Query</th>
                        <th>Search Count</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchData.popularSearches.map((search, index) => (
                        <tr key={index}>
                          <td>{search.query}</td>
                          <td>{search.count}</td>
                          <td>
                            <Link 
                              href={`/search?q=${encodeURIComponent(search.query)}`}
                              className={styles.actionButton}
                              target="_blank"
                            >
                              View Results
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'zero' && (
              <div className={styles.zeroTab}>
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Query</th>
                        <th>Search Count</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchData.zeroResultSearches.map((search, index) => (
                        <tr key={index}>
                          <td>{search.query}</td>
                          <td>{search.count}</td>
                          <td>
                            <Link 
                              href={`/admin/products/new?suggested_name=${encodeURIComponent(search.query)}`}
                              className={styles.actionButton}
                            >
                              Create Product
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className={styles.zeroResultsActions}>
                  <h3>Recommendations</h3>
                  <p>Based on zero-result searches, consider adding these products or categories:</p>
                  <ul className={styles.recommendationsList}>
                    {searchData.zeroResultSearches.slice(0, 5).map((search, index) => (
                      <li key={index}>
                        <strong>{search.query}</strong> - Searched {search.count} times with no results
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
