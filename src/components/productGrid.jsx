import React, { useState } from "react";
import ProductCard from "./productCard";
import styles from "./style/productGrid.module.css";

export default function ProductGrid({ products }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    console.log("Selected Product:", product);
  };

  if (!products || products.length === 0) {
    return <p className={styles.noProducts}>No products available.</p>;
  }

  return (
    <div className={styles.gridContainer}>
      {products.map((product, idx) => (
        <div
          key={product.id || product.name}
          className={styles.gridItem}
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <ProductCard
            product={product}
            onProductSelect={handleProductSelect}
          />
        </div>
      ))}

      {selectedProduct && (
        <div className={styles.selectedProduct}>
          <h3>Selected Product:</h3>
          <p>{selectedProduct.name}</p>
          <p>৳ {selectedProduct.price}</p>
        </div>
      )}
    </div>
  );
}