import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../style/category.module.css";
import { h2 } from "framer-motion/client";

const categoryData = {
  Electronics: [
    "Desktop Computers",
    "Laptops",
    "Mobile Phones",
    "Televisions",
    "Cameras",
    "Headphones",
    "Smart Watch",
  ],
  "Men's Clothing": [
    "T-Shirt & Shirt",
    "Panjabi",
    "Jubba",
    "Pants",
    "Lungi",
    "Jacket",
    "Coat",
    "Tie",
    "Cap",
  ],
  "Women's Clothing": [
    "Hijab",
    "Three Piece",
    "Saree",
    "Shalwar Khameez",
    "Skirts",
    "Burqa",
  ],
  Vehicles: ["Motorcycles", "Bicycles"],
  Sports: [
    "Jersey",
    "Football",
    "Cricket Bats",
    "Cricket Balls",
    "Tennis Balls",
    "Boots",
    "Helmets",
    "Racket",
  ],
};

export default function Category({ onCategorySelect }) {
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState({});

const toggleCategory = (category) => {
  setExpandedCategories(prev => ({
    ...prev,
    [category]: !prev[category],
  }));
};


const handleSubcategoryClick = (category, subcategory) => {
  
  navigate(
    `/products/${encodeURIComponent(category)}/${encodeURIComponent(subcategory)}`
  );

  if (onCategorySelect) {
    onCategorySelect();
  }
};

  return (
    <div className={styles.categoryWrapper}>
      <div className={styles.categoryContainer}>
        {Object.keys(categoryData).map((category, index) => (
          <div 
            key={category} 
            className={styles.categoryItem}
            style={{ '--animation-delay': `${index * 0.1}s` }}
          >
            <button
              className={styles.categoryButton}
              onClick={() => toggleCategory(category)}
              aria-expanded={expandedCategories[category]}
              aria-controls={`subcategory-${category.replace(/\s+/g, '-')}`}
            >
              <span className={styles.categoryText}>{category}</span>
              <span className={styles.expandIcon}>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className={expandedCategories[category] ? styles.rotated : ''}
                >
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </span>
            </button>
            
            <div 
              className={`${styles.subcategoryWrapper} ${expandedCategories[category] ? styles.expanded : ''}`}
              id={`subcategory-${category.replace(/\s+/g, '-')}`}
            >
              <ul className={styles.subcategoryList} role="list">
                {categoryData[category].map((sub, subIndex) => (
                  <li 
                    key={sub} 
                    className={styles.subcategoryItem}
                    style={{ '--sub-animation-delay': `${subIndex * 0.05}s` }}
                  >
                    <button
                      className={styles.subcategoryButton}
                      onClick={() => handleSubcategoryClick(category, sub)}
                    >
                      <span className={styles.subcategoryIcon}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m9 18 6-6-6-6"></path>
                        </svg>
                      </span>
                      <span className={styles.subcategoryText}>{sub}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}