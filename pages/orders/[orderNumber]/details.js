import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';
import styles from '../../../styles/OrderDetail.module.css';

export default function OrderDetail() {
  const router = useRouter();
  const { orderNumber } = router.query;
  const { data: session, status } = useSession();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderNumber) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);

        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock order data
        const mockOrder = {
          id: orderNumber,
          date: '2023-06-15T14:30:00Z',
          status: 'delivered',
          total: 199.99,
          subtotal: 189.99,
          shipping: 10.00,
          tax: 0,
          payment_method: 'Credit Card (Visa ending in 1234)',
          shipping_address: {
            name: 'John Doe',
            address: '123 Main St',
            city: 'Vienna',
            state: 'VA',
            zip: '22182',
            country: 'United States'
          },
          billing_address: {
            name: 'John Doe',
            address: '123 Main St',
            city: 'Vienna',
            state: 'VA',
            zip: '22182',
            country: 'United States'
          },
          items: [
            {
              id: 1,
              name: 'iPhone 13 Pro OLED Screen',
              price: 129.99,
              quantity: 1,
              image: '/images/iphone-screen.svg',
              total: 129.99
            },
            {
              id: 2,
              name: 'Professional Repair Tool Kit',
              price: 69.99,
              quantity: 1,
              image: '/images/repair-tools.svg',
              total: 69.99
            }
          ],
          timeline: [
            {
              status: 'Order Placed',
              date: '2023-06-15T14:30:00Z',
              description: 'Your order has been received and is being processed.'
            },
            {
              status: 'Payment Confirmed',
              date: '2023-06-15T14:35:00Z',
              description: 'Your payment has been confirmed.'
            },
            {
              status: 'Processing',
              date: '2023-06-16T09:15:00Z',
              description: 'Your order is being prepared for shipping.'
            },
            {
              status: 'Shipped',
              date: '2023-06-17T11:20:00Z',
              description: 'Your order has been shipped.',
              tracking: {
                number: 'TRK123456789',
                carrier: 'USPS'
              }
            },
            {
              status: 'Delivered',
              date: '2023-06-19T15:45:00Z',
              description: 'Your order has been delivered.'
            }
          ]
        };
        
        setOrder(mockOrder);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderNumber]);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status class
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
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => router.reload()} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container">
        <div className="error-message">
          <p>Order not found.</p>
          <Link href="/account?tab=orders" className="btn btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Order {order.id} | MDTS - Midas Technical Solutions</title>
        <meta name="description" content={`Order details for ${order.id} at MDTS - Midas Technical Solutions`} />
      </Head>
      
      <div className="container">
        <div className={styles.orderDetailHeader}>
          <div className={styles.orderDetailHeaderLeft}>
            <Link href="/account?tab=orders" className={styles.backLink}>
              &larr; Back to Orders
            </Link>
            <h1>Order Details</h1>
            <div className={styles.orderNumber}>Order #{order.id}</div>
            <div className={styles.orderDate}>Placed on {formatDate(order.date)}</div>
          </div>
          
          <div className={styles.orderDetailHeaderRight}>
            <div className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
            
            {(order.status === 'shipped' || order.status === 'processing') && (
              <Link href={`/orders/track/${order.id}`} className={styles.trackOrderButton}>
                Track Order
              </Link>
            )}
          </div>
        </div>
        
        <div className={styles.orderDetailContent}>
          <div className={styles.orderDetailMain}>
            <div className={styles.orderItems}>
              <h2>Items in Your Order</h2>
              
              <div className={styles.orderItemsList}>
                {order.items.map(item => (
                  <div key={item.id} className={styles.orderItem}>
                    <div className={styles.orderItemImage}>
                      <img src={item.image || '/images/placeholder.svg'} alt={item.name} />
                    </div>
                    
                    <div className={styles.orderItemDetails}>
                      <div className={styles.orderItemName}>{item.name}</div>
                      <div className={styles.orderItemPrice}>${item.price.toFixed(2)}</div>
                      <div className={styles.orderItemQuantity}>Quantity: {item.quantity}</div>
                    </div>
                    
                    <div className={styles.orderItemTotal}>
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.orderTimeline}>
              <h2>Order Timeline</h2>
              
              <div className={styles.timeline}>
                {order.timeline.map((event, index) => (
                  <div key={index} className={styles.timelineEvent}>
                    <div className={styles.timelineEventIcon}>
                      <div className={styles.timelineEventIconInner}></div>
                    </div>
                    
                    <div className={styles.timelineEventContent}>
                      <div className={styles.timelineEventHeader}>
                        <div className={styles.timelineEventStatus}>{event.status}</div>
                        <div className={styles.timelineEventDate}>{formatDate(event.date)}</div>
                      </div>
                      
                      <div className={styles.timelineEventDescription}>
                        {event.description}
                      </div>
                      
                      {event.tracking && (
                        <div className={styles.timelineEventTracking}>
                          <div className={styles.trackingInfo}>
                            <span className={styles.trackingLabel}>Tracking Number:</span>
                            <span className={styles.trackingNumber}>{event.tracking.number}</span>
                          </div>
                          <div className={styles.trackingInfo}>
                            <span className={styles.trackingLabel}>Carrier:</span>
                            <span className={styles.trackingCarrier}>{event.tracking.carrier}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className={styles.orderDetailSidebar}>
            <div className={styles.orderSummary}>
              <h2>Order Summary</h2>
              
              <div className={styles.orderSummaryRow}>
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              
              <div className={styles.orderSummaryRow}>
                <span>Shipping:</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              
              {order.tax > 0 && (
                <div className={styles.orderSummaryRow}>
                  <span>Tax:</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
              )}
              
              <div className={`${styles.orderSummaryRow} ${styles.orderTotal}`}>
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              
              <div className={styles.paymentMethod}>
                <h3>Payment Method</h3>
                <p>{order.payment_method}</p>
              </div>
            </div>
            
            <div className={styles.addressInfo}>
              <div className={styles.shippingAddress}>
                <h3>Shipping Address</h3>
                <p>{order.shipping_address.name}</p>
                <p>{order.shipping_address.address}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
                <p>{order.shipping_address.country}</p>
              </div>
              
              <div className={styles.billingAddress}>
                <h3>Billing Address</h3>
                <p>{order.billing_address.name}</p>
                <p>{order.billing_address.address}</p>
                <p>{order.billing_address.city}, {order.billing_address.state} {order.billing_address.zip}</p>
                <p>{order.billing_address.country}</p>
              </div>
            </div>
            
            <div className={styles.orderActions}>
              <h3>Need Help?</h3>
              <Link href="/contact" className={styles.contactButton}>
                Contact Support
              </Link>
              
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <button className={styles.cancelOrderButton}>
                  Cancel Order
                </button>
              )}
              
              <button className={styles.returnOrderButton}>
                Return Items
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Server-side authentication check
export async function getServerSideProps(context) {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin?callbackUrl=/orders/' + context.params.orderNumber + '/details',
        permanent: false,
      },
    };
  }
  
  return {
    props: { session },
  };
}
