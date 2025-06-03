import React from 'react';
import styles from '../styles/AdminLayout.module.css';

const AdminLayoutLoading = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Loading...</p>
    </div>
  );
};

export default AdminLayoutLoading;
