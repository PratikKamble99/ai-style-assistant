import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3003/api',
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API service functions
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
}

export const userService = {
  getProfile: () => api.get('/user/profile'),
  
  updateProfile: (profileData: any) =>
    api.put('/user/profile', profileData),
  
  addPhoto: (url: string, publicId: string, type: string) =>
    api.post('/user/photos', { url, publicId, type }),
  
  getFavorites: () => api.get('/user/favorites'),
  
  addFavorite: (productData: any) =>
    api.post('/user/favorites', productData),
  
  removeFavorite: (id: string) =>
    api.delete(`/user/favorites/${id}`),
}

export const aiService = {
  analyzePhoto: (photoUrl: string, analysisType: string) =>
    api.post('/ai/analyze-photo', { photoUrl, analysisType }),

  analyzePhotos: (facePhotos: string[], bodyPhotos: string[]) =>
    api.post('/ai/analyze-photos', { facePhotos, bodyPhotos }),
  
  getSuggestions: (occasion: string, preferences?: any) =>
    api.post('/ai/suggestions', { occasion, preferences }),
  
  generateVirtualTryOn: (userPhotoUrl: string, outfitDescription: string) =>
    api.post('/ai/virtual-tryon', { userPhotoUrl, outfitDescription }),
  
  submitFeedback: (suggestionId: string, rating: number, liked: boolean, comment?: string) =>
    api.post('/ai/feedback', { suggestionId, rating, liked, comment }),
  
  getSuggestionHistory: (page: number = 1, limit: number = 10) =>
    api.get(`/ai/suggestions/history?page=${page}&limit=${limit}`),
}

export const productService = {
  searchProducts: (query: string, filters?: any) =>
    api.get('/products/search', { params: { query, ...filters } }),
  
  getRecommendations: (suggestionId: string) =>
    api.get(`/products/recommendations/${suggestionId}`),
}

export const uploadService = {
  uploadImage: (file: File, type: string) => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', type)
    
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  uploadMultipleImages: (files: File[], folder?: string) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })
    if (folder) {
      formData.append('folder', folder)
    }
    return api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  deleteImage: (publicId: string) => {
    return api.delete(`/upload/image/${encodeURIComponent(publicId)}`)
  },

  getUploadSignature: (folder?: string) => {
    return api.post('/upload/signature', { folder })
  },

  transformImage: (publicId: string, transformations?: any[]) => {
    return api.post('/upload/transform', { publicId, transformations })
  },
}

export const dashboardService = {
  getOverview: () => api.get('/dashboard/overview'),
  
  getMetrics: () => api.get('/dashboard/metrics'),
  
  getAnalytics: (timeRange: '7d' | '30d' | '90d' = '7d') =>
    api.get(`/dashboard/analytics?range=${timeRange}`),
  
  getNotifications: (limit: number = 10) =>
    api.get(`/dashboard/notifications?limit=${limit}`),
  
  getWeatherSuggestions: (lat?: number, lon?: number) => {
    const params = lat && lon ? `?lat=${lat}&lon=${lon}` : '';
    return api.get(`/dashboard/weather-suggestions${params}`);
  },
  
  trackActivity: (type: string, metadata?: any) =>
    api.post('/dashboard/activity', { type, metadata }),
  
  getUpdates: (since?: string) => {
    const params = since ? `?since=${since}` : '';
    return api.get(`/dashboard/updates${params}`);
  },
}