import Image from 'next/image';
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout/Layout';
import styles from '../styles/GAPP.module.css';

function GAPPPage() {
  return (
    <Layout
      title="Genuine Apple Parts Program (GAPP) | MDTS Tech"
      description="Access genuine Apple parts for reliable repairs through our Genuine Apple Parts Program (GAPP). Choose from flexible options with or without core returns."
    >
      <div className={styles.gappContainer}>
        <div className={styles.gappHero}>
          <div className={styles.gappBanner}>
            <div className={styles.gappBannerContent}>
              <h1>Genuine Apple Parts Program (GAPP)</h1>
              <h2>Reliable Repairs with Genuine Apple Parts</h2>
              <p>
                MDTS Tech is proud to partner with Apple to bring you the Genuine Apple Parts Program (GAPP),
                designed exclusively for repair shops committed to quality and customer satisfaction.
                With GAPP, you gain access to authentic Apple components for dependable repairs that keep
                your customers coming back.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.gappOptions}>
          <h3>Find the Right Option in the Genuine Apple Parts Program</h3>
          <p>
            The Genuine Apple Parts Program (GAPP) is designed with flexibility in mind.
            Choose the option that best aligns with your repair shop's needs and goals.
          </p>

          <div className={styles.optionsGrid}>
            <div className={styles.optionCard}>
              <h4>GAPP with Core Returns</h4>
              <p>
                Save upfront by sending back the original core. Perfect for keeping costs low
                while accessing Genuine Apple Parts.
              </p>
            </div>
            <div className={styles.optionCard}>
              <h4>GAPP without Core Returns</h4>
              <p>
                Pay more upfront but keep the core. Sell it later for additional revenue potential,
                maximizing your profits.
              </p>
            </div>
          </div>

          <p className={styles.contactInfo}>
            You can adjust these settings by contacting <strong>MDTS Tech Customer Support.</strong> Our team is available
            to assist you with any changes or preferences you need, ensuring a smooth experience with your
            account settings and services.
          </p>

          <Link href="/contact" className={styles.signupButton}>
            Sign Up Now
          </Link>
        </div>

        <div className={styles.partsSection}>
          <h3>Parts You Can Trust</h3>
          <h4>Certified Quality for Reliable, Lasting Repairs</h4>
          <p>
            Look for the Genuine Apple Parts badge to ensure you're purchasing parts that meet Apple's
            rigorous quality standards—from displays to batteries—allowing you to provide repairs that
            customers can trust.
          </p>

          <div className={styles.partsBanner}>
            <img
              src="https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
              alt="Genuine Apple Parts Banner"
              className={styles.bannerImage}
            />
          </div>

          <div className={styles.partsGrid}>
            <div className={styles.partCard}>
              <div className={styles.partImageContainer}>
                <div className={styles.partLabel}>
                  <span>Genuine Apple Part</span>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1565849904461-04a58ad377e0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=736&q=80"
                  alt="Display Repair Parts"
                  className={styles.partImage}
                />
              </div>
              <div className={styles.partContent}>
                <h4>Display Repair Parts</h4>
                <p>
                  All Genuine Apple replacement display assemblies include the front camera / proximity sensors
                  and all screws. Each display is serialized to help you track your purchases and core returns
                  associated with a repair.
                </p>
              </div>
            </div>

            <div className={styles.partCard}>
              <div className={styles.partImageContainer}>
                <div className={styles.partLabel}>
                  <span>Genuine Apple Part</span>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80"
                  alt="Camera Repair Parts"
                  className={styles.partImage}
                />
              </div>
              <div className={styles.partContent}>
                <h4>Camera Repair Parts</h4>
                <p>
                  Genuine Apple back camera replacements guarantee compatibility, functionality, and performance
                  to match the photographic performance of iPhones that consumers have come to expect.
                </p>
              </div>
            </div>

            <div className={styles.partCard}>
              <div className={styles.partImageContainer}>
                <div className={styles.partLabel}>
                  <span>Genuine Apple Part</span>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1604671368394-2240d0b1bb6c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                  alt="Battery Repair Parts"
                  className={styles.partImage}
                />
              </div>
              <div className={styles.partContent}>
                <h4>Battery Repair Parts</h4>
                <p>
                  When it comes to replacing batteries, the quality of the replacement battery is of utmost importance.
                  Genuine Apple batteries ensure optimal performance, reliability, and safety as expected from iPhones.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.coreReturnsSection}>
          <div className={styles.coreReturnsContent}>
            <h3>GAPP with Core Returns</h3>
            <h4>A reliable choice and savings with core returns</h4>
            <p>
              For shops that want to reduce costs and maintain a sustainable parts process, GAPP with Core Returns
              offers a way to keep your costs lower. By returning the used Apple component (or "core") after the
              repair, you benefit from a reduced price on replacement parts.
            </p>

            <div className={styles.howItWorks}>
              <h5>How it Works:</h5>
              <p>
                By returning the original, used Apple component (the "core") after the repair, you'll receive a
                discounted price on the replacement part. If the core is not returned within the specified window,
                you will be charged the difference between the discounted price and the regular rate.
              </p>
            </div>

            <div className={styles.benefits}>
              <h5>Benefits of GAPP with Core Returns:</h5>
              <ul>
                <li>Reduced upfront price, ideal for managing immediate expenses.</li>
                <li>Simple Returns Process: Just return the used part within the allotted time frame.</li>
              </ul>
            </div>

            <Link href="/contact" className={styles.signupButton}>
              Sign Up Now
            </Link>
          </div>
          <div className={styles.coreReturnsImage}>
            <img
              src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1026&q=80"
              alt="Core Returns Process"
              className={styles.coreReturnsImg}
            />
          </div>
        </div>

        <div className={styles.withoutCoreReturnsSection}>
          <div className={styles.withoutCoreReturnsImage}>
            <img
              src="https://images.unsplash.com/photo-1581092921461-7031e8fbc6e5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
              alt="Without Core Returns Process"
              className={styles.withoutCoreReturnsImg}
            />
          </div>
          <div className={styles.withoutCoreReturnsContent}>
            <h3>GAPP without Core Returns</h3>
            <h4>Streamlined Pricing Without Returns</h4>
            <p>
              With this option, purchase parts at full price and keep the original components. Later, you can
              use our Buyback program to sell the parts and recover costs, turning them into additional profit.
            </p>
            <p className={styles.saveBuyback}>save more with <strong>Buyback</strong></p>

            <div className={styles.howItWorks}>
              <h5>How it Works:</h5>
              <p>
                Pay the total part price upfront without returning the core, with no additional return or
                processing required. Earn back more at your convenience using our Buyback Program!
              </p>
            </div>

            <div className={styles.benefits}>
              <h5>Benefits of GAPP Without Core Returns:</h5>
              <ul>
                <li>Simple Purchase Process: No returns needed, keeping inventory and repairs hassle-free.</li>
                <li>Flexible Buyback Option: Return the core at your convenience to recoup part of the cost.</li>
              </ul>
            </div>

            <Link href="/contact" className={styles.signupButton}>
              Sign Up Now
            </Link>
          </div>
        </div>

        <div className={styles.examplesSection}>
          <div className={styles.exampleCard}>
            <h4>Example 1</h4>
            <h5>With Core Return</h5>
            <p>Purchase Price: $333.52</p>
            <p>Core Fee: $45.48</p>
            <p><em>(Not charged if core is returned)</em></p>
            <p className={styles.totalCost}>Total Cost if Core is not Returned: $379</p>
          </div>

          <div className={styles.exampleCard}>
            <h4>Example 2</h4>
            <h5>Without Core Return</h5>
            <p>Purchase Price: $379</p>
            <p>Buyback Value: Sell the Core later</p>
            <p><strong>for up to $135</strong></p>
            <p className={styles.totalCost}>Final cost as low as: $244</p>
          </div>
        </div>

        <div className={styles.whyChooseSection}>
          <h3>Why Choose GAPP?</h3>
          <h4>Both GAPP options provide:</h4>
          <ul>
            <li>Authentic Apple parts for reliable, top-quality repairs.</li>
            <li>Flexible pricing models to support your business needs.</li>
            <li>Customer satisfaction, driven by the quality and integrity of genuine components.</li>
          </ul>
          <p>
            Make the right choice for your business with MDTS Tech's GAPP program, designed to meet the unique
            demands of repair professionals. Whether you prefer the savings with Core Returns or the convenience
            of no-return pricing, MDTS Tech and Apple have you covered.
          </p>
        </div>

        <div className={styles.repairGuidesSection}>
          <div className={styles.repairGuidesContent}>
            <h3>Apple Repair Guides</h3>
            <p>
              Enhance your repair expertise with official Apple repair guides, accessible on the product detail pages.
              These step-by-step instructions ensure that your repairs follow Apple's recommended practices, helping
              you maintain the highest standards in every repair job.
            </p>
          </div>
          <div className={styles.repairGuidesImage}>
            <img
              src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80"
              alt="Apple Repair Guides"
              className={styles.repairGuidesImg}
            />
          </div>
        </div>

        <div className={styles.marketingMaterialsSection}>
          <h3>Marketing Materials for your</h3>
          <h4>Store</h4>
          <Link href="/contact" className={styles.signupButton}>
            Sign up to gain access
          </Link>
        </div>

        <div className={styles.faqSection} id="gapp-faq">
          <h3>Frequently Asked Questions (FAQs)</h3>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h4>What is the Genuine Apple Parts Program?</h4>
              <p>
                The Genuine Apple Parts Program is a partnership with Apple that allows repair businesses to access
                genuine Apple parts and resources for high-quality repairs. Through this program, MDTS Tech offers
                you authentic Apple components, ensuring your repairs meet Apple's safety and performance standards.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>Who is eligible to join the program?</h4>
              <p>
                Any repair business that is interested in providing high-quality Apple repairs can apply to join.
                The enrollment process is simple and accessible to businesses of all sizes through MDTS Tech.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>How do I enroll in the program?</h4>
              <p>
                Enrollment is easy and free! Simply visit the Genuine Apple Parts section in your account dashboard
                to start the registration process. Once enrolled, you'll gain access to genuine Apple parts and other resources.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>Are there any costs associated with joining?</h4>
              <p>
                No, enrolling in the Genuine Apple Parts Program through MDTS Tech is completely free.
                You only pay for the parts you order.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>What kinds of Apple parts are available through this program?</h4>
              <p>
                The program offers a wide selection of genuine Apple parts, including screens, batteries, and other
                essential components, all manufactured to meet Apple's safety and performance standards.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>How does ordering and returns work?</h4>
              <p>
                MDTS Tech handles all part orders and returns for you. You can place orders, track shipments, and
                initiate returns easily through the MDTS Tech platform, allowing you to focus on providing great service.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>When are the core returns due?</h4>
              <p>
                Core returns are due 60 days from the date of purchase of the Genuine part. You can monitor these
                under the Core Returns section of your account dashboard.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>What models do you carry?</h4>
              <p>
                Currently, we carry Genuine parts for iPhone 12 and above models with more models and device types coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default React.memo(GAPPPage);
