import React, { Suspense, lazy } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout/Layout';

// Dynamic imports for code splitting
const Hero = dynamic(() => import('../components/Hero/Hero'), {
  loading: () => <div style={{ height: '500px', background: '#f3f4f6' }}></div>,
  ssr: true
});

const FeaturedProducts = dynamic(() => import('../components/FeaturedProducts/FeaturedProducts'), {
  ssr: true
});

const ProductList = dynamic(() => import('../components/ProductList/ProductList'), {
  ssr: true
});

const CategoryCards = dynamic(() => import('../components/CategoryCards/CategoryCards'), {
  ssr: true
});

const Testimonials = dynamic(() => import('../components/Testimonials/Testimonials'), {
  ssr: true
});

const TrustBadges = dynamic(() => import('../components/TrustBadges/TrustBadges'), {
  ssr: true
});

const RecentlyViewed = dynamic(() => import('../components/RecentlyViewed/RecentlyViewed'), {
  ssr: false // Client-side only component
});

const PersonalizedRecommendations = dynamic(
  () => import('../components/Recommendations/PersonalizedRecommendations'),
  { ssr: false } // Client-side only component
);

const MarketplaceIntegration = dynamic(
  () => import('../components/Marketplace').then(mod => ({ default: mod.MarketplaceIntegration })),
  { ssr: true }
);

// Simulating data from CSV since we can't use getStaticProps in this environment
const featuredProducts = [
  {
    id: 1,
    name: 'iPhone 13 Pro OLED Screen',
    category: 'Replacement Parts',
    price: 129.99,
    discount_percentage: 13.33,
    imageUrl: '/images/products/iphone/iphone-13-pro-screen.jpg',
    badge: 'Best Seller'
  },
  {
    id: 2,
    name: 'Professional Repair Tool Kit',
    category: 'Tools',
    price: 89.99,
    discount_percentage: 0,
    imageUrl: '/images/products/tools/repair-tool-kit.svg',
    badge: 'New'
  },
  {
    id: 3,
    name: 'Samsung Galaxy S22 Battery',
    category: 'Batteries',
    price: 39.99,
    discount_percentage: 20,
    imageUrl: '/images/products/samsung/galaxy-s22-battery.jpg',
    badge: '20% OFF'
  },
  {
    id: 4,
    name: 'iPad Pro 12.9" LCD Assembly',
    category: 'Replacement Parts',
    price: 199.99,
    discount_percentage: 0,
    imageUrl: '/images/products/ipad/ipad-pro-lcd.jpg',
    badge: null
  }
];

const popularProducts = [
  {
    id: 5,
    name: 'iPhone 12 LCD Screen',
    category: 'iPhone Parts',
    price: 89.99,
    discount_percentage: 0,
    imageUrl: '/images/products/iphone/iphone-12-screen.jpg'
  },
  {
    id: 6,
    name: 'Samsung Galaxy S21 Battery',
    category: 'Samsung Parts',
    price: 34.99,
    discount_percentage: 0,
    imageUrl: '/images/products/samsung/galaxy-s21-battery.jpg'
  },
  {
    id: 7,
    name: 'iPad Mini 5 Digitizer',
    category: 'iPad Parts',
    price: 79.99,
    discount_percentage: 10,
    imageUrl: '/images/ipad-mini.svg'
  },
  {
    id: 8,
    name: 'MacBook Pro Keyboard',
    category: 'MacBook Parts',
    price: 129.99,
    discount_percentage: 0,
    imageUrl: '/images/macbook-keyboard.svg'
  },
  {
    id: 9,
    name: 'Precision Screwdriver Set',
    category: 'Tools',
    price: 49.99,
    discount_percentage: 0,
    imageUrl: '/images/screwdriver-set.svg'
  },
  {
    id: 10,
    name: 'Heat Gun for Repairs',
    category: 'Tools',
    price: 69.99,
    discount_percentage: 15,
    imageUrl: '/images/heat-gun.svg'
  }
];

function Home() {
  const heroImageUrl = "/images/hero-banner-black-gold.jpg";

  // Loading fallback component
  const LoadingFallback = () => (
    <div style={{
      height: '200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f3f4f6'
    }}>
      <div className="loading-spinner"></div>
    </div>
  );

  return (
    <Layout
      title="Digiclick - Digital Marketing Solutions"
      description="Your trusted partner for digital marketing solutions. Find everything you need to grow your online presence."
    >
      {/* Hero Section - Critical for LCP */}
      <Hero heroImageUrl={heroImageUrl} />

      {/* Trust Badges */}
      <Suspense fallback={<LoadingFallback />}>
        <TrustBadges />
      </Suspense>

      {/* Category Cards */}
      <Suspense fallback={<LoadingFallback />}>
        <CategoryCards />
      </Suspense>

      {/* Featured Products */}
      <Suspense fallback={<LoadingFallback />}>
        <FeaturedProducts products={featuredProducts} />
      </Suspense>

      {/* Testimonials */}
      <Suspense fallback={<LoadingFallback />}>
        <Testimonials />
      </Suspense>

      {/* Popular Products */}
      <Suspense fallback={<LoadingFallback />}>
        <ProductList products={popularProducts} title="Popular Products" />
      </Suspense>

      {/* Below-the-fold content that can be loaded later */}
      <Suspense fallback={<LoadingFallback />}>
        {/* Personalized Recommendations */}
        <PersonalizedRecommendations
          title="Recommended For You"
          subtitle="Based on your browsing history and preferences"
          limit={4}
        />
      </Suspense>

      {/* Recently Viewed */}
      <Suspense fallback={<LoadingFallback />}>
        <RecentlyViewed
          title="Recently Viewed Products"
          subtitle="Products you've viewed recently"
        />
      </Suspense>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Digital Marketing Services</h2>
          <p>Digiclick is proud to offer comprehensive digital marketing services to help your business grow. Learn more about our services.</p>
          <Link href="/services" className="cta-button">Learn More</Link>
        </div>
      </section>
    </Layout>
  );
}

export default React.memo(Home);
