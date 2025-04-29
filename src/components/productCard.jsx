import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaInfoCircle, FaStar, FaStarHalfAlt } from "react-icons/fa";
import styles from "./style/productCard.module.css";
import { getDatabase, ref, onValue } from "firebase/database";

export default function ProductCard({ product = {}, onProductSelect }) {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);

  // Destructure product properties with defaults
  const {
    id,
    imageUrl = "",
    title = "Unknown Product",
    price = "N/A",
    type = "Unknown",
    discountPercentage = 0,
  } = product;

  useEffect(() => {
    if (!id) return;
    const db = getDatabase();
    const reviewsRef = ref(db, `reviews/${id}`);
    const unsubscribe = onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      setReviews(data ? Object.values(data) : []);
    });
    return () => unsubscribe();
  }, [id]);

  // IntersectionObserver for staggered entrance
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
      : 0;

  // Preserve original star coloring logic
  const totalStars = 5;
  const stars = Array.from({ length: totalStars }, (_, i) => {
    const starNumber = i + 1;
    if (averageRating >= starNumber) {
      return <FaStar key={i} color="#ffc107" size={16} />;
    } else if (averageRating >= starNumber - 0.5) {
      return <FaStarHalfAlt key={i} color="#ffc107" size={16} />;
    } else {
      return <FaStar key={i} color="#444" size={16} />;
    }
  });

  const handleCardClick = () => {
    if (onProductSelect) onProductSelect(product);
    navigate(`/product/${id}`, { state: { product } });
  };

  const handleExpand = (e) => {
    e.stopPropagation();
    setExpanded((p) => !p);
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${visible ? styles.visible : ""} ${
        expanded ? styles.expanded : ""
      }`}
      onClick={handleCardClick}
    >
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={title} className={styles.productImage} />
        <FaInfoCircle
          className={styles.infoIcon}
          size={18}
          onClick={handleExpand}
        />
        <div className={styles.shadow}></div>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.productName}>{title}</h3>
        <p className={styles.type}>Type: {type}</p>
        <div className={styles.priceRow}>
          <p className={styles.productPrice}>
            {price} <span>৳</span>
          </p>
          {discountPercentage > 0 && (
            <p className={styles.discount}>{discountPercentage}% Off</p>
          )}
        </div>
        <div className={styles.ratingSection}>
          {stars}
          <span className={styles.ratingText}>
            {averageRating ? averageRating.toFixed(1) : "0.0"}
          </span>
        </div>
      </div>
    </div>
  );
}