import React from 'react';
import Layout from '../components/Layout/Layout';
import styles from '../styles/ReturnPolicy.module.css';

const ReturnPolicy = () => {
  return (
    <Layout title="Return Policy" description="MDTS Return Policy - Learn about our return and refund policies">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Return Policy</h1>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Our Return Policy</h2>
            <p>
              At MDTS, we want you to be completely satisfied with your purchase. We understand that sometimes a product may not meet your expectations or may arrive damaged. Our return policy is designed to make the return process as simple and fair as possible.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Return Eligibility</h2>
            <p>
              You may return most new, unopened items within 30 days of delivery for a full refund. We'll also pay the return shipping costs if the return is a result of our error (you received an incorrect or defective item, etc.).
            </p>
            <p>
              You should expect to receive your refund within four weeks of giving your package to the return shipper, however, in many cases you will receive a refund more quickly. This time period includes the transit time for us to receive your return from the shipper (5 to 10 business days), the time it takes us to process your return once we receive it (3 to 5 business days), and the time it takes your bank to process our refund request (5 to 10 business days).
            </p>
          </section>

          <section className={styles.section}>
            <h2>Return Process</h2>
            <ol className={styles.processList}>
              <li>
                <h3>Contact Customer Service</h3>
                <p>
                  Before returning any item, please contact our customer service team at <a href="mailto:support@mdtstech.store">support@mdtstech.store</a> or call us at +1 (240) 351-0511 to obtain a Return Merchandise Authorization (RMA) number.
                </p>
              </li>
              <li>
                <h3>Package Your Return</h3>
                <p>
                  Pack the item securely in its original packaging if possible. Include the RMA number on the outside of the package and on any documentation inside the package.
                </p>
              </li>
              <li>
                <h3>Ship Your Return</h3>
                <p>
                  Ship the package to the address provided by our customer service team. We recommend using a shipping method that provides tracking information.
                </p>
              </li>
              <li>
                <h3>Refund Processing</h3>
                <p>
                  Once we receive and inspect your return, we'll process your refund. The refund will be issued to the original payment method used for the purchase.
                </p>
              </li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2>Non-Returnable Items</h2>
            <p>
              The following items cannot be returned:
            </p>
            <ul className={styles.nonReturnableList}>
              <li>Items that have been opened or used, unless defective</li>
              <li>Custom or personalized orders</li>
              <li>Downloadable software products</li>
              <li>Items marked as "Final Sale" or "Non-Returnable"</li>
              <li>Gift cards</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Damaged or Defective Items</h2>
            <p>
              If you receive a damaged or defective item, please contact our customer service team immediately. We'll work with you to resolve the issue by either replacing the item or providing a refund.
            </p>
            <p>
              For damaged items, please take photos of the damage and the packaging, as these may be required for processing your claim.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Exchanges</h2>
            <p>
              We do not process direct exchanges. If you need a different item, please return the original purchase for a refund and place a new order for the desired item.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Restocking Fees</h2>
            <p>
              A 15% restocking fee may apply to returns of specialized equipment or bulk orders. This will be communicated to you when you request your RMA.
            </p>
          </section>

          <section className={styles.section}>
            <h2>International Returns</h2>
            <p>
              For international orders, the customer is responsible for return shipping costs and any applicable customs fees or taxes. Please contact our customer service team for specific instructions regarding international returns.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Questions?</h2>
            <p>
              If you have any questions about our return policy, please contact our customer service team:
            </p>
            <div className={styles.contactInfo}>
              <p>Email: <a href="mailto:support@mdtstech.store">support@mdtstech.store</a></p>
              <p>Phone: +1 (240) 351-0511</p>
              <p>Hours: Monday-Friday, 9AM-10PM EST</p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default ReturnPolicy;
