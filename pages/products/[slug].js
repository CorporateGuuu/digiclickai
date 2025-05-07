import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout/Layout';
import AddToCart from '../../components/AddToCart';
import ProductImages from '../../components/ProductDetail/ProductImages';
import ProductTabs from '../../components/ProductDetail/ProductTabs';
import RelatedProducts from '../../components/ProductDetail/RelatedProducts';
import ProductReviews from '../../components/ProductDetail/ProductReviews';
import CompareButton from '../../components/ProductDetail/CompareButton';
import ProductRecommendations from '../../components/ProductRecommendations/ProductRecommendations';
import RecentlyViewed from '../../components/RecentlyViewed/RecentlyViewed';
import SocialShare from '../../components/SocialShare/SocialShare';
import SimilarProducts from '../../components/Recommendations/SimilarProducts';
import FrequentlyBoughtTogether from '../../components/Recommendations/FrequentlyBoughtTogether';
import { trackProductView } from '../../utils/recommendationEngine';
import styles from '../../styles/ProductDetail.module.css';

export default function ProductDetail() {
  const router = useRouter();
  const { slug } = router.query;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Only fetch when slug is available
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${slug}`);

        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const data = await response.json();

        if (data.success) {
          setProduct(data.product);

          // Track this product in recently viewed
          try {
            const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            const productId = data.product.id.toString();

            // Remove if already exists (to move to front)
            const filtered = recentlyViewed.filter(id => id !== productId);

            // Add to beginning
            filtered.unshift(productId);

            // Keep only the most recent 20
            const limited = filtered.slice(0, 20);

            // Save back to localStorage
            localStorage.setItem('recentlyViewed', JSON.stringify(limited));

            // Track product view for recommendations
            trackProductView(data.product.id);
          } catch (err) {
            console.error('Error updating recently viewed:', err);
          }
        } else {
          throw new Error(data.message || 'Failed to fetch product');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <Layout title="Loading Product" description="Loading product details...">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error" description="An error occurred while loading the product">
        <div className="container">
          <div className="error-message">
            <h1>Error</h1>
            <p>{error}</p>
            <Link href="/products" className="btn">
              Back to Products
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout title="Product Not Found" description="The requested product could not be found">
        <div className="container">
          <div className="error-message">
            <h1>Product Not Found</h1>
            <p>The requested product could not be found.</p>
            <Link href="/products" className="btn">
              Back to Products
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={product.name}
      description={product.description || `Buy ${product.name} from MDTS`}
    >
      <div className="container product-detail-container">
        <div className={styles.breadcrumbs}>
          <Link href="/">Home</Link> /
          <Link href="/products">Products</Link> /
          <Link href={`/categories/${product.category_slug || 'all'}`}>{product.category_name}</Link> /
          <span>{product.name}</span>
        </div>

        <div className={styles.productDetail}>
          <div className={styles.productMedia}>
            <ProductImages product={product} />
          </div>

          <div className={styles.productInfo}>
            <h1 className={styles.productName}>{product.name}</h1>

            <div className={styles.productMeta}>
              <span className={styles.productCategory}>Category: {product.category_name}</span>
              <span className={styles.productSku}>SKU: {product.sku || 'N/A'}</span>
              {product.stock_status && (
                <span className={`${styles.stockStatus} ${product.stock_status === 'In Stock' ? styles.inStock : styles.outOfStock}`}>
                  {product.stock_status}
                </span>
              )}
            </div>

            <div className={styles.productPrice}>
              <span className={styles.currentPrice}>$82.34</span>
            </div>

            <div className={styles.productDescription}>
              <p>{product.description || 'No description available for this product.'}</p>
            </div>

            <div className={styles.productActions}>
              <div className={styles.quantityWrapper}>
                <label htmlFor="quantity">Quantity:</label>
                <div className={styles.quantitySelector + " " + styles.horizontalQuantity}>
                  <button
                    onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className={styles.quantityButton}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    min="1"
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className={styles.quantityInput}
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className={styles.quantityButton}
                  >
                    +
                  </button>
                </div>
              </div>

              <AddToCart product={product} quantity={quantity} />

              <button className={styles.wishlistButton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                Add to Wishlist
              </button>

              <CompareButton product={product} />
            </div>

            <div className={styles.socialShareContainer}>
              <h4 className={styles.socialShareTitle}>Share This Product</h4>
              <SocialShare
                url={`${typeof window !== 'undefined' ? window.location.origin : ''}/products/${product.slug}`}
                title={product.name}
                description={product.description || `Check out ${product.name} at MDTS - Midas Technical Solutions`}
                image={product.image_url}
              />
            </div>

            <div className={styles.productFeatures}>
              <div className={styles.feature}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                <span>Free shipping on orders over $1000</span>
              </div>

              <div className={styles.feature}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                <span>30-day satisfaction guarantee</span>
              </div>

              <div className={styles.feature}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>

        <ProductTabs product={product} />

        <ProductReviews productId={product.id} />

        <FrequentlyBoughtTogether
          productId={product.id}
          currentProduct={product}
          title="Frequently Bought Together"
          limit={3}
        />

        <SimilarProducts
          productId={product.id}
          categoryId={product.category_id}
          title="Similar Products"
          subtitle="You might also be interested in these products"
          limit={4}
        />

        <ProductRecommendations
          currentProductId={product.id}
          currentCategory={product.category_name}
          title="You Might Also Like"
        />

        <RecentlyViewed
          currentProductId={product.id}
          title="Recently Viewed Products"
        />
      </div>
    </Layout>
  );
}
