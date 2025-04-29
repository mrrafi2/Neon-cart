import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaStar, FaHeart, FaTrash,FaStarHalfAlt } from "react-icons/fa";
import { ref, push, onValue, remove, update, get } from "firebase/database";
import { db } from "../firebaseInit/firebase";
import { useAuth } from "../contexts/AuthContext";
import styles from "../style/detail.module.css";

export default function ProductDetail() {
  const { state } = useLocation();
  const product = state?.product;
  const { currentUser } = useAuth();
  const navigate = useNavigate();


  if (!product || !product.id) {
    return <p>Product not found.</p>;
  }

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

  // Function to delete a review (only for review owner)
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
    if (!inStock) return;
    setShowBuyOverlay(true);
  };

  useEffect(() => {
    let timer;
    if (showBuyOverlay) {
      timer = setTimeout(() => {
        setShowBuyOverlay(false);
        navigate("/buy", { state: { product } });
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showBuyOverlay, navigate, product]);

  // Calculate average rating from the fetched reviews
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

<div className={styles.imageSection}>

  <img
    src={product.imageUrl}
    alt={product.title}
    className={styles.productImage}
    onClick={() => setShowImageOverlay(true)}
    style={{ cursor: "zoom-in" }}
  />
</div>

      <div className={styles.infoSection}>
        <h1 className={styles.title}>{product.title}</h1>
        <p className={styles.price}>Price: {product.price} Tk</p>
        {/* Show discount if available */}
        {product.discountPercentage > 0 && (
          <p className={styles.discount}>{product.discountPercentage}% OFF</p>
        )}
        {/* Show stock information */}
        {product.stock !== undefined ? (
          product.stock > 0 ? (
            <p className={styles.inStock}><strong>In Stock:</strong> {product.stock}</p>
          ) : (
            <p className={styles.outOfStock}>Out of stock</p>
          )
        ) : null}
        <p className={styles.detail}><strong>Brand:</strong> {product.brand}</p>
        <p className={styles.detail}><strong>Type:</strong> {product.type}</p>
        <p className={styles.detail}><strong>Condition:</strong> {product.condition}</p>
        {product.condition === "Used" && product.usedDuration && (
          <p className={styles.detail}><strong>Age:</strong> {product.usedDuration}</p>
        )}
        <br />
        <button
          className="btn btn-primary"
          onClick={handleBuyNowClick}
          disabled={!inStock}
        >
          {inStock ? "Buy now" : "Out of stock"}
        </button>
        <hr />
        {product.dynamicValues && Object.keys(product.dynamicValues).length > 0 && (
          <div className={styles.dynamicDetails}>
            <h3 style={{ fontSize: "22px", marginBottom: "15px" }}>Specifications</h3>
            {Object.entries(product.dynamicValues).map(([key, value]) => (
              <p key={key} className={styles.detail}>
                <strong>{key}:</strong> {value}
              </p>
            ))}
          </div>
        )}
        <hr />
        {product.description && (
          <div className={styles.description}>
            <h3 style={{ fontSize: "22px", marginBottom: "15px" }}>Product Details</h3>
            <p>{product.description}</p>
          </div>
        )}
      </div>

      {/* Rating & Review Section */}
      <div className={styles.reviewSection}>
        <h3 style={{ fontSize: "23px", marginBottom: "15px" }}>Rate & Review</h3>
        {currentUser && !userReview ? (
          <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
            <div className={styles.stars}>
              {Array.from({ length: 5 }, (_, i) => {
                const starValue = i + 1;
                return (
                  <FaStar
                    key={i}
                    size={24}
                    className={styles.star}
                    color={starValue <= (hoverRating || userRating) ? "#ffc107" : "#e4e5e9"}
                    onClick={() => setUserRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ cursor: "pointer" }}
                  />
                );
              })}
            </div>
            <textarea
              className={styles.reviewTextarea}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review..."
            />
            <button type="submit" className={styles.reviewButton}>
              Submit Review
            </button>
          </form>
        ) : currentUser && userReview ? (
          <p>You have already submitted a review.</p>
        ) : (
          <p>Please log in to submit a review.</p>
        )}

        {/* Display list of reviews */}
        <div className={styles.reviewList}>
          <h3 style={{ fontSize: "20px", marginBottom: "15px", color: "#ddd" }}>Reviews ({reviews.length}) </h3>
          {reviews.length === 0 && <p>No reviews yet.</p>}
          {reviews.map((rev) => (
            <div key={rev.id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <span className={styles.reviewAuthor}>{rev.displayName}</span>
                {currentUser && currentUser.uid === rev.userId && (
                  <FaTrash
                    className={styles.deleteIcon}
                    size={15}
                    color="gray"
                    onClick={() => deleteReview(rev.id)}
                    style={{ cursor: "pointer", marginLeft: "9px", position: "relative", top: "-2.5px" }}
                  />
                )}
              </div>
              <div className={styles.reviewStars}>
                {Array.from({ length: 5 }, (_, i) => {
                  const starVal = i + 1;
                  return (
                    <FaStar key={i} size={13} color={starVal <= rev.rating ? "#ffc107" : "#e4e5e9"} />
                  );
                })}
              </div>
              <p className={styles.reviewText}>{rev.text}</p>
              <p className={styles.reviewDate}>{new Date(rev.createdAt).toLocaleString()}</p>
            </div>
          ))}
          
        </div>
        <div className={styles.relatedProducts}>
  <h3 style={{ fontSize: "24px", margin: "40px 0 20px" }}>Related Products</h3>
  <div className={styles.relatedGrid}>
    {relatedProducts.map((relProd) => (
      <Link to={`/product/${relProd.id}`} state={{ product: relProd }} key={relProd.id} className={styles.relatedItem}>
        <img src={relProd.imageUrl} alt={relProd.title} className={styles.relatedImage} />
        <p className={styles.relatedTitle}>{relProd.title}</p>
        <p className={styles.relatedPrice}>{relProd.price} Tk</p>
      </Link>
    ))}
  </div>
</div>

      </div>


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
    <img
      src={product.imageUrl}
      alt={product.title}
      className={styles.fullscreenImage}
      style={{ transform: `translateY(${dragY}px)` }}
    />
  </div>
)}



      {showBuyOverlay && (
        <div className={styles.buyOverlay}>
          <p style={{ fontSize: "17px", marginBottom: "20px" }}>
            Preparing for order...
          </p>
          <div className={styles.progressCircle}>
            <svg viewBox="0 0 36 36">
              <path
                className={styles.circleBg}
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={styles.circleProgress}
                strokeDasharray="0, 100"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
