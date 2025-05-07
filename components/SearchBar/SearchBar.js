import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './SearchBar.module.css';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchInputRef = useRef(null);
  const router = useRouter();

  // Mock categories for suggestions
  const categories = [
    { id: 1, name: 'iPhone Parts', slug: 'categories/iphone-parts' },
    { id: 2, name: 'Samsung Parts', slug: 'categories/samsung-parts' },
    { id: 3, name: 'iPad Parts', slug: 'categories/ipad-parts' },
    { id: 4, name: 'MacBook Parts', slug: 'categories/macbook-parts' },
    { id: 5, name: 'Repair Tools', slug: 'categories/repair-tools' },
    { id: 6, name: 'iPhone 15 Screen', slug: 'products/iphone-15-screen' },
    { id: 7, name: 'iPhone 14 Battery', slug: 'products/iphone-14-battery' },
    { id: 8, name: 'Samsung S24 Screen', slug: 'products/samsung-s24-screen' },
    { id: 9, name: 'iPad Pro Screen', slug: 'products/ipad-pro-screen' },
    { id: 10, name: 'Screwdriver Set', slug: 'products/screwdriver-set' },
  ];

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 1) {
      // Filter categories based on search term
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
    } else {
      setSuggestions([]);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
      setIsExpanded(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (slug) => {
    router.push(`/${slug}`);
    setSearchTerm('');
    setSuggestions([]);
    setIsExpanded(false);
  };

  // Toggle search bar expansion
  const toggleSearchBar = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      // Focus the input when expanding
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  };

  // Close search bar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.searchContainer}>
      <button
        className={styles.searchToggle}
        onClick={toggleSearchBar}
        aria-label="Toggle search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>

      <div className={`${styles.searchBar} ${isExpanded ? styles.expanded : ''}`}>
        <form onSubmit={handleSearchSubmit} ref={searchInputRef}>
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
            aria-label="Search products"
          />
          <button type="submit" className={styles.searchButton} aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>

        {suggestions.length > 0 && (
          <div className={styles.suggestions}>
            {suggestions.map(suggestion => (
              <div
                key={suggestion.id}
                className={styles.suggestionItem}
                onClick={() => handleSuggestionClick(suggestion.slug)}
              >
                {suggestion.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
