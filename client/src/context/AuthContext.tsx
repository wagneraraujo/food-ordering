import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

// Configure Axios base URL
axios.defaults.baseURL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';
axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = 'true';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
}

export interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserInfo>;
  register: (name: string, email: string, password: string, phone: string, role?: string) => Promise<UserInfo>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState<boolean>(true);

  // Set default auth header on token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If unauthorized, logout
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<UserInfo> => {
    const response = await axios.post('/api/auth/login', { email, password });
    const { token: receivedToken, user: userData } = response.data;
    setToken(receivedToken);
    setUser(userData);
    return userData;
  };

  const register = async (name: string, email: string, password: string, phone: string, role: string = 'customer'): Promise<UserInfo> => {
    const response = await axios.post('/api/auth/register', { name, email, password, phone, role });
    const { token: receivedToken, user: userData } = response.data;
    setToken(receivedToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
