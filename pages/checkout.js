import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import StripeCheckoutButton from '../components/StripeCheckoutButton';
import CryptoCheckoutButton from '../components/CryptoCheckoutButton';
import PayPalCheckoutButton from '../components/PayPalCheckoutButton';

export default function Checkout() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [taxRate, setTaxRate] = useState(0.0625); // 6.25% tax rate

  // Form state
  const [formData, setFormData] = useState({
    // Shipping information
    shipping_name: '',
    shipping_email: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: 'US',

    // Billing information
    same_as_shipping: true,
    billing_name: '',
    billing_email: '',
    billing_phone: '',
    billing_address: '',
    billing_city: '',
    billing_state: '',
    billing_zip: '',
    billing_country: 'US',

    // Payment information
    payment_method: 'credit_card',
    card_number: '',
    card_name: '',
    card_expiry: '',
    card_cvc: '',

    // Order notes
    notes: ''
  });

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();

      if (data.success) {
        if (data.cart.items.length === 0) {
          // Redirect to cart if empty
          router.push('/cart');
          return;
        }
        setCart(data.cart);
      } else {
        throw new Error(data.message || 'Failed to fetch cart');
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (processing) return;

    try {
      setProcessing(true);

      // Prepare order data
      const orderData = {
        items: cart.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.discounted_price || item.price,
          total: item.total
        })),
        shipping_address: {
          name: formData.shipping_name,
          email: formData.shipping_email,
          phone: formData.shipping_phone,
          address: formData.shipping_address,
          city: formData.shipping_city,
          state: formData.shipping_state,
          zip: formData.shipping_zip,
          country: formData.shipping_country
        },
        billing_address: formData.same_as_shipping
          ? {
            name: formData.shipping_name,
            email: formData.shipping_email,
            phone: formData.shipping_phone,
            address: formData.shipping_address,
            city: formData.shipping_city,
            state: formData.shipping_state,
            zip: formData.shipping_zip,
            country: formData.shipping_country
          }
          : {
            name: formData.billing_name,
            email: formData.billing_email,
            phone: formData.billing_phone,
            address: formData.billing_address,
            city: formData.billing_city,
            state: formData.billing_state,
            zip: formData.billing_zip,
            country: formData.billing_country
          },
        payment_method: {
          type: formData.payment_method,
          card_number: formData.card_number ? formData.card_number.replace(/\s+/g, '') : null,
          card_name: formData.card_name,
          card_expiry: formData.card_expiry,
          card_cvc: formData.card_cvc
        },
        notes: formData.notes,
        total_amount: cart.subtotal
      };

      // Submit order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      if (data.success) {
        // Redirect to order confirmation page
        router.push(`/orders/${data.order.order_number}`);
      } else {
        throw new Error(data.message || 'Failed to place order');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message);
      setProcessing(false);
    }
  };

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        shipping_name: session.user.name || prev.shipping_name,
        shipping_email: session.user.email || prev.shipping_email
      }));
    }
  }, [session]);

  // Fetch cart on component mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/checkout')}`);
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="container">
        <h1>Checkout</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1>Checkout</h1>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchCart}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="container">
        <h1>Checkout</h1>
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Checkout</h1>

      <div className="checkout-container">
        <div className="checkout-form-container">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h2>Shipping Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="shipping_name">Full Name</label>
                  <input
                    type="text"
                    id="shipping_name"
                    name="shipping_name"
                    value={formData.shipping_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="shipping_email">Email</label>
                  <input
                    type="email"
                    id="shipping_email"
                    name="shipping_email"
                    value={formData.shipping_email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shipping_phone">Phone</label>
                  <input
                    type="tel"
                    id="shipping_phone"
                    name="shipping_phone"
                    value={formData.shipping_phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="shipping_address">Address</label>
                <input
                  type="text"
                  id="shipping_address"
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="shipping_city">City</label>
                  <input
                    type="text"
                    id="shipping_city"
                    name="shipping_city"
                    value={formData.shipping_city}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shipping_state">State</label>
                  <input
                    type="text"
                    id="shipping_state"
                    name="shipping_state"
                    value={formData.shipping_state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="shipping_zip">ZIP Code</label>
                  <input
                    type="text"
                    id="shipping_zip"
                    name="shipping_zip"
                    value={formData.shipping_zip}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shipping_country">Country</label>
                  <select
                    id="shipping_country"
                    name="shipping_country"
                    value={formData.shipping_country}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="same_as_shipping"
                  name="same_as_shipping"
                  checked={formData.same_as_shipping}
                  onChange={handleInputChange}
                />
                <label htmlFor="same_as_shipping">Billing address same as shipping</label>
              </div>

              {!formData.same_as_shipping && (
                <>
                  <h2>Billing Information</h2>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="billing_name">Full Name</label>
                      <input
                        type="text"
                        id="billing_name"
                        name="billing_name"
                        value={formData.billing_name}
                        onChange={handleInputChange}
                        required={!formData.same_as_shipping}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="billing_email">Email</label>
                      <input
                        type="email"
                        id="billing_email"
                        name="billing_email"
                        value={formData.billing_email}
                        onChange={handleInputChange}
                        required={!formData.same_as_shipping}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="billing_phone">Phone</label>
                      <input
                        type="tel"
                        id="billing_phone"
                        name="billing_phone"
                        value={formData.billing_phone}
                        onChange={handleInputChange}
                        required={!formData.same_as_shipping}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="billing_address">Address</label>
                    <input
                      type="text"
                      id="billing_address"
                      name="billing_address"
                      value={formData.billing_address}
                      onChange={handleInputChange}
                      required={!formData.same_as_shipping}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="billing_city">City</label>
                      <input
                        type="text"
                        id="billing_city"
                        name="billing_city"
                        value={formData.billing_city}
                        onChange={handleInputChange}
                        required={!formData.same_as_shipping}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="billing_state">State</label>
                      <input
                        type="text"
                        id="billing_state"
                        name="billing_state"
                        value={formData.billing_state}
                        onChange={handleInputChange}
                        required={!formData.same_as_shipping}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="billing_zip">ZIP Code</label>
                      <input
                        type="text"
                        id="billing_zip"
                        name="billing_zip"
                        value={formData.billing_zip}
                        onChange={handleInputChange}
                        required={!formData.same_as_shipping}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="billing_country">Country</label>
                      <select
                        id="billing_country"
                        name="billing_country"
                        value={formData.billing_country}
                        onChange={handleInputChange}
                        required={!formData.same_as_shipping}
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="form-section">
              <h2>Payment Information</h2>
              <div className="payment-options">
                <div className="payment-option">
                  <h3>Credit Card Payment</h3>
                  <p>We use Stripe for secure credit card processing. You will be redirected to Stripe to complete your payment.</p>
                  <div className="stripe-info">
                    <img src="/stripe-logo.svg" alt="Stripe" className="stripe-logo" />
                    <p>Your payment information is securely processed by Stripe. We never store your card details.</p>
                  </div>
                </div>

                <div className="payment-option">
                  <h3>PayPal Payment</h3>
                  <p>Pay securely with PayPal. You can use your PayPal balance, bank account, or credit card.</p>
                  <div className="paypal-info">
                    <img src="/images/payments/paypal.svg" alt="PayPal" className="paypal-logo" />
                    <p>Fast, secure checkout with PayPal. No account required for credit card payments.</p>
                  </div>
                </div>

                <div className="payment-option">
                  <h3>Cryptocurrency Payment</h3>
                  <p>We accept Bitcoin, Ethereum, and other cryptocurrencies. Select this option to pay with cryptocurrency.</p>
                  <div className="crypto-info">
                    <div className="crypto-icons">
                      <img src="/images/crypto/bitcoin.svg" alt="Bitcoin" className="crypto-icon" />
                      <img src="/images/crypto/ethereum.svg" alt="Ethereum" className="crypto-icon" />
                      <img src="/images/crypto/usdt.svg" alt="Tether" className="crypto-icon" />
                    </div>
                    <p>Cryptocurrency payments are processed instantly. No account required.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Order Notes</h2>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Special instructions for delivery"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div className="checkout-actions">
              <Link href="/cart" className="btn btn-secondary">
                Back to Cart
              </Link>

              <div className="payment-buttons">
                <StripeCheckoutButton
                  shippingAddress={formData.same_as_shipping ? {
                    name: formData.shipping_name,
                    email: formData.shipping_email,
                    phone: formData.shipping_phone,
                    address: formData.shipping_address,
                    city: formData.shipping_city,
                    state: formData.shipping_state,
                    zip: formData.shipping_zip,
                    country: formData.shipping_country
                  } : {
                    name: formData.billing_name,
                    email: formData.billing_email,
                    phone: formData.billing_phone,
                    address: formData.billing_address,
                    city: formData.billing_city,
                    state: formData.billing_state,
                    zip: formData.billing_zip,
                    country: formData.billing_country
                  }}
                />

                <PayPalCheckoutButton
                  amount={cart.subtotal + (cart.subtotal * taxRate)}
                  shippingAddress={formData.same_as_shipping ? {
                    name: formData.shipping_name,
                    email: formData.shipping_email,
                    phone: formData.shipping_phone,
                    address: formData.shipping_address,
                    city: formData.shipping_city,
                    state: formData.shipping_state,
                    zip: formData.shipping_zip,
                    country: formData.shipping_country
                  } : {
                    name: formData.billing_name,
                    email: formData.billing_email,
                    phone: formData.billing_phone,
                    address: formData.billing_address,
                    city: formData.billing_city,
                    state: formData.billing_state,
                    zip: formData.billing_zip,
                    country: formData.billing_country
                  }}
                  onSuccess={(data) => {
                    router.push(`/checkout/success?order_id=${data.orderNumber}`);
                  }}
                  onError={(error) => {
                    setError(error.message || 'There was an error processing your PayPal payment');
                  }}
                />

                <CryptoCheckoutButton
                  shippingAddress={formData.same_as_shipping ? {
                    name: formData.shipping_name,
                    email: formData.shipping_email,
                    phone: formData.shipping_phone,
                    address: formData.shipping_address,
                    city: formData.shipping_city,
                    state: formData.shipping_state,
                    zip: formData.shipping_zip,
                    country: formData.shipping_country
                  } : {
                    name: formData.billing_name,
                    email: formData.billing_email,
                    phone: formData.billing_phone,
                    address: formData.billing_address,
                    city: formData.billing_city,
                    state: formData.billing_state,
                    zip: formData.billing_zip,
                    country: formData.billing_country
                  }}
                  amount={cart.subtotal + (cart.subtotal * taxRate)}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="checkout-items">
            {cart.items.map((item) => (
              <div key={item.id} className="checkout-item">
                <div className="checkout-item-image">
                  <img src={item.image_url || "/placeholder.svg"} alt={item.name} />
                </div>
                <div className="checkout-item-details">
                  <div className="checkout-item-name">{item.name}</div>
                  <div className="checkout-item-price">
                    ${(item.discounted_price || item.price).toFixed(2)} x {item.quantity}
                  </div>
                </div>
                <div className="checkout-item-total">
                  ${item.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-totals">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>

            <div className="summary-row">
              <span>Tax ({(taxRate * 100).toFixed(2)}%):</span>
              <span>${(cart.subtotal * taxRate).toFixed(2)}</span>
            </div>

            <div className="summary-row total">
              <span>Total:</span>
              <span>${(cart.subtotal + (cart.subtotal * taxRate)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
