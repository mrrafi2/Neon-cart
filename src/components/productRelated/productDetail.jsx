// shows full product info and handle rating and reviews
// also handle buy now/add to cart action
// also shows related products at bottom
// NOTE: this component is beefy. Might need splitting into subcomponents soon.
// TODO: consider server-side rendering or caching for faster initial load.


import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaStar, FaHeart, FaTrash, FaStarHalfAlt, FaShoppingCart } from "react-icons/fa";
import { ref, push, onValue, remove, update, get } from "firebase/database";
import { db } from "../../firebaseInit/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useCartDispatch, addItem } from "../../contexts/CartContext"; 
import styles from "../style/detail.module.css";

export default function ProductDetail() {
  const { state } = useLocation();
  const product = state?.product;
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const dispatch = useCartDispatch(); 

  
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [showBuyOverlay, setShowBuyOverlay] = useState(false);
  const [showImageOverlay, setShowImageOverlay] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [dragY, setDragY] = useState(0);
  const touchStartY = useRef(0);

  const handleOverlayClick = () => {
    if (Math.abs(dragY) < 10) {
      setShowImageOverlay(false);
    }
  };

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const productsRef = ref(db, "products");
        const snapshot = await get(productsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          let productsArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          const related = productsArray.filter((p) => 
            (p.category === product.category ||
             p.subcategory === product.subcategory ||
             p.type === product.type) &&
            p.id !== product.id 
          );

          setRelatedProducts(related.slice(0, 8)); 
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
      }
    };

    if (product?.id) {
      fetchRelatedProducts();
    }
  }, [product]);

  useEffect(() => {
    const reviewsRef = ref(db, `reviews/${product.id}`);
    const unsubscribe = onValue(reviewsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const reviewArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setReviews(reviewArray);
      } else {
        setReviews([]);
      }
    });
    return () => unsubscribe();
  }, [product.id]);

  const userReview = currentUser
    ? reviews.find((rev) => rev.userId === currentUser.uid)
    : null;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You must be logged in to post a review.");
      return;
    }
    if (userRating === 0) {
      alert("Please select a rating.");
      return;
    }
    if (userReview) {
      alert("You have already submitted a review. Delete it to submit a new one.");
      return;
    }
    if (!reviewText.trim()) {
      alert("Review text cannot be empty!");
      return;
    }
    const reviewData = {
      rating: userRating,
      text: reviewText.trim(),
      createdAt: new Date().toISOString(),
      userId: currentUser.uid,
      displayName: currentUser.displayName || "Anonymous",
      lovedBy: {},
    };
    try {
      const reviewsRef = ref(db, `reviews/${product.id}`);
      await push(reviewsRef, reviewData);
      setUserRating(0);
      setReviewText("");
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!currentUser) {
      alert("You must be logged in to delete a review.");
      return;
    }
    try {
      const reviewRef = ref(db, `reviews/${product.id}/${reviewId}`);
      await remove(reviewRef);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const inStock = product.stock !== undefined ? product.stock > 0 : true;

  const handleBuyNowClick = () => {
    if (!inStock ) return;
    setShowBuyOverlay(true);
  }

  useEffect(() => {
    let timer;
    if (showBuyOverlay) {
      timer = setTimeout(() => {
        setShowBuyOverlay(false);
        navigate("/buy", { state: { product } });
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showBuyOverlay, navigate, product]
)

  if ( !product || !product.id ) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundContent}>
          <h2>Product not found</h2>
          <p>The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }


  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / reviews.length
      : 0;

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

  return (
    <div className={styles.detailContainer}>
      <div className={styles.productLayout}>
        <div className={styles.imageSection}>
          <div className={styles.imageWrapper}>
            <img
              src={product.imageUrl}
              alt={product.title}
              className={styles.productImage}
              onClick={() => setShowImageOverlay(true)}
              loading="lazy"
            />
            <div className={styles.zoomIndicator}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
                <path d="M11 8v6M8 11h6"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.productHeader}>
            <h1 className={styles.title}>{product.title}</h1>
            <div className={styles.ratingDisplay}>
              <div className={styles.stars}>{stars}</div>
              <span className={styles.ratingText}>
                ({averageRating.toFixed(1)}) {reviews.length} reviews
              </span>
            </div>
          </div>

          <div className={styles.priceSection}>
            <div className={styles.priceWrapper}>
              <span className={styles.price}>{product.price} Tk</span>
              {product.discountPercentage > 0 && (
                <span className={styles.discount}>{product.discountPercentage}% OFF</span>
              )}
            </div>
            {product.stock !== undefined ? (
              product.stock > 0 ? (
                <div className={styles.stockInfo}>
                  <span className={styles.inStock}>✓ In Stock: {product.stock}</span>
                </div>
              ) : (
                <div className={styles.stockInfo}>
                  <span className={styles.outOfStock}>✗ Out of stock</span>
                </div>
              )
            ) : null}
          </div>

          <div className={styles.productDetails}>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Brand</span>
                <span className={styles.detailValue}>{product.brand}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Type</span>
                <span className={styles.detailValue}>{product.type}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Condition</span>
                <span className={styles.detailValue}>{product.condition}</span>
              </div>
              {product.condition === "Used" && product.usedDuration && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Age</span>
                  <span className={styles.detailValue}>{product.usedDuration}</span>
                </div>
              )}
            </div>
          </div>


          <div className={styles.actionSection}>
            <button
              className={`${styles.buyButton} ${!inStock ? styles.disabled : ''}`}
              onClick={handleBuyNowClick}
              disabled={!inStock}
            >
              <span className={styles.buttonText}>
                {inStock ? "Buy Now" : "Out of Stock"}
              </span>
              <div className={styles.buttonGlow}></div>
            </button>

            <button
         className={`${styles.cartButton} ${!inStock ? styles.disabled : ""}`}
         onClick={() => {
           if (!inStock) return;
           dispatch(addItem({
             id: product.id,
             title: product.title,
             price: Number(product.price),
             imageUrl: product.imageUrl,
           }));
         }}
         disabled={!inStock}
       >
         <FaShoppingCart size={16} />{" "}
         <span className={styles.buttonText}>
          Add to Cart
         </span>
      </button>
          </div>

          {product.dynamicValues && Object.keys(product.dynamicValues).length > 0 && (
            <div className={styles.specificationsSection}>
              <h3 className={styles.sectionTitle}>
                Specifications
                </h3>

              <div className={styles.specGrid}>

                {Object.entries(product.dynamicValues).map(([key, value]) => (
                  <div key={key} className={styles.specItem}>

                    <span className={styles.specLabel}>
                      {key}
                      </span>

                    <span className={styles.specValue}>
                      {value}
                      </span>
                  </div>
                ) )
                }
              </div>
            </div>
          )}
         
         <br /> 

          {product.description && (
            <div className={styles.descriptionSection}>
              <h3 className={styles.sectionTitle}>Product Details</h3>
              <div className={styles.descriptionContent}>
                <p>{product.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.reviewSection}>
        <h3 className={styles.sectionTitle}>Rate & Review</h3>
        
        {currentUser && !userReview ? (
          <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
            <div className={styles.ratingInput}>
              <span className={styles.ratingLabel}>Your Rating:</span>
              <div className={styles.starRating}>
                {Array.from({ length: 5 }, (_, i) => {
                  const starValue = i + 1;
                  return (
                    <FaStar
                      key={i}
                      size={24}
                      className={styles.star}
                      color={starValue <= (hoverRating || userRating) ? "#00ffff" : "#333"}
                      onClick={() => setUserRating(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  );
                })}
              </div>
            </div>
            <div className={styles.textareaWrapper}>
              <textarea
                className={styles.reviewTextarea}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review..."
                rows="4"
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              <span>Submit Review</span>
              <div className={styles.buttonRipple}></div>
            </button>
          </form>
        ) : currentUser && userReview ? (
          <div className={styles.reviewStatus}>
            <p>You have already submitted a review for this product.</p>
          </div>
        ) : (
          <div className={styles.loginPrompt}>
            <p>Please log in to submit a review.</p>
          </div>
        )}

        <div className={styles.reviewList}>
          <h4 className={styles.reviewListTitle}>
            Customer Reviews ({reviews.length})
          </h4>
          
          {reviews.length === 0 ? (
            <div className={styles.noReviews}>
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className={styles.reviewItems}>
              {reviews.map((rev) => (
                <div key={rev.id} className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewAuthorInfo}>
                      <span className={styles.reviewAuthor}>{rev.displayName}</span>
                      <div className={styles.reviewStars}>
                        {Array.from({ length: 5 }, (_, i) => {
                          const starVal = i + 1;
                          return (
                            <FaStar 
                              key={i} 
                              size={14} 
                              color={starVal <= rev.rating ? "#ffc107" : "#333"} 
                            />
                          );
                        })}
                      </div>
                    </div>
                    {currentUser && currentUser.uid === rev.userId && (
                      <button
                        className={styles.deleteButton}
                        onClick={() => deleteReview(rev.id)}
                        aria-label="Delete review"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>
                  <p className={styles.reviewText}>{rev.text}</p>
                  <p className={styles.reviewDate}>
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className={styles.relatedSection}>
          <h3 className={styles.sectionTitle}>Related Products</h3>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((relProd) => (
              <Link 
                to={`/product/${relProd.id}`} 
                state={{ product: relProd }} 
                key={relProd.id} 
                className={styles.relatedItem}
              >
                <div className={styles.relatedImageWrapper}>
                  <img 
                    src={relProd.imageUrl} 
                    alt={relProd.title} 
                    className={styles.relatedImage}
                    loading="lazy"
                  />
                  <div className={styles.relatedOverlay}>
                    <span>View Details</span>
                  </div>
                </div>
                <div className={styles.relatedInfo}>
                  <p className={styles.relatedTitle}>{relProd.title}</p>
                  <p className={styles.relatedPrice}>{relProd.price} Tk</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {showImageOverlay && (
        <div
          className={styles.imageOverlay}
          onClick={handleOverlayClick}
          onTouchStart={e => {
            touchStartY.current = e.touches[0].clientY;
          }}
          onTouchMove={e => {
            const deltaY = e.touches[0].clientY - touchStartY.current;
            setDragY(deltaY);
          }}
          onTouchEnd={() => {
            if (Math.abs(dragY) > 100) {
              setShowImageOverlay(false);
            }
            setDragY(0);
          }}
        >
          <div className={styles.imageOverlayContent}>
            <button 
              className={styles.closeOverlay}
              onClick={() => setShowImageOverlay(false)}
              aria-label="Close image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <img
              src={product.imageUrl}
              alt={product.title}
              className={styles.fullscreenImage}
              style={{ transform: `translateY(${dragY}px)` }}
            />
          </div>
        </div>
      )}

      {showBuyOverlay && (
        <div className={styles.buyOverlay}>
          <div className={styles.buyOverlayContent}>
            <h3>Preparing Your Order</h3>
            <p>Please wait while we process your request...</p>
            <div className={styles.progressContainer}>
              <div className={styles.progressCircle}>
                <svg viewBox="0 0 36 36" className={styles.circularChart}>
                  <path
                    className={styles.circleBg}
                    d="M18 2.0845
                       a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={styles.circleProgress}
                    strokeDasharray="100, 100"
                    d="M18 2.0845
                       a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}