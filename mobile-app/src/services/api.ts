import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Update this URL to your backend API
// For mobile development, you might need to use your computer's IP address instead of localhost
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Use your computer's IP address for mobile device testing
    // Replace with your actual IP address if different
    // return 'http://192.168.29.129:3003/api';
    return 'http://172.30.232.113:3003/api';
  }
  return 'https://your-production-api.com/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🌐 Mobile API Base URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  // timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);

    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token attached to request');
    } else {
      console.log('⚠️ No token found for request');
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      code: error.code
    });

    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error - Check if backend server is running and accessible');
      console.error('💡 Backend should be running at:', API_BASE_URL.replace('/api', ''));
    }

    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - Clearing token');
      await SecureStore.deleteItemAsync('token');
      // Navigate to login screen - you might want to use navigation service here
    }

    return Promise.reject(error);
  }
);

// API service functions
export const authService = {
  login: (email: string, password: string) => {
    console.log(email, password)
    return api.post('/auth/login', { email, password })
  },

  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
};

export const userService = {
  getProfile: () => api.get('/user/profile'),

  updateProfile: (profileData: any) =>
    api.put('/user/profile', profileData),

  addPhoto: (url: string, publicId: string, type: string) =>
    api.post('/user/photos', { url, publicId, type }),

  getPhotos: () => api.get('/user/photos'),

  removePhoto: (photoId: string) => api.delete(`/user/photos/${photoId}`),

  getFavorites: () => api.get('/user/favorites'),

  addFavorite: (productData: any) =>
    api.post('/user/favorites', productData),

  removeFavorite: (id: string) =>
    api.delete(`/user/favorites/${id}`),
};

export const aiService = {
  analyzePhoto: (photoUrl: string, analysisType: string) =>
    api.post('/ai/analyze-photo', { photoUrl, analysisType }),

  analyzePhotos: (facePhotos: string[], bodyPhotos: string[], userHeight?: number) =>
    api.post('/ai/analyze-photos', { facePhotos, bodyPhotos, userHeight }),

  analyzeMeasurements: (bodyPhotos: string[], userHeight?: number, userWeight?: number) =>
    api.post('/ai/analyze-measurements', { bodyPhotos, userHeight, userWeight }),

  // Deprecated - use suggestionsService.generate instead
  getSuggestions: (occasion: string, preferences?: any) =>
    api.post('/suggestions/generate', { occasion, ...preferences }),

  generateVirtualTryOn: (userPhotoUrl: string, outfitDescription: string) =>
    api.post('/ai/virtual-tryon', { userPhotoUrl, outfitDescription }),

  // Deprecated - use suggestionsService.submitFeedback instead
  submitFeedback: (suggestionId: string, rating: number, liked: boolean, comment?: string) =>
    api.post(`/suggestions/${suggestionId}/feedback`, { rating, liked, comment }),

  // Deprecated - use suggestionsService.getHistory instead
  getSuggestionHistory: (page: number = 1, limit: number = 10) =>
    api.get(`/suggestions/history?page=${page}&limit=${limit}`),
};

export const productService = {
  searchProducts: (query: string, filters?: any) =>
    api.get('/products/search', { params: { query, ...filters } }),

  getRecommendations: (suggestionId: string) =>
    api.get(`/products/recommendations/${suggestionId}`),

  getProductDetails: (platform: string, productId: string) =>
    api.get(`/products/details/${platform}/${productId}`),

  getTrendingProducts: (filters?: any) =>
    api.get('/products/trending', { params: filters }),

  getSimilarProducts: (platform: string, productId: string, limit?: number) =>
    api.get(`/products/similar/${platform}/${productId}`, { params: { limit } }),

  trackProductView: (productId: string, platform: string, suggestionId?: string) =>
    api.post('/products/track-view', { productId, platform, suggestionId }),
};

