import React from 'react';
import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import styles from '../../styles/AdminPages.module.css';

export default function AdminOrders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, [filter, search, sortBy, sortOrder, page]);

  async function fetchOrders() {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('filter', filter);
      params.append('search', search);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', page);
      params.append('limit', 10);
      
      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  }

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      // Refresh orders list
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return styles.statusPending;
      case 'processing':
        return styles.statusProcessing;
      case 'shipped':
        return styles.statusShipped;
      case 'delivered':
        return styles.statusDelivered;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  return (
    <>
      <Head>
        <title>Orders | Admin Dashboard</title>
      </Head>
      
      <AdminLayout>
        <div className={styles.pageHeader}>
          <h1>Orders</h1>
        </div>
        
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <label htmlFor="filter">Filter:</label>
            <select
              id="filter"
              value={filter}
              onChange={handleFilterChange}
              className={styles.select}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={search}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              Search
            </button>
          </form>
        </div>
        
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading orders...</p>
          </div>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th 
                      className={`${styles.sortableColumn} ${sortBy === 'order_number' ? styles.activeSortColumn : ''}`}
                      onClick={() => handleSort('order_number')}
                    >
                      Order #
                      {sortBy === 'order_number' && (
                        <span className={styles.sortIcon}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className={`${styles.sortableColumn} ${sortBy === 'customer_name' ? styles.activeSortColumn : ''}`}
                      onClick={() => handleSort('customer_name')}
                    >
                      Customer
                      {sortBy === 'customer_name' && (
                        <span className={styles.sortIcon}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className={`${styles.sortableColumn} ${sortBy === 'created_at' ? styles.activeSortColumn : ''}`}
                      onClick={() => handleSort('created_at')}
                    >
                      Date
                      {sortBy === 'created_at' && (
                        <span className={styles.sortIcon}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className={`${styles.sortableColumn} ${sortBy === 'total_amount' ? styles.activeSortColumn : ''}`}
                      onClick={() => handleSort('total_amount')}
                    >
                      Total
                      {sortBy === 'total_amount' && (
                        <span className={styles.sortIcon}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className={`${styles.sortableColumn} ${sortBy === 'status' ? styles.activeSortColumn : ''}`}
                      onClick={() => handleSort('status')}
                    >
                      Status
                      {sortBy === 'status' && (
                        <span className={styles.sortIcon}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.order_number}</td>
                        <td>{order.customer_name}</td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>${order.total_amount.toFixed(2)}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className={styles.actions}>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className={styles.actionButton}
                          >
                            View
                          </Link>
                          <div className={styles.statusDropdown}>
                            <button className={`${styles.actionButton} ${styles.updateButton}`}>
                              Update Status
                            </button>
                            <div className={styles.dropdownContent}>
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'pending')}
                                className={order.status === 'pending' ? styles.activeStatus : ''}
                              >
                                Pending
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'processing')}
                                className={order.status === 'processing' ? styles.activeStatus : ''}
                              >
                                Processing
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                className={order.status === 'shipped' ? styles.activeStatus : ''}
                              >
                                Shipped
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                className={order.status === 'delivered' ? styles.activeStatus : ''}
                              >
                                Delivered
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                className={order.status === 'cancelled' ? styles.activeStatus : ''}
                              >
                                Cancelled
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className={styles.noData}>
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                className={styles.paginationButton}
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={styles.paginationButton}
              >
                Previous
              </button>
              
              <span className={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={styles.paginationButton}
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages}
                className={styles.paginationButton}
              >
                Last
              </button>
            </div>
          </>
        )}
      </AdminLayout>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin?callbackUrl=/admin/orders',
        permanent: false,
      },
    };
  }
  
  return {
    props: {
      session,
    },
  };
}
