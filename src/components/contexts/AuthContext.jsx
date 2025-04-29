import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
  } from "firebase/auth";
  import React, { useContext, useEffect, useState } from "react";
  import "../firebaseInit/firebase";
  import { ref, set, update, get } from "firebase/database";
  import { db } from "../firebaseInit/firebase";
  
  const AuthContext = React.createContext();
  
  export function useAuth() {
    return useContext(AuthContext);
  }
  
  export function AuthProvider({ children }) {
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
  
   
    
  
    useEffect(() => {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userRef = ref(db, `users/${user.uid}`);
          const userSnapshot = await get(userRef);
  
          let storedAvatarIcon = null;
          let storedAvatarBgColor = "";
  
          if (user.photoURL) {
            try {
              if (user.photoURL.trim().startsWith("{")) {
                const data = JSON.parse(user.photoURL);
                storedAvatarIcon = data.avatarIcon;
                storedAvatarBgColor = data.avatarBgColor;
              }
            } catch (e) {
              console.error("Error parsing photoURL:", e);
            }
          }
  
          const profileData = userSnapshot.exists() ? userSnapshot.val() : {};
  
          setCurrentUser({
            ...user,
            ...profileData,
            avatarIcon: storedAvatarIcon,
            avatarBgColor: storedAvatarBgColor,
          });
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
  
      return unsubscribe;
    }, []);
  
    async function signup(email, password, username, phoneNumber, gender) {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      await updateProfile(user, {
        displayName: username,
      });
  
      // For new signups, default isSeller to false.
      const userData = {
        displayName: username,
        email: email,
        phoneNumber: phoneNumber || null,
        gender: gender || null,
        totalScore: 0,
        avatarIcon: null,
        avatarBgColor: null,
      };
  
      await set(ref(db, `users/${user.uid}`), userData);
  
      setCurrentUser({ ...user, ...userData });
    }
  
    function login(email, password) {
      const auth = getAuth();
      return signInWithEmailAndPassword(auth, email, password);
    }
  
    async function loginWithGoogle() {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
  
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
  
        const userRef = ref(db, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
  
        let userData = {
          displayName: user.displayName,
          email: user.email,
          phoneNumber: null,
          gender: null,
          avatarIcon: null,
          avatarBgColor: null,
        };
  
        if (!userSnapshot.exists()) {
          await set(userRef, userData);
        } else {
          userData = userSnapshot.val();
        }
  
  
        setCurrentUser({
          ...user,
          ...userData,
        });
  
        return user;
      } catch (error) {
        console.error("Google Sign-In Error:", error);
        throw error;
      }
    }
  
    function logout() {
      const auth = getAuth();
      return signOut(auth);
    }
  
    async function updateUser(newDisplayName, newAvatarIcon, newAvatarBgColor) {
      const auth = getAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: newDisplayName,
          photoURL: JSON.stringify({
            avatarIcon: newAvatarIcon,
            avatarBgColor: newAvatarBgColor,
          }),
        });
  
        await update(ref(db, `users/${auth.currentUser.uid}`), {
          displayName: newDisplayName,
          avatarIcon: newAvatarIcon,
          avatarBgColor: newAvatarBgColor,
        });
  
        setCurrentUser((prevUser) => ({
          ...prevUser,
          displayName: newDisplayName,
          avatarIcon: newAvatarIcon,
          avatarBgColor: newAvatarBgColor,
        }));
      }
    }
  
    const value = {
      currentUser,
      signup,
      login,
      loginWithGoogle,
      logout,
      updateUser,
    };
  
    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
  }
  