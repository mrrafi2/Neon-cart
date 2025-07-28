// here normal folks turn into business legends.

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ref, update } from "firebase/database";
import { db } from "../../firebaseInit/firebase";
import { useAuth } from "../../contexts/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom"; 
import { useDropzone } from "react-dropzone";
import styles from "../style/sellerApply.module.css";

export default function SellerApply() {
  const { currentUser } = useAuth();
  const navigate = useNavigate(); 

  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [nationalId, setnationalId] = useState("");
  const [description, setDescription] = useState("");
  const [documents, setDocuments] = useState([]);   
  const [uploading, setUploading] = useState(false);   
  const [uploadedUrls, setUploadedUrls] = useState([]); 

  const [captchaToken, setCaptchaToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const recaptchaRef = useRef();

  // fill progress tracking
  const [completedFields, setCompletedFields] = useState(new Set());
  const [currentStep, setCurrentStep] = useState(1);

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

//  Clean slate vibes when page loads.
  useEffect(() => {
    setError("");
    setSubmitting(false);
    setBusinessName("");
    setAddress("");
    setTaxId("");
    setPhone("");
    setEmail("");
    setWebsite("");
    setnationalId("");
    setDescription("");
    setDocuments([]);
    setCaptchaToken(null);
    recaptchaRef.current?.reset();
  }, []);

  // prograss track field completion
  useEffect(() => {
    const newCompletedFields = new Set();
    
    if (businessName.trim()) newCompletedFields.add('businessName');
    if (address.trim()) newCompletedFields.add('address');
    if (taxId.trim()) newCompletedFields.add('taxId');
    if (nationalId.trim()) newCompletedFields.add('nationalId');
    if (phone.trim()) newCompletedFields.add('phone');
    if (email.trim()) newCompletedFields.add('email');
    if (description.trim()) newCompletedFields.add('description');
    if (documents.length > 0) newCompletedFields.add('documents');
    if (captchaToken) newCompletedFields.add('captcha');

    setCompletedFields(newCompletedFields);

    if (newCompletedFields.size >= 7) {
      setCurrentStep(3);
    } else if (newCompletedFields.size >= 4) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [businessName, address, taxId, nationalId, phone, email, description, documents, captchaToken]);

  //  Handles the big moment - captcha, uploads, Firebase magic.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !businessName.trim() ||
      !address.trim() ||
      !taxId.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !nationalId.trim() ||
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
        isSeller: true,
        "milestones/recaptchaPassed": true,
        "profile/businessName": businessName.trim(),
        "profile/address": address.trim(),
        "profile/taxId": taxId.trim(),
        "profile/phone": phone.trim(),
        "profile/email": email.trim(),
        "profile/nationalId": nationalId.trim(),
        "profile/website": website.trim() || null,
        "profile/description": description.trim(),
        "profile/documents": urls,
      });

      alert("Seller profile created! You can now start selling.");
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

  const requiredFields = ['businessName', 'address', 'taxId', 'nationalId', 'phone', 'email', 'description', 'documents', 'captcha'];
  const progressPercentage = (completedFields.size / requiredFields.length) * 100;

  const steps = [
    { id: 1, title: "Basic Information", description: "Business details and contact info" },
    { id: 2, title: "Additional Details", description: "Complete your profile" },
    { id:3, title: "Verification", description: "Documents and security check" }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        {/* doc header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Become a Seller</h1>
          <p className={styles.subtitle}>Join our marketplace and start selling your products</p>
        </div>

        {/* field progress track section */}
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className={styles.progressText}>
            {completedFields.size} of {requiredFields.length} fields completed ({Math.round(progressPercentage)}%)
          </div>
        </div>

        {/*the master stepss indicator */}
        <div className={styles.stepsContainer}>
          {steps.map((step) => (
            <div 
              key={step.id} 
              className={`${styles.stepItem} ${currentStep >= step.id ? styles.stepActive : ''} ${currentStep > step.id ? styles.stepCompleted : ''}`}
            >
              <div className={styles.stepNumber}>
                {currentStep > step.id ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className={styles.stepContent}>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepDescription}>{step.description}</div>
              </div>
            </div>
          ))}
        </div>


    <form
          className={styles.form}
          onSubmit={handleSubmit}
          aria-busy={submitting}
          aria-labelledby="sellerApplyTitle"
    >
 {error && (
            <div className={styles.errorAlert} role="alert" tabIndex={-1}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              {error}
            </div>
        )}

    <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              Basic Information
            </h3>

            <div className={styles.formGrid}>
              <div className={`${styles.field} ${completedFields.has('businessName') ? styles.fieldCompleted : ''}`}>
                <label htmlFor="businessName">
                  Business Name
                  <span className={styles.required} aria-hidden="true">*</span>
                </label>
                <input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  disabled={submitting}
                  placeholder="Your shop or brand name"
                  className={styles.input}
                />
                {completedFields.has('businessName') && (
                  <div className={styles.fieldCheck}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                  </div>
                )}
              </div>

              <div className={`${styles.field} ${completedFields.has('address') ? styles.fieldCompleted : ''}`}>
                <label htmlFor="address">
                  Business Address
                  <span className={styles.required} aria-hidden="true">*</span>
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  disabled={submitting}
                  placeholder="Street, city, postcode"
                  className={styles.input}
                />
                {completedFields.has('address') && (
                  <div className={styles.fieldCheck}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                  </div>
                )}
              </div>

              <div className={`${styles.field} ${completedFields.has('taxId') ? styles.fieldCompleted : ''}`}>
                <label htmlFor="taxId">
                  Tax ID
                  <span className={styles.required} aria-hidden="true">*</span>
                </label>
                <input
                  id="taxId"
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  required
                  disabled={submitting}
                  placeholder="VAT/GST or local tax number"
                  className={styles.input}
                />
                {completedFields.has('taxId') && (
                  <div className={styles.fieldCheck}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                  </div>
                )}
              </div>

              <div className={`${styles.field} ${completedFields.has('nationalId') ? styles.fieldCompleted : ''}`}>
                <label htmlFor="nid">
                  National ID Number
                  <span className={styles.required} aria-hidden="true">*</span>
                </label>
                <input
                  id="nid"
                  type="text"
                  value={nationalId}
                  onChange={(e) => setnationalId(e.target.value)}
                  required
                  disabled={submitting}
                  placeholder="Enter your 10 to 17 digit National ID number"
                  className={styles.input}
         />
        {completedFields.has('nationalId') && (
                  <div className={styles.fieldCheck}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
    </div>
                )}
              </div>
            </div>
    </div>

          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              Contact Information
            </h3>

            <div className={styles.formGrid}>
              <div className={`${styles.field} ${completedFields.has('phone') ? styles.fieldCompleted : ''}`}>
                <label htmlFor="phone">
                  Phone Number
                  <span className={styles.required} aria-hidden="true">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={submitting}
                  placeholder="+1 234 567 890"
                  className={styles.input}
                />
                {completedFields.has('phone') && (
                  <div className={styles.fieldCheck}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                  </div>
                )}
              </div>

              <div className={`${styles.field} ${completedFields.has('email') ? styles.fieldCompleted : ''}`}>
                <label htmlFor="email">
                  Email Address
                  <span className={styles.required} aria-hidden="true">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                  placeholder="your@email.com"
                  className={styles.input}
                />
                {completedFields.has('email') && (
                  <div className={styles.fieldCheck}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="website">Website or Social URL</label>
                <input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={submitting}
                  placeholder="https://example.com (optional)"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={`${styles.field} ${completedFields.has('description') ? styles.fieldCompleted : ''}`}>
              <label htmlFor="description">
                Business Description
                <span className={styles.required} aria-hidden="true">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={submitting}
                placeholder="Brief description about your business, products, and services..."
                rows={4}
                className={styles.textarea}
              />
              {completedFields.has('description') && (
                <div className={styles.fieldCheck}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                </div>
              )}
            </div>
          </div>
                    <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
              </span>
              Documents & Verification
            </h3>

            <div className={`${styles.field} ${completedFields.has('documents') ? styles.fieldCompleted : ''}`}>
              <label>Upload Documents (PDF or Images, max 5 files)</label>
              <div
                {...getRootProps()}
                className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''} ${completedFields.has('documents') ? styles.dropzoneCompleted : ''}`}
              >
                <input {...getInputProps()} disabled={submitting || uploading} />
                <div className={styles.dropzoneContent}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  {isDragActive ? (
                    <p>Drop the files here...</p>
                  ) : documents.length > 0 ? (
                    <div>
                      <p>Files selected:</p>
                      <ul className={styles.fileList}>
                        {documents.map((file) => (
                          <li key={file.path || file.name}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <p>Drag & drop documents here, or click to browse</p>
                      <span className={styles.fileTypes}>PDF, JPG, PNG up to 10MB each</span>
                    </div>
                  )}
                </div>
              </div>
              {completedFields.has('documents') && (
                <div className={styles.fieldCheck}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                </div>
              )}
            </div>

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
         
         {/*   prove you’re not a toaster. */}
            <div className={`${styles.field} ${completedFields.has('captcha') ? styles.fieldCompleted : ''}`}>
              <label>Security Verification</label>
              <div className={styles.captchaWrapper}>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={setCaptchaToken}
                />
                {completedFields.has('captcha') && (
                  <div className={styles.fieldCheck}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* action buttons */}
          <div className={styles.actions}>
            <button
              type="button"
              disabled={submitting}
              className={styles.cancelButton}
              onClick={() => window.history.back()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"></path>
              </svg>
              Cancel
            </button>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting || completedFields.size < requiredFields.length}
            >
              {submitting ? (
                <>
                  <div className={styles.spinner}></div>
                  Submitting...
                </>
              ) : (
                <>
                  Apply to Sell
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}