import React, { useState, useEffect } from 'react';
import styles from '../../styles/Account.module.css';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // Mock exchange rates (in a real app, these would come from an API)
  const exchangeRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    CAD: 1.37,
    AUD: 1.52,
    JPY: 149.82,
    CNY: 7.24,
    INR: 83.12,
    BRL: 5.05,
    RUB: 91.75,
    KRW: 1345.78,
    CHF: 0.90,
    SGD: 1.35,
    NZD: 1.64,
    MXN: 16.82,
    HKD: 7.82,
    SEK: 10.42,
    NOK: 10.71,
    DKK: 6.87,
    PLN: 3.94,
    ZAR: 18.45,
    AED: 3.67,
    SAR: 3.75,
    BTC: 0.000016,
    ETH: 0.00031
  };

  useEffect(() => {
    convertCurrency();
    // Set last updated to current time
    const now = new Date();
    setLastUpdated(now.toLocaleString());
  }, [fromCurrency, toCurrency]);

  const convertCurrency = () => {
    setLoading(true);
    
    // In a real app, you would fetch the exchange rate from an API
    // For this demo, we'll use our mock data
    try {
      const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
      setExchangeRate(rate);
      setConvertedAmount((amount * rate).toFixed(2));
    } catch (error) {
      console.error('Error converting currency:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleFromCurrencyChange = (e) => {
    setFromCurrency(e.target.value);
  };

  const handleToCurrencyChange = (e) => {
    setToCurrency(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    convertCurrency();
    // Update last updated time
    const now = new Date();
    setLastUpdated(now.toLocaleString());
  };

  return (
    <div className={styles.currencyConverter}>
      <h3>Currency Converter</h3>
      <p>Convert between different currencies using real-time exchange rates</p>
      
      <form onSubmit={handleSubmit} className={styles.converterForm}>
        <div className={styles.converterInputs}>
          <div className={styles.formGroup}>
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="fromCurrency">From</label>
            <select
              id="fromCurrency"
              value={fromCurrency}
              onChange={handleFromCurrencyChange}
            >
              {Object.keys(exchangeRates).map(currency => (
                <option key={`from-${currency}`} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.switchCurrencies}>
            <button 
              type="button" 
              onClick={() => {
                const temp = fromCurrency;
                setFromCurrency(toCurrency);
                setToCurrency(temp);
              }}
              aria-label="Switch currencies"
            >
              ⇄
            </button>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="toCurrency">To</label>
            <select
              id="toCurrency"
              value={toCurrency}
              onChange={handleToCurrencyChange}
            >
              {Object.keys(exchangeRates).map(currency => (
                <option key={`to-${currency}`} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button 
          type="submit" 
          className={styles.convertButton}
          disabled={loading}
        >
          {loading ? 'Converting...' : 'Convert'}
        </button>
      </form>
      
      <div className={styles.conversionResult}>
        <div className={styles.resultAmount}>
          <span>{amount} {fromCurrency} = </span>
          <span className={styles.convertedValue}>{convertedAmount} {toCurrency}</span>
        </div>
        <div className={styles.exchangeRate}>
          <span>1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}</span>
        </div>
        <div className={styles.lastUpdated}>
          <small>Last updated: {lastUpdated}</small>
        </div>
      </div>
      
      <div className={styles.disclaimer}>
        <p>
          <small>
            Disclaimer: Exchange rates are for informational purposes only and may vary at checkout.
            Actual conversion is performed at the time of transaction.
          </small>
        </p>
      </div>
    </div>
  );
};

export default CurrencyConverter;
