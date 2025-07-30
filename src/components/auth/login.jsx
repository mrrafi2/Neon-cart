// you all know why this component for....

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import styles from "../style/login.module.css";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]  = useState("");
  const [password, setPassword]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]  = useState("");
  const [loading, setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("⚠️ Failed to login. Please recheck your Email and password.");
    } finally {
      setLoading(false);
    }
  }

  //google login handler
  async function handleGoogleLogin() {
    setError("");
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result?.user) {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ Google sign‑in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      className={styles.loginContainer}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.form
        className={styles.loginForm}
        onSubmit={handleSubmit}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <h2 style={{color:'whitesmoke', textAlign:'center'}}>Login</h2>
        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.inputGroup}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className={styles.inputGroup}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <span
            className={styles.eyeIcon}
            onClick={() => setShowPassword(v => !v)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          type="submit"
          className={styles.primaryButton}
          disabled={loading}
        >
          {loading ? "Loading…" : "Login"}
        </button>

        <div className={styles.divider}>or</div>

        <button
          type="button"
          className={styles.googleButton}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <FaGoogle className="me-2" />
          {loading ? "Please wait…" : "Continue with Google"}
        </button>

        <p className={styles.switch}>
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </motion.form>
    </motion.div>
  );
}
