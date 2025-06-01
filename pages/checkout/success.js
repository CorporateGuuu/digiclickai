import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import styles from '../../styles/CheckoutSuccess.module.css';

export default function CheckoutSuccess() {
  const { data: session } = useSession();
  const router = useRouter();
  const { order_id } = router.query;

  // Redirect to orders page if user is authenticated
  useEffect(() => {
    if (session?.user) {
      const redirectTimer = setTimeout(() => {
        router.push('/account?tab=orders');
      }, 10000); // Increased to 10 seconds to give users time to read

      return () => clearTimeout(redirectTimer);
    }
  }, [session, router]);

  return (
    <>
      <Head>
        <title>Order Confirmed | MDTS - Midas Technical Solutions</title>
        <meta name="description" content="Your order has been confirmed. Thank you for shopping with Midas Technical Solutions." />
      </Head>

      <div className={styles.successContainer}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>

          <h1 className={styles.successTitle}>Order Confirmed!</h1>

          <p className={styles.successMessage}>
            Thank you for your purchase. Your order has been confirmed and is now being processed.
          </p>

          {order_id && (
            <div className={styles.orderInfo}>
              <p className={styles.orderNumber}>
                Order Number: <span>{order_id}</span>
              </p>
              <p className={styles.orderNote}>
                Please save this order number for your records. We've also sent a confirmation email with your order details.
              </p>
            </div>
          )}

          <div className={styles.nextSteps}>
            <h2>What's Next?</h2>
            <ol>
              <li>You'll receive an order confirmation email shortly.</li>
              <li>Once your order ships, we'll send you tracking information.</li>
              <li>Your items should arrive within 3-5 business days.</li>
            </ol>
          </div>

          {session?.user && (
            <p className={styles.redirectMessage}>
              You will be redirected to your orders page in 10 seconds, or you can click the button below.
            </p>
          )}

          <div className={styles.actionButtons}>
            {session?.user ? (
              <Link href="/account?tab=orders" className={styles.viewOrderButton}>
                View Order Details
              </Link>
            ) : (
              <Link href="/auth/register" className={styles.viewOrderButton}>
                Create Account
              </Link>
            )}
            <Link href="/" className={styles.continueShoppingButton}>
              Continue Shopping
            </Link>
          </div>

          <div className={styles.supportInfo}>
            <p>
              If you have any questions about your order, please contact our customer support at{' '}
              <a href="mailto:support@mdtstech.store">support@mdtstech.store</a> or call us at{' '}
              <a href="tel:+12403510511">+1 (240) 351-0511</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
