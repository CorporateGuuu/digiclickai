import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './ProductFilters.module.css';
import PriceRangeSlider from '../PriceRangeSlider/PriceRangeSlider';

const ProductFilters = ({ categories, brands, onFilterChange }) => {
  const router = useRouter();
  const { query } = router;

  // Initialize filter state from URL query params
  const [filters, setFilters] = useState({
    category: query.category || '',
    brand: query.brand || '',
    priceRange: [0, 500],
    inStock: query.inStock === 'true',
    sortBy: query.sortBy || 'featured'
  });

  // Price range slider values
  const [priceMin, setPriceMin] = useState(query.minPrice ? parseInt(query.minPrice) : 0);
  const [priceMax, setPriceMax] = useState(query.maxPrice ? parseInt(query.maxPrice) : 500);

  // Mobile filter visibility
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Update filters when URL query changes
  useEffect(() => {
    setFilters({
      category: query.category || '',
      brand: query.brand || '',
      priceRange: [
        query.minPrice ? parseInt(query.minPrice) : 0,
        query.maxPrice ? parseInt(query.maxPrice) : 500
      ],
      inStock: query.inStock === 'true',
      sortBy: query.sortBy || 'featured'
    });

    setPriceMin(query.minPrice ? parseInt(query.minPrice) : 0);
    setPriceMax(query.maxPrice ? parseInt(query.maxPrice) : 500);
  }, [query]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);

    if (onFilterChange) {
      onFilterChange(newFilters);
    }

    // Update URL with new filters
    const queryParams = { ...query };

    if (filterType === 'category' && value) {
      queryParams.category = value;
    } else if (filterType === 'category') {
      delete queryParams.category;
    }

    if (filterType === 'brand' && value) {
      queryParams.brand = value;
    } else if (filterType === 'brand') {
      delete queryParams.brand;
    }

    if (filterType === 'priceRange') {
      queryParams.minPrice = value[0].toString();
      queryParams.maxPrice = value[1].toString();
    }

    if (filterType === 'inStock') {
      if (value) {
        queryParams.inStock = 'true';
      } else {
        delete queryParams.inStock;
      }
    }

    if (filterType === 'sortBy' && value !== 'featured') {
      queryParams.sortBy = value;
    } else if (filterType === 'sortBy') {
      delete queryParams.sortBy;
    }

    router.push({
      pathname: router.pathname,
      query: queryParams
    }, undefined, { shallow: true });
  };

  // Handle price range changes
  const handlePriceChange = (type, value) => {
    if (type === 'min') {
      setPriceMin(value);
    } else {
      setPriceMax(value);
    }
  };

  // Apply price range filter
  const applyPriceRange = () => {
    handleFilterChange('priceRange', [priceMin, priceMax]);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: '',
      brand: '',
      priceRange: [0, 500],
      inStock: false,
      sortBy: 'featured'
    });

    setPriceMin(0);
    setPriceMax(500);

    router.push({
      pathname: router.pathname
    }, undefined, { shallow: true });

    if (onFilterChange) {
      onFilterChange({
        category: '',
        brand: '',
        priceRange: [0, 500],
        inStock: false,
        sortBy: 'featured'
      });
    }
  };

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };

  return (
    <div className={styles.productFilters}>
      {/* Unified filter bar */}
      <div className={styles.mobileFilterToggle}>
        <button onClick={toggleMobileFilters}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
          Filters
        </button>

        <div className={styles.sortByMobile}>
          <label htmlFor="sort-by-mobile" style={{ marginRight: '8px', fontSize: '0.875rem', color: '#4b5563' }}>Sort By:</label>
          <select
            id="sort-by-mobile"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="bestselling">Best Selling</option>
            <option value="rating">Highest Rated</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </div>
      </div>

      {/* Hidden desktop sort (we're using the unified bar now) */}
      <div className={styles.sortByDesktop} style={{ display: 'none' }}>
        <label htmlFor="sort-by">Sort By:</label>
        <select
          id="sort-by"
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
          <option value="bestselling">Best Selling</option>
          <option value="rating">Highest Rated</option>
          <option value="discount">Biggest Discount</option>
        </select>
      </div>

      {/* Filter sidebar */}
      <div className={`${styles.filterSidebar} ${mobileFiltersOpen ? styles.open : ''}`}>
        <div className={styles.filterHeader}>
          <h3>Filters</h3>
          <button
            className={styles.closeButton}
            onClick={toggleMobileFilters}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.filterSection}>
          <h4>Category</h4>
          <div className={styles.filterOptions}>
            <div className={styles.filterOption}>
              <input
                type="radio"
                id="category-all"
                name="category"
                checked={filters.category === ''}
                onChange={() => handleFilterChange('category', '')}
              />
              <label htmlFor="category-all">All Categories</label>
            </div>

            {categories && categories.map((category) => (
              <div key={category.id} className={styles.categoryGroup}>
                <div className={styles.filterOption}>
                  <input
                    type="radio"
                    id={`category-${category.id}`}
                    name="category"
                    checked={filters.category === category.slug}
                    onChange={() => handleFilterChange('category', category.slug)}
                  />
                  <label htmlFor={`category-${category.id}`}>{category.name}</label>
                </div>

                {/* Show subcategories if this category is selected */}
                {filters.category === category.slug && category.subcategories && (
                  <div className={styles.subcategories}>
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className={styles.filterOption}>
                        <input
                          type="radio"
                          id={`subcategory-${subcategory.id}`}
                          name="subcategory"
                          checked={query.subcategory === subcategory.slug}
                          onChange={() => {
                            const queryParams = { ...query, subcategory: subcategory.slug };
                            router.push({
                              pathname: router.pathname,
                              query: queryParams
                            }, undefined, { shallow: true });
                          }}
                        />
                        <label htmlFor={`subcategory-${subcategory.id}`}>{subcategory.name}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <h4>Brand</h4>
          <div className={styles.filterOptions}>
            <div className={styles.filterOption}>
              <input
                type="radio"
                id="brand-all"
                name="brand"
                checked={filters.brand === ''}
                onChange={() => handleFilterChange('brand', '')}
              />
              <label htmlFor="brand-all">All Brands</label>
            </div>

            {brands && brands.map((brand) => (
              <div key={brand.id} className={styles.filterOption}>
                <input
                  type="radio"
                  id={`brand-${brand.id}`}
                  name="brand"
                  checked={filters.brand === brand.slug}
                  onChange={() => handleFilterChange('brand', brand.slug)}
                />
                <label htmlFor={`brand-${brand.id}`}>{brand.name}</label>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <h4>Price Range</h4>
          <PriceRangeSlider
            min={0}
            max={1000}
            step={10}
            initialMin={priceMin}
            initialMax={priceMax}
            onChange={([min, max]) => {
              setPriceMin(min);
              setPriceMax(max);
              handleFilterChange('priceRange', [min, max]);
            }}
          />
        </div>

        <div className={styles.filterSection}>
          <h4>Availability</h4>
          <div className={styles.filterOptions}>
            <div className={styles.filterOption}>
              <input
                type="checkbox"
                id="in-stock"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              />
              <label htmlFor="in-stock">In Stock Only</label>
            </div>
          </div>
        </div>

        <button
          className={styles.resetButton}
          onClick={resetFilters}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;
