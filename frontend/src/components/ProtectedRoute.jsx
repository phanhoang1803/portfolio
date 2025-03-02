// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="protected-loading">
        <div className="protected-spinner"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated or not an admin
  if (!isAuthenticated || !isAdmin()) {
    return <Navigate to="/login" />;
  }
  
  // Render the protected component
  return children;
};

export default ProtectedRoute;
