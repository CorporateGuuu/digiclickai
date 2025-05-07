import React from 'react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../styles/Account.module.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch orders from an API
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock order data
        const mockOrders = [
          {
            id: 'ORD-12345',
            date: '2023-06-15T14:30:00Z',
            status: 'delivered',
            total: 199.99,
            items: [
              {
                id: 1,
                name: 'iPhone 13 Pro OLED Screen',
                price: 129.99,
                quantity: 1,
                image: '/images/iphone-screen.svg'
              },
              {
                id: 2,
                name: 'Professional Repair Tool Kit',
                price: 69.99,
                quantity: 1,
                image: '/images/repair-tools.svg'
              }
            ]
          },
          {
            id: 'ORD-12344',
            date: '2023-05-22T10:15:00Z',
            status: 'shipped',
            total: 89.99,
            items: [
              {
                id: 3,
                name: 'Samsung Galaxy S22 Battery',
                price: 39.99,
                quantity: 1,
                image: '/images/samsung-battery.svg'
              },
              {
                id: 4,
                name: 'Precision Screwdriver Set',
                price: 49.99,
                quantity: 1,
                image: '/images/screwdriver-set.svg'
              }
            ]
          },
          {
            id: 'ORD-12343',
            date: '2023-04-10T09:45:00Z',
            status: 'delivered',
            total: 129.99,
            items: [
              {
                id: 5,
                name: 'iPad Mini 5 Digitizer',
                price: 79.99,
                quantity: 1,
                image: '/images/ipad-mini.svg'
              },
              {
                id: 6,
                name: 'Heat Gun for Repairs',
                price: 49.99,
                quantity: 1,
                image: '/images/heat-gun.svg'
              }
            ]
          }
        ];

        setOrders(mockOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status class
  const getStatusClass = (status) => {
    switch (status) {
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.emptyOrders}>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <h3>No orders yet</h3>
        <p>You haven't placed any orders yet.</p>
        <Link href="/products" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Order History</h2>
      <p>View and track your orders</p>

      <div className={styles.ordersList}>
        {orders.map(order => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div>
                <span className={styles.orderNumber}>{order.id}</span>
                <div className={styles.orderDate}>{formatDate(order.date)}</div>
              </div>

              <div className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>

            <div className={styles.orderItems}>
              {order.items.map(item => (
                <div key={item.id} className={styles.orderItem}>
                  <img
                    src={item.image || '/images/placeholder.svg'}
                    alt={item.name}
                    className={styles.orderItemImage}
                  />

                  <div className={styles.orderItemDetails}>
                    <div className={styles.orderItemName}>{item.name}</div>
                    <div className={styles.orderItemPrice}>${item.price.toFixed(2)}</div>
                    <div className={styles.orderItemQuantity}>Quantity: {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.orderFooter}>
              <div className={styles.orderTotal}>
                Total: ${order.total.toFixed(2)}
              </div>

              <div className={styles.orderActions}>
                <Link href={`/orders/${order.id}`} className={`${styles.orderButton} ${styles.viewOrderButton}`}>
                  View Order Details
                </Link>

                {(order.status === 'shipped' || order.status === 'processing') && (
                  <Link href={`/orders/track/${order.id}`} className={`${styles.orderButton} ${styles.trackOrderButton}`}>
                    Track Order
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
