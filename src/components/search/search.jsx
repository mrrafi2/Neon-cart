import React, { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import OverlayPortal from "../common/overportal"; 
import styles from "../style/search.module.css";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const navigate = useNavigate();

  // Fetch all products from Firebase on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const db = getDatabase();
        const productsRef = ref(db, "products");
        const snapshot = await get(productsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const productsArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setAllProducts(productsArray);
        } else {
          setAllProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Generate suggestions from title, brand, type, subcategory
  useEffect(() => {
    if (query.trim() !== "") {
      const lowerQuery = query.toLowerCase();
      const suggestionSet = new Set();
      allProducts.forEach((product) => {
        if (product.title && product.title.toLowerCase().includes(lowerQuery)) {
          suggestionSet.add(product.title);
        }
        if (product.brand && product.brand.toLowerCase().includes(lowerQuery)) {
          suggestionSet.add(product.brand);
        }
        if (product.type && product.type.toLowerCase().includes(lowerQuery)) {
          suggestionSet.add(product.type);
        }
       
      });
      setSuggestions(Array.from(suggestionSet));
      setShowOverlay(true);
    } else {
      setSuggestions([]);
      setShowOverlay(false);
    }
  }, [query, allProducts]);

  // When a suggestion is clicked, navigate to search results page.
  const handleSuggestionClick = (suggestion) => {
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setQuery("");
    setShowOverlay(false);
  };

  return (
    <div className={styles.searchWrapper}>
      <div className={styles.searchContainer}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
            aria-expanded={showOverlay}
            aria-haspopup="listbox"
            role="combobox"
          />
          <div className={styles.searchIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
        </div>

        {showOverlay && (
          <div className={styles.overlay}>
            <div className={styles.overlayHeader}>
              <h3>Suggestions</h3>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setQuery("");
                  setShowOverlay(false);
                }}
                aria-label="Close suggestions"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <ul className={styles.suggestionsList} role="listbox">
              {suggestions.length > 0 ? (
                suggestions.map((sugg, idx) => (
                  <li
                    key={idx}
                    className={styles.suggestionItem}
                    onClick={() => handleSuggestionClick(sugg)}
                    role="option"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSuggestionClick(sugg);
                      }
                    }}
                  >
                    <span className={styles.suggestionText}>{sugg}</span>
                  </li>
                ))
              ) : (
                <li className={styles.noResults}>No suggestions found.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;