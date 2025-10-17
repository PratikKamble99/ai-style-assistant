import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, authService, connectionService } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  profile?: any;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuthState = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await fetchUserProfile();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      await SecureStore.deleteItemAsync('token');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const login = async (email: string, password: string) => {
    console.log('🔐 Attempting login for:', email);
    
    try {
      // First test connectivity
      const connectivityTest = await connectionService.testConnectivity();
      if (!connectivityTest.success) {
        throw new Error('Cannot connect to server. Please check your internet connection and try again.');
      }
      
      const response = await authService.login(email, password);
      console.log('✅ Login successful');
      
      const { user, token } = response.data;
      
      await SecureStore.setItemAsync('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Login failed';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check your internet connection and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const googleLogin = async (idToken: string) => {
    console.log('🔐 Attempting Google login');
    
    try {
      // First test connectivity
      const connectivityTest = await connectionService.testConnectivity();
      if (!connectivityTest.success) {
        throw new Error('Cannot connect to server. Please check your internet connection and try again.');
      }
      
      const response = await api.post('/auth/google', { idToken });
      console.log('✅ Google login successful');
      
      const { user, token } = response.data;
      
      await SecureStore.setItemAsync('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
    } catch (error: any) {
      console.error('❌ Google login failed:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Google login failed';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check your internet connection and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid Google token. Please try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    console.log('📝 Attempting registration for:', email);
    
    try {
      // First test connectivity
      const connectivityTest = await connectionService.testConnectivity();
      if (!connectivityTest.success) {
        throw new Error('Cannot connect to server. Please check your internet connection and try again.');
      }
      
      const response = await authService.register(email, password, name);
      console.log('✅ Registration successful');
      
      const { user, token } = response.data;
      
      await SecureStore.setItemAsync('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Registration failed';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check your internet connection and try again.';
      } else if (error.response?.status === 409) {
        errorMessage = 'An account with this email already exists.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || 'Invalid registration data. Please check your inputs.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const value = {
    user,
    login,
    googleLogin,
    register,
    logout,
    loading,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};