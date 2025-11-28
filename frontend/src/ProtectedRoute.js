// frontend/src/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    // Utilisateur connecté mais pas le bon rôle
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
