//Renders product listings with sorting, filtering, pagination, and category offcanvas.
// TODO: consider breaking into multiple component and server-side filtering and pagination for large catalogs.
// TIP: debounce search input to reduce unnecessary re-renders.

import React, { useState, useEffect, useRef } from "react";
import ProductGrid from "./productGrid";
import Category from "./category";
import { getDatabase, ref, get } from "firebase/database";
import { useParams } from "react-router-dom";
import {fetchProducts as fetchAllProducts} from "../../data/fetchProductData"
import LoadingSpinner from "../common/loading";
import SearchBar from "../search/search";
import styles from "../style/products.module.css";

export default function Products ({ initialProducts }) {

  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [conditionFilter, setConditionFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryOffcanvas, setShowCategoryOffcanvas] = useState(false);
   const [sortBy, setSortBy] = useState("newest");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const scrollContainer = useRef(null);

  const pageSize = 18;

  const { category, subcategory } = useParams();

    // compute product rating on demand
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

  // fetch all products + enrich with ratings & counts
  const fetchProducts = async ( ) => {
    try {
      let all = await fetchAllProducts();

      if (category && subcategory) {
        all = all.filter(p => p.category === category && p.subcategory === subcategory);
     }
     const db = getDatabase();
     const enriched = await Promise.all(
       all.map (async (p) => {
         const avg = await fetchAverageRating(p.id);
         const snap = await get(ref(db, `reviews/${p.id}`));
         const count = snap.exists() ? Object.values(snap.val()).length : 0;
          return { ...p, rating: avg, reviewCount: count };
        } )
      );
      setProducts(enriched);
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }


  useEffect(( ) => {
    fetchProducts();
  }, [category, subcategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [conditionFilter]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    const onScroll = () => {
      if (window.pageYOffset > 300) setShowScroll(true);
      else setShowScroll(false);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  let displayed = [...products];
  switch (sortBy) {

    case "newest":
      displayed.sort( (a,b) => new Date(b.createdAt) - new Date(a.createdAt) );

      break;

    case "popular":

      displayed.sort( (a,b) => (b.rating||0)*(b.reviewCount||0) - (a.rating||0)*(a.reviewCount||0)) ;

      break;

    case "priceLow":
      displayed.sort( (a,b) => a.price - b.price );

      break;

    case "priceHigh":
      displayed.sort( (a,b) => b.price - a.price );

      break;

    case "used":
      displayed = displayed.filter( p => p.condition === "Used" );

      break;

    default:
      break;
  }


  const totalProducts = displayed.length
const totalPages    = Math.ceil(totalProducts / pageSize)
 const validPage     = Math.min(currentPage, totalPages || 1);
const startIndex    = (validPage - 1) * pageSize
const endIndex      = startIndex + pageSize

const paginatedProducts = displayed.slice(startIndex, endIndex) 

const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages) {
    setCurrentPage(page)
  }
};

  

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
            <button p
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
              <span>Page {validPage} of {totalPages || 1}</span>
          </div>
        </div>
           {/* Search Row */}
                    <div className={styles.searchRow}>
                        <div className={styles.searchContainer}>
                            <SearchBar />
                        </div>
                    </div>
        
        <div className={styles.sortContainer}>
        <button
          className={styles.sortToggle}
          onClick={() => setDropdownOpen(o => !o)}
          aria-expanded={dropdownOpen}
          aria-label="Sort products"
        >
          Sort: {(() => {
            const map = {
              newest: "Newest",
              popular: "Popular",
              priceLow: "Price ↑",
              priceHigh: "Price ↓",
              used: "Used Only"
            };
            return map[sortBy];
          })()}
          <span className={styles.arrow}>{dropdownOpen ? "▲" : "▼"}</span>
        </button>
        
        {dropdownOpen && (
          <ul className={styles.sortMenu}>
            {[
              ["newest","Newest"],
              ["popular","Popular"],
              ["priceLow","Price: Low→High"],
              ["priceHigh","Price: High→Low"],
              ["used","Used Only"]
            ].map(([value,label]) => (
              <li key={value}>
                <button
                  className={styles.sortItem}
                  onClick={() => {
                    setSortBy(value);
                    setDropdownOpen(false);
                  }}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showScroll && (
        <button
          className={styles.scrollTop}
          onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}

        {/* Product Grid */}
        <div className={styles.gridSection}>
          {paginatedProducts.length > 0 ? (
            <ProductGrid products={paginatedProducts} />
          ) : (
            <div className={styles.emptyState}>
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

        {/* pagination */}
        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <nav className={styles.pagination} aria-label="Pagination">

                {/* previous Button */}
              <button
               onClick={() => handlePageChange(validPage - 1)}
               disabled={validPage === 1}
               className={`${styles.paginationButton} ${
                 validPage === 1 ? styles.paginationDisabled : ""
               }`}
               aria-label="Previous page"
             >
               ← Prev
             </button>

              {/* page Numbers */}
              <div className={styles.pageNumber}>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 7) {
                    pageNumber = i + 1;
                  } else {
                    if (validPage <= 4) {
                      pageNumber = i + 1;
                    } else if (validPage >= totalPages - 3) {
                      pageNumber = totalPages - 6 + i;
                    } else {
                      pageNumber = validPage - 3 + i;
                    }
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`${styles.pageButton} ${pageNumber === validPage ? styles.pageActive : ''}`}
                      aria-label={`Go to page ${pageNumber}`}
                      aria-current={pageNumber === validPage ? "page" : undefined}
                    >
                      {pageNumber === validPage && (
                        <div className={styles.pageActiveCorner}></div>
                      )}
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              {/* next Button */}
              <button
                onClick={() => handlePageChange(validPage + 1)}
                disabled={validPage === totalPages}
                className={`${styles.paginationButton} ${validPage === totalPages ? styles.paginationDisabled : ''}`}
                aria-label="Next page"
              >
                Next →
              </button>
            </nav>
          </div>
        )}
      </div>

{/* background decorations */}
      <div className={styles.backgroundOrbs}>
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