export const uploadService = {
  uploadImage: (uri: string, type: string = 'BODY') => {
    const formData = new FormData();
    formData.append('image', {
      uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);
    formData.append('type', type);

    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadMultipleImages: (uris: string[], folder?: string) => {
    const formData = new FormData();
    uris.forEach((uri, index) => {
      formData.append('images', {
        uri,
        type: 'image/jpeg',
        name: `photo_${index}.jpg`,
      } as any);
    });
    if (folder) {
      formData.append('folder', folder);
    }

    return api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteImage: (imageId: string) =>
    api.delete(`/upload/image/${imageId}`),

  getUploadSignature: (folder?: string) =>
    api.post('/upload/signature', { folder }),
};

export const suggestionsService = {
  // Health check
  healthCheck: () => api.get('/suggestions/health'),

  // Generate new suggestion (now uses profile data)
  generate: (data: {
    occasion: string;
    budget?: string;
    season?: string;
    searchProducts?: boolean;
    maxProductsPerCategory?: number;
  }) => api.post('/suggestions/generate', data),

  // Get suggestion history
  getHistory: (page: number = 1, limit: number = 10) =>
    api.get(`/suggestions/history?page=${page}&limit=${limit}`),

  // Get suggestion details
  getDetails: (id: string) => api.get(`/suggestions/${id}`),

  // Submit feedback
  submitFeedback: (id: string, data: {
    rating: number;
    liked: boolean;
    comment?: string;
  }) => api.post(`/suggestions/${id}/feedback`, data),

  // Get trending suggestions
  getTrending: () => api.get('/suggestions/trending/popular'),
};

export const dashboardService = {
  getUserDashboard: () => api.get('/dashboard/user'),

  getRecommendations: () => api.get('/dashboard/recommendations'),

  trackActivity: (type: string, metadata?: any) =>
    api.post('/dashboard/activity', { type, metadata }),

  getAnalytics: (period?: string) =>
    api.get('/dashboard/analytics', { params: { period } }),
};

export const trendingService = {
  // Get trending outfits
  getTrending: (limit?: number, offset?: number) =>
    api.get('/trending', { params: { limit, offset } }),

  // Get featured trending outfits
  getFeatured: (limit?: number) =>
    api.get('/trending/featured', { params: { limit } }),

  // Get trending outfit by ID
  getById: (id: string) => api.get(`/trending/${id}`),

  // Like/Unlike trending outfit
  toggleLike: (id: string) => api.post(`/trending/${id}/like`),

  // Share trending outfit
  share: (id: string) => api.post(`/trending/${id}/share`),

  // Get trending by category
  getByCategory: (category: string, limit?: number, offset?: number) =>
    api.get(`/trending/category/${category}`, { params: { limit, offset } }),

  // Get trending by occasion
  getByOccasion: (occasion: string, limit?: number, offset?: number) =>
    api.get(`/trending/occasion/${occasion}`, { params: { limit, offset } }),
};

export const notificationService = {
  // Get user notifications
  getNotifications: (limit?: number, offset?: number) =>
    api.get('/notifications', { params: { limit, offset } }),

  // Mark notification as read
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

  // Register device token for push notifications
  registerDeviceToken: (token: string, platform: 'IOS' | 'ANDROID' | 'WEB') =>
    api.post('/notifications/device-token', { token, platform }),

  // Update notification preferences
  updatePreferences: (preferences: any) =>
    api.put('/notifications/preferences', preferences),

  // Get notification preferences
  getPreferences: () => api.get('/notifications/preferences'),

  // Admin: Trigger trending cron (for testing)
  triggerTrendingCron: () => api.post('/notifications/admin/trigger-trending'),

  // Admin: Get cron status
  getCronStatus: () => api.get('/notifications/admin/cron-status'),
};

export const connectionService = {
  testConnection: () => api.get('/test'),

  getApiBaseUrl: () => API_BASE_URL,

  checkHealth: () => {
    // Remove /api from base URL for health check
    const healthUrl = API_BASE_URL.replace('/api', '/health');
    console.log('🏥 Health check URL:', healthUrl);
    return axios.get(healthUrl);
  },

  // Test basic connectivity
  testConnectivity: async () => {
    console.log('🔍 Testing connectivity to backend...');

    try {
      const healthUrl = API_BASE_URL.replace('/api', '/health');
      const response = await axios.get(healthUrl, { timeout: 5000 });

      console.log('✅ Backend is reachable:', response.status);
      return { success: true, status: response.status };
    } catch (error: any) {
      console.error('❌ Backend connectivity test failed:', error.message);

      if (error.code === 'ERR_NETWORK') {
        console.error('💡 Possible solutions:');
        console.error('   1. Make sure backend server is running on port 3003');
        console.error('   2. Check if your IP address has changed');
        console.error('   3. Ensure your device and computer are on the same network');
        console.error('   4. Try using your computer\'s IP address instead of localhost');
      }

      return { success: false, error: error.message, code: error.code };
    }
  },
};