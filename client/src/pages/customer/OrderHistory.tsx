import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Paid' | 'Failed';
  createdAt: string;
  updatedAt: string;
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/my-orders');
      setOrders(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Could not load order history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Preparing': return 'status-preparing';
      case 'Ready': return 'status-ready';
      case 'Delivered': return 'status-delivered';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="container center-msg">
        <div className="spinner"></div>
        <p>Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="history-page container">
      <h1>My Order History</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-card">
          <span>🍽️</span>
          <h2>No Orders Placed Yet</h2>
          <p>You haven't ordered any food yet. Explore our delicious menu to get started!</p>
          <Link to="/" className="btn btn-primary">Browse Menu</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-history-card" key={order._id}>
              <div className="card-header">
                <div>
                  <span className="order-id-label">Order #</span>
                  <span className="order-id-value font-mono">{order.orderId}</span>
                </div>
                <div>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="card-body-grid">
                <div className="order-items-summary">
                  <h4>Items Summary</h4>
                  <ul className="items-list-plain">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} <span className="item-qty-tag">x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="order-pricing-status">
                  <div className="price-label">Total Amount:</div>
                  <div className="price-value">${order.total.toLocaleString()}</div>
                  
                  <div className="status-label-group">
                    <span className={`badge ${getStatusClass(order.status)}`}>{order.status}</span>
                    <span className={`badge ${order.paymentStatus === 'Paid' ? 'status-ready' : 'status-pending'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="card-footer">
                <Link to={`/confirmation?order_id=${order.orderId}`} className="btn btn-secondary btn-sm">
                  View Full Details & Status
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
