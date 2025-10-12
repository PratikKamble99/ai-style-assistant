// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GOOGLE: '/auth/google'
  },
  USER: {
    PROFILE: '/user/profile',
    PHOTOS: '/user/photos',
    FAVORITES: '/user/favorites'
  },
  AI: {
    ANALYZE_PHOTO: '/ai/analyze-photo',
    SUGGESTIONS: '/ai/suggestions',
    VIRTUAL_TRYON: '/ai/virtual-tryon',
    FEEDBACK: '/ai/feedback',
    HISTORY: '/ai/suggestions/history'
  },
  PRODUCTS: {
    SEARCH: '/products/search',
    RECOMMENDATIONS: '/products/recommendations',
    TRENDING: '/products/trending',
    SIMILAR: '/products/similar',
    TRACK_VIEW: '/products/track-view'
  },
  UPLOAD: {
    IMAGE: '/upload/image',
    IMAGES: '/upload/images',
    SIGNATURE: '/upload/signature'
  }
}

// Form validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  PHONE: /^\+?[\d\s-()]+$/
}

// Enum options for forms
export const FORM_OPTIONS = {
  GENDER: [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'NON_BINARY', label: 'Non-Binary' },
    { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }
  ],
  BODY_TYPE: [
    { value: 'ECTOMORPH', label: 'Ectomorph (Lean)' },
    { value: 'MESOMORPH', label: 'Mesomorph (Athletic)' },
    { value: 'ENDOMORPH', label: 'Endomorph (Curvy)' },
    { value: 'PEAR', label: 'Pear Shape' },
    { value: 'APPLE', label: 'Apple Shape' },
    { value: 'HOURGLASS', label: 'Hourglass' },
    { value: 'RECTANGLE', label: 'Rectangle' },
    { value: 'INVERTED_TRIANGLE', label: 'Inverted Triangle' }
  ],
  FACE_SHAPE: [
    { value: 'OVAL', label: 'Oval' },
    { value: 'ROUND', label: 'Round' },
    { value: 'SQUARE', label: 'Square' },
    { value: 'HEART', label: 'Heart' },
    { value: 'DIAMOND', label: 'Diamond' },
    { value: 'OBLONG', label: 'Oblong' }
  ],
  SKIN_TONE: [
    { value: 'VERY_FAIR', label: 'Very Fair' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'LIGHT', label: 'Light' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'OLIVE', label: 'Olive' },
    { value: 'TAN', label: 'Tan' },
    { value: 'DARK', label: 'Dark' },
    { value: 'VERY_DARK', label: 'Very Dark' }
  ],
  STYLE_TYPE: [
    { value: 'CASUAL', label: 'Casual' },
    { value: 'FORMAL', label: 'Formal' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'TRENDY', label: 'Trendy' },
    { value: 'CLASSIC', label: 'Classic' },
    { value: 'BOHEMIAN', label: 'Bohemian' },
    { value: 'MINIMALIST', label: 'Minimalist' },
    { value: 'SPORTY', label: 'Sporty' },
    { value: 'VINTAGE', label: 'Vintage' },
    { value: 'EDGY', label: 'Edgy' }
  ],
  BUDGET_RANGE: [
    { value: 'BUDGET_FRIENDLY', label: 'Budget Friendly (Under ₹2,000)' },
    { value: 'MID_RANGE', label: 'Mid Range (₹2,000 - ₹8,000)' },
    { value: 'PREMIUM', label: 'Premium (₹8,000 - ₹20,000)' },
    { value: 'LUXURY', label: 'Luxury (Above ₹20,000)' }
  ],
  OCCASIONS: [
    { value: 'CASUAL', label: 'Casual', icon: '👕' },
    { value: 'OFFICE', label: 'Office', icon: '💼' },
    { value: 'DATE', label: 'Date', icon: '💕' },
    { value: 'WEDDING', label: 'Wedding', icon: '💒' },
    { value: 'PARTY', label: 'Party', icon: '🎉' },
    { value: 'FORMAL_EVENT', label: 'Formal Event', icon: '🎭' },
    { value: 'VACATION', label: 'Vacation', icon: '🏖️' },
    { value: 'WORKOUT', label: 'Workout', icon: '💪' },
    { value: 'INTERVIEW', label: 'Interview', icon: '📋' }
  ],
  PLATFORMS: [
    { value: 'MYNTRA', label: 'Myntra' },
    { value: 'AMAZON', label: 'Amazon' },
    { value: 'HM', label: 'H&M' },
    { value: 'AJIO', label: 'Ajio' },
    { value: 'NYKAA', label: 'Nykaa' }
  ]
}

// Color schemes for different platforms
export const PLATFORM_COLORS = {
  MYNTRA: 'bg-pink-100 text-pink-800',
  AMAZON: 'bg-orange-100 text-orange-800',
  HM: 'bg-red-100 text-red-800',
  AJIO: 'bg-purple-100 text-purple-800',
  NYKAA: 'bg-green-100 text-green-800'
}

// File upload constraints
export const UPLOAD_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 5
}

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ai_stylist_token',
  USER_PREFERENCES: 'ai_stylist_preferences',
  THEME: 'ai_stylist_theme'
}

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size must be less than 10MB.',
  INVALID_FILE_TYPE: 'Please upload a valid image file (JPEG, PNG, or WebP).'
}

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully!',
  PHOTO_UPLOADED: 'Photo uploaded successfully!',
  FAVORITE_ADDED: 'Added to favorites!',
  FAVORITE_REMOVED: 'Removed from favorites!',
  FEEDBACK_SUBMITTED: 'Thank you for your feedback!',
  SUGGESTION_GENERATED: 'New style suggestion generated!'
}

// App configuration
export const APP_CONFIG = {
  NAME: 'AI Stylist',
  VERSION: '1.0.0',
  DESCRIPTION: 'Your AI-powered personal stylist and grooming assistant',
  SUPPORT_EMAIL: 'support@aistylist.com',
  PRIVACY_POLICY_URL: '/privacy',
  TERMS_OF_SERVICE_URL: '/terms'
}