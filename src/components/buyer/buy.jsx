//  A compinents to handles the checkout flow: displays cart items or single product, collects shipping info, and sends order via EmailJS. very simple mechanism for my small project

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser"; 
import styles from "../style/buy.module.css";
import locationData from "../../data/locationData.json";

  

export default function BuyNow() {
  const { state } = useLocation();
  const cartItems = state?.cart || [];
  const singleProduct = state?.product || null;
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // ramdom imaginary shipping fee, because free shipping feels like a lie sometimes
    const deliveryCharge = 200;
  
  // Calculate items total, whether it's a multi-item cart or a single buy-now
  const itemsTotal = cartItems.length
    ? cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    : singleProduct
    ? parseFloat(singleProduct.price)
    : 0;
  const totalPrice = itemsTotal + deliveryCharge;


  // Derive dynamic drop-down options from our locationData JSON
  const districts = division ? Object.keys(locationData[division] || {}) : [];
  const areas = division && district ? locationData[division][district] || [] : [];

  useEffect(() => {
    setDistrict("");
    setArea("");
  }, [division]);

  useEffect(() => {
    setArea("");
  }, [district]);


    // submit handler: validate, assemble payload, dispatch EmailJS, handle UI feedback
  const handleSubmit = async (e) => {
    e.preventDefault();

    if ( !fullName || !email || !phone || !division || !district || !area || !address ) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true); 


 const orderItems = cartItems.length
      ? cartItems.map((i) => ({
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          subtotal: i.price * i.quantity,
        }))
      : [
          {
            title: singleProduct.title,
            price: parseFloat(singleProduct.price),
            quantity: 1,
            subtotal: parseFloat(singleProduct.price),
          },
        ];

    const orderDetails = {
      fullName,
      email,
      phone,
      division,
      district,
      area,
      address,
      items: JSON.stringify(orderItems), // stringified because EmailJS loves text blobs
      itemsTotal,
      deliveryCharge,
      totalPrice,
    };

 
    // Send order details via EmailJS for excperiment
    try {
      await emailjs.send(
        "service_u9fpnm2", 
        "template_zjpfw2z", 
        orderDetails,
        "8TxyKYmHmMLYLV52E" // EmailJS public key
      );

      alert("Order submitted successfully!");
      resetForm();
      navigate("/");

    } catch (error) {
      console.error("Failed to send order email:", error);
      alert("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

    // clear the form so the ghosts of past orders don't haunt us
  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setDivision("");
    setDistrict("");
    setArea("");
    setAddress("");
  };

  if ( !cartItems.length && !singleProduct) {
    return (
      <div className={styles.buyContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h2>No items to purchase</h2>
          <p>Your cart is empty. Add some products to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.buyContainer}>

        {/* Page headline with sci-fi vibes */}
      <div className={styles.header}>
        <h1 className={styles.heading}>Review Your Order</h1>
        <div className={styles.headerLine}></div>
      </div>

      <div className={styles.orderContent}>
        <div className={styles.leftSection}>
          <div className={styles.productSummary}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </span>
              Order Summary
        </h2>

      {/* render cart items or single product summary */}
          {cartItems.length > 0 ? (
              <div className={styles.cartList}>
                {cartItems.map((item, index) => (
                  <div key={item.id} className={styles.cartListItem} style={{ '--item-index': index }}>
                    <div className={styles.productImageWrapper}>
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className={styles.productImage}
                        loading="lazy"
                      />
                    </div>
                    <div className={styles.productInfo}>
                      <h3 className={styles.productTitle}>{item.title}</h3>
                      <div className={styles.productDetails}>
                        <span className={styles.productPrice}>৳{item.price.toFixed(2)}</span>
                        <span className={styles.productQuantity}>Qty: {item.quantity}</span>
                        <span className={styles.productSubtotal}>
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            ) : (
              <div className={styles.cartListItem}>
                <div className={styles.productImageWrapper}>
                  <img
                    src={singleProduct.imageUrl}
                    alt={singleProduct.title}
                    className={styles.productImage}
                    loading="lazy"
                  />
                </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productTitle}>{singleProduct.title}</h3>
                  <div className={styles.productDetails}>
                    <span className={styles.productPrice}>৳{parseFloat(singleProduct.price).toFixed(2)}</span>
                    <span className={styles.productQuantity}>Qty: 1</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Buyer & Delivery form start */}
          <form onSubmit={handleSubmit} className={styles.buyForm}>
            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>
                <span className={styles.titleIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                Buyer Information
              </h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name</label>
                  <input 
                    type="text" 
                    className={styles.formInput}
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                    placeholder="Enter your full name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <input 
                    type="email" 
                    className={styles.formInput}
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="Enter your email"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone Number</label>
                  <input 
                    type="tel" 
                    className={styles.formInput}
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>
                <span className={styles.titleIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </span>
                Delivery Information
              </h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Division</label>
                  <select 
                    className={styles.formSelect}
                    value={division} 
                    onChange={(e) => setDivision(e.target.value)} 
                    required
                  >
                    <option value="">Select Division</option>
                    {Object.keys(locationData).map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>
                {division && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>District</label>
                    <select 
                      className={styles.formSelect}
                      value={district} 
                      onChange={(e) => setDistrict(e.target.value)} 
                      required
                    >
                      <option value="">Select District</option>
                      {districts.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {district && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Region</label>
                    <select 
                      className={styles.formSelect}
                      value={area} 
                      onChange={(e) => setArea(e.target.value)} 
                      required
                    >
                      <option value="">Select Region</option>
                      {areas.map((ar) => (
                        <option key={ar} value={ar}>
                          {ar}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.formLabel}>Full Delivery Address</label>
                  <input 
                    type="text" 
                    className={styles.formInput}
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    required 
                    placeholder="House/Apartment No, Street Name, Ward, Area"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

{/* right side (bottom for small screens) price summary & place order */}
        <div className={styles.rightSection}>
          <div className={styles.priceSummary}>
            <h3 className={styles.summaryTitle}>Order Total</h3>
            <div className={styles.summaryContent}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Items Total</span>
                <span className={styles.summaryValue}>৳{itemsTotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Delivery Charge</span>
                <span className={styles.summaryValue}>৳{deliveryCharge.toFixed(2)}</span>
              </div>
              <div className={styles.summaryDivider}></div>
              <div className={styles.summaryRow + ' ' + styles.summaryTotal}>
                <span className={styles.summaryLabel}>Grand Total</span>
                <span className={styles.summaryValue}>৳{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              type="submit" 
              className={styles.submitButton} 
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? <LoadingSpinner /> : (
                <>
                  <span className={styles.buttonText}>Place Order</span>
                  <span className={styles.buttonIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal loader  because a blank screen is for amateurs
const LoadingSpinner = () => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loader}></div>
    </div>
  );
};