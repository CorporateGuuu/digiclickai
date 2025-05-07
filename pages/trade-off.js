import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import styles from '../styles/TradeOff.module.css';

export default function TradeOffPage() {
  const [activeTab, setActiveTab] = useState('iphone');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <Layout>
      <Head>
        <title>Trade-Off Program | MDTS - Midas Technical Solutions</title>
        <meta name="description" content="Get the best prices for your broken screen trade-offs at MDTS. We offer competitive prices for iPhone, Samsung, and iPad screens." />
      </Head>

      <main className="main-content">
        <div className="container">
          <div className={styles.tradeOffHeader}>
            <h1>Trade-Off</h1>
            <p className={styles.tradeOffSubtitle}>
              The Best Prices For Your Broken<br />Screen Trade-Off
            </p>
            <div className={styles.decorativeLine}>
              <img src="/images/trade-off/decorative-line.png" alt="Decorative Line" />
            </div>
          </div>

          <div className={styles.tradeOffTabs}>
            <div className={styles.tabsHeader}>
              <h2>TRADE OFF PRICING</h2>
              <div className={styles.tabButtons}>
                <button
                  id="iphone"
                  className={`${styles.tabButton} ${activeTab === 'iphone' ? styles.active : ''}`}
                  onClick={() => handleTabChange('iphone')}
                >
                  iPHONE
                </button>
                <button
                  id="samsung"
                  className={`${styles.tabButton} ${activeTab === 'samsung' ? styles.active : ''}`}
                  onClick={() => handleTabChange('samsung')}
                >
                  SAMSUNG
                </button>
                <button
                  id="ipad"
                  className={`${styles.tabButton} ${activeTab === 'ipad' ? styles.active : ''}`}
                  onClick={() => handleTabChange('ipad')}
                >
                  iPADS
                </button>
              </div>
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'iphone' && (
                <div className={styles.priceTable}>
                  <h3>IPHONE TRADE-OFF PRICES</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>DEVICE MODEL</th>
                        <th>A/B OEM</th>
                        <th>MINOR DEFECT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>iPhone 13 Pro Max</td>
                        <td>$90</td>
                        <td>$110</td>
                      </tr>
                      <tr>
                        <td>iPhone 13 Pro</td>
                        <td>$90</td>
                        <td>$110</td>
                      </tr>
                      <tr>
                        <td>iPhone 13</td>
                        <td>$90</td>
                        <td>$110</td>
                      </tr>
                      <tr>
                        <td>iPhone 13 Mini</td>
                        <td>$90</td>
                        <td>$110</td>
                      </tr>
                      <tr>
                        <td>iPhone 12 Pro Max</td>
                        <td>$70</td>
                        <td>$90</td>
                      </tr>
                      <tr>
                        <td>iPhone 12 / 12 Pro</td>
                        <td>$70</td>
                        <td>$90</td>
                      </tr>
                      <tr>
                        <td>iPhone 12 Mini</td>
                        <td>$70</td>
                        <td>$90</td>
                      </tr>
                      <tr>
                        <td>iPhone 11 Pro Max</td>
                        <td>$60</td>
                        <td>$80</td>
                      </tr>
                      <tr>
                        <td>iPhone 11 Pro</td>
                        <td>$35</td>
                        <td>$60</td>
                      </tr>
                      <tr>
                        <td>iPhone 11</td>
                        <td>$30</td>
                        <td>$40</td>
                      </tr>
                      <tr>
                        <td>iPhone XS Max</td>
                        <td>$45</td>
                        <td>$70</td>
                      </tr>
                      <tr>
                        <td>iPhone XS</td>
                        <td>$30</td>
                        <td>$40</td>
                      </tr>
                      <tr>
                        <td>iPhone XR</td>
                        <td>$30</td>
                        <td>$40</td>
                      </tr>
                      <tr>
                        <td>iPhone X</td>
                        <td>$30</td>
                        <td>$40</td>
                      </tr>
                      <tr>
                        <td>iPhone 8 Plus</td>
                        <td>$20</td>
                        <td>$25</td>
                      </tr>
                      <tr>
                        <td>iPhone 8</td>
                        <td>$20</td>
                        <td>$25</td>
                      </tr>
                      <tr>
                        <td>iPhone 7 Plus</td>
                        <td>$20</td>
                        <td>$25</td>
                      </tr>
                      <tr>
                        <td>iPhone 7</td>
                        <td>$15</td>
                        <td>$20</td>
                      </tr>
                      <tr>
                        <td>iPhone 6S Plus</td>
                        <td>$20</td>
                        <td>-</td>
                      </tr>
                      <tr>
                        <td>iPhone 6S</td>
                        <td>$15</td>
                        <td>-</td>
                      </tr>
                      <tr>
                        <td>iPhone 6 Plus</td>
                        <td>$15</td>
                        <td>-</td>
                      </tr>
                      <tr>
                        <td>iPhone 6</td>
                        <td>$15</td>
                        <td>-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'samsung' && (
                <div className={styles.priceTable}>
                  <h3>SAMSUNG TRADE-OFF PRICES</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>DEVICE MODEL</th>
                        <th>A/B OEM</th>
                        <th>MINOR DEFECT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Galaxy S22 Ultra</td>
                        <td>$120</td>
                        <td>$160</td>
                      </tr>
                      <tr>
                        <td>Galaxy S22 Plus</td>
                        <td>$100</td>
                        <td>$140</td>
                      </tr>
                      <tr>
                        <td>Galaxy S22</td>
                        <td>$100</td>
                        <td>$140</td>
                      </tr>
                      <tr>
                        <td>Galaxy S21 Ultra</td>
                        <td>$140</td>
                        <td>$180</td>
                      </tr>
                      <tr>
                        <td>Galaxy S21 Plus</td>
                        <td>$100</td>
                        <td>$120</td>
                      </tr>
                      <tr>
                        <td>Galaxy S21</td>
                        <td>$100</td>
                        <td>$120</td>
                      </tr>
                      <tr>
                        <td>Galaxy S21 FE</td>
                        <td>$80</td>
                        <td>$90</td>
                      </tr>
                      <tr>
                        <td>Galaxy S20 Ultra</td>
                        <td>$90</td>
                        <td>$140</td>
                      </tr>
                      <tr>
                        <td>Galaxy S20 Plus</td>
                        <td>$90</td>
                        <td>$140</td>
                      </tr>
                      <tr>
                        <td>Galaxy S20</td>
                        <td>$90</td>
                        <td>$140</td>
                      </tr>
                      <tr>
                        <td>Galaxy S20 FE</td>
                        <td>$50</td>
                        <td>$70</td>
                      </tr>
                      <tr>
                        <td>Galaxy S10 Plus</td>
                        <td>$90</td>
                        <td>$140</td>
                      </tr>
                      <tr>
                        <td>Galaxy S10E</td>
                        <td>$60</td>
                        <td>$80</td>
                      </tr>
                      <tr>
                        <td>Galaxy S10</td>
                        <td>$80</td>
                        <td>$120</td>
                      </tr>
                      <tr>
                        <td>Galaxy S9 Plus</td>
                        <td>$55</td>
                        <td>$75</td>
                      </tr>
                      <tr>
                        <td>Galaxy S9</td>
                        <td>$50</td>
                        <td>$75</td>
                      </tr>
                      <tr>
                        <td>Galaxy S8 Plus</td>
                        <td>$55</td>
                        <td>$75</td>
                      </tr>
                      <tr>
                        <td>Galaxy S8</td>
                        <td>$45</td>
                        <td>$70</td>
                      </tr>
                      <tr>
                        <td>Galaxy Note 20 Ultra</td>
                        <td>$100</td>
                        <td>$150</td>
                      </tr>
                      <tr>
                        <td>Galaxy Note 20</td>
                        <td>$80</td>
                        <td>$120</td>
                      </tr>
                      <tr>
                        <td>Galaxy Note 10 Plus</td>
                        <td>$90</td>
                        <td>$140</td>
                      </tr>
                      <tr>
                        <td>Galaxy Note 10</td>
                        <td>$90</td>
                        <td>$130</td>
                      </tr>
                      <tr>
                        <td>Galaxy Note 9</td>
                        <td>$70</td>
                        <td>$110</td>
                      </tr>
                      <tr>
                        <td>Galaxy Note 8</td>
                        <td>$60</td>
                        <td>$90</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'ipad' && (
                <div className={styles.priceTable}>
                  <h3>iPADS TRADE-OFF PRICES</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>DEVICE MODEL</th>
                        <th>A/B OEM</th>
                        <th>MINOR DEFECT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>iPad Pro 12.9 (5th Gen) (2021)</td>
                        <td>$230</td>
                        <td>$260</td>
                      </tr>
                      <tr>
                        <td>iPad Pro 12.9 (4th & 3rd Gen) 2020/2018</td>
                        <td>$90</td>
                        <td>$110</td>
                      </tr>
                      <tr>
                        <td>iPad Pro 12.9 (2nd Gen) (2017)</td>
                        <td>$200</td>
                        <td>$250</td>
                      </tr>
                      <tr>
                        <td>iPad Pro 12.9 (1st Gen) (2016)</td>
                        <td>$100</td>
                        <td>$140</td>
                      </tr>
                      <tr>
                        <td>iPad Pro 11 (3rd Gen) (2021)</td>
                        <td>$120</td>
                        <td>$140</td>
                      </tr>
                      <tr>
                        <td>iPad Pro 11 (2nd & 1st Gen) (2020/2018)</td>
                        <td>$90</td>
                        <td>$110</td>
                      </tr>
                      <tr>
                        <td>iPad Pro 10.5</td>
                        <td>$100</td>
                        <td>$120</td>
                      </tr>
                      <tr>
                        <td>iPad Pro 9.7</td>
                        <td>$60</td>
                        <td>$75</td>
                      </tr>
                      <tr>
                        <td>iPad Mini 6</td>
                        <td>$200</td>
                        <td>$240</td>
                      </tr>
                      <tr>
                        <td>iPad Mini 5</td>
                        <td>$50</td>
                        <td>$70</td>
                      </tr>
                      <tr>
                        <td>iPad Mini 4</td>
                        <td>$50</td>
                        <td>$70</td>
                      </tr>
                      <tr>
                        <td>iPad Air 5</td>
                        <td>$100</td>
                        <td>$120</td>
                      </tr>
                      <tr>
                        <td>iPad Air 4</td>
                        <td>$80</td>
                        <td>$100</td>
                      </tr>
                      <tr>
                        <td>iPad Air 3</td>
                        <td>$95</td>
                        <td>$110</td>
                      </tr>
                      <tr>
                        <td>iPad Air 2</td>
                        <td>$60</td>
                        <td>$75</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div id="how-it-works" className={styles.tradeOffInfo}>
            <h2>How Our Trade-Off Program Works</h2>
            <div className={styles.infoSteps}>
              <div className={styles.infoStep}>
                <div className={styles.stepIcon}>
                  <img src="/images/trade-off/step-1.svg" alt="Step 1" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                </div>
                <h3>Send Us Your Broken Screens</h3>
                <p>Ship your broken screens to our facility using your preferred carrier.</p>
              </div>

              <div className={styles.infoStep}>
                <div className={styles.stepIcon}>
                  <img src="/images/trade-off/step-2.svg" alt="Step 2" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                </div>
                <h3>We Evaluate Your Screens</h3>
                <p>Our technicians will assess the condition of your screens and grade them accordingly.</p>
              </div>

              <div className={styles.infoStep}>
                <div className={styles.stepIcon}>
                  <img src="/images/trade-off/step-3.svg" alt="Step 3" onError={(e) => e.target.src = '/images/placeholder.svg'} />
                </div>
                <h3>Get Paid or Store Credit</h3>
                <p>Receive payment via your preferred method or get store credit with bonus value.</p>
              </div>
            </div>
          </div>

          <div id="faq" className={styles.tradeOffFAQ}>
            <h2>Frequently Asked Questions</h2>

            <div className={styles.faqItem}>
              <h3>What does A/B OEM mean?</h3>
              <p>A/B OEM refers to Original Equipment Manufacturer screens that have minor cosmetic issues but are still functional. These screens may have slight scratches or minor blemishes that don't affect functionality.</p>
            </div>

            <div className={styles.faqItem}>
              <h3>What qualifies as a Minor Defect?</h3>
              <p>Minor defects include screens with small areas of discoloration, minor touch sensitivity issues in certain areas, or small non-functioning areas. The screen should still be largely functional despite these issues.</p>
            </div>

            <div className={styles.faqItem}>
              <h3>How do I package my screens for shipping?</h3>
              <p>Wrap each screen individually in bubble wrap or foam, then place in a sturdy box with additional padding. Make sure screens don't move around inside the package to prevent further damage during transit.</p>
            </div>

            <div className={styles.faqItem}>
              <h3>How long does the evaluation process take?</h3>
              <p>Once we receive your screens, the evaluation process typically takes 1-2 business days. Payment is processed within 24 hours after evaluation is complete.</p>
            </div>
          </div>

          <div className={styles.tradeOffCTA}>
            <h2>Ready to Trade-Off Your Broken Screens?</h2>
            <p>Contact our team today to get started with the trade-off process.</p>
            <div className={styles.ctaButtons}>
              <a href="tel:+12403510511" className={styles.primaryButton}>
                Call Us: (240) 351-0511
              </a>
              <a href="mailto:support@mdtstech.store" className={styles.secondaryButton}>
                Email Us
              </a>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
