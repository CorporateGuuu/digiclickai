import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/CryptoCheckout.module.css';

export default function CryptoCheckoutButton({ shippingAddress, amount }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCryptoOptions, setShowCryptoOptions] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [paymentAddress, setPaymentAddress] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const router = useRouter();

  const cryptoOptions = [
    { id: 'btc', name: 'Bitcoin (BTC)', icon: '/images/crypto/bitcoin.svg' },
    { id: 'eth', name: 'Ethereum (ETH)', icon: '/images/crypto/ethereum.svg' },
    { id: 'usdt', name: 'Tether (USDT)', icon: '/images/crypto/tether.svg' },
    { id: 'usdc', name: 'USD Coin (USDC)', icon: '/images/crypto/usdc.svg' },
    { id: 'xrp', name: 'Ripple (XRP)', icon: '/images/crypto/xrp.svg' },
  ];

  const handleShowCryptoOptions = () => {
    setShowCryptoOptions(true);
  };

  const handleSelectCrypto = async (crypto) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedCrypto(crypto);

      // In a real implementation, this would call an API to generate a payment address
      // For demo purposes, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      // Mock payment addresses for different cryptocurrencies
      const mockAddresses = {
        btc: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
        eth: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        usdt: 'TXFBqBbqJommqZf7BV8NNYzePh5zABnKM3',
        usdc: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        xrp: 'rLW9gnQo7BQhU6igk5keqYnH3TVrCxGRzm',
      };

      // Mock conversion rates (in a real app, these would come from an API)
      const mockRates = {
        btc: 0.000025, // 1 USD = 0.000025 BTC
        eth: 0.00042,  // 1 USD = 0.00042 ETH
        usdt: 1,       // 1 USD = 1 USDT
        usdc: 1,       // 1 USD = 1 USDC
        xrp: 1.5,      // 1 USD = 1.5 XRP
      };

      setPaymentAddress(mockAddresses[crypto.id]);
      setPaymentAmount((amount * mockRates[crypto.id]).toFixed(8));
      
    } catch (err) {
      console.error('Error generating crypto payment:', err);
      setError(err.message || 'Failed to generate crypto payment');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would call an API to verify the payment
      // For demo purposes, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      // Simulate successful payment
      router.push('/checkout/success?payment_method=crypto');
      
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError(err.message || 'Failed to verify payment');
      setLoading(false);
    }
  };

  if (selectedCrypto) {
    return (
      <div className={styles.cryptoCheckout}>
        <h3>Pay with {selectedCrypto.name}</h3>
        
        <div className={styles.paymentDetails}>
          <div className={styles.qrCodeContainer}>
            {/* In a real implementation, this would be a QR code for the payment address */}
            <div className={styles.mockQrCode}>
              <img 
                src="/images/crypto/qr-placeholder.png" 
                alt={`QR Code for ${selectedCrypto.name} payment`}
                className={styles.qrCode}
              />
            </div>
          </div>
          
          <div className={styles.paymentInstructions}>
            <p>Please send exactly <strong>{paymentAmount} {selectedCrypto.id.toUpperCase()}</strong> to the following address:</p>
            
            <div className={styles.addressContainer}>
              <code className={styles.address}>{paymentAddress}</code>
              <button 
                className={styles.copyButton}
                onClick={() => {
                  navigator.clipboard.writeText(paymentAddress);
                  alert('Address copied to clipboard!');
                }}
              >
                Copy
              </button>
            </div>
            
            <p className={styles.warning}>
              Important: Send only {selectedCrypto.id.toUpperCase()} to this address. Sending any other cryptocurrency may result in permanent loss.
            </p>
            
            <div className={styles.verifyContainer}>
              <button 
                className={styles.verifyButton}
                onClick={handleVerifyPayment}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'I\'ve Sent the Payment'}
              </button>
              
              <button 
                className={styles.backButton}
                onClick={() => setSelectedCrypto(null)}
                disabled={loading}
              >
                Back to Options
              </button>
            </div>
          </div>
        </div>
        
        {error && <div className={styles.error}>{error}</div>}
      </div>
    );
  }

  if (showCryptoOptions) {
    return (
      <div className={styles.cryptoOptions}>
        <h3>Select a Cryptocurrency</h3>
        
        <div className={styles.cryptoList}>
          {cryptoOptions.map(crypto => (
            <button
              key={crypto.id}
              className={styles.cryptoOption}
              onClick={() => handleSelectCrypto(crypto)}
              disabled={loading}
            >
              <img src={crypto.icon} alt={crypto.name} className={styles.cryptoIcon} />
              <span>{crypto.name}</span>
            </button>
          ))}
        </div>
        
        <button 
          className={styles.backButton}
          onClick={() => setShowCryptoOptions(false)}
          disabled={loading}
        >
          Back
        </button>
        
        {loading && <div className={styles.loading}>Loading payment options...</div>}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    );
  }

  return (
    <div className={styles.cryptoCheckoutButton}>
      <button
        onClick={handleShowCryptoOptions}
        disabled={loading}
        className={styles.button}
      >
        Pay with Cryptocurrency
      </button>
    </div>
  );
}
