import React from "react";
import { Link } from "react-router-dom";
import img from "../../image/logo.jfif";
import styles from "../style/logo.module.css"; 

const Logo = () => {
  return (
    <div className={styles.logoContainer}>
      <Link to="/" className={styles.logoLink}>
        <div className={styles.logoWrapper}>
          <img src={img} alt="Logo" className={styles.logoImg} />
          <div className={styles.logoGlow}></div>
          <div className={styles.logoCircuit}></div>
          
          {/* Animated particles */}
          <div className={styles.particles}>
            <span className={styles.particle}></span>
            <span className={styles.particle}></span>
            <span className={styles.particle}></span>
            <span className={styles.particle}></span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Logo;