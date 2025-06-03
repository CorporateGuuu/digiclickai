import React, { useState } from 'react';
import styles from './PricingPage.module.css';

const pricingPlans = [
  {
    id: 1,
    title: 'Basic Plan',
    priceMonthly: '$29',
    priceYearly: '$290',
    features: [
      'Feature A',
      'Feature B',
      'Feature C'
    ],
    popular: false
  },
  {
    id: 2,
    title: 'Pro Plan',
    priceMonthly: '$59',
    priceYearly: '$590',
    features: [
      'Feature A',
      'Feature B',
      'Feature C',
      'Feature D'
    ],
    popular: true
  },
  {
    id: 3,
    title: 'Enterprise Plan',
    priceMonthly: 'Contact Us',
    priceYearly: 'Contact Us',
    features: [
      'All Pro features',
      'Custom Solutions',
      'Dedicated Support'
    ],
    popular: false
  }
];

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly');
  };

  return (
    <section className={styles.pricing}>
      <h1 className={styles.title}>Pricing</h1>
      <div className={styles.billingToggle}>
        <button
          className={billingCycle === 'monthly' ? styles.active : ''}
          onClick={() => setBillingCycle('monthly')}
        >
          Monthly
        </button>
        <button
          className={billingCycle === 'yearly' ? styles.active : ''}
          onClick={() => setBillingCycle('yearly')}
        >
          Yearly
        </button>
      </div>
      <div className={styles.plansGrid}>
        {pricingPlans.map(plan => (
          <div
            key={plan.id}
            className={`${styles.planCard} ${plan.popular ? styles.popular : ''}`}
          >
            {plan.popular && <div className={styles.popularBadge}>Most Popular</div>}
            <h2 className={styles.planTitle}>{plan.title}</h2>
            <p className={styles.planPrice}>
              {billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly}
            </p>
            <ul className={styles.planFeatures}>
              {plan.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
            <button className={styles.ctaButton}>Select Plan</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingPage;
