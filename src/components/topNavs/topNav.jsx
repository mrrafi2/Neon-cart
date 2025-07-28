// this is the site-wide top navigation bar. Handles features like help, About, Contact, Notifications,
// and dynamic seller actions (e.g., Sell, Become a Seller) depending on user state.

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaQuestionCircle, 
  FaPhone, 
  FaGlobe, 
  FaBell,
  FaInfoCircle, 
} from "react-icons/fa";
import { FiMoreHorizontal } from 'react-icons/fi';
import { FaStore } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { ref } from "firebase/database";
import { db } from "../../firebaseInit/firebase";
import { useObjectVal } from "react-firebase-hooks/database";
import SellerApply from "../common/sellerApply";
import { createPortal } from "react-dom" ;
import styles from "../style/topNav.module.css";


export default function TopNav() {

  const { currentUser, isSeller } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showSellOverlay, setShowSellOverlay] = useState(false);

  

  const handleSellClick = () => {
    setShowSellOverlay(true);
  };

    //  could be moved to AuthContext to avoid repeating seller logic in every component
   const sellerRef = currentUser
  ? ref(db, `users/${currentUser.uid}/seller`)
  : null

const [sellerData] = useObjectVal(sellerRef);

  //  Show overlay then redirect after a short delay
  useEffect(() => {
    let timer;
    if (showSellOverlay) {
      timer = setTimeout(() => {
        setShowSellOverlay(false);
        navigate("/sell");
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [showSellOverlay, navigate]);

   const portalRoot = typeof document !== "undefined"
   ? document.getElementById("cart-root")
   : null;


   //  don't show nav on certain pages
  const hiddenRoutes = ["/seller-apply"];
  if (hiddenRoutes.includes(location.pathname)) return null;


  const navItems = [
    { icon: <FaQuestionCircle size={15} />, label: "Help", link: "/help" },
    { icon: <FaPhone size={15} />, label: "Contact", link: "/contact" },
     { icon: <FaBell   size={15} />, label: "Notifications", link: "/"},
    { icon: <FaInfoCircle size={15} />, label: "About", link: "/about" },
  ];


  return (
    <>
       <>

      <div className={styles.sellerSection}>
      

        {currentUser ? (
          sellerData?.profile?.businessName && sellerData?.profile?.address && sellerData?.profile?.taxId ?  (
        <>
              <Link to="/seller-dashboard" className={styles.sellLink}>
                <FaStore />
              </Link>
              <button
                className={styles.sellButton}
                onClick={() => navigate("/sell")}
              >
                Sell
              </button>
            </>
          ) : (
            <button
              className={styles.sellButton}
             onClick={() => navigate("/seller-apply")}
            >
              Become a Seller
            </button>
          )
          
        ):  (
          <Link to="/login" className={styles.sellLink}>Login to sell</Link>
        )}
      </div>

      
    </>
    
      <div className={styles.topnavContainer}>
        {navItems.map((item, index) => (
          <div key={index} className={styles.navItem}>
            <Link to={item.link || "#"} className={styles.navButton}>
              {item.icon}
            </Link>
            <div className={styles.tooltip}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Mobile Navigation Toggle */}
      <FiMoreHorizontal
       size={33}
        className={styles.mobileMenuIcon}
        onClick={() => setShowMobileNav(true)}
      />

      {/* Mobile Overlay */}
      <div className={`${styles.mobileOverlay} ${showMobileNav ? styles.show : ""}`}>
        <button
          className={styles.closeButton}
          onClick={() => setShowMobileNav(false)}
        >
          ×
        </button>

        <div className={styles.mobileNavCard}>
          {navItems.map((item, index) => (
            <div key={index} className={styles.mobileNavItem}>
              <Link to={item.link || "#"} className={styles.mobileNavButton}>
                {item.icon}
              </Link>
            </div>
          ))}
        </div>
      </div>

     {showSellOverlay && portalRoot && createPortal(
       <div className={styles.sellOverlay}>
         <p>
           Give your product amazing details and a great image to attract buyers!
          </p>
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar}></div>
          </div>
        </div>,
        portalRoot
      )}
    </>
  );
}