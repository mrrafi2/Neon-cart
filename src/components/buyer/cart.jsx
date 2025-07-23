import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";      
import { FaShoppingCart, FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  useCart,
  useCartDispatch,
  removeItem,
  updateQty
} from "../../contexts/CartContext";
import styles from "../style/cart.module.css";

export default function CartDropdown() {
  const cart = useCart();
  const dispatch = useCartDispatch();
  const [open, setOpen] = useState(false);
  const [animatingItems, setAnimatingItems] = useState(new Set());
  const wrapperRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleQuantityChange = (itemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setAnimatingItems(prev => new Set([...prev, itemId]));
    dispatch(updateQty(itemId, newQty));
    setTimeout(() => {
      setAnimatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 300);
  };

  const handleRemoveItem = (itemId) => {
    setAnimatingItems(prev => new Set([...prev, itemId]));
    setTimeout(() => {
      dispatch(removeItem(itemId));
      setAnimatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 300);
  };

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const portalRoot = document.getElementById("cart-root");
  if (!portalRoot) return null; 

  const dropdownJSX = (
    <div ref={wrapperRef} className={styles.portalWrapper}>
      {/* Cart Icon Button */}
      <button
        className={styles.iconButton}
        onClick={() => setOpen(v => !v)}
        aria-label="Toggle cart dropdown"
      >
        <div className={styles.iconContainer}>
          <FaShoppingCart size={20} />
          <div className={styles.iconGlow}></div>
          
          {/* Animated particles around cart */}
          <div className={styles.particles}>
            <span className={styles.particle}></span>
            <span className={styles.particle}></span>
            <span className={styles.particle}></span>
          </div>
        </div>
        
        {totalItems > 0 && (
          <span className={styles.badge}>
            {totalItems}
            <div className={styles.badgePulse}></div>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3>Shopping Cart</h3>
            <div className={styles.headerDecoration}></div>
          </div>

          {cart.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FaShoppingCart size={40} />
                <div className={styles.emptyGlow}></div>
              </div>
              <p>Your cart is empty</p>
              <span>Add some items to get started</span>
            </div>
          ) : (
            <>
              <ul className={styles.itemsList}>
                {cart.map(item => (
                  <li 
                    key={item.id} 
                    className={`${styles.item} ${animatingItems.has(item.id) ? styles.itemAnimating : ''}`}
                  >
                    <div className={styles.itemImage}>
                      <img src={item.imageUrl} alt={item.title} />
                      <div className={styles.imageOverlay}></div>
                    </div>
                    
                    <div className={styles.itemDetails}>
                      <h4 className={styles.itemTitle}>{item.title}</h4>

                      <p className={styles.itemPrice}>৳{item.price.toFixed(2)}</p>
                      
                      <div className={styles.quantityControls}>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className={styles.qtyButton}
                          aria-label="Decrease quantity"
                        >
                          <FaMinus size={10} />
                        </button>
                        
                        <span className={styles.quantity}>{item.quantity}</span>
                        
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className={styles.qtyButton}
                          aria-label="Increase quantity"
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className={styles.removeButton}
                      aria-label="Remove item"
                    >
                      <FaTrash size={12} />
                      <div className={styles.removeGlow}></div>
                    </button>
                  </li>
                ))}
              </ul>

              <div className={styles.footer}>
                <div className={styles.totalSection}>
                  <span className={styles.totalLabel}>Total:</span>
                  <span className={styles.totalPrice}>৳{totalPrice.toFixed(2)}</span>
                  <div className={styles.totalGlow}></div>
                </div>
                
                <button 
                  className={styles.checkoutButton}
                  onClick={() => {
                    setOpen(false);
                    navigate("/buy", { state: { cart } });
                  }}
                >
                  <span>Checkout</span>
                  <div className={styles.checkoutGlow}></div>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  return createPortal(dropdownJSX, portalRoot);
}