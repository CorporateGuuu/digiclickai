import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function UserOrders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch user orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch orders when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/user/orders')}`);
    }
  }, [status, router]);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (status === 'loading' || loading) {
    return (
      <div className="container">
        <h1>My Orders</h1>
        <p>Loading orders...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container">
        <h1>My Orders</h1>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchOrders}>Try Again</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <h1>My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="empty-orders">
          <p>You haven't placed any orders yet.</p>
          <Link href="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-card-info">
                  <h3>Order #{order.order_number}</h3>
                  <p>Placed on {formatDate(order.created_at)}</p>
                </div>
                <div className="order-card-status">
                  <span className={`status-badge status-${order.status}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="order-card-body">
                <div className="order-card-total">
                  <span>Total:</span>
                  <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="order-card-footer">
                <Link href={`/orders/${order.order_number}`} className="btn btn-secondary">
                  View Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
