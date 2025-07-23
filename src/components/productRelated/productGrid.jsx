import React, { useState } from "react";
import ProductCard from "./productCard";
import styles from "../style/productGrid.module.css";

export default function ProductGrid({ products }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    console.log("Selected Product:", product);
  };

  if (!products || products.length === 0) {
    return (
      <div className={styles.emptyState}>
        {/* Circuit pattern for empty state */}
        <div className={styles.emptyIcon}>
          <div className={styles.emptyIconBorder}></div>
          <div className={styles.emptyIconLines}>
            <div className={styles.emptyLineTop}></div>
            <div className={styles.emptyLineLeft}></div>
            <div className={styles.emptyLineBottom}></div>
            <div className={styles.emptyLineRight}></div>
          </div>
          <div className={styles.emptyIconCenter}></div>
        </div>
        
        <div className={styles.emptyContent}>
          <h3 className={styles.emptyTitle}>
            No Products Available
          </h3>
          <p className={styles.emptyDescription}>
            We're currently updating our inventory. Check back soon for amazing deals!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gridWrapper}>
      {/* Background Circuit Grid */}
      <div className={styles.circuitBackground}>
        <div className={styles.circuitGrid}>
          {Array.from({ length: 96 }, (_, i) => (
            <div
              key={i}
              className={`${styles.circuitCell} ${i % 7 === 0 ? styles.circuitHighlight1 : ''} ${i % 11 === 0 ? styles.circuitHighlight2 : ''}`}
            ></div>
          ))}
        </div>
      </div>

      {/* Main Grid Container */}
      <div className={styles.gridContainer}>
        {products.map((product, idx) => (
          <div
            key={product.id || product.name || idx}
            className={styles.gridItem}
            style={{ 
              animationDelay: `${Math.min(idx * 100, 1000)}ms`
            }}
          >
            <ProductCard
              product={product}
              onProductSelect={handleProductSelect}
            />
          </div>
        ))}
      </div>

      {/* Floating particles effect */}
      <div className={styles.floatingParticles}>
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Selected Product Modal/Preview */}
      {selectedProduct && (
        <div 
          className={styles.modalOverlay}
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Quick Preview
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className={styles.modalCloseButton}
                aria-label="Close preview"
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                className={styles.modalImage}
              />
              
              <div className={styles.modalDetails}>
                <h4 className={styles.modalProductName}>
                  {selectedProduct.title || selectedProduct.name}
                </h4>
                <div className={styles.modalFooter}>
                  <span className={styles.modalPrice}>
                    ৳ {selectedProduct.price}
                  </span>
                  <button className={styles.modalCartButton}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}