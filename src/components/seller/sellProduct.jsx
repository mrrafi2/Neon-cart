// like a shop it handles multi-step product listing with image upload and metadata

import React, { useState, useEffect } from "react";
import { ref, push, set } from "firebase/database";
import { db } from "../../firebaseInit/firebase";
import { useAuth } from "../../contexts/AuthContext"; 
import { useDropzone } from "react-dropzone";
import productMeta from "../../data/productMeta.json";
import styles from "../style/sell.module.css";


export default function Sell() {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const { categories, dynamicFields } = productMeta;

  const [brand, setBrand] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");

  const [dynamicValues, setDynamicValues] = useState({});
  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");

  const [condition, setCondition] = useState("New");
  const [usedDuration, setUsedDuration] = useState("");

  const [productImage, setProductImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

// drag-n-drop setup
  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setProductImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  });

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);


  const handleCategoryChange = (e) => {
    setCategory(e.target.value)
    setSubcategory("")
    setDynamicValues({ });
  };

  const handleSubcategoryChange = (e) => {
    setSubcategory(e.target.value)
    setDynamicValues({})

  };

    // first form submit moves to details step
  const handleStep1Submit = (e) => {
    e.preventDefault ();
    if (!category || !subcategory) {
      alert("Please select both category and subcategory.")
      return
    }
    setStep(2)
  };

    // final submit uploads image then data
  const handleFinalSubmit = async (e) => {
    console.log("Submitting...")
    e.preventDefault( )

      // TODO: add form validation for all required fields
    if ( !brand || !title || !type ) {
      alert("Please fill out the required fields (brand, title, type).");
      return
    }

    if ( !price ) {
      alert("Please enter a price.");
      return;
    }

    if (condition === "Used" && !usedDuration) {
      alert("Please specify the age of the used product.");
      return;
    }

    if (!productImage) {
      alert("Please upload a product image.");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", productImage);
      formData.append("upload_preset", "ecommerce_products"); 

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/dycxaquwk/image/upload`, 
        {
          method: "POST",
          body: formData,
        }
      );
      const cloudinaryData = await cloudinaryRes.json();

      const imageUrl = cloudinaryData.secure_url;  // url for db

      console.log("Image uploaded to:", imageUrl)

      console.log("Cloudinary response:", cloudinaryData)

      const productData = {
        category,
        subcategory,
        brand,
        title,
        type,
        dynamicValues,
        description,
        price,
        condition,
        usedDuration: condition === "Used" ? usedDuration : null,
        imageUrl,
        createdAt: new Date().toISOString(),
        userId: currentUser?.uid,
      };

      console.log("Final product data:", productData);

      const productsRef = ref(db, "products");
      const newProductRef = push(productsRef);
      await set(newProductRef, productData);

      // Show success modal and reset form
      setShowSuccessModal(true);
      resetForm();
    } catch (error) {
      console.error("Error uploading or saving product:", error);
      alert("Failed to post product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset the form state
  const resetForm = () => {
    setStep(1);
    setCategory("");
    setSubcategory("");
    setBrand("");
    setTitle("");
    setType("");
    setDynamicValues({});
    setDescription("");
    setPrice("");
    setCondition("New");
    setUsedDuration("");
    setProductImage(null);
  };

  let subcategoryFields = [];
  if (category && subcategory && dynamicFields[category]) {
    subcategoryFields = dynamicFields[category][subcategory] || [];
  }

  const handleDynamicChange = (fieldName, value) => {
    setDynamicValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  // render Step 1
  const renderStep1 = () => (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIndicator}>
          <span className={styles.stepNumber}>1</span>
          <span className={styles.stepTitle}>Choose Category</span>
        </div>
        <div className={styles.stepProgress}>
          <div className={styles.progressBar} style={{ width: '50%' }}></div>
        </div>
      </div>
      
      <form onSubmit={handleStep1Submit} className={styles.sellForm}>
        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Product Category
              <span className={styles.required}>*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={handleCategoryChange}
              className={styles.select}
              required
            >
              <option value="">Select a category</option>
              {Object.keys(categories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {category && (
            <div className={styles.formGroup}>
              <label htmlFor="subcategory" className={styles.label}>
                Subcategory
                <span className={styles.required}>*</span>
              </label>
              <select
                id="subcategory"
                value={subcategory}
                onChange={handleSubcategoryChange}
                className={styles.select}
                required
              >
                <option value="">Select a subcategory</option>
                {categories[category].map((sub) => (
                  <option value={sub} key={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className={styles.formActions}>
          <button type="submit" className={styles.primaryButton}>
            Continue
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );

  // render Step 2
  const renderStep2 = () => (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIndicator}>
          <span className={styles.stepNumber}>2</span>
          <span className={styles.stepTitle}>Product Details</span>
        </div>
        <div className={styles.stepProgress}>
          <div className={styles.progressBar} style={{ width: '100%' }}></div>
        </div>
      </div>

      <form onSubmit={handleFinalSubmit} className={styles.sellForm}>
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Basic Information</h3>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Brand
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g., Apple, Samsung, Nike"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Product Type
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g., Smartphone, Laptop, T-shirt"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Product Title
              <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, short title"
              required
            />
            <span className={styles.helpText}>Keep it concise and short</span>
          </div>
        </div>
  
   {/* specification */}
        {subcategoryFields.length > 0 && (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Specifications</h3>
            <div className={styles.formRow}>
              {subcategoryFields.map((field) => (
                <div className={styles.formGroup} key={field}>
                  <label className={styles.label}>{field}</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={dynamicValues[field] || ""}
                    onChange={(e) => handleDynamicChange(field, e.target.value)}
                    placeholder={`Enter ${field.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/*  Image  */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Product Image</h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Upload Photo
              <span className={styles.required}>*</span>
            </label>
            <div
              {...getRootProps()}
              className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''} ${previewUrl ? styles.dropzoneHasImage : ''}`}
            >
              <input {...getInputProps()} required />
              {previewUrl ? (
                <div className={styles.imagePreview}>
                  <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                  <div className={styles.imageOverlay}>
                    <span>Click to change image</span>
                  </div>
                </div>
              ) : (
                <div className={styles.dropzoneContent}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21,15 16,10 5,21"></polyline>
                  </svg>
                  <h4>Upload Product Image</h4>
                  <p>Drag and drop an image here, or click to browse</p>
                  <span className={styles.fileTypes}>PNG, JPG, GIF, WebP, AVIF, SVG up to 10MB</span>
                </div>
              )}
            </div>
          </div>
        </div>

        
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Description</h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>Product Details</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product's features, condition, and any other relevant details..."
              rows="5"
            />
            <span className={styles.helpText}>Provide detailed information to help buyers make informed decisions</span>
          </div>
        </div>

        {/* pricing & condition  */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Pricing & Condition</h3>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Price (BDT)
                <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWithIcon}>
                <span className={styles.inputIcon}>৳</span>
                <input
                  type="number"
                  className={styles.input}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Condition
                <span className={styles.required}>*</span>
              </label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="condition"
                    value="New"
                    checked={condition === "New"}
                    onChange={(e) => setCondition(e.target.value)}
                    required
                  />
                  <span className={styles.radioLabel}>New</span>
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="condition"
                    value="Used"
                    checked={condition === "Used"}
                    onChange={(e) => setCondition(e.target.value)}
                  />
                  <span className={styles.radioLabel}>Used</span>
                </label>
              </div>
            </div>
          </div>

          {condition === "Used" && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Age of Product
                <span className={styles.required}>*</span>
              </label>
              <select
                value={usedDuration}
                onChange={(e) => setUsedDuration(e.target.value)}
                className={styles.select}
                required
              >
                <option value="">Select age</option>
                <option value="Under 6 months">Under 6 months</option>
                <option value="6 months">6 months</option>
                <option value="1 year">1 year</option>
                <option value="2 years">2 years</option>
                <option value="2.5 years">2.5 years</option>
                <option value="3 years">3 years</option>
                <option value="5 years">5 years</option>
                <option value="More than 5 years">More than 5 years</option>
              </select>
            </div>
          )}
        </div>

        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.secondaryButton}
            onClick={() => setStep(1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>
          <button 
            type="submit" 
            className={`${styles.primaryButton} ${isSubmitting ? styles.loading : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className={styles.spinner}></div>
                Posting Product...
              </>
            ) : (
              <>
                Post Product
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className={styles.sellContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Sell Your Product</h1>
        <p className={styles.subtitle}>
          {step === 1 
            ? "Start by selecting the right category for your product" 
            : `Complete your ${subcategory} listing`
          }
        </p>
      </div>

      <div className={styles.content}>
        {step === 1 ? renderStep1() : renderStep2()}
      </div>

      {/* success modal */}
      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.successModal}>
            <div className={styles.successIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22,4 12,14.01 9,11.01"></polyline>
              </svg>
            </div>
            <h2>Product Posted Successfully!</h2>
            <p>Your product has been added to the marketplace and is now visible to potential buyers.</p>
            <div className={styles.modalActions}>
              <button
                className={styles.primaryButton}
                onClick={() => setShowSuccessModal(false)}
              >
                Continue Selling
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}