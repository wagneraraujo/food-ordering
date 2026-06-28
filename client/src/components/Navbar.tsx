import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <span className="logo-emoji" role="img" aria-label="hamburger">🍔</span> FeastFlow
        </Link>

        {/* Hamburger Toggle */}
        <button 
          className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <div className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="navbar-link" onClick={closeMobileMenu}>Menu</Link>
          
          {user && user.role === 'customer' && (
            <Link to="/orders" className="navbar-link" onClick={closeMobileMenu}>My Orders</Link>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin" className="navbar-link admin-tag" onClick={closeMobileMenu}>Admin Panel</Link>
          )}

          <Link to="/cart" className="navbar-link cart-link" onClick={closeMobileMenu}>
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="user-menu">
              <span className="user-greeting">Hi, {user.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm" onClick={closeMobileMenu}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMobileMenu}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
      {/* Overlay to close menu when clicking outside */}
      {mobileMenuOpen && <div className="navbar-overlay" onClick={closeMobileMenu}></div>}
    </nav>
  );
};

export default Navbar;
