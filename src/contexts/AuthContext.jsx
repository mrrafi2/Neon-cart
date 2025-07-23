import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { ref, set, get, update } from "firebase/database";
import "../firebaseInit/firebase";
import { db } from "../firebaseInit/firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await ensureUserInDatabase(result.user);
          setCurrentUser(result.user);
        }
      })
      .catch(console.error);
  }, [auth]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await ensureUserInDatabase(user);
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoadingAuth(false);
    });
    return unsubscribe;
  }, [auth]);

  async function ensureUserInDatabase(user) {
  const userRef = ref(db, `users/${user.uid}`);
  const snap = await get(userRef);

  if (!snap.exists()) {
    const baseData = {
      displayName: user.displayName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || null,
      gender: null,
      avatarIcon: null,
      avatarBgColor: null,
      seller: {
        isApproved: false,
        appliedAt: null,
        milestones: {
          emailVerified: user.emailVerified || false,
          recaptchaPassed: false,
          phoneVerified: false
        },
        profile: {
          businessName: null,
          address: null,
          taxId: null
        }
      }
    };
    await set(userRef, baseData);
  } else {
    await update(ref(db, `users/${user.uid}/seller/milestones`), {
      emailVerified: user.emailVerified || false
    });
  }
}

  // Email/password signup
  async function signup(email, password, username, phoneNumber, gender) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: username });
    await set(ref(db, `users/${cred.user.uid}`), {
      displayName: username,
      email,
      phoneNumber: phoneNumber || null,
      gender: gender || null,
      avatarIcon: null,
      avatarBgColor: null,
    });
    setCurrentUser({ ...cred.user, displayName: username });
  }

  // Email/password login
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Google login with popup → redirect fallback
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      return await signInWithPopup(auth, provider);
    } catch (err) {
      if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        return signInWithRedirect(auth, provider);
      }
      throw err;
    }
  }

  // Logout
  function logout() {
    return signOut(auth);
  }

  // Update user profile & database
  async function updateUser(displayName, avatarIcon, avatarBgColor) {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, {
      displayName,
      photoURL: JSON.stringify({ avatarIcon, avatarBgColor }),
    });
    await set(ref(db, `users/${auth.currentUser.uid}`), {
      displayName,
      avatarIcon,
      avatarBgColor,
    });
    setCurrentUser({
      ...auth.currentUser,
      displayName,
      photoURL: JSON.stringify({ avatarIcon, avatarBgColor }),
    });
  }

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loadingAuth && children}
    </AuthContext.Provider>
  );
}
