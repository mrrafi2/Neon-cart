import React, { useState, useRef, useEffect, useCallback } from "react";
import { ref, update } from "firebase/database";
import { db } from "../../firebaseInit/firebase";
import { useAuth } from "../../contexts/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom"; 
import { useDropzone } from "react-dropzone";
import styles from "../style/sellerApply.module.css";

export default function SellerApply({  }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
const [documents, setDocuments] = useState([]);   
const [uploading, setUploading] = useState(false);   
const [uploadedUrls, setUploadedUrls] = useState([]); 

  const [captchaToken, setCaptchaToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const recaptchaRef = useRef();

 const onDrop = useCallback((acceptedFiles) => {
  setDocuments(acceptedFiles);
}, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpeg", ".jpg", ".png", ".webp"]
    },
    maxFiles: 5,
  });

  useEffect(() => {
    // Reset on mount
    setError("");
    setSubmitting(false);
    setBusinessName("");
    setAddress("");
    setTaxId("");
    setPhone("");
    setEmail("");
    setWebsite("");
    setCategory("");
    setDescription("");
    setDocuments([]);
    setCaptchaToken(null);
    recaptchaRef.current?.reset();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (
      !businessName.trim() ||
      !address.trim() ||
      !taxId.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !category ||
      !description.trim()
    ) {
      return setError("Please fill all required fields.");
    }

    if (!captchaToken) {
      return setError("Please complete the ReCAPTCHA.");
    }

    setSubmitting(true);
    setError("");
    setUploading(true);

    try {
      const res = await fetch("/api/verifyCaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken }),
      });
      if (!res.ok) throw new Error("CAPTCHA verification failed.");

    
      const urls = [];
    for (const file of documents) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ecommerce_products"); 


      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/dycxaquwk/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!cloudinaryRes.ok) throw new Error("Document upload failed.");

      const cloudinaryData = await cloudinaryRes.json();
      urls.push(cloudinaryData.secure_url);
    }

    setUploadedUrls(urls);

      await update(ref(db, `users/${currentUser.uid}/seller`), {
        appliedAt: new Date().toISOString(),
        "milestones/recaptchaPassed": true,
        "profile/businessName": businessName.trim(),
        "profile/address": address.trim(),
        "profile/taxId": taxId.trim(),
        "profile/phone": phone.trim(),
        "profile/email": email.trim(),
        "profile/website": website.trim() || null,
        "profile/category": category,
        "profile/description": description.trim(),
        "profile/documents": urls,
      });

     alert("Application submitted! Please wait for approval.");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Submission failed. Try again.");
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
  <form
    className={styles.formFullScreen}
    onSubmit={handleSubmit}
    aria-busy={submitting}
    aria-labelledby="sellerApplyTitle"
  >
    <h2 id="sellerApplyTitle">Become a Seller</h2>

    {error && (
      <p className={styles.error} role="alert" tabIndex={-1}>
        {error}
      </p>
    )}

    {/* Business Name */}
    <div className={styles.field}>
      <label htmlFor="businessName">
        Business Name<span aria-hidden="true">*</span>
      </label>
      <input
        id="businessName"
        type="text"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        required
        disabled={submitting}
        placeholder="Your shop or brand name"
      />
    </div>

    {/* Address */}
    <div className={styles.field}>
      <label htmlFor="address">
        Address<span aria-hidden="true">*</span>
      </label>
      <input
        id="address"
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
        disabled={submitting}
        placeholder="Street, city, postcode"
      />
    </div>

    {/* Tax ID */}
    <div className={styles.field}>
      <label htmlFor="taxId">
        Tax ID<span aria-hidden="true">*</span>
      </label>
      <input
        id="taxId"
        type="text"
        value={taxId}
        onChange={(e) => setTaxId(e.target.value)}
        required
        disabled={submitting}
        placeholder="VAT/GST or local tax number"
      />
    </div>

    {/* Phone */}
    <div className={styles.field}>
      <label htmlFor="phone">
        Phone Number<span aria-hidden="true">*</span>
      </label>
      <input
        id="phone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        disabled={submitting}
        placeholder="+1 234 567 890"
      />
    </div>

    {/* Email */}
    <div className={styles.field}>
      <label htmlFor="email">
        Email<span aria-hidden="true">*</span>
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={submitting}
        placeholder="your@email.com"
      />
    </div>

    {/* Website */}
    <div className={styles.field}>
      <label htmlFor="website">Website or Social URL (optional)</label>
      <input
        id="website"
        type="url"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        disabled={submitting}
        placeholder="https://example.com"
      />
    </div>

    {/* Category */}
    <div className={styles.field}>
      <label htmlFor="category">
        Business Type / Category<span aria-hidden="true">*</span>
      </label>
      <select
        id="category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
        disabled={submitting}
      >
        <option value="">Select category</option>
        <option value="electronics">Electronics</option>
        <option value="fashion">Fashion</option>
        <option value="home">Home & Garden</option>
        <option value="books">Books</option>
        <option value="toys">Toys</option>
        {/* add your own categories here */}
      </select>
    </div>

    {/* Description */}
    <div className={styles.field}>
      <label htmlFor="description">
        Business Description<span aria-hidden="true">*</span>
      </label>
      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        disabled={submitting}
        placeholder="Brief description about your business"
        rows={4}
      />
    </div>

    {/* Upload Documents */}
    <div className={styles.field}>
      <label>Upload Documents (PDF or Images, max 5 files)</label>
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ""}`}
      >
        <input {...getInputProps()} disabled={submitting || uploading} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : documents.length > 0 ? (
          <ul>
            {documents.map((file) => (
              <li key={file.path || file.name}>{file.name}</li>
            ))}
          </ul>
        ) : (
          <p>Drag 'n' drop some documents here, or click to select</p>
        )}
      </div>

      {/* Show uploaded URLs after successful upload */}
      {uploadedUrls && uploadedUrls.length > 0 && (
        <div className={styles.uploadedUrls}>
          <h4>Uploaded Documents:</h4>
          <ul>
            {uploadedUrls.map((url, i) => (
              <li key={i}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  Document {i + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>

    {/* ReCAPTCHA */}
    <div className={styles.field}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
        onChange={setCaptchaToken}
      />
    </div>

    {/* Actions */}
    <div className={styles.actions}>
      {/* If you want to navigate away, replace this button onClick with react-router navigate() */}
      <button
        type="button"
        disabled={submitting}
        className={styles.cancelButton}
        onClick={() => {
          // e.g. navigate("/") or history.back()
          window.history.back();
        }}
      >
        Cancel
      </button>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={submitting}
      >
        {submitting ? "Submitting…" : "Apply to Sell"}
      </button>
    </div>
  </form>
);

}
