// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  
  return (
    <nav className="navbar">
      <div className="container-wide">
        <div className="navbar-content">
          {/* Logo/site name */}
          <div className="navbar-logo">
            <Link to="/" className="navbar-title">
              Academic Portfolio
            </Link>
          </div>
          
          {/* Navigation links */}
          <div className="navbar-links">
            <Link to="/" className="navbar-link">
              Home
            </Link>
            {/* Future navigation items can go here */}
          </div>
          
          {/* User menu */}
          <div className="navbar-user">
            {user ? (
              <div className="navbar-user-menu">
                <span className="navbar-username">
                  {user.username}
                </span>
                {isAdmin() && (
                  <Link to="/admin" className="navbar-admin">
                    Admin
                  </Link>
                )}
                <button onClick={logout} className="navbar-logout">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="navbar-login">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
