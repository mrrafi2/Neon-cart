import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ref } from "firebase/database";
import { useObjectVal } from "react-firebase-hooks/database";
import { db } from "../../firebaseInit/firebase";
import LoadingSpinner from "../common/loading";

export default function PrivateSellerRoute({ children }) {
  const { currentUser } = useAuth();

  const sellerRef = currentUser
    ? ref(db, `users/${currentUser.uid}/seller`)
    : null;
  const [sellerData, loading, error] = useObjectVal(sellerRef);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const { profile } = sellerData || {};
  const isFullSeller =
    profile?.businessName &&
    profile?.address &&
    profile?.taxId;

  if (!isFullSeller) {
    return <Navigate to="/seller-apply" replace />;
  }

  return children;
}
