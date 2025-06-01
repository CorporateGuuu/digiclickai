import React from 'react';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import styles from './Marketplace.module.css';

const MarketplaceIntegration = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ebayConnected, setEbayConnected] = useState(false);
  const [amazonConnected, setAmazonConnected] = useState(false);
  const [tiktokConnected, setTiktokConnected] = useState(false);

  const handleConnect = (platform) => {
    // In a real implementation, this would redirect to the OAuth flow
    // For demo purposes, we'll just toggle the connected state
    switch (platform) {
      case 'ebay':
        setEbayConnected(!ebayConnected);
        break;
      case 'amazon':
        setAmazonConnected(!amazonConnected);
        break;
      case 'tiktok':
        setTiktokConnected(!tiktokConnected);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.marketplaceContainer}>
      <h2 className={styles.marketplaceTitle}>Marketplace Integrations</h2>
      
      <div className={styles.marketplaceTabs}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'dashboard' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'orders' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'inventory' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'settings' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
      
      <div className={styles.marketplaceContent}>
        {activeTab === 'dashboard' && (
          <div className={styles.marketplaceDashboard}>
            <div className={styles.marketplaceCards}>
              <div className={styles.marketplaceCard}>
                <div className={styles.marketplaceCardHeader}>
                  <img src="/images/ebay-logo.png" alt="eBay" className={styles.marketplaceLogo} />
                  <h3>eBay</h3>
                </div>
                <div className={styles.marketplaceCardBody}>
                  <div className={styles.connectionStatus}>
                    <span className={`${styles.statusIndicator} ${ebayConnected ? styles.connected : styles.disconnected}`}></span>
                    <span>{ebayConnected ? 'Connected' : 'Disconnected'}</span>
                  </div>
                  {ebayConnected ? (
                    <>
                      <div className={styles.marketplaceStats}>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Active Listings</span>
                          <span className={styles.statValue}>24</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Pending Orders</span>
                          <span className={styles.statValue}>3</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Total Sales</span>
                          <span className={styles.statValue}>$1,245.67</span>
                        </div>
                      </div>
                      <button 
                        className={styles.marketplaceButton}
                        onClick={() => handleConnect('ebay')}
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button 
                      className={styles.marketplaceButton}
                      onClick={() => handleConnect('ebay')}
                    >
                      Connect eBay Account
                    </button>
                  )}
                </div>
              </div>
              
              <div className={styles.marketplaceCard}>
                <div className={styles.marketplaceCardHeader}>
                  <img src="/images/amazon-logo.png" alt="Amazon" className={styles.marketplaceLogo} />
                  <h3>Amazon</h3>
                </div>
                <div className={styles.marketplaceCardBody}>
                  <div className={styles.connectionStatus}>
                    <span className={`${styles.statusIndicator} ${amazonConnected ? styles.connected : styles.disconnected}`}></span>
                    <span>{amazonConnected ? 'Connected' : 'Disconnected'}</span>
                  </div>
                  {amazonConnected ? (
                    <>
                      <div className={styles.marketplaceStats}>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Active Listings</span>
                          <span className={styles.statValue}>18</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Pending Orders</span>
                          <span className={styles.statValue}>5</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Total Sales</span>
                          <span className={styles.statValue}>$2,890.45</span>
                        </div>
                      </div>
                      <button 
                        className={styles.marketplaceButton}
                        onClick={() => handleConnect('amazon')}
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button 
                      className={styles.marketplaceButton}
                      onClick={() => handleConnect('amazon')}
                    >
                      Connect Amazon Account
                    </button>
                  )}
                </div>
              </div>
              
              <div className={styles.marketplaceCard}>
                <div className={styles.marketplaceCardHeader}>
                  <img src="/images/tiktok-logo.png" alt="TikTok Shop" className={styles.marketplaceLogo} />
                  <h3>TikTok Shop</h3>
                </div>
                <div className={styles.marketplaceCardBody}>
                  <div className={styles.connectionStatus}>
                    <span className={`${styles.statusIndicator} ${tiktokConnected ? styles.connected : styles.disconnected}`}></span>
                    <span>{tiktokConnected ? 'Connected' : 'Disconnected'}</span>
                  </div>
                  {tiktokConnected ? (
                    <>
                      <div className={styles.marketplaceStats}>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Active Listings</span>
                          <span className={styles.statValue}>12</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Pending Orders</span>
                          <span className={styles.statValue}>7</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Total Sales</span>
                          <span className={styles.statValue}>$945.20</span>
                        </div>
                      </div>
                      <button 
                        className={styles.marketplaceButton}
                        onClick={() => handleConnect('tiktok')}
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button 
                      className={styles.marketplaceButton}
                      onClick={() => handleConnect('tiktok')}
                    >
                      Connect TikTok Shop
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className={styles.marketplaceSummary}>
              <h3>Marketplace Summary</h3>
              <div className={styles.summaryStats}>
                <div className={styles.summaryStatItem}>
                  <span className={styles.summaryStatLabel}>Total Active Listings</span>
                  <span className={styles.summaryStatValue}>
                    {(ebayConnected ? 24 : 0) + (amazonConnected ? 18 : 0) + (tiktokConnected ? 12 : 0)}
                  </span>
                </div>
                <div className={styles.summaryStatItem}>
                  <span className={styles.summaryStatLabel}>Total Pending Orders</span>
                  <span className={styles.summaryStatValue}>
                    {(ebayConnected ? 3 : 0) + (amazonConnected ? 5 : 0) + (tiktokConnected ? 7 : 0)}
                  </span>
                </div>
                <div className={styles.summaryStatItem}>
                  <span className={styles.summaryStatLabel}>Total Sales</span>
                  <span className={styles.summaryStatValue}>
                    ${((ebayConnected ? 1245.67 : 0) + (amazonConnected ? 2890.45 : 0) + (tiktokConnected ? 945.20 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div className={styles.marketplaceOrders}>
            <h3>Marketplace Orders</h3>
            <p className={styles.comingSoon}>Order management coming soon!</p>
          </div>
        )}
        
        {activeTab === 'inventory' && (
          <div className={styles.marketplaceInventory}>
            <h3>Inventory Management</h3>
            <p className={styles.comingSoon}>Inventory management coming soon!</p>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className={styles.marketplaceSettings}>
            <h3>Integration Settings</h3>
            <p className={styles.comingSoon}>Integration settings coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceIntegration;
