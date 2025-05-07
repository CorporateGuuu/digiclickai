import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './SearchAutocomplete.module.css';

const SearchAutocomplete = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  // Mock search results for demo purposes
  const mockSearchResults = [
    {
      id: 1,
      name: 'iPhone 13 Pro OLED Screen',
      slug: 'iphone-13-pro-oled-screen',
      category: 'iPhone Parts',
      image: '/images/iphone-screen.svg'
    },
    {
      id: 2,
      name: 'iPhone 13 Battery Replacement',
      slug: 'iphone-13-battery-replacement',
      category: 'iPhone Parts',
      image: '/images/iphone-battery.svg'
    },
    {
      id: 3,
      name: 'Samsung Galaxy S22 Battery',
      slug: 'samsung-galaxy-s22-battery',
      category: 'Samsung Parts',
      image: '/images/samsung-battery.svg'
    },
    {
      id: 4,
      name: 'Professional Repair Tool Kit',
      slug: 'professional-repair-tool-kit',
      category: 'Repair Tools',
      image: '/images/repair-tools.svg'
    },
    {
      id: 5,
      name: 'iPad Pro 12.9" LCD Assembly',
      slug: 'ipad-pro-12-9-lcd-assembly',
      category: 'iPad Parts',
      image: '/images/ipad-screen.svg'
    }
  ];

  // Categories for suggestions
  const categories = [
    { name: 'iPhone Parts', slug: 'iphone-parts' },
    { name: 'Samsung Parts', slug: 'samsung-parts' },
    { name: 'iPad Parts', slug: 'ipad-parts' },
    { name: 'MacBook Parts', slug: 'macbook-parts' },
    { name: 'Repair Tools', slug: 'repair-tools' }
  ];

  // Popular searches
  const popularSearches = [
    'iPhone screen replacement',
    'Samsung battery',
    'iPad digitizer',
    'MacBook keyboard',
    'repair tools'
  ];

  useEffect(() => {
    // Close search results when clicking outside
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

  useEffect(() => {
    // Debounce search to avoid too many requests
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 2) {
        setLoading(true);

        // In a real implementation, this would be an API call
        // For demo purposes, we'll filter the mock data
        const filteredResults = mockSearchResults.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setResults(filteredResults);
        setLoading(false);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      setShowResults(false);
    }
  };

  const handleCategoryClick = (slug) => {
    router.push(`/categories/${slug}`);
    setShowResults(false);
  };

  const handlePopularSearchClick = (term) => {
    setSearchTerm(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
    setShowResults(false);
  };

  return (
    <div className={styles.searchAutocomplete} ref={searchRef}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          id="search"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
          placeholder="Search products..."
          className={styles.searchInput}
          aria-label="Search products"
        />
        <button type="submit" className={styles.searchButton}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </form>

      {showResults && (
        <div className={styles.resultsDropdown}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className={styles.resultsList}>
              <h3 className={styles.resultsTitle}>Products</h3>
              {results.map(result => (
                <Link
                  href={`/products/${result.slug}`}
                  key={result.id}
                  className={styles.resultItem}
                  onClick={() => setShowResults(false)}
                >
                  <div className={styles.resultImage}>
                    <img src={result.image} alt={result.name} />
                  </div>
                  <div className={styles.resultInfo}>
                    <h4>{result.name}</h4>
                    <p>{result.category}</p>
                  </div>
                </Link>
              ))}
              <div className={styles.viewAll}>
                <Link
                  href={`/search?q=${encodeURIComponent(searchTerm)}`}
                  onClick={() => setShowResults(false)}
                >
                  View all results
                </Link>
              </div>
            </div>
          ) : (
            <div className={styles.noResults}>
              <p>No results found for "{searchTerm}"</p>

              <div className={styles.suggestions}>
                <div className={styles.suggestionsSection}>
                  <h3>Categories</h3>
                  <div className={styles.categoryTags}>
                    {categories.map(category => (
                      <button
                        key={category.slug}
                        className={styles.categoryTag}
                        onClick={() => handleCategoryClick(category.slug)}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.suggestionsSection}>
                  <h3>Popular Searches</h3>
                  <ul className={styles.popularSearches}>
                    {popularSearches.map((term, index) => (
                      <li key={index}>
                        <button
                          className={styles.popularSearchItem}
                          onClick={() => handlePopularSearchClick(term)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
