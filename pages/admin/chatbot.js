import React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Admin.module.css';

export default function ChatbotAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [conversations, setConversations] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalConversations: 0,
    totalMessages: 0,
    avgMessagesPerConversation: 0,
    topIntents: [],
    satisfactionRate: 0
  });
  const [supportArticles, setSupportArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is authenticated and is an admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !session.user.isAdmin) {
      router.push('/auth/signin?callbackUrl=/admin/chatbot');
    }
  }, [session, status, router]);
  
  // Load chatbot data
  useEffect(() => {
    if (status !== 'authenticated' || !session.user.isAdmin) return;
    
    const fetchChatbotData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch conversations
        const conversationsResponse = await fetch('/api/admin/chatbot/conversations');
        const conversationsData = await conversationsResponse.json();
        
        if (conversationsData.success) {
          setConversations(conversationsData.conversations);
        }
        
        // Fetch analytics
        const analyticsResponse = await fetch('/api/admin/chatbot/analytics');
        const analyticsData = await analyticsResponse.json();
        
        if (analyticsData.success) {
          setAnalytics(analyticsData.analytics);
        }
        
        // Fetch support articles
        const articlesResponse = await fetch('/api/admin/chatbot/articles');
        const articlesData = await articlesResponse.json();
        
        if (articlesData.success) {
          setSupportArticles(articlesData.articles);
        }
      } catch (error) {
        console.error('Error fetching chatbot data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChatbotData();
  }, [session, status]);
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  // If loading or not authenticated, show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading chatbot dashboard...</p>
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
        <title>Chatbot Admin | MDTS Admin</title>
        <meta name="description" content="Chatbot administration dashboard for MDTS admin" />
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
            <Link href="/admin/chatbot" className={`${styles.adminNavItem} ${styles.active}`}>
              Chatbot
            </Link>
          </nav>
        </div>
        
        <div className={styles.adminContent}>
          <header className={styles.adminHeader}>
            <h1>Chatbot Administration</h1>
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
              className={`${styles.adminTab} ${activeTab === 'conversations' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('conversations')}
            >
              Conversations
            </button>
            <button 
              className={`${styles.adminTab} ${activeTab === 'analytics' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
            <button 
              className={`${styles.adminTab} ${activeTab === 'articles' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('articles')}
            >
              Support Articles
            </button>
          </div>
          
          <div className={styles.adminTabContent}>
            {activeTab === 'overview' && (
              <div className={styles.overviewTab}>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <h3>Total Conversations</h3>
                    <div className={styles.statValue}>{analytics.totalConversations}</div>
                  </div>
                  
                  <div className={styles.statCard}>
                    <h3>Total Messages</h3>
                    <div className={styles.statValue}>{analytics.totalMessages}</div>
                  </div>
                  
                  <div className={styles.statCard}>
                    <h3>Avg. Messages Per Conversation</h3>
                    <div className={styles.statValue}>{analytics.avgMessagesPerConversation.toFixed(1)}</div>
                  </div>
                  
                  <div className={styles.statCard}>
                    <h3>Satisfaction Rate</h3>
                    <div className={styles.statValue}>{(analytics.satisfactionRate * 100).toFixed(1)}%</div>
                  </div>
                </div>
                
                <div className={styles.overviewCharts}>
                  <div className={styles.chartCard}>
                    <h3>Top Intents</h3>
                    <div className={styles.barChart}>
                      {analytics.topIntents.map((intent, index) => (
                        <div key={index} className={styles.barChartItem}>
                          <div className={styles.barLabel}>{intent.name}</div>
                          <div className={styles.barContainer}>
                            <div 
                              className={styles.bar} 
                              style={{ 
                                width: `${Math.min(100, (intent.count / (analytics.topIntents[0]?.count || 1)) * 100)}%` 
                              }}
                            ></div>
                            <div className={styles.barValue}>{intent.count}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.chartCard}>
                    <h3>Recent Activity</h3>
                    <div className={styles.recentActivity}>
                      {conversations.slice(0, 5).map((conversation, index) => (
                        <div key={index} className={styles.activityItem}>
                          <div className={styles.activityIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                          </div>
                          <div className={styles.activityContent}>
                            <div className={styles.activityTitle}>
                              New conversation from {conversation.user_id}
                            </div>
                            <div className={styles.activityTime}>
                              {formatDate(conversation.created_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className={styles.actionButtons}>
                  <button className={styles.actionButton} onClick={() => setActiveTab('conversations')}>
                    View All Conversations
                  </button>
                  <button className={styles.actionButton} onClick={() => setActiveTab('analytics')}>
                    View Detailed Analytics
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'conversations' && (
              <div className={styles.conversationsTab}>
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Started</th>
                        <th>Last Activity</th>
                        <th>Messages</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversations.map((conversation, index) => (
                        <tr key={index}>
                          <td>{conversation.id.substring(0, 8)}...</td>
                          <td>{conversation.user_id}</td>
                          <td>{formatDate(conversation.created_at)}</td>
                          <td>{formatDate(conversation.updated_at)}</td>
                          <td>{conversation.message_count || 0}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles[conversation.status]}`}>
                              {conversation.status}
                            </span>
                          </td>
                          <td>
                            <button className={styles.viewButton}>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div className={styles.analyticsTab}>
                <div className={styles.analyticsSection}>
                  <h3>Intent Distribution</h3>
                  <div className={styles.pieChartContainer}>
                    <div className={styles.pieChart}>
                      {/* Placeholder for pie chart */}
                      <div className={styles.pieChartPlaceholder}>
                        Pie Chart Visualization
                      </div>
                    </div>
                    <div className={styles.pieChartLegend}>
                      {analytics.topIntents.map((intent, index) => (
                        <div key={index} className={styles.legendItem}>
                          <div 
                            className={styles.legendColor} 
                            style={{ backgroundColor: getColorForIndex(index) }}
                          ></div>
                          <div className={styles.legendLabel}>{intent.name}</div>
                          <div className={styles.legendValue}>
                            {((intent.count / analytics.totalMessages) * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className={styles.analyticsSection}>
                  <h3>Conversation Length Distribution</h3>
                  <div className={styles.barChartHorizontal}>
                    <div className={styles.barChartItem}>
                      <div className={styles.barLabel}>1-2 messages</div>
                      <div className={styles.barContainer}>
                        <div 
                          className={styles.bar} 
                          style={{ width: '45%' }}
                        ></div>
                        <div className={styles.barValue}>45%</div>
                      </div>
                    </div>
                    <div className={styles.barChartItem}>
                      <div className={styles.barLabel}>3-5 messages</div>
                      <div className={styles.barContainer}>
                        <div 
                          className={styles.bar} 
                          style={{ width: '30%' }}
                        ></div>
                        <div className={styles.barValue}>30%</div>
                      </div>
                    </div>
                    <div className={styles.barChartItem}>
                      <div className={styles.barLabel}>6-10 messages</div>
                      <div className={styles.barContainer}>
                        <div 
                          className={styles.bar} 
                          style={{ width: '15%' }}
                        ></div>
                        <div className={styles.barValue}>15%</div>
                      </div>
                    </div>
                    <div className={styles.barChartItem}>
                      <div className={styles.barLabel}>11+ messages</div>
                      <div className={styles.barContainer}>
                        <div 
                          className={styles.bar} 
                          style={{ width: '10%' }}
                        ></div>
                        <div className={styles.barValue}>10%</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={styles.analyticsSection}>
                  <h3>Common User Queries</h3>
                  <div className={styles.wordCloudContainer}>
                    <div className={styles.wordCloudPlaceholder}>
                      Word Cloud Visualization
                    </div>
                  </div>
                </div>
                
                <div className={styles.analyticsSection}>
                  <h3>Chatbot Performance</h3>
                  <div className={styles.performanceMetrics}>
                    <div className={styles.metricCard}>
                      <h4>Resolution Rate</h4>
                      <div className={styles.metricValue}>78%</div>
                      <div className={styles.metricDescription}>
                        Percentage of conversations resolved without human intervention
                      </div>
                    </div>
                    <div className={styles.metricCard}>
                      <h4>Handoff Rate</h4>
                      <div className={styles.metricValue}>22%</div>
                      <div className={styles.metricDescription}>
                        Percentage of conversations transferred to human support
                      </div>
                    </div>
                    <div className={styles.metricCard}>
                      <h4>Avg. Response Time</h4>
                      <div className={styles.metricValue}>1.2s</div>
                      <div className={styles.metricDescription}>
                        Average time to generate a response
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'articles' && (
              <div className={styles.articlesTab}>
                <div className={styles.articlesHeader}>
                  <h3>Support Articles</h3>
                  <button className={styles.addButton}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add New Article
                  </button>
                </div>
                
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Created</th>
                        <th>Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supportArticles.map((article, index) => (
                        <tr key={index}>
                          <td>{article.title}</td>
                          <td>{article.category}</td>
                          <td>{formatDate(article.created_at)}</td>
                          <td>{formatDate(article.updated_at)}</td>
                          <td>
                            <div className={styles.actionButtons}>
                              <button className={styles.editButton}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Edit
                              </button>
                              <button className={styles.deleteButton}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to get color for chart
function getColorForIndex(index) {
  const colors = [
    '#0066cc', '#4caf50', '#ff9800', '#e53e3e', '#9c27b0', 
    '#3f51b5', '#00bcd4', '#009688', '#8bc34a', '#ffeb3b'
  ];
  
  return colors[index % colors.length];
}
