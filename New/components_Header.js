import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Header.module.css';

function Header() {
  return (
    <header>
      <div className={styles.topBanner}>
        <p>Introducing the LCD Buyback Program – Sell your old LCDs today! <Link href="/lcd-buyback">Learn More</Link></p>
      </div>
      <div className={styles.mainHeader}>
        <Link href="/">
          <img src="/logo.png" alt="Logo" className={styles.logo} />
        </Link>
        <nav className={styles.nav}>
          <input type="text" placeholder="What you lookin'?" className={styles.search} />
          <ul>
            <li><Link href="/lcd-buyback">LCD Buyback</Link></li>
            <li><Link href="/services">MS Services</Link></li>
            <li><Link href="/account">My Account</Link></li>
            <li><Link href="/cart">Cart</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
export default React.memo(Header);
