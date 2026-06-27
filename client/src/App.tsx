import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Menu from './pages/customer/Menu';
import Cart from './pages/customer/Cart';
import Confirmation from './pages/customer/Confirmation';
import OrderHistory from './pages/customer/OrderHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminItems from './pages/admin/AdminItems';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Menu />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />

                {/* Protected Customer Routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="/confirmation" element={<Confirmation />} />
                  <Route path="/orders" element={<OrderHistory />} />
                </Route>

                {/* Protected Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/items" element={<AdminItems />} />
                </Route>

                {/* Catch-all Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <footer className="app-footer">
              <p>&copy; {new Date().getFullYear()} FeastFlow Inc. Sri Lanka. All rights reserved.</p>
            </footer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
