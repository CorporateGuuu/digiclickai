import React from 'react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import styles from '../../styles/AdminPages.module.css';

export default function AdminProducts() {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, [filter, search, sortBy, sortOrder, page]);

  async function fetchProducts() {
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
      
      const response = await fetch(`/api/admin/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
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
    fetchProducts();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete product');
        }
        
        // Refresh products list
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  return (
    <>
      <Head>
        <title>Products | Admin Dashboard</title>
      </Head>
      
      <AdminLayout>
        <div className={styles.pageHeader}>
          <h1>Products</h1>
          <Link href="/admin/products/new" className={styles.addButton}>
            Add New Product
          </Link>
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
              <option value="all">All Products</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="featured">Featured</option>
              <option value="new">New Arrivals</option>
            </select>
          </div>
          
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Search products..."
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
            <p>Loading products...</p>
          </div>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.imageColumn}>Image</th>
                    <th 
                      className={`${styles.sortableColumn} ${sortBy === 'name' ? styles.activeSortColumn : ''}`}
                      onClick={() => handleSort('name')}
                    >
                      Product Name
                      {sortBy === 'name' && (
                        <span className={styles.sortIcon}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className={`${styles.sortableColumn} ${sortBy === 'price' ? styles.activeSortColumn : ''}`}
                      onClick={() => handleSort('price')}
                    >
                      Price
                      {sortBy === 'price' && (
                        <span className={styles.sortIcon}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className={`${styles.sortableColumn} ${sortBy === 'category' ? styles.activeSortColumn : ''}`}
                      onClick={() => handleSort('category')}
                    >
                      Category
                      {sortBy === 'category' && (
                        <span className={styles.sortIcon}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className={`${styles.sortableColumn} ${sortBy === 'stock' ? styles.activeSortColumn : ''}`}
                      onClick={() => handleSort('stock')}
                    >
                      Stock
                      {sortBy === 'stock' && (
                        <span className={styles.sortIcon}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td className={styles.imageCell}>
                          <img
                            src={product.image_url || '/images/placeholder.jpg'}
                            alt={product.name}
                            className={styles.productImage}
                          />
                        </td>
                        <td>{product.name}</td>
                        <td>${product.price.toFixed(2)}</td>
                        <td>{product.category_name}</td>
                        <td>
                          <span className={`${styles.stockBadge} ${
                            product.stock_quantity <= 0
                              ? styles.outOfStock
                              : product.stock_quantity <= 5
                              ? styles.lowStock
                              : styles.inStock
                          }`}>
                            {product.stock_quantity <= 0
                              ? 'Out of Stock'
                              : product.stock_quantity <= 5
                              ? 'Low Stock'
                              : 'In Stock'}
                          </span>
                          <span className={styles.stockCount}>
                            ({product.stock_quantity})
                          </span>
                        </td>
                        <td className={styles.actions}>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className={styles.actionButton}
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className={`${styles.actionButton} ${styles.editButton}`}
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className={styles.noData}>
                        No products found
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
        destination: '/auth/signin?callbackUrl=/admin/products',
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
