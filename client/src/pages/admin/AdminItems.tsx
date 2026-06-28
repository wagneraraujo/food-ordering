import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  available: boolean;
}

const AdminItems: React.FC = () => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Form State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string | number>('');
  const [category, setCategory] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [available, setAvailable] = useState<boolean>(true);

  // Form loading
  const [formLoading, setFormLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/items');
      setItems(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Could not load menu items.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item: FoodItem) => {
    setIsEditing(true);
    setCurrentId(item._id);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price);
    setCategory(item.category);
    setImage(item.image || '');
    setAvailable(item.available);
  };

  const handleResetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setImage('');
    setAvailable(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const payload = {
      name,
      description,
      price: typeof price === 'string' ? parseFloat(price) : price,
      category,
      image,
      available
    };

    try {
      if (isEditing && currentId) {
        const res = await axios.put(`/api/items/${currentId}`, payload);
        setItems(prev => prev.map(item => item._id === currentId ? res.data : item));
        alert('Item updated successfully!');
      } else {
        const res = await axios.post('/api/items', payload);
        setItems(prev => [...prev, res.data]);
        alert('Item added successfully!');
      }
      handleResetForm();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save food item');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;

    try {
      await axios.delete(`/api/items/${itemId}`);
      setItems(prev => prev.filter(item => item._id !== itemId));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete food item');
    }
  };

  if (loading) {
    return (
      <div className="container center-msg">
        <div className="spinner"></div>
        <p>Loading catalog items...</p>
      </div>
    );
  }

  return (
    <div className="admin-page container">
      <header className="admin-header">
        <div>
          <h1>Food Catalog Management</h1>
          <p>Create, update, toggle availability, or remove items from the system menu.</p>
        </div>
        <div className="admin-nav-actions">
          <Link to="/admin" className="btn btn-secondary">← Back to Dashboard</Link>
        </div>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="admin-items-layout">
        {/* Creation/Edition Form */}
        <div className="admin-card form-section">
          <h2>{isEditing ? 'Edit Food Item' : 'Create New Food Item'}</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="itemName">Item Name *</label>
              <input
                id="itemName"
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Spicy Chicken Kottu"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="itemCategory">Category *</label>
              <input
                id="itemCategory"
                type="text"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Mains, Desserts, Appetizers"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="itemPrice">Price (USD) *</label>
              <input
                id="itemPrice"
                type="number"
                step="0.01"
                className="form-control"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 1200.00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="itemImage">Image URL (Optional)</label>
              <input
                id="itemImage"
                type="url"
                className="form-control"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="itemDesc">Description</label>
              <textarea
                id="itemDesc"
                rows={3}
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of ingredients or size"
              ></textarea>
            </div>

            <div className="form-group checkbox-group">
              <input
                id="itemAvailable"
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
              />
              <label htmlFor="itemAvailable">Available in Menu</label>
            </div>

            <div className="form-actions-row">
              <button type="submit" className="btn btn-primary" disabled={formLoading}>
                {formLoading ? 'Saving...' : isEditing ? 'Update Item' : 'Add Item'}
              </button>
              {isEditing && (
                <button type="button" className="btn btn-secondary" onClick={handleResetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Items Grid */}
        <div className="admin-card list-section">
          <h2>Catalog Items ({items.length})</h2>
          
          <div className="admin-items-grid">
            {items.length === 0 ? (
              <p className="no-items-text">No items in catalog yet. Create one!</p>
            ) : (
              items.map(item => (
                <div className={`admin-item-card ${!item.available ? 'item-unavailable' : ''}`} key={item._id}>
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'}
                    alt={item.name}
                    className="item-img"
                    loading="lazy"
                  />
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <span className="badge status-ready">{item.category}</span>
                    <p className="price">${item.price.toLocaleString()}</p>
                    <p className="status-label">
                      Status: {item.available ? '🟢 Live' : '🔴 Hidden'}
                    </p>
                  </div>
                  <div className="item-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(item)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminItems;
