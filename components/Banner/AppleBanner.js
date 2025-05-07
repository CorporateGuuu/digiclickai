import React from 'react';
import Link from 'next/link';
import styles from './Banner.module.css';

const AppleBanner = () => {
  return (
    <div className={styles.announceBlockHeader}>
      <Link href="/gapp">
        <p>
          Introducing the <b>Genuine Apple Parts Program!</b>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M0.449174 3.69726C0.449174 3.69726 3.47542 6.689 4.26836 7.48195C4.89946 8.11304 5.62842 8.02396 6.8674 6.78498C7.80526 5.84713 8.06121 4.90237 7.45458 4.29574C6.61019 3.45135 3.63539 0.511676 3.63539 0.511676C3.63539 0.511676 7.23878 -1.20596 10.0975 1.65279C12.6382 4.19348 11.6778 7.1871 11.6188 7.24607C11.5598 7.30567 29.2399 24.8672 29.2399 24.8672C29.2399 24.8672 31.0849 26.884 29.026 28.9429C27.1521 30.8168 25.0299 29.0766 25.0299 29.0766L7.40941 11.4555C7.40941 11.4555 4.28593 12.5502 1.74336 10.007C-1.17122 7.09301 0.449174 3.69726 0.449174 3.69726ZM25.7946 25.7461C26.3554 25.1852 27.272 25.1909 27.8397 25.7592C28.4074 26.327 28.4137 27.2435 27.8529 27.8043C27.292 28.3652 26.3755 28.3589 25.8078 27.7912C25.2394 27.2234 25.2338 26.3069 25.7946 25.7461Z" fill="#808388" />
          </svg> Official Apple parts now available through Midas Technical Solutions.
        </p>
        <span>
          Learn More
          <svg width="31" height="24" viewBox="0 0 31 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26.0066 13.1902L0.0316438 13.0766L0.0380606 11.027L25.7581 11.1392L15.6114 1.78218L16.999 0.275386L30.0342 12.2969L17.189 23.9708L15.811 22.4554L26.0066 13.1902Z" fill="white" />
          </svg>
        </span>
      </Link>
    </div>
  );
};

export default AppleBanner;
