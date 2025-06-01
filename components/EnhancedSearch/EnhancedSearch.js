import React from 'react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './EnhancedSearch.module.css';

const EnhancedSearch = ({ initialQuery = '', onSearch, showFilters = false }) => {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    brand: [],
    priceRange: { min: '', max: '' },
    inStock: false
  });
  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    brands: []
  });
  const searchRef = useRef(null);
  const searchTimeout = useRef(null);
  
  // Load recent searches from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSearches = localStorage.getItem('recentSearches');
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    }
    
    // Fetch available filters
    fetchAvailableFilters();
  }, []);
  
  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fetch available filters for faceted search
  const fetchAvailableFilters = async () => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll use mock data
      setAvailableFilters({
        categories: [
          { id: 1, name: 'iPhone Parts', slug: 'iphone-parts', count: 42 },
          { id: 2, name: 'Samsung Parts', slug: 'samsung-parts', count: 38 },
          { id: 3, name: 'iPad Parts', slug: 'ipad-parts', count: 24 },
          { id: 4, name: 'MacBook Parts', slug: 'macbook-parts', count: 18 },
          { id: 5, name: 'Repair Tools', slug: 'repair-tools', count: 35 }
        ],
        brands: [
          { id: 1, name: 'Apple', slug: 'apple', count: 65 },
          { id: 2, name: 'Samsung', slug: 'samsung', count: 48 },
          { id: 3, name: 'LG', slug: 'lg', count: 22 },
          { id: 4, name: 'Huawei', slug: 'huawei', count: 18 },
          { id: 5, name: 'Xiaomi', slug: 'xiaomi', count: 15 }
        ]
      });
    } catch (error) {
      console.error('Error fetching available filters:', error);
    }
  };
  
  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (value.trim().length > 1) {
      setLoading(true);
      setShowResults(true);
      
      // Debounce search to avoid too many requests
      searchTimeout.current = setTimeout(() => {
        performSearch(value);
      }, 300);
    } else {
      setResults([]);
      setLoading(false);
      setShowResults(value.trim().length > 0);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType === 'category' || filterType === 'brand') {
        // Toggle array values
        if (newFilters[filterType].includes(value)) {
          newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
        } else {
          newFilters[filterType] = [...newFilters[filterType], value];
        }
      } else if (filterType === 'priceMin') {
        newFilters.priceRange.min = value;
      } else if (filterType === 'priceMax') {
        newFilters.priceRange.max = value;
      } else if (filterType === 'inStock') {
        newFilters.inStock = !newFilters.inStock;
      }
      
      return newFilters;
    });
    
    // Re-run search with new filters
    if (query.trim().length > 1) {
      performSearch(query);
    }
  };
  
  // Perform search with current query and filters
  const performSearch = async (searchQuery) => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call with filters
      // For demo purposes, we'll use mock data
      const mockResults = [
        {
          id: 1,
          name: 'iPhone 13 Pro OLED Screen',
          slug: 'iphone-13-pro-oled-screen',
          category: 'iPhone Parts',
          price: 129.99,
          image_url: '/images/products/iphone-screen.jpg',
          stock: 15
        },
        {
          id: 2,
          name: 'Samsung Galaxy S22 Battery',
          slug: 'samsung-galaxy-s22-battery',
          category: 'Samsung Parts',
          price: 39.99,
          image_url: '/images/products/samsung-battery.jpg',
          stock: 23
        },
        {
          id: 3,
          name: 'Professional Repair Tool Kit',
          slug: 'professional-repair-tool-kit',
          category: 'Repair Tools',
          price: 89.99,
          image_url: '/images/products/repair-tools.jpg',
          stock: 8
        },
        {
          id: 4,
          name: 'iPad Pro 12.9" LCD Assembly',
          slug: 'ipad-pro-12-9-lcd-assembly',
          category: 'iPad Parts',
          price: 199.99,
          image_url: '/images/products/ipad-screen.jpg',
          stock: 5
        }
      ];
      
      // Filter results based on selected filters
      let filteredResults = [...mockResults];
      
      // Apply category filter
      if (selectedFilters.category.length > 0) {
        filteredResults = filteredResults.filter(item => 
          selectedFilters.category.includes(item.category.toLowerCase().replace(' ', '-'))
        );
      }
      
      // Apply price range filter
      if (selectedFilters.priceRange.min) {
        filteredResults = filteredResults.filter(item => 
          item.price >= parseFloat(selectedFilters.priceRange.min)
        );
      }
      
      if (selectedFilters.priceRange.max) {
        filteredResults = filteredResults.filter(item => 
          item.price <= parseFloat(selectedFilters.priceRange.max)
        );
      }
      
      // Apply in-stock filter
      if (selectedFilters.inStock) {
        filteredResults = filteredResults.filter(item => item.stock > 0);
      }
      
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setResults(filteredResults);
      
      // If this is a new search (not just filter changes), add to recent searches
      if (searchQuery && searchQuery.trim() !== '' && !recentSearches.includes(searchQuery.trim())) {
        const updatedSearches = [searchQuery.trim(), ...recentSearches.slice(0, 4)];
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      }
      
      if (onSearch) {
        onSearch(searchQuery, filteredResults);
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (query.trim().length > 1) {
      // Navigate to search results page
      router.push({
        pathname: '/search',
        query: { q: query, ...buildFilterQueryParams() }
      });
      
      setShowResults(false);
    }
  };
  
  // Build query parameters from selected filters
  const buildFilterQueryParams = () => {
    const params = {};
    
    if (selectedFilters.category.length > 0) {
      params.category = selectedFilters.category.join(',');
    }
    
    if (selectedFilters.brand.length > 0) {
      params.brand = selectedFilters.brand.join(',');
    }
    
    if (selectedFilters.priceRange.min) {
      params.minPrice = selectedFilters.priceRange.min;
    }
    
    if (selectedFilters.priceRange.max) {
      params.maxPrice = selectedFilters.priceRange.max;
    }
    
    if (selectedFilters.inStock) {
      params.inStock = 'true';
    }
    
    return params;
  };
  
  // Clear a recent search
  const clearRecentSearch = (searchTerm, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const updatedSearches = recentSearches.filter(term => term !== searchTerm);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };
  
  // Clear all recent searches
  const clearAllRecentSearches = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };
  
  return (
    <div className={styles.searchContainer} ref={searchRef}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowResults(true)}
            placeholder="Search for products..."
            className={styles.searchInput}
            aria-label="Search"
          />
          
          {query && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowResults(false);
              }}
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
          
          <button type="submit" className={styles.searchButton} aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        
        {showFilters && (
          <div className={styles.filtersContainer}>
            <div className={styles.filterSection}>
              <h3>Categories</h3>
              <div className={styles.filterOptions}>
                {availableFilters.categories.map(category => (
                  <label key={category.id} className={styles.filterCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedFilters.category.includes(category.slug)}
                      onChange={() => handleFilterChange('category', category.slug)}
                    />
                    <span>{category.name}</span>
                    <span className={styles.filterCount}>({category.count})</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className={styles.filterSection}>
              <h3>Brands</h3>
              <div className={styles.filterOptions}>
                {availableFilters.brands.map(brand => (
                  <label key={brand.id} className={styles.filterCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedFilters.brand.includes(brand.slug)}
                      onChange={() => handleFilterChange('brand', brand.slug)}
                    />
                    <span>{brand.name}</span>
                    <span className={styles.filterCount}>({brand.count})</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className={styles.filterSection}>
              <h3>Price Range</h3>
              <div className={styles.priceRangeInputs}>
                <input
                  type="number"
                  placeholder="Min"
                  value={selectedFilters.priceRange.min}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  className={styles.priceInput}
                  min="0"
                />
                <span className={styles.priceSeparator}>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={selectedFilters.priceRange.max}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  className={styles.priceInput}
                  min="0"
                />
              </div>
            </div>
            
            <div className={styles.filterSection}>
              <label className={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  checked={selectedFilters.inStock}
                  onChange={() => handleFilterChange('inStock')}
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>
        )}
      </form>
      
      {showResults && (
        <div className={styles.searchResults}>
          {loading ? (
            <div className={styles.loadingResults}>
              <div className={styles.spinner}></div>
              <p>Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className={styles.resultsHeader}>
                <h3>Search Results</h3>
                <Link href={{ pathname: '/search', query: { q: query, ...buildFilterQueryParams() } }} className={styles.viewAllLink}>
                  View All
                </Link>
              </div>
              
              <div className={styles.resultsList}>
                {results.map(result => (
                  <Link 
                    href={`/products/${result.slug}`} 
                    key={result.id}
                    className={styles.resultItem}
                    onClick={() => setShowResults(false)}
                  >
                    <div className={styles.resultImageContainer}>
                      <img 
                        src={result.image_url || '/images/placeholder.svg'} 
                        alt={result.name}
                        className={styles.resultImage}
                      />
                    </div>
                    <div className={styles.resultContent}>
                      <h4 className={styles.resultName}>{result.name}</h4>
                      <div className={styles.resultCategory}>{result.category}</div>
                      <div className={styles.resultPrice}>${result.price.toFixed(2)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : query.trim().length > 1 ? (
            <div className={styles.noResults}>
              <p>No results found for "{query}"</p>
              <p className={styles.searchTip}>Try using different keywords or check your spelling</p>
            </div>
          ) : recentSearches.length > 0 ? (
            <div className={styles.recentSearches}>
              <div className={styles.recentSearchesHeader}>
                <h3>Recent Searches</h3>
                <button 
                  className={styles.clearAllButton}
                  onClick={clearAllRecentSearches}
                >
                  Clear All
                </button>
              </div>
              
              <div className={styles.recentSearchList}>
                {recentSearches.map((searchTerm, index) => (
                  <div key={index} className={styles.recentSearchItem}>
                    <button
                      className={styles.recentSearchButton}
                      onClick={() => {
                        setQuery(searchTerm);
                        performSearch(searchTerm);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 14 4 9 9 4"></polyline>
                        <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                      </svg>
                      {searchTerm}
                    </button>
                    <button
                      className={styles.removeRecentButton}
                      onClick={(e) => clearRecentSearch(searchTerm, e)}
                      aria-label={`Remove ${searchTerm} from recent searches`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.searchPrompt}>
              <p>Start typing to search for products</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;
