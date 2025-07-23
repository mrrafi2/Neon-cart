import React, { useState, useEffect } from "react";
import Logo from "./logo";
import SearchBar from "../search/search";
import TopSection from "../topNavs/tops";
import CartDropdown from "../buyer/cart";
import styles from "../style/header.module.css";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            setIsScrolled(currentScrollY > 50);
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <>
            <div id="cart-root"></div>
            
            <header 
                className={`${styles.headerContainer} ${isScrolled ? styles.scrolled : ''} ${isVisible ? styles.visible : styles.hidden}`}
            >
                <div className={styles.headerBackground}>
                    <div className={styles.circuitPattern}></div>
                    <div className={styles.glowEffect}></div>
                    <div className={styles.particles}>
                        <span className={styles.particle}></span>
                        <span className={styles.particle}></span>
                        <span className={styles.particle}></span>
                        <span className={styles.particle}></span>
                        <span className={styles.particle}></span>
                    </div>
                </div>

                <div className={styles.headerContent}>
                    <div className={styles.topRow}>
                        <div className={styles.logoContainer}>
                            <Logo />
                        </div>
                        
                        <div className={styles.topSection}>
                            <TopSection />
                        </div>
                        
                        <div className={styles.cartContainer}>
                            <CartDropdown />
                        </div>
                    </div>

                  
                </div>
            </header>
        </>
    );
}