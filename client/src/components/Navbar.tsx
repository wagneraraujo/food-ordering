import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-emoji">🍔</span> FeastFlow
        </Link>

        <div className="navbar-links">
          <Link to="/" className="navbar-link">Menu</Link>
          
          {user && user.role === 'customer' && (
            <Link to="/orders" className="navbar-link">My Orders</Link>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin" className="navbar-link admin-tag">Admin Panel</Link>
          )}

          <Link to="/cart" className="navbar-link cart-link">
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
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
