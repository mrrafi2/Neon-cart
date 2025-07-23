import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedAdminRoute({ children }) {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
if (isAdmin === null) {
    return <div>Checking admin access...</div>; 
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
