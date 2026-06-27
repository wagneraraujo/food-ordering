import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Customer {
  name: string;
  email: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderId: string;
  customer?: Customer;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Paid' | 'Failed';
  createdAt: string;
  updatedAt: string;
}

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch orders. Please make sure you are logged in as an administrator.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdateLoading(orderId);
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: newStatus as Order['status'] } : order
        )
      );
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdateLoading(null);
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
        <p>Loading administrative dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container center-msg">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page container">
      <header className="admin-header">
        <div>
          <h1>Admin Control Panel</h1>
          <p>Monitor customer orders, adjust progress status, and manage the food catalog.</p>
        </div>
        <div className="admin-nav-actions">
          <Link to="/admin/items" className="btn btn-secondary">Manage Food Items</Link>
        </div>
      </header>

      {/* Orders Table */}
      <div className="admin-card">
        <h2>Order Tracking ({orders.length})</h2>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Items Ordered</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">No orders placed in the system yet.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td className="font-mono" style={{ fontSize: '14px' }}>
                      <Link to={`/confirmation?order_id=${order.orderId}`}>{order.orderId}</Link>
                    </td>
                    <td>
                      <div className="cust-info">
                        <strong>{order.customer?.name || 'Unknown'}</strong>
                        <span className="text-muted">{order.customer?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <ul className="items-list-plain" style={{ fontSize: '14px', margin: 0, paddingLeft: 0 }}>
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} <span className="item-qty-tag">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>LKR {order.total.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${order.paymentStatus === 'Paid' ? 'status-ready' : 'status-pending'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-control form-control-sm"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updateLoading === order._id}
                        style={{ minWidth: '120px' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready">Ready</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
