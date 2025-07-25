import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaInfoCircle, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { getDatabase, ref, onValue } from "firebase/database";
import styles from "../style/productCard.module.css";
import { useCartDispatch, addItem } from "../../contexts/CartContext"

export default function ProductCard({ product = {}, onProductSelect }) {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const dispatch = useCartDispatch();

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

  const totalStars = 5;
  const stars = Array.from({ length: totalStars }, (_, i) => {
    const starNumber = i + 1;
    if (averageRating >= starNumber) {
      return <FaStar key={i} className={styles.starFilled} size={14} />;
    } else if (averageRating >= starNumber - 0.5) {
      return <FaStarHalfAlt key={i} className={styles.starFilled} size={14} />;
    } else {
      return <FaStar key={i} className={styles.starEmpty} size={14} />;
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



  const handleCartClick = (e) => {
    e.stopPropagation();
    dispatch(addItem({ id, title, price: Number(price), imageUrl }));
  };

  return (
    <article
      ref={cardRef}
      className={`${styles.card} ${visible ? styles.visible : ""} ${expanded ? styles.expanded : ""}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${title}`}
    >
      {/* Circuit Lines Background */}
      <div className={styles.circuitLines}>
        <div className={styles.circuitLineTop}></div>
        <div className={styles.circuitLineLeft}></div>
        <div className={styles.circuitLineBottom}></div>
        <div className={styles.circuitLineRight}></div>
      </div>

      {/* Glow effect overlay */}
      <div className={`${styles.glowOverlay} ${isHovered ? styles.glowActive : ""}`}></div>

      {/* Image Section */}
      <div className={styles.imageContainer}>
        <img 
          src={imageUrl} 
          alt={title}
          className={styles.productImage}
          loading="lazy"
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className={styles.discountBadge}>
            <span className={styles.discountText}>
              {discountPercentage}% OFF
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`${styles.actionButtons} ${(isHovered || expanded) ? styles.actionsVisible : ""}`}>
          <button
            onClick={handleExpand}
            className={styles.infoButton}
            aria-label="More information"
          >
            <FaInfoCircle size={14} />
          </button>
          <button
            onClick={handleCartClick}
            className={styles.cartButton}
            aria-label="Add to cart"
          >
            <FaShoppingCart size={14} />
          </button>
        </div>

        {/* Shimmer effect */}
        <div className={`${styles.shimmer} ${isHovered ? styles.shimmerActive : ""}`}></div>
      </div>

    
      <div className={styles.cardContent}>
       
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>
            {title}
          </h3>
          
          <p className={styles.productType}>
            Type: <span className={styles.typeValue}>{type}</span>
          </p>
        </div>

        
        <div className={styles.ratingContainer}>
          <div className={styles.starsContainer}>
            {stars}
          </div>
          <span className={styles.ratingText}>
            {averageRating ? averageRating.toFixed(1) : "0.0"}
          </span>
          <span className={styles.reviewCount}>
            ({reviews.length})
          </span>
        </div>

        {/* Price Section */}
        <div className={styles.priceContainer}>
          <div className={styles.priceInfo}>
            <span className={styles.currentPrice}>
              ৳{price}
            </span>
            {discountPercentage > 0 && (
              <span className={styles.originalPrice}>
                ৳{Math.round(price * (1 + discountPercentage / 100))}
              </span>
            )}
          </div>
          
          {/* Floating buy button */}
          <button
            onClick={() => navigate("/buy", { state: { product } })}
            className={styles.buyButton}
          >
            Buy Now
          </button>
        </div>

        {/* Expanded Content */}
        <div className={`${styles.expandedContent} ${expanded ? styles.expandedVisible : ""}`}>
          <div className={styles.expandedDetails}>
            <p className={styles.expandedText}>Click the card to get more details about this product...</p>
            <div className={styles.productTags}>
              <span className={styles.tag}>
                {type}
              </span>
              {discountPercentage > 0 && (
                <span className={styles.saleTag}>
                  Sale
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.accentTopLeft}></div>
      <div className={styles.accentBottomRight}></div>
    </article>
  );
}