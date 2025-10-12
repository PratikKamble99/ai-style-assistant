import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Update this URL to your backend API
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api' 
  : 'https://your-production-api.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  // timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
      // Navigate to login screen - you might want to use navigation service here
    }
    return Promise.reject(error);
  }
);

// API service functions
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
};

export const userService = {
  getProfile: () => api.get('/user/profile'),
  
  updateProfile: (profileData: any) =>
    api.put('/user/profile', profileData),
  
  addPhoto: (url: string, type: string) =>
    api.post('/user/photos', { url, type }),
  
  getFavorites: () => api.get('/user/favorites'),
  
  addFavorite: (productData: any) =>
    api.post('/user/favorites', productData),
  
  removeFavorite: (id: string) =>
    api.delete(`/user/favorites/${id}`),
};

export const aiService = {
  analyzePhoto: (photoUrl: string, analysisType: string) =>
    api.post('/ai/analyze-photo', { photoUrl, analysisType }),
  
  getSuggestions: (occasion: string, preferences?: any) =>
    api.post('/ai/suggestions', { occasion, preferences }),
  
  generateVirtualTryOn: (userPhotoUrl: string, outfitDescription: string) =>
    api.post('/ai/virtual-tryon', { userPhotoUrl, outfitDescription }),
  
  submitFeedback: (suggestionId: string, rating: number, liked: boolean, comment?: string) =>
    api.post('/ai/feedback', { suggestionId, rating, liked, comment }),
  
  getSuggestionHistory: (page: number = 1, limit: number = 10) =>
    api.get(`/ai/suggestions/history?page=${page}&limit=${limit}`),
};

export const uploadService = {
  uploadImage: (uri: string) => {
    const formData = new FormData();
    formData.append('image', {
      uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);
    
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};