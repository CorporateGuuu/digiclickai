import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { getStripe } from '../lib/stripe';
import styles from '../styles/StripeCheckout.module.css';

export default function StripeCheckoutButton({ shippingAddress }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const router = useRouter();

  const handleCheckout = async () => {
    // Show the card form instead of redirecting to Stripe
    setShowCardForm(true);
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardData({
      ...cardData,
      [name]: value,
    });
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // In a real implementation, this would send the card data to your server
      // which would then use the Stripe API to process the payment

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate a fake order number
      const orderNumber = Math.floor(100000000 + Math.random() * 900000000).toString();

      // Redirect to success page
      router.push(`/checkout/success?order_id=${orderNumber}`);
    } catch (err) {
      console.error('Stripe checkout error:', err);
      setError('There was an error processing your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // Add a space after every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');

    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // Format as MM/YY
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }

    return digits;
  };

  return (
    <div className={styles.stripeCheckout}>
      {!showCardForm ? (
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="btn btn-primary checkout-button"
        >
          <img src="/images/payments/stripe.svg" alt="Stripe" width="20" height="20" style={{ marginRight: '8px' }} />
          {loading ? 'Processing...' : 'Pay with Card'}
        </button>
      ) : (
        <div className={styles.cardForm}>
          <div className={styles.cardFormHeader}>
            <h3>Enter Card Details</h3>
            <div className={styles.cardTypes}>
              <img src="/images/payments/visa.svg" alt="Visa" height="24" />
              <img src="/images/payments/mastercard.svg" alt="Mastercard" height="24" />
              <img src="/images/payments/amex.svg" alt="American Express" height="24" />
              <img src="/images/payments/discover.svg" alt="Discover" height="24" />
            </div>
          </div>

          <form onSubmit={handleCardSubmit}>
            <div className={styles.cardFormGroup}>
              <label className={styles.cardFormLabel}>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                className={styles.cardFormInput}
                placeholder="1234 5678 9012 3456"
                value={formatCardNumber(cardData.cardNumber)}
                onChange={(e) => setCardData({ ...cardData, cardNumber: formatCardNumber(e.target.value) })}
                required
                maxLength="19"
              />
            </div>

            <div className={styles.cardFormGroup}>
              <label className={styles.cardFormLabel}>Cardholder Name</label>
              <input
                type="text"
                name="cardName"
                className={styles.cardFormInput}
                placeholder="John Doe"
                value={cardData.cardName}
                onChange={handleCardInputChange}
                required
              />
            </div>

            <div className={styles.cardFormRow}>
              <div className={styles.cardFormGroup}>
                <label className={styles.cardFormLabel}>Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  className={styles.cardFormInput}
                  placeholder="MM/YY"
                  value={formatExpiryDate(cardData.expiryDate)}
                  onChange={(e) => setCardData({ ...cardData, expiryDate: formatExpiryDate(e.target.value) })}
                  required
                  maxLength="5"
                />
              </div>

              <div className={styles.cardFormGroup}>
                <label className={styles.cardFormLabel}>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  className={styles.cardFormInput}
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={handleCardInputChange}
                  required
                  maxLength="4"
                />
              </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div style={{ position: 'relative' }}>
              <button
                type="submit"
                className={styles.cardFormButton}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </button>

              {loading && (
                <div className={styles.processingOverlay}>
                  <div className={styles.spinner}></div>
                  <span>Processing payment...</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowCardForm(false)}
                style={{ background: 'none', border: 'none', color: '#0070ba', cursor: 'pointer' }}
              >
                Back to payment options
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
