import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('skillswap_user');
    const storedToken = localStorage.getItem('skillswap_token');
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const register = async (formData) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/register', formData);
      const userData = data.data;
      setUser(userData);
      localStorage.setItem('skillswap_user', JSON.stringify(userData));
      localStorage.setItem('skillswap_token', userData.token);
      localStorage.setItem('zedify_user', JSON.stringify(userData));
      localStorage.setItem('zedify_token', userData.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/login', { email, password });
      const userData = data.data;
      setUser(userData);
      localStorage.setItem('zedify_user', JSON.stringify(userData));
      localStorage.setItem('zedify_token', userData.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zedify_user');
    localStorage.removeItem('zedify_token');
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUserInContext = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem('zedify_user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout, updateUserInContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
