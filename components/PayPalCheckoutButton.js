import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/PayPalCheckout.module.css';

export default function PayPalCheckoutButton({ amount, shippingAddress, onSuccess, onError }) {
  const paypalRef = useRef();
  const router = useRouter();

  useEffect(() => {
    // Load the PayPal SDK script
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;

    script.onload = () => {
      // Initialize PayPal buttons
      if (window.paypal) {
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            // Create a PayPal order
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: amount.toFixed(2),
                    currency_code: 'USD',
                  },
                  shipping: {
                    name: {
                      full_name: shippingAddress.name,
                    },
                    address: {
                      address_line_1: shippingAddress.address,
                      admin_area_2: shippingAddress.city,
                      admin_area_1: shippingAddress.state,
                      postal_code: shippingAddress.zip,
                      country_code: shippingAddress.country,
                    },
                  },
                },
              ],
              application_context: {
                shipping_preference: 'SET_PROVIDED_ADDRESS',
              },
            });
          },
          onApprove: async (data, actions) => {
            // Capture the funds from the transaction
            const order = await actions.order.capture();
            
            // Call your server to save the transaction
            try {
              const response = await fetch('/api/orders/paypal-success', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  orderID: data.orderID,
                  paypalOrderData: order,
                  shippingAddress,
                }),
              });
              
              const responseData = await response.json();
              
              if (responseData.success) {
                if (onSuccess) {
                  onSuccess(responseData);
                } else {
                  // Redirect to success page
                  router.push(`/checkout/success?order_id=${responseData.orderNumber}`);
                }
              } else {
                throw new Error(responseData.message || 'Failed to process order');
              }
            } catch (error) {
              console.error('Error processing PayPal payment:', error);
              if (onError) {
                onError(error);
              } else {
                alert('There was an error processing your payment. Please try again.');
              }
            }
          },
          onError: (err) => {
            console.error('PayPal Checkout Error:', err);
            if (onError) {
              onError(err);
            } else {
              alert('There was an error with PayPal. Please try again later.');
            }
          },
          style: {
            layout: 'horizontal',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
            height: 40,
          },
        }).render(paypalRef.current);
      }
    };

    // Add the script to the document
    document.body.appendChild(script);

    // Clean up
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [amount, shippingAddress, router, onSuccess, onError]);

  return (
    <div className={styles.paypalButtonContainer}>
      <div ref={paypalRef} className={styles.paypalButton}></div>
    </div>
  );
}
