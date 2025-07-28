//  The beating heart of our user auth flow and put a lot of hardwork in.
// handles user login/signup, Google login, user session tracking,
//  realtime DB syncing, and seller verification logic.
// Built with care and a suspicious amount of caffeine.

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

const [isSeller, setIsSeller] = useState(false);  // used to check seller role


  // redirect sign-in (mobile google auth fallback)
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {

          await ensureUserInDatabase(result.user) // Make sure the user exists in DB

          setCurrentUser(result.user);
        }
      }
    )
      .catch(console.error);
  }, [auth]);


 useEffect(( ) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await ensureUserInDatabase (user); 
        setCurrentUser(user);

        const sellerRef = ref(db, `users/${user.uid}/seller/isSeller`);
        const snap = await get(sellerRef);
        setIsSeller(!!snap.val());

      } else {
        setCurrentUser(null);
        setIsSeller(false);
      }
      setLoadingAuth(false);
    });

    return unsubscribe;
  }, [auth]);


    //  ensure user exists in DB with base fields
  async function ensureUserInDatabase(user) {
  const userRef = ref(db, `users/${user.uid}`);
  const snap = await get(userRef);

  if ( !snap.exists () ) {
    const baseData = {
      displayName: user.displayName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || null,
      gender: null,
      avatarIcon: null,
      avatarBgColor: null,
      seller: {
        isSeller: false,
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
    await set(userRef, baseData);  // creates neww user doc
  } else {

    await update(ref(db, `users/${user.uid}/seller/milestones`), {
      emailVerified: user.emailVerified || false
    } );
  }
   // TODO: consider abstrecting this into an "syncUserDefaults" util
    // TIP: keep user schema versions in future to avoid breaking changes
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
      seller: {
         isSeller: false,
        appliedAt: null,
        milestones: {
          emailVerified: cred.user.emailVerified || false,
          recaptchaPassed: false,
          phoneVerified: false
        },
        profile: {
          businessName: null,
          address: null,
          taxId: null
        }
      }
    });
    setCurrentUser({ ...cred.user, displayName: username });
  }

  // Email/password login
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  //google login
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
     isSeller,
  };

  return (
    <AuthContext.Provider value={value}>
        {/*  only render children when auth check is done */}
      {!loadingAuth && children}
    </AuthContext.Provider>
  );
}
