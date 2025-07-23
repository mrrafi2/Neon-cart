import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update, remove, query, orderByChild } from "firebase/database";
import { useAuth } from "../../contexts/AuthContext";
import styles from "../style/seller.module.css";
import LoadingSpinner from "../common/loading";

export default function SellerDashboard() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStates, setEditStates] = useState({});

  useEffect(() => {
    if (!currentUser) return;
    const db = getDatabase();
    const productsRef = ref(db, "products");

   
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allProducts = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        
        const sellerProducts = allProducts.filter(
          (prod) => prod.userId === currentUser.uid
        );
        setProducts(sellerProducts);

        // Initialize edit states for each product if not already set
        const newEditStates = {};
        sellerProducts.forEach((prod) => {
          newEditStates[prod.id] = {
            editingStock: false,
            stock: prod.stock || 0,
            editingDiscount: false,
            discount: prod.discountPercentage || 0,
          };
        });
        setEditStates(newEditStates);
      } else {
        setProducts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // --- STOCK HANDLERS ---
  const toggleEditStock = (productId) => {
    setEditStates((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], editingStock: !prev[productId].editingStock },
    }));
  };

  const handleStockChange = (productId, newStock) => {
    setEditStates((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], stock: newStock },
    }));
  };

  const saveStock = async (productId) => {
    const newStock = editStates[productId].stock;
    const db = getDatabase();
    const productRef = ref(db, `products/${productId}`);
    try {
      await update(productRef, { stock: newStock });
      setEditStates((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], editingStock: false },
      }));
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  // --- DISCOUNT HANDLERS ---
  const toggleEditDiscount = (productId) => {
    setEditStates((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], editingDiscount: !prev[productId].editingDiscount },
    }));
  };

  const handleDiscountChange = (productId, newDiscount) => {
    setEditStates((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], discount: newDiscount },
    }));
  };

  const saveDiscount = async (productId, originalPrice) => {
    const discount = parseFloat(editStates[productId].discount);
    // Calculate new price: discountPercentage applied (rounded to whole number)
    const discountedPrice = originalPrice * (1 - discount / 100);
    const db = getDatabase();
    const productRef = ref(db, `products/${productId}`);
    try {
      await update(productRef, {
        discountPercentage: discount,
        price: Math.round(discountedPrice),
      });
      setEditStates((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], editingDiscount: false },
      }));
    } catch (error) {
      console.error("Error updating discount:", error);
    }
  };

  // --- REMOVE PRODUCT HANDLER ---
  const removeProduct = async (productId) => {
    if (window.confirm("Are you sure you want to remove this product?")) {
      const db = getDatabase();
      const productRef = ref(db, `products/${productId}`);
      try {
        await remove(productRef);
        // Optionally, update local state to remove the product immediately
        setProducts((prev) => prev.filter((prod) => prod.id !== productId));
      } catch (error) {
        console.error("Error removing product:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.heading}>
            <span className={styles.headingIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
                <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
                <path d="M12 3v6"></path>
              </svg>
            </span>
            My Store Dashboard
          </h1>
          <div className={styles.storeStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{products.length}</span>
              <span className={styles.statLabel}>Products</span>
            </div>
            
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {products.filter(prod => prod.discountPercentage > 0).length}
              </span>
              <span className={styles.statLabel}>On Sale</span>
            </div>
          </div>
        </div>
        <div className={styles.headerLine}></div>
      </div>

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
              <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
              <path d="M12 3v6"></path>
            </svg>
          </div>
          <h2>No Products Found</h2>
          <p>You haven't added any products to your store yet. Start selling by adding your first product!</p>
        </div>
      ) : (
        <div className={styles.productGrid}>
          {products.map((prod, index) => (
            <div 
              key={prod.id} 
              className={styles.productCard}
              style={{ '--card-index': index }}
            >
              <div className={styles.productImageWrapper}>
                <img 
                  src={prod.imageUrl} 
                  alt={prod.title} 
                  className={styles.productImage}
                  loading="lazy"
                />
                <div className={styles.productBadges}>
                  {prod.discountPercentage > 0 && (
                    <span className={styles.discountBadge}>
                      -{prod.discountPercentage}%
                    </span>
                  )}
                  {(prod.stock || 0) === 0 && (
                    <span className={styles.outOfStockBadge}>
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.productContent}>
                <div className={styles.productInfo}>
                  <h3 className={styles.productTitle}>{prod.title}</h3>
                  <div className={styles.productMeta}>
                    <span className={styles.productPrice}>৳{prod.price}</span>
                    <span className={styles.productCategory}>{prod.category}</span>
                  </div>
                </div>

                <div className={styles.productActions}>
                  <div className={styles.actionGroup}>
                    <label className={styles.actionLabel}>
                      <span className={styles.labelIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                      </span>
                      Stock Management
                    </label>
                    {editStates[prod.id]?.editingStock ? (
                      <div className={styles.editGroup}>
                        <input
                          type="number"
                          value={editStates[prod.id].stock}
                          onChange={(e) => handleStockChange(prod.id, e.target.value)}
                          className={styles.editInput}
                          min="0"
                          placeholder="Stock quantity"
                        />
                        <div className={styles.editButtons}>
                          <button
                            onClick={() => saveStock(prod.id)}
                            className={styles.saveButton}
                            aria-label="Save stock"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20,6 9,17 4,12"></polyline>
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleEditStock(prod.id)}
                            className={styles.cancelButton}
                            aria-label="Cancel edit"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleEditStock(prod.id)}
                        className={styles.actionButton}
                      >
                        <span className={styles.buttonIcon}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"></path>
                          </svg>
                        </span>
                        <span className={styles.buttonText}>
                          Stock: {editStates[prod.id]?.stock || 0}
                        </span>
                        <span className={styles.editIcon}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </span>
                      </button>
                    )}
                  </div>

                  <div className={styles.actionGroup}>
                    <label className={styles.actionLabel}>
                      <span className={styles.labelIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                      </span>
                      Discount Offers
                    </label>
                    {editStates[prod.id]?.editingDiscount ? (
                      <div className={styles.editGroup}>
                        <select
                          value={editStates[prod.id].discount}
                          onChange={(e) => handleDiscountChange(prod.id, e.target.value)}
                          className={styles.editSelect}
                        >
                          <option value="0">No Discount</option>
                          <option value="5">5% Off</option>
                          <option value="8">8% Off</option>
                          <option value="10">10% Off</option>
                          <option value="15">15% Off</option>
                          <option value="20">20% Off</option>
                          <option value="22">22% Off</option>
                          <option value="25">25% Off</option>
                          <option value="30">30% Off</option>
                        </select>
                        <div className={styles.editButtons}>
                          <button
                            onClick={() => saveDiscount(prod.id, parseFloat(prod.price))}
                            className={styles.saveButton}
                            aria-label="Save discount"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20,6 9,17 4,12"></polyline>
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleEditDiscount(prod.id)}
                            className={styles.cancelButton}
                            aria-label="Cancel edit"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleEditDiscount(prod.id)}
                        className={styles.actionButton}
                      >
                        <span className={styles.buttonIcon}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                          </svg>
                        </span>
                        <span className={styles.buttonText}>
                          {editStates[prod.id]?.discount ? `${editStates[prod.id].discount}% Off` : 'No Discount'}
                        </span>
                        <span className={styles.editIcon}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.productFooter}>
                  <button
                    onClick={() => removeProduct(prod.id)}
                    className={styles.deleteButton}
                  >
                    <span className={styles.deleteIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </span>
                    Remove Product
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}