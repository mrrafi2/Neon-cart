// this component renders the user avatar button and profile overlay (with logout dialog) in a slick, animated UI.

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../style/account.module.css";

export default function Account() {
  const { currentUser, logout } = useAuth();
  const [showAccountOverlay, setShowAccountOverlay] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    currentUser?.displayName || "User"

  
  const [editedAvatarIcon, setEditedAvatarIcon] = useState(null);
  const [customAvatarBgColor, setCustomAvatarBgColor] = useState("");

    // Calculate display name & initials
   const displayName = currentUser?.displayName || "User";
  let storedAvatarIcon = null;
  let storedAvatarBgColor = "";
  if (currentUser?.photoURL) {
    try {
      const data = JSON.parse(currentUser.photoURL);
      storedAvatarIcon = data.avatarIcon;
      storedAvatarBgColor = data.avatarBgColor;
    } catch (e) {
      //  error tracking
    console.error("Failed to parse avatar JSON:", e);
    }
  }

  useEffect(() => {
    if (currentUser?.photoURL) {
      try {
        const data = JSON.parse(currentUser.photoURL);
        setEditedAvatarIcon(data.avatarIcon || null);
        setCustomAvatarBgColor(data.avatarBgColor || "");
      } catch (e) {
        console.error("Error parsing photoURL : ",e);
      }
    }
  }, [currentUser]);

  const defaultStringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  //finally pick a  background color for each user, based on their name
  const avatarBgColor =
    customAvatarBgColor || storedAvatarBgColor || defaultStringToColor(displayName);
    const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join("");

    const portalRoot = document.getElementById("cart-root");
  if (!portalRoot) {
    console.error(" No cart-root found for portal!");
    return null;
  }

  
  const handleLogout = async () => {
    await logout();
    setShowAccountOverlay(false);
    setShowLogoutDialog(false);
  };

  // account overlay open when user cliks on account icon
   const accountOverlay = (
    <AnimatePresence>
      {showAccountOverlay && (
        <motion.div
          className={styles.fullOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.accountOverlay}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <button
              className={styles.overlayCloseButton}
              onClick={() => setShowAccountOverlay(false)}
            >
              ×
            </button>

            <h4 className={styles.accountName}>
              {displayName}
              </h4>

            <p className={styles.accountEmail}>
              {currentUser.email}
              </p>

            {currentUser.phoneNumber  && 
            <p className={styles.accountDetail}>
              Phone:{currentUser.phoneNumber}
              </p>
              }

          { currentUser.gender &&
           <p className={styles.accountDetail}>
            Gender: {currentUser.gender}
            </p>
            }

            <div className={styles.buttonGroup}>

              <button
                className={styles.futuristicButton}
                onClick={() => setShowLogoutDialog(true)}
              >
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // logout dialog is for confirming logout
  // logout dialog open when user clicks on logout button 
  const logoutDialog = (
    <AnimatePresence>
      {showLogoutDialog && (
        <motion.div
          className={styles.fullOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.logoutDialog}
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <p>Do you really want to logout?</p>
            <div className={styles.dialogButtons}>
              <button
                className={styles.futuristicButton}
                onClick={handleLogout}
              >
                Yes
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowLogoutDialog(false)}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={styles.accountContainer}>
      <div className={styles.accountIconWrapper}>

        {currentUser ? (

          <div
            className={styles.accountIcon}
            title={displayName}
            style={{ backgroundColor: avatarBgColor }}
            onClick={() => setShowAccountOverlay(!showAccountOverlay)}
          >

            {editedAvatarIcon || storedAvatarIcon ? (
              <i className={editedAvatarIcon || storedAvatarIcon}></i>
            ) : (
              initials
            )}
          </div>
        ) : (
          <>
           
            <Link to="/login" className={styles.authLink}>
            <i className="fa-solid fa-user"></i>
            </Link>
          </>
        )}
      </div>

      {createPortal(accountOverlay, portalRoot)}
      {createPortal(logoutDialog,   portalRoot)}

    </div>
  );
}
