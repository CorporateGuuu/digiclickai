import React, { useState } from 'react';
import styles from './Marketplace.module.css';

const FourSellerIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [storeId, setStoreId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [inventoryStats, setInventoryStats] = useState({
    totalItems: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  });

  const handleConnect = (e) => {
    e.preventDefault();
    
    if (!apiKey || !storeId) {
      alert('Please enter both API Key and Store ID');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API connection
    setTimeout(() => {
      setIsConnected(true);
      setLastSync(new Date().toISOString());
      setInventoryStats({
        totalItems: 1245,
        inStock: 987,
        lowStock: 158,
        outOfStock: 100
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setApiKey('');
    setStoreId('');
    setLastSync(null);
    setInventoryStats({
      totalItems: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0
    });
  };

  const handleSync = () => {
    setIsLoading(true);
    
    // Simulate sync process
    setTimeout(() => {
      setLastSync(new Date().toISOString());
      setInventoryStats({
        totalItems: 1245,
        inStock: 987,
        lowStock: 158,
        outOfStock: 100
      });
      setIsLoading(false);
    }, 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.fourSellerContainer}>
      <div className={styles.fourSellerHeader}>
        <div className={styles.fourSellerLogo}>
          <img src="/images/4seller-logo.png" alt="4seller" className={styles.fourSellerLogoImg} />
          <h3>4seller Integration</h3>
        </div>
        
        <div className={styles.connectionStatus}>
          <span className={`${styles.statusIndicator} ${isConnected ? styles.connected : styles.disconnected}`}></span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      
      <div className={styles.fourSellerContent}>
        {!isConnected ? (
          <form onSubmit={handleConnect} className={styles.connectionForm}>
            <div className={styles.formGroup}>
              <label htmlFor="apiKey">API Key</label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your 4seller API Key"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="storeId">Store ID</label>
              <input
                type="text"
                id="storeId"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                placeholder="Enter your 4seller Store ID"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.connectButton}
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect to 4seller'}
            </button>
          </form>
        ) : (
          <>
            <div className={styles.syncInfo}>
              <div className={styles.lastSync}>
                <span className={styles.syncLabel}>Last Synchronized:</span>
                <span className={styles.syncValue}>{formatDate(lastSync)}</span>
              </div>
              
              <button 
                className={styles.syncButton}
                onClick={handleSync}
                disabled={isLoading}
              >
                {isLoading ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
            
            <div className={styles.inventoryStats}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{inventoryStats.totalItems}</div>
                <div className={styles.statLabel}>Total Items</div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statValue}>{inventoryStats.inStock}</div>
                <div className={styles.statLabel}>In Stock</div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statValue}>{inventoryStats.lowStock}</div>
                <div className={styles.statLabel}>Low Stock</div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statValue}>{inventoryStats.outOfStock}</div>
                <div className={styles.statLabel}>Out of Stock</div>
              </div>
            </div>
            
            <div className={styles.actionButtons}>
              <button className={styles.viewInventoryButton}>
                View Inventory
              </button>
              
              <button 
                className={styles.disconnectButton}
                onClick={handleDisconnect}
              >
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FourSellerIntegration;
