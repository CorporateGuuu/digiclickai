import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';
import styles from '../../../styles/OrderTracking.module.css';

export default function OrderTracking() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchTracking = async () => {
      try {
        setLoading(true);
        
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock tracking data
        const mockTracking = {
          order_id: id,
          tracking_number: 'TRK123456789',
          carrier: 'USPS',
          estimated_delivery: '2023-06-19T15:45:00Z',
          status: 'delivered',
          origin: {
            city: 'Vienna',
            state: 'VA',
            country: 'US'
          },
          destination: {
            city: 'New York',
            state: 'NY',
            country: 'US'
          },
          events: [
            {
              status: 'Delivered',
              location: 'New York, NY',
              timestamp: '2023-06-19T15:45:00Z',
              description: 'Package delivered to recipient'
            },
            {
              status: 'Out for Delivery',
              location: 'New York, NY',
              timestamp: '2023-06-19T08:30:00Z',
              description: 'Package is out for delivery'
            },
            {
              status: 'Arrived at Local Facility',
              location: 'New York, NY',
              timestamp: '2023-06-18T22:15:00Z',
              description: 'Package arrived at local facility'
            },
            {
              status: 'In Transit',
              location: 'Philadelphia, PA',
              timestamp: '2023-06-18T14:20:00Z',
              description: 'Package in transit to destination'
            },
            {
              status: 'Departed Shipping Facility',
              location: 'Vienna, VA',
              timestamp: '2023-06-17T16:45:00Z',
              description: 'Package has left the shipping facility'
            },
            {
              status: 'Shipping Label Created',
              location: 'Vienna, VA',
              timestamp: '2023-06-17T11:20:00Z',
              description: 'Shipping label created, package ready for UPS'
            }
          ]
        };
        
        setTracking(mockTracking);
      } catch (err) {
        console.error('Error fetching tracking:', err);
        setError('Failed to load tracking information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTracking();
  }, [id]);
  
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
      case 'delivered':
        return styles.statusDelivered;
      case 'out for delivery':
        return styles.statusOutForDelivery;
      case 'in transit':
        return styles.statusInTransit;
      case 'shipping label created':
        return styles.statusCreated;
      default:
        return styles.statusProcessing;
    }
  };
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tracking information...</p>
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
  
  if (!tracking) {
    return (
      <div className="container">
        <div className="error-message">
          <p>Tracking information not found.</p>
          <Link href={`/orders/${id}`} className="btn btn-primary">
            Back to Order Details
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Track Order {tracking.order_id} | MDTS - Midas Technical Solutions</title>
        <meta name="description" content={`Track your order ${tracking.order_id} at MDTS - Midas Technical Solutions`} />
      </Head>
      
      <div className="container">
        <div className={styles.trackingHeader}>
          <Link href={`/orders/${tracking.order_id}`} className={styles.backLink}>
            &larr; Back to Order Details
          </Link>
          <h1>Track Your Order</h1>
          <div className={styles.orderNumber}>Order #{tracking.order_id}</div>
        </div>
        
        <div className={styles.trackingContent}>
          <div className={styles.trackingInfo}>
            <div className={styles.trackingInfoItem}>
              <div className={styles.trackingInfoLabel}>Tracking Number:</div>
              <div className={styles.trackingInfoValue}>{tracking.tracking_number}</div>
            </div>
            
            <div className={styles.trackingInfoItem}>
              <div className={styles.trackingInfoLabel}>Carrier:</div>
              <div className={styles.trackingInfoValue}>{tracking.carrier}</div>
            </div>
            
            <div className={styles.trackingInfoItem}>
              <div className={styles.trackingInfoLabel}>Status:</div>
              <div className={`${styles.trackingInfoValue} ${getStatusClass(tracking.status)}`}>
                {tracking.status.charAt(0).toUpperCase() + tracking.status.slice(1)}
              </div>
            </div>
            
            <div className={styles.trackingInfoItem}>
              <div className={styles.trackingInfoLabel}>Estimated Delivery:</div>
              <div className={styles.trackingInfoValue}>{formatDate(tracking.estimated_delivery)}</div>
            </div>
          </div>
          
          <div className={styles.trackingMap}>
            <div className={styles.mapPlaceholder}>
              <div className={styles.mapOrigin}>
                <div className={styles.mapLocation}>{tracking.origin.city}, {tracking.origin.state}</div>
                <div className={styles.mapLabel}>Origin</div>
              </div>
              
              <div className={styles.mapProgress}>
                <div className={styles.mapProgressBar}>
                  <div 
                    className={styles.mapProgressFill} 
                    style={{ 
                      width: tracking.status === 'delivered' ? '100%' : 
                             tracking.status === 'out for delivery' ? '90%' :
                             tracking.status === 'in transit' ? '50%' : '10%' 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className={styles.mapDestination}>
                <div className={styles.mapLocation}>{tracking.destination.city}, {tracking.destination.state}</div>
                <div className={styles.mapLabel}>Destination</div>
              </div>
            </div>
            
            <div className={styles.mapNote}>
              <p>For detailed tracking information, visit the {tracking.carrier} website using your tracking number.</p>
              <a 
                href={`https://www.${tracking.carrier.toLowerCase()}.com/tracking/details/${tracking.tracking_number}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.carrierLink}
              >
                Track on {tracking.carrier} Website
              </a>
            </div>
          </div>
          
          <div className={styles.trackingTimeline}>
            <h2>Tracking History</h2>
            
            <div className={styles.timeline}>
              {tracking.events.map((event, index) => (
                <div key={index} className={styles.timelineEvent}>
                  <div className={styles.timelineEventIcon}>
                    <div className={`${styles.timelineEventIconInner} ${getStatusClass(event.status)}`}></div>
                  </div>
                  
                  <div className={styles.timelineEventContent}>
                    <div className={styles.timelineEventHeader}>
                      <div className={styles.timelineEventStatus}>{event.status}</div>
                      <div className={styles.timelineEventDate}>{formatDate(event.timestamp)}</div>
                    </div>
                    
                    <div className={styles.timelineEventLocation}>{event.location}</div>
                    <div className={styles.timelineEventDescription}>{event.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className={styles.trackingHelp}>
            <h2>Need Help?</h2>
            <p>If you have any questions about your shipment, please contact our customer support team.</p>
            <Link href="/contact" className={styles.contactButton}>
              Contact Support
            </Link>
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
        destination: '/auth/signin?callbackUrl=/orders/track/' + context.params.id,
        permanent: false,
      },
    };
  }
  
  return {
    props: { session },
  };
}
