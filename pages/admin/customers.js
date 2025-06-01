import React from 'react';
import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import styles from '../../styles/AdminPages.module.css';

export default function AdminCustomers() {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    fetchCustomers();
  }, [search, sortBy, sortOrder, page]);

  async function fetchCustomers() {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('search', search);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', page);
      params.append('limit', 10);
      
      const response = await fetch(`/api/admin/customers?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data = await response.json();
      setCustomers(data.customers);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <Head>
        <title>Customers | Admin Dashboard</title>
      </Head>
      
      <AdminLayout>
        <div className={styles.pageHeader}>
          <h1>Customers</h1>
        </div>
        
        <div className={styles.filterBar}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Search by name or email..."
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
            <p>Loading customers...</p>
          </div>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th 
                      className={`${styles.sortableColumn} ${sortBy === 'name' ? styles.activeSortColumn : ''}`}
                      onClick={() => handleSort('name')}
                    >
                      Name
                      {sortBy === 'name' && (
                        <span className={styles.sortIcon}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className={`${styles.sortableColumn} ${sortBy === 'email' ? styles.activeSortColumn : ''}`}
                      onClick={() => handleSort('email')}
                    >
                      Email
                      {sortBy === 'email' && (
                        <span className={styles.sortIcon}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className={`${styles.sortableColumn} ${sortBy === 'created_at' ? styles.activeSortColumn : ''}`}
                      onClick={() => handleSort('created_at')}
                    >
                      Joined
                      {sortBy === 'created_at' && (
                        <span className={styles.sortIcon}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className={`${styles.sortableColumn} ${sortBy === 'orders_count' ? styles.activeSortColumn : ''}`}
                      onClick={() => handleSort('orders_count')}
                    >
                      Orders
                      {sortBy === 'orders_count' && (
                        <span className={styles.sortIcon}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className={`${styles.sortableColumn} ${sortBy === 'total_spent' ? styles.activeSortColumn : ''}`}
                      onClick={() => handleSort('total_spent')}
                    >
                      Total Spent
                      {sortBy === 'total_spent' && (
                        <span className={styles.sortIcon}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <tr key={customer.id}>
                        <td>{customer.first_name} {customer.last_name}</td>
                        <td>{customer.email}</td>
                        <td>{formatDate(customer.created_at)}</td>
                        <td>{customer.orders_count || 0}</td>
                        <td>${(customer.total_spent || 0).toFixed(2)}</td>
                        <td className={styles.actions}>
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className={styles.actionButton}
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/customers/${customer.id}/edit`}
                            className={`${styles.actionButton} ${styles.editButton}`}
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/admin/customers/${customer.id}/orders`}
                            className={`${styles.actionButton} ${styles.ordersButton}`}
                          >
                            Orders
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className={styles.noData}>
                        No customers found
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
        destination: '/auth/signin?callbackUrl=/admin/customers',
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
