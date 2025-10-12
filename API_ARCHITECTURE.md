# API Architecture - AI Stylist Application

## 🏗️ Architecture Overview

The AI Stylist application uses a **direct axios-based API architecture** instead of React Query for simpler state management and more predictable data flow.

## 📡 API Communication Flow

```
Frontend (React/React Native) 
    ↓ axios calls
Backend API (Node.js + Express)
    ↓ database queries
PostgreSQL Database
    ↓ AI processing
AI Services (Python/Node.js)
```

## 🔧 API Service Structure

### **Frontend API Service (`src/services/api.ts`)**

```typescript
// Centralized axios configuration
export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Service modules
export const authService = { login, register }
export const userService = { getProfile, updateProfile, addPhoto }
export const aiService = { analyzePhoto, getSuggestions, submitFeedback }
export const productService = { searchProducts, getRecommendations }
export const uploadService = { uploadImage }
```

### **Backend API Routes**

```typescript
// Route structure
/api/auth/*      - Authentication endpoints
/api/user/*      - User profile and data management
/api/ai/*        - AI analysis and suggestions
/api/products/*  - Product search and recommendations
/api/upload/*    - Image upload and management
```

## 🎯 Benefits of Direct Axios Approach

### **Simplicity**
- ✅ No additional abstraction layer
- ✅ Direct control over API calls
- ✅ Easier debugging and error handling
- ✅ Smaller bundle size

### **Flexibility**
- ✅ Custom error handling per endpoint
- ✅ Request/response interceptors
- ✅ Easy to add authentication headers
- ✅ Simple retry logic when needed

### **Performance**
- ✅ No caching overhead for real-time data
- ✅ Predictable network requests
- ✅ Direct state updates in components
- ✅ Faster initial load time

## 📋 API Call Patterns

### **1. Authentication Flow**
```typescript
// Login example
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await authService.login(email, password)
    const { user, token } = response.data
    localStorage.setItem('token', token)
    setUser(user)
  } catch (error) {
    setError(getErrorMessage(error))
  }
}
```

### **2. Data Fetching**
```typescript
// Profile data example
const fetchProfile = async () => {
  setLoading(true)
  try {
    const response = await userService.getProfile()
    setProfile(response.data.user)
  } catch (error) {
    setError(getErrorMessage(error))
  } finally {
    setLoading(false)
  }
}
```

### **3. Form Submissions**
```typescript
// Update profile example
const handleSubmit = async (data: ProfileForm) => {
  setLoading(true)
  try {
    await userService.updateProfile(data)
    setMessage('Profile updated successfully!')
  } catch (error) {
    setError(getErrorMessage(error))
  } finally {
    setLoading(false)
  }
}
```

## 🔒 Security Features

### **Request Interceptors**
```typescript
// Automatic token attachment
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### **Response Interceptors**
```typescript
// Automatic token refresh/logout
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
```

## 🎨 State Management Pattern

### **Component-Level State**
```typescript
// Local state for UI interactions
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [data, setData] = useState(null)
```

### **Context for Global State**
```typescript
// AuthContext for user authentication
const { user, login, logout } = useAuth()
```

### **No Global API State**
- Each component manages its own API state
- Reduces complexity and coupling
- Easier to reason about data flow
- Better performance for large applications

## 🚀 API Endpoints

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/google` - Google OAuth

### **User Management**
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/photos` - Add user photo
- `GET /api/user/favorites` - Get favorites
- `POST /api/user/favorites` - Add to favorites

### **AI Services**
- `POST /api/ai/analyze-photo` - Analyze user photos
- `POST /api/ai/suggestions` - Generate style suggestions
- `POST /api/ai/virtual-tryon` - Virtual try-on
- `POST /api/ai/feedback` - Submit feedback
- `GET /api/ai/suggestions/history` - Get suggestion history

### **Products**
- `GET /api/products/search` - Search products
- `GET /api/products/recommendations/:id` - Get recommendations
- `GET /api/products/trending` - Get trending products

### **Upload**
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images
- `POST /api/upload/signature` - Get upload signature

## 🔄 Error Handling Strategy

### **Centralized Error Processing**
```typescript
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message
  if (error.response?.status === 401) return 'Please log in to continue'
  if (error.response?.status === 500) return 'Server error, please try again'
  return 'Network error, please check your connection'
}
```

### **Component Error Handling**
```typescript
const [error, setError] = useState('')

const handleApiCall = async () => {
  setError('') // Clear previous errors
  try {
    await apiCall()
  } catch (err) {
    setError(getErrorMessage(err))
  }
}
```

## 📊 Performance Considerations

### **Request Optimization**
- Debounced search queries
- Request cancellation for outdated calls
- Optimistic updates for better UX
- Image compression before upload

### **Bundle Size**
- No React Query dependency (~50KB saved)
- Tree-shaking friendly imports
- Minimal API surface area
- Direct axios usage

## 🧪 Testing Strategy

### **API Service Testing**
```typescript
// Mock axios for unit tests
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

test('should login user successfully', async () => {
  mockedAxios.post.mockResolvedValue({ data: { user, token } })
  const result = await authService.login(email, password)
  expect(result.data.user).toEqual(user)
})
```

### **Component Testing**
```typescript
// Test API integration in components
test('should display user profile', async () => {
  mockedAxios.get.mockResolvedValue({ data: { user: mockUser } })
  render(<ProfilePage />)
  await waitFor(() => {
    expect(screen.getByText(mockUser.name)).toBeInTheDocument()
  })
})
```

This architecture provides a clean, maintainable, and performant API layer that's easy to understand and extend.