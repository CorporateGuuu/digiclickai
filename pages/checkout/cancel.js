import React from 'react';
import Link from 'next/link';

function CheckoutCancel() {
  return (
    <div className="container">
      <div className="checkout-cancel">
        <div className="cancel-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        
        <h1>Payment Cancelled</h1>
        
        <p>Your payment was cancelled. No charges were made.</p>
        
        <div className="cancel-actions">
          <Link href="/cart" className="btn btn-primary">
            Return to Cart
          </Link>
          
          <Link href="/products" className="btn btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default React.memo(CheckoutCancel);
