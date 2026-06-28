import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderId: string;
  customer?: any;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Paid' | 'Failed';
  createdAt: string;
  updatedAt: string;
}

const Confirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [simulating, setSimulating] = useState<boolean>(false);

  useEffect(() => {
    if (!orderId) {
      setError('No Order ID found in URL parameters.');
      setLoading(false);
      return;
    }

    fetchOrder();

    // Set up polling to check for payment webhook updates every 4 seconds
    const interval = setInterval(fetchOrder, 4000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      setOrder(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error loading order details.');
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!orderId) return;
    setSimulating(true);
    try {
      await axios.post('/api/payments/simulate', { orderId });
      await fetchOrder();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to simulate payment.');
    } finally {
      setSimulating(false);
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

  const getPaymentStatusClass = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'Unpaid': return 'status-pending';
      case 'Paid': return 'status-ready';
      case 'Failed': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading && !order) {
    return (
      <div className="container center-msg">
        <div className="spinner"></div>
        <p>Retrieving order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container center-msg">
        <div className="alert alert-danger">{error || 'Order not found.'}</div>
        <Link to="/" className="btn btn-primary mt-4">Back to Menu</Link>
      </div>
    );
  }

  return (
    <div className="confirmation-page container">
      <div className="confirmation-card">
        {order.paymentStatus === 'Paid' ? (
          <div className="success-banner animate-pop">
            <span className="success-icon">🎉</span>
            <h2>Payment Successful!</h2>
            <p>Your payment was processed successfully. The kitchen is preparing your food.</p>
          </div>
        ) : order.paymentStatus === 'Failed' || order.status === 'Cancelled' ? (
          <div className="failed-banner">
            <span className="failed-icon">❌</span>
            <h2>Order Cancelled or Failed</h2>
            <p>The transaction was cancelled or payment failed. If this was a mistake, please try placing your order again.</p>
          </div>
        ) : (
          <div className="pending-banner">
            <div className="spinner-sm"></div>
            <h2>Awaiting Payment Confirmation...</h2>
            <p>We are waiting for PayHere to confirm your payment. This page updates automatically.</p>
            <button
              onClick={handleSimulatePayment}
              disabled={simulating}
              className="btn btn-primary mt-4"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                color: '#fff',
                fontWeight: 'bold',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                transition: 'transform 0.2s ease, opacity 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {simulating ? 'Simulating...' : '⚡ Simulate Payment Success (Dev Mode)'}
            </button>
          </div>
        )}

        <div className="order-details-summary">
          <h3>Order Details</h3>
          <hr />
          <div className="info-grid">
            <div className="info-label">Order Number:</div>
            <div className="info-value font-mono">{order.orderId}</div>

            <div className="info-label">Order Status:</div>
            <div className="info-value">
              <span className={`badge ${getStatusClass(order.status)}`}>{order.status}</span>
            </div>

            <div className="info-label">Payment Status:</div>
            <div className="info-value">
              <span className={`badge ${getPaymentStatusClass(order.paymentStatus)}`}>{order.paymentStatus}</span>
            </div>

            <div className="info-label">Date & Time:</div>
            <div className="info-value">{new Date(order.createdAt).toLocaleString()}</div>
          </div>

          <h4 className="mt-4">Items Ordered</h4>
          <table className="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">${item.price.toLocaleString()}</td>
                  <td className="text-right">${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="grand-total-row">
                <td colSpan={3}>Total Paid</td>
                <td className="text-right">${order.total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="action-buttons">
          <Link to="/" className="btn btn-secondary">Order More Food</Link>
          {order.customer && (
            <Link to="/orders" className="btn btn-primary">View Order History</Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
