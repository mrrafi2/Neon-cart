import React, { useState, useEffect } from "react";
import ProductGrid from "./productGrid";
import Category from "./category";
import { getDatabase, ref, get } from "firebase/database";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../common/loading";
import SearchBar from "../search/search";
import styles from "../style/products.module.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conditionFilter, setConditionFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryOffcanvas, setShowCategoryOffcanvas] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); 
  const [filters, setFilters] = useState([]); 
  const [sortBy, setSortBy] = useState("rating"); 
  const [viewMode, setViewMode] = useState("grid"); 
  const [quickViewProduct, setQuickViewProduct] = useState(null); 

  const pageSize = 18;

  const { category, subcategory } = useParams();

  const fetchAverageRating = async (productId) => {
    const db = getDatabase();
    const reviewsRef = ref(db, `reviews/${productId}`);
    try {
      const snapshot = await get(reviewsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const reviewsArray = Object.values(data);
        const total = reviewsArray.reduce((acc, review) => acc + (review.rating || 0), 0);
        const average = total / reviewsArray.length;
        return average;
      }
    } catch (error) {
      console.error("Error fetching reviews for product", productId, error);
    }
    return 0;
  };

  const fetchProducts = async () => {
    const db = getDatabase();
    const productsRef = ref(db, "products");
    try {
      const snapshot = await get(productsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        let productsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        if (category && subcategory) {
          productsArray = productsArray.filter(
            (product) =>
              product.category === category && product.subcategory === subcategory
          );
        }

        const productsWithRatings = await Promise.all(
          productsArray.map(async (prod) => {
            const avgRating = await fetchAverageRating(prod.id);
            return { ...prod, rating: avgRating };
          })
        );

        productsWithRatings.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setProducts(productsWithRatings);
      } else {
        console.log("No products available.");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, subcategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [conditionFilter]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

 if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <LoadingSpinner />
          <p className={styles.loadingText}>Loading amazing products...</p>
        </div>
      </div>
    );
  }

  let filteredProducts = products;
  if (conditionFilter === "New") {
    filteredProducts = products.filter((p) => p.condition === "New");
  } else if (conditionFilter === "Used") {
    filteredProducts = products.filter((p) => p.condition === "Used");
  }

  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / pageSize);
  const validCurrentPage = Math.min(currentPage, totalPages || 1);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const filterOptions = [
    { value: "All", label: "All Products", count: products.length },
    { value: "New", label: "New", count: products.filter(p => p.condition === "New").length },
    { value: "Used", label: "Used", count: products.filter(p => p.condition === "Used").length }
  ];

  return (
    <div className={styles.productsContainer}>

       <button 
       className={styles.categoryTrigger}
       onClick={() => setShowCategoryOffcanvas(true)}
       aria-label="Browse Categories"
     >

       <div className={styles.triggerIcon}>
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
           <rect x="3" y="3" width="7" height="7"></rect>
           <rect x="14" y="3" width="7" height="7"></rect>
           <rect x="14" y="14" width="7" height="7"></rect>
           <rect x="3" y="14" width="7" height="7"></rect>
         </svg>
       </div>
       <div className={styles.triggerPulse}></div>
     </button>

      <div className={`${styles.offcanvasOverlay} ${showCategoryOffcanvas ? styles.offcanvasOpen : ''}`}>
        <div className={styles.offcanvasContent}>
          <div className={styles.offcanvasHeader}>
            <h2 className={styles.offcanvasTitle}>Browse Categories</h2>
            <button 
              className={styles.offcanvasClose}
              onClick={() => setShowCategoryOffcanvas(false)}
              aria-label="Close categories"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <line x1="18" y1="6" x2="6" y2="18"></line>
               <line x1="6" y1="6" x2="18" y2="18"></line>
             </svg>
           </button>
         </div>
         <div className={styles.offcanvasBody}>
           <Category onCategorySelect={() => setShowCategoryOffcanvas(false)} />
          </div>
        </div>
      </div>

    
      <div className={styles.mainContent}>
       
        <div className={styles.header}>
          <h1 className={styles.title}>
            {category && subcategory 
              ? `${category} - ${subcategory}`
              : "Our Products"
            }
          </h1>
          
          <div className={styles.headerStats}>
            <span>Total: {totalProducts} products</span>
            <div className={styles.statsDivider}></div>
            <span>Page {validCurrentPage} of {totalPages || 1}</span>
          </div>
        </div>
           {/* Search Row */}
                    <div className={styles.searchRow}>
                        <div className={styles.searchContainer}>
                            <SearchBar />
                        </div>
                    </div>
        {/* Filter Tabs */}
        <div className={styles.tabContainer}>
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setConditionFilter(option.value)}
              className={`${styles.tabButton} ${conditionFilter === option.value ? styles.tabActive : ''}`}
            >
              {/* Circuit decorations */}
              <div className={styles.circuitCornerTopLeft}></div>
              <div className={styles.circuitCornerBottomRight}></div>

              <span className={styles.tabContent}>
                {option.label}
                <span className={styles.tabBadge}>
                  {option.count}
                </span>
              </span>

              {/* Hover effect */}
              <div className={styles.tabHoverEffect}></div>
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className={styles.gridSection}>
          {paginatedProducts.length > 0 ? (
            <ProductGrid products={paginatedProducts} />
          ) : (
            <div className={styles.emptyState}>
              {/* Empty state animation */}
              <div className={styles.emptyAnimation}>
                <div className={styles.emptyBox}></div>
                <div className={styles.emptyPulse}></div>
              </div>
              
              <div className={styles.emptyContent}>
                <h3 className={styles.emptyTitle}>
                  No {conditionFilter.toLowerCase()} products found
                </h3>
                <p className={styles.emptyDescription}>
                  Try adjusting your filters or check back later for new arrivals.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <nav className={styles.pagination} aria-label="Pagination">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(validCurrentPage - 1)}
                disabled={validCurrentPage === 1}
                className={`${styles.paginationButton} ${validCurrentPage === 1 ? styles.paginationDisabled : ''}`}
                aria-label="Previous page"
              >
                ← Prev
              </button>

              {/* Page Numbers */}
              <div className={styles.pageNumber}>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 7) {
                    pageNumber = i + 1;
                  } else {
                    if (validCurrentPage <= 4) {
                      pageNumber = i + 1;
                    } else if (validCurrentPage >= totalPages - 3) {
                      pageNumber = totalPages - 6 + i;
                    } else {
                      pageNumber = validCurrentPage - 3 + i;
                    }
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`${styles.pageButton} ${pageNumber === validCurrentPage ? styles.pageActive : ''}`}
                      aria-label={`Go to page ${pageNumber}`}
                      aria-current={pageNumber === validCurrentPage ? "page" : undefined}
                    >
                      {pageNumber === validCurrentPage && (
                        <div className={styles.pageActiveCorner}></div>
                      )}
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(validCurrentPage + 1)}
                disabled={validCurrentPage === totalPages}
                className={`${styles.paginationButton} ${validCurrentPage === totalPages ? styles.paginationDisabled : ''}`}
                aria-label="Next page"
              >
                Next →
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Background decorative elements */}
      <div className={styles.backgroundOrbs}>
        {/* Floating orbs */}
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={styles.backgroundOrb}
            style={{
              left: `${20 + i * 20}%`,
              top: `${10 + i * 15}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${8 + i * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}