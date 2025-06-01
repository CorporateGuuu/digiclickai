import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function OrderConfirmation() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { orderNumber } = router.query;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order data
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderNumber}`);

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        throw new Error(data.message || 'Failed to fetch order');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch order when orderNumber is available
  useEffect(() => {
    if (orderNumber && status === 'authenticated') {
      fetchOrder();
    }
  }, [orderNumber, status]);

  // For demo purposes, we'll skip authentication redirect
  // In production, uncomment this code to redirect unauthenticated users
  /*
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/orders/${orderNumber}`)}`);
    }
  }, [status, router, orderNumber]);
  */

  if (status === 'loading' || loading) {
    return (
      <div className="container">
        <h1>Order Confirmation</h1>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1>Order Confirmation</h1>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchOrder}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container">
        <h1>Order Confirmation</h1>
        <p>Loading order details...</p>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container">
      <div className="order-confirmation">
        <div className="order-confirmation-header">
          <h1>Order Confirmation</h1>
          <div className="order-confirmation-status">
            <span className={`status-badge status-${order.status}`}>
              {order.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="order-confirmation-message">
          <p>Thank you for your order! Your order has been received and is being processed.</p>
          <p>Order Number: <strong>{order.order_number}</strong></p>
          <p>Date: {formatDate(order.created_at)}</p>
        </div>

        <div className="order-details">
          <div className="order-section">
            <h2>Order Summary</h2>

            <div className="order-items">
              {order.items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="order-item-image">
                    <img src={item.image_url || "/placeholder.svg"} alt={item.product_name} />
                  </div>
                  <div className="order-item-details">
                    <div className="order-item-name">
                      {item.slug ? (
                        <Link href={`/products/${item.slug}`}>
                          {item.product_name}
                        </Link>
                      ) : (
                        item.product_name
                      )}
                    </div>
                    <div className="order-item-price">
                      ${item.product_price.toFixed(2)}
                      {item.discount_percentage > 0 && (
                        <span className="discount-badge">
                          {item.discount_percentage}% OFF
                        </span>
                      )}
                    </div>
                    <div className="order-item-quantity">
                      Quantity: {item.quantity}
                    </div>
                  </div>
                  <div className="order-item-total">
                    ${item.total_price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping:</span>
                <span>{order.shipping_cost > 0 ? `$${order.shipping_cost.toFixed(2)}` : 'Free'}</span>
              </div>

              <div className="summary-row total">
                <span>Total:</span>
                <span>${(order.total_amount + order.shipping_cost).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="order-section order-info-grid">
            <div className="order-info-column">
              <h3>Shipping Address</h3>
              <div className="address-box">
                <p>{order.shipping_address.name}</p>
                <p>{order.shipping_address.address}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
                <p>{order.shipping_address.country}</p>
                <p>{order.shipping_address.phone}</p>
                <p>{order.shipping_address.email}</p>
              </div>
            </div>

            <div className="order-info-column">
              <h3>Billing Address</h3>
              <div className="address-box">
                <p>{order.billing_address.name}</p>
                <p>{order.billing_address.address}</p>
                <p>{order.billing_address.city}, {order.billing_address.state} {order.billing_address.zip}</p>
                <p>{order.billing_address.country}</p>
                <p>{order.billing_address.phone}</p>
                <p>{order.billing_address.email}</p>
              </div>
            </div>

            <div className="order-info-column">
              <h3>Payment Method</h3>
              <div className="payment-box">
                {order.payment_method.type === 'credit_card' ? (
                  <>
                    <p>Credit Card</p>
                    <p>Card ending in {order.payment_method.card_number.slice(-4)}</p>
                    <p>Status: {order.payment_status}</p>
                  </>
                ) : (
                  <>
                    <p>PayPal</p>
                    <p>Status: {order.payment_status}</p>
                  </>
                )}
              </div>
            </div>

            <div className="order-info-column">
              <h3>Order Status</h3>
              <div className="status-box">
                {order.status_history.map((status, index) => (
                  <div key={index} className="status-item">
                    <div className="status-date">
                      {formatDate(status.created_at)}
                    </div>
                    <div className="status-info">
                      <span className={`status-badge status-${status.status}`}>
                        {status.status.toUpperCase()}
                      </span>
                      {status.notes && <p>{status.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="order-actions">
          <Link href="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
          <Link href="/user/orders" className="btn btn-secondary">
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
