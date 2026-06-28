import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Cart: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [payhereParams, setPayhereParams] = useState<Record<string, any> | null>(null);
  
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-submit PayHere form once parameters are received
  useEffect(() => {
    if (payhereParams && formRef.current) {
      formRef.current.submit();
    }
  }, [payhereParams]);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create order on the backend
      const orderPayload = {
        items: cartItems.map((item) => ({
          item: item._id,
          quantity: item.quantity
        }))
      };

      const orderRes = await axios.post('/api/orders', orderPayload);
      const createdOrder = orderRes.data;

      // 2. Initiate payment session to get signed PayHere parameters
      const paymentRes = await axios.post('/api/payments/init', {
        orderId: createdOrder._id
      });

      // Clear local cart now that the order is successfully logged
      clearCart();

      // 3. Set parameters to trigger the auto-submit form
      setPayhereParams(paymentRes.data);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Failed to process checkout. Please try again.');
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !payhereParams) {
    return (
      <div className="container cart-empty-page">
        <div className="empty-card">
          <span className="empty-cart-icon">🛒</span>
          <h2>Your Cart is Empty</h2>
          <p>Go back to our menu and select delicious food items to satisfy your cravings.</p>
          <Link to="/" className="btn btn-primary">Browse Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1>Shopping Cart</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}

      {payhereParams ? (
        <div className="checkout-redirect-loading">
          <div className="spinner"></div>
          <h2>Redirecting to PayHere Sandbox...</h2>
          <p>Please do not close or refresh this page. You will be redirected to complete your payment.</p>
          
          {/* Hidden PayHere Submission Form */}
          <form
            ref={formRef}
            action="https://sandbox.payhere.lk/pay/checkout"
            method="POST"
            style={{ display: 'none' }}
          >
            {Object.entries(payhereParams).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={String(value)} />
            ))}
          </form>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Items List */}
          <div className="cart-items-section">
            {cartItems.map((item) => (
              <div className="cart-item-card" key={item._id}>
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'}
                  alt={item.name}
                  className="cart-item-img"
                />
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-cat">{item.category}</p>
                  <p className="cart-item-price">${item.price.toLocaleString()}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-selector">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    >-</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >+</button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="btn-remove"
                    title="Remove item"
                  >
                    🗑️ Remove
                  </button>
                </div>
                <div className="cart-item-subtotal">
                  ${(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary Panel */}
          <div className="cart-summary-section">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Items Count:</span>
                <span>{cartItems.reduce((acc, i) => acc + i.quantity, 0)}</span>
              </div>
              <div className="summary-row total-row">
                <span>Total:</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>

              {user ? (
                <button
                  onClick={handleCheckout}
                  className="btn btn-primary btn-block btn-checkout"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Proceed to Checkout (PayHere)'}
                </button>
              ) : (
                <div className="auth-checkout-prompt">
                  <p>You must be signed in to check out.</p>
                  <Link to="/login" className="btn btn-primary btn-block">Login & Check Out</Link>
                </div>
              )}
              
              <Link to="/" className="continue-shopping">← Continue Shopping</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
