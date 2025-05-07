import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFrequentlyBoughtTogether } from '../../utils/recommendationEngine';
import styles from './Recommendations.module.css';

const FrequentlyBoughtTogether = ({
  productId,
  currentProduct,
  title = "Frequently Bought Together",
  limit = 3
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Get frequently bought together products
        const relatedProducts = await getFrequentlyBoughtTogether(productId, limit);

        setProducts(relatedProducts);

        // Initialize selected products (all selected by default)
        const initialSelected = {};
        relatedProducts.forEach(product => {
          initialSelected[product.id] = true;
        });

        setSelectedProducts(initialSelected);

        // Calculate initial total price
        const initialTotal = currentProduct.price + relatedProducts.reduce((sum, product) => {
          return sum + product.price;
        }, 0);

        setTotalPrice(initialTotal);
      } catch (error) {
        console.error('Error fetching frequently bought together products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (productId && currentProduct) {
      fetchProducts();
    }
  }, [productId, currentProduct, limit]);

  // Handle checkbox change
  const handleCheckboxChange = (productId, price) => {
    setSelectedProducts(prev => {
      const newSelected = { ...prev, [productId]: !prev[productId] };

      // Update total price
      let newTotal = currentProduct.price;
      products.forEach(product => {
        if (newSelected[product.id]) {
          newTotal += product.price;
        }
      });

      setTotalPrice(newTotal);

      return newSelected;
    });
  };

  // Add selected products to cart
  const addSelectedToCart = () => {
    // Get selected product IDs
    const selectedIds = [currentProduct.id];
    products.forEach(product => {
      if (selectedProducts[product.id]) {
        selectedIds.push(product.id);
      }
    });

    // Add to cart (implementation depends on your cart system)
    // // // console.log('Adding to cart:', selectedIds);

    // Example implementation
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');

    // Add current product
    const currentProductInCart = cartItems.find(item => item.id === currentProduct.id);
    if (currentProductInCart) {
      currentProductInCart.quantity += 1;
    } else {
      cartItems.push({
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        image_url: currentProduct.image_url,
        quantity: 1
      });
    }

    // Add selected products
    products.forEach(product => {
      if (selectedProducts[product.id]) {
        const productInCart = cartItems.find(item => item.id === product.id);
        if (productInCart) {
          productInCart.quantity += 1;
        } else {
          cartItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            quantity: 1
          });
        }
      }
    });

    // Save to localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    // Show confirmation
    alert('Products added to cart!');
  };

  if (loading) {
    return (
      <div className={styles.recommendationsLoading}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Don't show anything if no related products
  }

  return (
    <section className={styles.frequentlyBoughtSection}>
      <div className="container">
        <h2 className={styles.recommendationsTitle}>{title}</h2>

        <div className={styles.frequentlyBoughtContainer}>
          <div className={styles.productCombination}>
            {/* Current product */}
            <div className={styles.combinationItem}>
              <div className={styles.combinationImageContainer}>
                <img
                  src={currentProduct.image_url || '/images/placeholder.svg'}
                  alt={currentProduct.name}
                  className={styles.combinationImage}
                />
              </div>
              <div className={styles.combinationName}>{currentProduct.name}</div>
              <div className={styles.combinationPrice}>$82.34</div>
            </div>

            {/* Plus signs between products */}
            {products.map((product, index) => (
              <React.Fragment key={`plus-${product.id}`}>
                <div className={styles.plusSign}>+</div>

                <div className={styles.combinationItem}>
                  <label className={styles.combinationCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedProducts[product.id] || false}
                      onChange={() => handleCheckboxChange(product.id, product.price)}
                    />
                    <div className={styles.combinationImageContainer}>
                      <img
                        src={product.image_url || '/images/placeholder.svg'}
                        alt={product.name}
                        className={styles.combinationImage}
                      />
                    </div>
                    <div className={styles.combinationName}>{product.name}</div>
                    <div className={styles.combinationPrice}>${product.price.toFixed(2)}</div>
                  </label>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className={styles.bundleSummary}>
            <div className={styles.bundlePrice}>
              <span className={styles.bundlePriceLabel}>Price for all:</span>
              <span className={styles.bundlePriceValue}>$82.34</span>
            </div>

            <button
              className={styles.addAllButton}
              onClick={addSelectedToCart}
            >
              Add Selected To Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrequentlyBoughtTogether;
