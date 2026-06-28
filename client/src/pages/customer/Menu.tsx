import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../../context/CartContext';

interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  available: boolean;
}

const Menu: React.FC = () => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/items');
      setItems(response.data);
    } catch (err) {
      setError('Could not load menu items. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId: string, val: string | number) => {
    const qty = typeof val === 'string' ? parseInt(val) || 1 : val;
    setQuantities(prev => ({
      ...prev,
      [itemId]: qty < 1 ? 1 : qty
    }));
  };

  const handleAddToCart = (item: FoodItem) => {
    const qty = quantities[item._id] || 1;
    addToCart(item, qty);
    // Reset quantity input to 1 after adding
    setQuantities(prev => ({
      ...prev,
      [item._id]: 1
    }));
  };

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))];

  if (loading) {
    return (
      <div className="container center-msg">
        <div className="spinner"></div>
        <p>Loading our delicious menu...</p>
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
    <div className="menu-page container">
      <header className="menu-header">
        <h1>Delicious Food, Delivered To You</h1>
        <p>Choose from our curated collection of signature dishes, crafted by expert chefs.</p>
      </header>

      {/* Filters Bar */}
      <div className="menu-filters">
        <input
          type="text"
          placeholder="Search for dishes..."
          className="form-control search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <div className="category-tags">
          {categories.map(cat => (
            <button
              key={cat}
              className={`tag-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <p>No dishes found matching your criteria. Try searching for something else!</p>
        </div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map(item => {
            const currentQty = quantities[item._id] || 1;
            return (
              <div className="menu-card" key={item._id}>
                <div className="menu-card-img-wrapper">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'}
                    alt={item.name}
                    className="menu-card-img"
                    loading="lazy"
                  />
                  <span className="menu-card-category">{item.category}</span>
                </div>
                <div className="menu-card-body">
                  <h3 className="menu-card-title">{item.name}</h3>
                  <p className="menu-card-desc">{item.description}</p>
                  <div className="menu-card-footer">
                    <span className="menu-card-price">${item.price.toLocaleString()}</span>
                    
                    <div className="menu-card-action">
                      <div className="qty-selector">
                        <button 
                          className="qty-btn" 
                          onClick={() => handleQuantityChange(item._id, currentQty - 1)}
                          aria-label="Decrease quantity"
                        >-</button>
                        <input
                          type="number"
                          className="qty-input"
                          min="1"
                          value={currentQty}
                          onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                          aria-label="Quantity"
                        />
                        <button 
                          className="qty-btn" 
                          onClick={() => handleQuantityChange(item._id, currentQty + 1)}
                          aria-label="Increase quantity"
                        >+</button>
                      </div>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="btn btn-primary btn-sm btn-add-cart"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Menu;
