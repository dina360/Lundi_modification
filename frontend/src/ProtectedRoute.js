// src/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");

  // Pas connecté → login
  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  // Si des rôles sont spécifiés et que celui de l'utilisateur n'en fait pas partie
  if (roles && !roles.includes(role)) {
    // 🔀 On le redirige vers son espace
    if (role === "admin") return <Navigate to="/dashboard" replace />;
    if (role === "medecin") return <Navigate to="/medecin/home" replace />;
    if (role === "secretaire") return <Navigate to="/secretaire/home" replace />;
    if (role === "patient") return <Navigate to="/patient/home" replace />;

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
