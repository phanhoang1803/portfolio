// frontend/src/components/Footer.jsx
import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-text">&copy; {currentYear} Academic Portfolio</p>
          <p className="footer-text">Created with FastAPI & React</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
