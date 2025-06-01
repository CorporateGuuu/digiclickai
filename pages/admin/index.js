import React from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard = () => {
  return (
    <>
      <Head>
        <title>Admin Dashboard | MDTS Tech</title>
        <meta name="description" content="Admin dashboard for MDTS Tech Store" />
      </Head>

      <AdminLayout>
        <h1>Dashboard</h1>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '20px',
          marginTop: '20px'
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <h3>Orders</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0' }}>24</p>
            <p style={{ color: '#666' }}>5 pending</p>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <h3>Revenue</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0' }}>$4,285</p>
            <p style={{ color: '#666' }}>Last 30 days</p>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <h3>Customers</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0' }}>156</p>
            <p style={{ color: '#666' }}>12 new this week</p>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <h3>Products</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0' }}>89</p>
            <p style={{ color: '#666' }}>15 low stock</p>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          marginTop: '30px'
        }}>
          <h2>Recent Orders</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Order ID</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>#ORD-5289</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>John Smith</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>May 15, 2023</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>$245.99</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  <span style={{ 
                    backgroundColor: '#d4edda', 
                    color: '#155724', 
                    padding: '3px 8px', 
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    Delivered
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>#ORD-5288</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Sarah Johnson</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>May 14, 2023</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>$189.50</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  <span style={{ 
                    backgroundColor: '#fff3cd', 
                    color: '#856404', 
                    padding: '3px 8px', 
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    Processing
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>#ORD-5287</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Michael Brown</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>May 14, 2023</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>$329.99</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  <span style={{ 
                    backgroundColor: '#cce5ff', 
                    color: '#004085', 
                    padding: '3px 8px', 
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    Shipped
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>#ORD-5286</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Emily Davis</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>May 13, 2023</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>$124.75</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  <span style={{ 
                    backgroundColor: '#d4edda', 
                    color: '#155724', 
                    padding: '3px 8px', 
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    Delivered
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>#ORD-5285</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Robert Wilson</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>May 12, 2023</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>$89.99</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  <span style={{ 
                    backgroundColor: '#f8d7da', 
                    color: '#721c24', 
                    padding: '3px 8px', 
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    Cancelled
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;
