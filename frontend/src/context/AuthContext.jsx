// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Create context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get current user info
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Error checking authentication:', error);
          // Clear invalid token
          logout();
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login/json', { 
        username, 
        password 
      });
      
      const { access_token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', access_token);
      
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Get user info
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove token from API headers
    delete api.defaults.headers.common['Authorization'];
    
    // Clear user state
    setUser(null);
    
    // Redirect to home
    navigate('/');
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.is_admin;
  };

  const contextValue = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;