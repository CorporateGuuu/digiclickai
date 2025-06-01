import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './UnifiedFooter.module.css';
import ContactForm from '../ContactForm/ContactForm';
import { useMediaQuery } from '../../utils/useMediaQuery';

const UnifiedFooter = () => {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [expandedSections, setExpandedSections] = useState({});
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Toggle section expansion
  const toggleSection = (section) => {
    if (isMobile) {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    }
  };

  // Available languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ar', name: 'العربية' },
  ];

  // Available currencies
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  ];

  const openContactForm = () => {
    setIsContactFormOpen(true);
  };

  const closeContactForm = () => {
    setIsContactFormOpen(false);
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);
  };

  // Handle currency change
  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  // Load saved preferences on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const savedCurrency = localStorage.getItem('preferredCurrency');

    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  return (
    <footer className={styles.footerContainer} id="footer-top">
      <div aria-label="footer-main" className={styles.footer}>
        <div className={styles.fShippingMethodSection}>
          <div className={styles.countryTypeSection}>
            <div className={styles.flagBox}>
              <img src="/images/flags/us-flag.svg" alt="US Flag" width="24" height="16" />
            </div>
            <div className={styles.selectLangBox} aria-label="Select-language-block">
              <select
                name="language"
                className={styles.selLang}
                value={language}
                onChange={handleLanguageChange}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.selectCurrencyBox} aria-label="Select-Currency-block">
              <select
                name="currency"
                className={styles.selCurr}
                id="selected_currency"
                value={currency}
                onChange={handleCurrencyChange}
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.shippingMethodsType}>
            <p aria-label="Shipping-methods">Shipping Methods:</p>
            <ul>
              <li className={styles.fedex}>
                <img src="/images/shipping/fedex.svg" alt="FedEx" width="40" height="24" />
              </li>
              <li className={styles.ups}>
                <img src="/images/shipping/ups.svg" alt="UPS" width="40" height="24" />
              </li>
              <li className={styles.frame}>
                <img src="/images/shipping/usps.svg" alt="USPS" width="40" height="24" />
              </li>
            </ul>
          </div>
          <div className={styles.ftCerificateSection}>
            <h5>Certifications</h5>
            <ul>
              <li>
                <img width="36" height="45" src="/images/certificates/r2-v3.svg" alt="R2 Certificate" />
              </li>
              <li>
                <img width="34" height="48" src="/images/certificates/certificate-001.svg" alt="NSAI - Health & Safety" />
              </li>
              <li>
                <img width="33" height="48" src="/images/certificates/certificate-002.svg" alt="NSAI - Quality" />
              </li>
              <li>
                <img width="34" height="48" src="/images/certificates/certificate-003.svg" alt="NSAI - Environment" />
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.newFooterMain}>
          <div className={`${styles.footerBoxes2} ${styles.firstCol}`}>
            <h4
              className={`${styles.showNav} ${expandedSections.shop ? styles.expanded : ''}`}
              onClick={() => toggleSection('shop')}
            >
              Shop
            </h4>
            <ul className={`${styles.accordion} ${styles.footerLinks2} ${expandedSections.shop ? styles.expanded : ''}`}>
              <li>
                <Link href="/categories/iphone-parts">iPhone Parts</Link>
              </li>
              <li>
                <Link href="/categories/samsung-parts">Samsung Parts</Link>
              </li>
              <li>
                <Link href="/categories/ipad-parts">iPad Parts</Link>
              </li>
              <li>
                <Link href="/categories/macbook-parts">MacBook Parts</Link>
              </li>
              <li>
                <Link href="/categories/repair-tools">Repair Tools</Link>
              </li>
              <li>
                <Link href="/categories/other-devices">Other Devices</Link>
              </li>
            </ul>
          </div>
          <div className={`${styles.footerBoxes2} ${styles.secondCol}`}>
            <h4
              className={`${styles.showNav} ${expandedSections.info ? styles.expanded : ''}`}
              onClick={() => toggleSection('info')}
            >
              Information
            </h4>
            <ul className={`${styles.accordion} ${styles.footerLinks2} ${expandedSections.info ? styles.expanded : ''}`}>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/quality-standards">Quality Standards</Link>
              </li>
              <li>
                <Link href="/return-policy">Return Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms and Conditions</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/trademark-disclaimer">Trademark Disclaimer</Link>
              </li>
            </ul>
          </div>
          <div className={`${styles.footerBoxes2} ${styles.secondCol}`}>
            <h4
              className={`${styles.showNav} ${expandedSections.services ? styles.expanded : ''}`}
              onClick={() => toggleSection('services')}
            >
              Services
            </h4>
            <ul className={`${styles.accordion} ${styles.footerLinks2} ${expandedSections.services ? styles.expanded : ''}`}>
              <li>
                <Link href="/lcd-buyback">LCD Buyback</Link>
              </li>
              <li>
                <Link href="/account">My Account</Link>
              </li>
              <li>
                <Link href="/device-grading">Device Grading</Link>
              </li>
              <li>
                <Link href="/shipping">Shipping</Link>
              </li>
              <li>
                <Link href="/trade-off">Trade-Off</Link>
              </li>
              <li>
                <Link href="/gapp">Apple Parts Program</Link>
              </li>
            </ul>
          </div>
          <div className={`${styles.footerBoxes2} ${styles.fourthCol}`}>
            <h4
              className={`${styles.showNav} ${expandedSections.help ? styles.expanded : ''}`}
              onClick={() => toggleSection('help')}
            >
              Need Help?
            </h4>
            <ul className={`${styles.accordion} ${styles.footerLinks2} ${expandedSections.help ? styles.expanded : ''}`}>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
              <li>
                <Link href="/help-center">Help Center</Link>
              </li>
              <li>
                <Link href="/payment-methods">Payment Methods</Link>
              </li>
              <li className={styles.contactUsMain}>
                <button onClick={openContactForm} className={styles.contactUsBtn}>
                  Contact us!
                </button>
              </li>
            </ul>
          </div>
          <div className={`${styles.footerBoxes2} ${styles.fifthColumn} ${styles.shippingMethodsMobile}`}>
            <h4 className={styles.showNav}>Shipping Methods:</h4>
            <ul className={styles.accordion}>
              <li className={styles.fedex}>
                <img src="/images/shipping/fedex.svg" alt="FedEx" width="40" height="24" />
              </li>
              <li className={styles.ups}>
                <img src="/images/shipping/ups.svg" alt="UPS" width="40" height="24" />
              </li>
              <li className={styles.frame}>
                <img src="/images/shipping/usps.svg" alt="USPS" width="40" height="24" />
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBoxes2Mobile}>
          <div className={styles.fResponsivePart}>
            <div className={styles.fLeftPart}>
              <span>Warehouse</span>
              <div className={styles.conDetailW}>
                <div className={styles.flagBox2}>
                  <img src="/images/flags/us-flag.svg" alt="US Flag" width="24" height="16" />
                </div>
                <span className={styles.usaTxt}>USA</span>
              </div>
            </div>
            <div className={styles.fRightPart}>
              <span className={styles.contactTxt}>Contact</span>
              <span className={styles.contactNubTxt}>+1 (240) 351-0511</span>
            </div>
          </div>
        </div>
      </div>
      <div aria-label="footer-main" className={`${styles.footer} ${styles.bootomFooter}`}>
        <div className={`${styles.leftCol} ${styles.withCerti}`}>
          <div className={styles.footerTrademark}>
            <div className={styles.logoTrademark}>
              <img src="/images/logo-dark.svg" alt="MDTS Tech" width="147" height="35" />
            </div>
            <span className={`${styles.follow2} ${styles.hideDeskOllow}`}>
              <b>FOLLOW</b> MDTS TECH
            </span>
            <ul className={styles.socialMediaPart}>
              <li className={styles.facebook}>
                <a
                  aria-label="facebook"
                  href="https://www.facebook.com/mdtstech"
                  title="facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  &nbsp;
                </a>
              </li>
              <li className={styles.twitter}>
                <a
                  aria-label="twitter"
                  href="https://twitter.com/mdtstech"
                  title="twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  &nbsp;
                </a>
              </li>
              <li className={styles.linkedin}>
                <a
                  aria-label="linkedin"
                  href="https://www.linkedin.com/in/fitzgerald-amaniampong-0a2962324/"
                  title="linkedin"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  &nbsp;
                </a>
              </li>
              <li className={styles.instagram}>
                <a
                  aria-label="instagram"
                  href="https://www.instagram.com/mdtstech.store/"
                  title="instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  &nbsp;
                </a>
              </li>
              <li className={styles.youtube}>
                <a
                  aria-label="youtube"
                  href="https://youtube.com/channel/mdtstech"
                  title="youtube"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  &nbsp;
                </a>
              </li>
            </ul>
          </div>
          <div className={styles.footerTrademark2}>
            <p>
              All trademarks are properties of their respective holders. MDTS Tech does not own or make claim to those trademarks used on this website in which it is not the holder.
            </p>
            <address>© {new Date().getFullYear()} MIDAS TECHNICAL SOLUTIONS</address>
          </div>
        </div>
        <div className={styles.rightCol}>
          <div className={`${styles.paymentMethodsPart} ${styles.paymentMethodsMobile}`}>
            <ul>
              <li className={styles.amex}>
                <img src="/images/payments/amex.svg" alt="American Express" width="40" height="24" />
              </li>
              <li className={styles.masterCard}>
                <img src="/images/payments/mastercard.svg" alt="Mastercard" width="40" height="24" />
              </li>
              <li className={styles.venmo}>
                <img src="/images/payments/venmo.svg" alt="Venmo" width="40" height="24" />
              </li>
              <li className={styles.paypal}>
                <img src="/images/payments/paypal.svg" alt="PayPal" width="40" height="24" />
              </li>
              <li className={styles.paypalCredit}>
                <img src="/images/payments/paypal-credit.svg" alt="PayPal Credit" width="40" height="24" />
              </li>
              <li className={styles.visa}>
                <img src="/images/payments/visa.svg" alt="Visa" width="40" height="24" />
              </li>
              <li className={styles.discover}>
                <img src="/images/payments/discover.svg" alt="Discover" width="40" height="24" />
              </li>
              <li className={styles.creditKey}>
                <img src="/images/payments/credit-key.svg" alt="Credit Key" width="40" height="24" />
              </li>
              <li className={styles.wireTransfer}>
                <img src="/images/payments/wire-transfer.svg" alt="Wire Transfer" width="40" height="24" />
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <ContactForm isOpen={isContactFormOpen} onClose={closeContactForm} />
    </footer>
  );
};

export default UnifiedFooter;
