import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Set auth header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Decode token to get user info
          const decoded = jwt_decode(token);
          
          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            // Token is expired, try to refresh
            await refreshToken();
          } else {
            // Set user from token
            setUser({
              id: decoded.user.id,
              userType: decoded.user.userType
            });
            setIsAuthenticated(true);
          }
        } catch (err) {
          // Invalid token or other error, log out
          logout();
          setError('Session expired. Please login again.');
        }
      }
      
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post('/api/auth/register', userData);
      
      // Save token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      // Set user
      setUser({
        id: res.data.user.id,
        email: res.data.user.email,
        name: res.data.user.name,
        userType: res.data.user.userType
      });
      
      setIsAuthenticated(true);
      setLoading(false);
      
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post('/api/auth/login', { email, password });
      
      // Save tokens to localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      // Set user
      setUser({
        id: res.data.user.id,
        email: res.data.user.email,
        name: res.data.user.name,
        userType: res.data.user.userType
      });
      
      setIsAuthenticated(true);
      setLoading(false);
      
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }
      
      const res = await axios.post('/api/auth/refresh-token', {
        refreshToken: refreshTokenValue
      });
      
      // Save new token
      localStorage.setItem('token', res.data.token);
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      // Decode token to get user info
      const decoded = jwt_decode(res.data.token);
      
      // Set user from token
      setUser({
        id: decoded.user.id,
        userType: decoded.user.userType
      });
      
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      logout();
      setError('Session expired. Please login again.');
      return false;
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const res = await axios.get('/api/users/profile');
      
      // Update user with full profile information
      setUser({
        ...user,
        ...res.data.user
      });
      
      return res.data.user;
    } catch (err) {
      setError('Failed to load user profile');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    // Remove tokens from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        refreshToken,
        fetchUserProfile,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
