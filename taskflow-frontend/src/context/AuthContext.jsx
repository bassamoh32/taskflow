import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      console.log('Login response:', response);
      // response structure: { success, message, data: { token, user } }
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response: missing token or user');
      }

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);
      return response;
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password, confirmPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(name, email, password, confirmPassword);
      console.log('Register response:', response);
      // response structure: { success, message, data: { token, user } }
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Invalid response: missing token or user');
      }

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);
      return response;
    } catch (err) {
      console.error('Register error:', err);
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
