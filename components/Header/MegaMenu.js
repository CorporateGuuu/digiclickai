import React from 'react';
import Link from 'next/link';
import styles from './MegaMenu.module.css';

const MegaMenu = () => {
  return (
    <div className={styles.megaMenuContainer}>
      <div className={styles.megaMenu}>
        <ul className={styles.menuList}>
          <li className={styles.menuItem}>
            <Link href="/categories/iphone-parts" className={styles.menuLink}>
              iPhone Parts
            </Link>
            <ul className={styles.submenu}>
              <li><Link href="/categories/iphone-parts?model=iphone-15">iPhone 15 Parts</Link></li>
              <li><Link href="/categories/iphone-parts?model=iphone-14">iPhone 14 Parts</Link></li>
              <li><Link href="/categories/iphone-parts?model=iphone-13">iPhone 13 Parts</Link></li>
              <li><Link href="/categories/iphone-parts?model=iphone-12">iPhone 12 Parts</Link></li>
              <li><Link href="/categories/iphone-parts?model=iphone-11">iPhone 11 Parts</Link></li>
              <li><Link href="/categories/iphone-parts?model=iphone-x">iPhone X Parts</Link></li>
              <li><Link href="/categories/iphone-parts?model=iphone-8">iPhone 8 Parts</Link></li>
              <li><Link href="/categories/iphone-parts?model=iphone-7">iPhone 7 Parts</Link></li>
              <li><Link href="/categories/iphone-parts?model=iphone-6">iPhone 6 Parts</Link></li>
              <li><Link href="/categories/iphone-parts?model=iphone-se">iPhone SE Parts</Link></li>
            </ul>
          </li>

          <li className={styles.menuItem}>
            <Link href="/categories/samsung-parts" className={styles.menuLink}>
              Samsung Parts
            </Link>
            <ul className={styles.submenu}>
              <li><Link href="/categories/samsung-parts?model=galaxy-s23">Galaxy S23 Parts</Link></li>
              <li><Link href="/categories/samsung-parts?model=galaxy-s22">Galaxy S22 Parts</Link></li>
              <li><Link href="/categories/samsung-parts?model=galaxy-s21">Galaxy S21 Parts</Link></li>
              <li><Link href="/categories/samsung-parts?model=galaxy-s20">Galaxy S20 Parts</Link></li>
              <li><Link href="/categories/samsung-parts?model=galaxy-note-20">Galaxy Note 20 Parts</Link></li>
              <li><Link href="/categories/samsung-parts?model=galaxy-note-10">Galaxy Note 10 Parts</Link></li>
              <li><Link href="/categories/samsung-parts?model=galaxy-a-series">Galaxy A Series Parts</Link></li>
              <li><Link href="/categories/samsung-parts?model=galaxy-z-fold">Galaxy Z Fold Parts</Link></li>
              <li><Link href="/categories/samsung-parts?model=galaxy-z-flip">Galaxy Z Flip Parts</Link></li>
            </ul>
          </li>

          <li className={styles.menuItem}>
            <Link href="/categories/ipad-parts" className={styles.menuLink}>
              iPad Parts
            </Link>
            <ul className={styles.submenu}>
              <li><Link href="/categories/ipad-parts?model=ipad-pro">iPad Pro Parts</Link></li>
              <li><Link href="/categories/ipad-parts?model=ipad-air">iPad Air Parts</Link></li>
              <li><Link href="/categories/ipad-parts?model=ipad-mini">iPad Mini Parts</Link></li>
              <li><Link href="/categories/ipad-parts?model=ipad-standard">iPad (Standard) Parts</Link></li>
            </ul>
          </li>

          <li className={styles.menuItem}>
            <Link href="/categories/macbook-parts" className={styles.menuLink}>
              MacBook Parts
            </Link>
            <ul className={styles.submenu}>
              <li><Link href="/categories/macbook-parts?model=macbook-pro">MacBook Pro Parts</Link></li>
              <li><Link href="/categories/macbook-parts?model=macbook-air">MacBook Air Parts</Link></li>
              <li><Link href="/categories/macbook-parts?model=macbook-standard">MacBook (Standard) Parts</Link></li>
            </ul>
          </li>

          <li className={styles.menuItem}>
            <Link href="/categories/repair-tools" className={styles.menuLink}>
              Repair Tools
            </Link>
            <ul className={styles.submenu}>
              <li><Link href="/categories/repair-tools?type=screwdriver-sets">Screwdriver Sets</Link></li>
              <li><Link href="/categories/repair-tools?type=opening-tools">Opening Tools</Link></li>
              <li><Link href="/categories/repair-tools?type=heat-guns">Heat Guns</Link></li>
              <li><Link href="/categories/repair-tools?type=soldering-equipment">Soldering Equipment</Link></li>
              <li><Link href="/categories/repair-tools?type=microscopes">Microscopes</Link></li>
              <li><Link href="/categories/repair-tools?type=testing-equipment">Testing Equipment</Link></li>
            </ul>
          </li>

          <li className={styles.menuItem}>
            <Link href="/lcd-buyback" className={styles.menuLink}>
              LCD Buyback
            </Link>
            <ul className={styles.submenu}>
              <li><Link href="/lcd-buyback?device=iphone">iPhone LCD Buyback</Link></li>
              <li><Link href="/lcd-buyback?device=samsung">Samsung LCD Buyback</Link></li>
              <li><Link href="/lcd-buyback?device=ipad">iPad LCD Buyback</Link></li>
              <li><Link href="/lcd-buyback?device=macbook">MacBook LCD Buyback</Link></li>
            </ul>
          </li>

          <li className={styles.menuItem}>
            <Link href="/trade-off" className={styles.menuLink}>
              Trade-Off Program
            </Link>
            <ul className={styles.submenu}>
              <li><Link href="/trade-off#iphone">iPhone Trade-Off</Link></li>
              <li><Link href="/trade-off#samsung">Samsung Trade-Off</Link></li>
              <li><Link href="/trade-off#ipad">iPad Trade-Off</Link></li>
              <li><Link href="/trade-off#how-it-works">How It Works</Link></li>
              <li><Link href="/trade-off#faq">FAQ</Link></li>
            </ul>
          </li>

          <li className={styles.menuItem}>
            <Link href="/finance" className={styles.menuLink}>
              Financing
            </Link>
            <ul className={styles.submenu}>
              <li><Link href="/finance#benefits">Financing Benefits</Link></li>
              <li><Link href="/finance#how-it-works">How It Works</Link></li>
              <li><Link href="/finance#faq">FAQ</Link></li>
              <li><Link href="https://www.creditkey.com/app/apply/mdts-tech" target="_blank">Apply Now</Link></li>
            </ul>
          </li>

          <li className={styles.menuItem}>
            <Link href="/gapp" className={styles.menuLink}>
              Apple Parts Program
            </Link>
            <ul className={styles.submenu}>
              <li><Link href="/gapp#benefits">Program Benefits</Link></li>
              <li><Link href="/gapp#eligibility">Eligibility</Link></li>
              <li><Link href="/gapp#how-it-works">How It Works</Link></li>
              <li><Link href="/gapp#apply">Apply Now</Link></li>
            </ul>
          </li>

          <li className={styles.menuItem}>
            <Link href="/wholesale" className={styles.menuLink}>
              Wholesale
            </Link>
            <ul className={styles.submenu}>
              <li><Link href="/wholesale#benefits">Wholesale Benefits</Link></li>
              <li><Link href="/wholesale#pricing">Pricing</Link></li>
              <li><Link href="/wholesale#apply">Apply for Wholesale</Link></li>
              <li><Link href="/wholesale#contact">Contact Wholesale Team</Link></li>
            </ul>
          </li>

          <li className={styles.menuItem}>
            <Link href="/about" className={styles.menuLink}>
              About Us
            </Link>
            <ul className={styles.submenu}>
              <li><Link href="/about#our-story">Our Story</Link></li>
              <li><Link href="/about#mission">Our Mission</Link></li>
              <li><Link href="/about#team">Our Team</Link></li>
              <li><Link href="/about#careers">Careers</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </li>


        </ul>
      </div>
    </div>
  );
};

export default MegaMenu;
