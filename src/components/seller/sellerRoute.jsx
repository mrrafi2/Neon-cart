import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ref } from "firebase/database";
import { useObjectVal } from "react-firebase-hooks/database";
import { db } from "../../firebaseInit/firebase";
import LoadingSpinner from "../common/loading";

export default function PrivateSellerRoute( { children } ) {
  const { currentUser } = useAuth( );

  const isApprovedRef = currentUser
    ? ref(db, `users/${currentUser.uid}/seller/isApproved`)
    : null;
  const [isApproved, loading ] = useObjectVal( isApprovedRef );

  if ( !currentUser ) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isApproved) {
    return <Navigate to="/" replace />;
  }

  return children;
}
