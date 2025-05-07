import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from '../styles/LcdBuyback.module.css';

function LcdBuyback() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.hero}>
          <h1>LCD Buyback Program</h1>
          <p>Sell your old LCDs and get cash back! Start now.</p>
        </section>
        <section className={styles.formSection}>
          <h2>Submit Your Device Details</h2>
          <form>
            <div className={styles.formGroup}>
              <label htmlFor="deviceModel">Device Model</label>
              <input type="text" id="deviceModel" placeholder="e.g., iPhone 11" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="condition">Condition</label>
              <select id="condition">
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="quantity">Quantity</label>
              <input type="number" id="quantity" defaultValue="1" min="1" />
            </div>
            <button type="submit" className={styles.submitButton}>Get Quote</button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
export default React.memo(LcdBuyback);
