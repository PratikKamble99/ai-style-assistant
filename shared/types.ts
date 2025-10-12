// Shared TypeScript types for AI Stylist application

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  gender: Gender;
  height?: number;
  weight?: number;
  bodyType?: BodyType;
  faceShape?: FaceShape;
  skinTone?: SkinTone;
  styleType: StyleType[];
  budgetRange?: BudgetRange;
  createdAt: string;
  updatedAt: string;
}

export interface UserPhoto {
  id: string;
  userId: string;
  url: string;
  type: PhotoType;
  isActive: boolean;
  createdAt: string;
}

export interface StyleSuggestion {
  id: string;
  userId: string;
  occasion: Occasion;
  bodyType: BodyType;
  faceShape?: FaceShape;
  skinTone?: SkinTone;
  outfitDesc: string;
  hairstyle?: string;
  accessories?: string;
  skincare?: string;
  colors: string[];
  imageUrl?: string;
  createdAt: string;
  products?: ProductRecommendation[];
  feedback?: Feedback[];
}

export interface ProductRecommendation {
  id: string;
  suggestionId: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  platform: Platform;
  category: ProductCategory;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  name: string;
  brand: string;
  imageUrl: string;
  productUrl: string;
  platform: Platform;
  createdAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  suggestionId?: string;
  rating: number;
  liked: boolean;
  comment?: string;
  createdAt: string;
}

export interface UserPreference {
  id: string;
  userId: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

// Enums
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY'
}

export enum BodyType {
  ECTOMORPH = 'ECTOMORPH',
  MESOMORPH = 'MESOMORPH',
  ENDOMORPH = 'ENDOMORPH',
  PEAR = 'PEAR',
  APPLE = 'APPLE',
  HOURGLASS = 'HOURGLASS',
  RECTANGLE = 'RECTANGLE',
  INVERTED_TRIANGLE = 'INVERTED_TRIANGLE'
}

export enum FaceShape {
  OVAL = 'OVAL',
  ROUND = 'ROUND',
  SQUARE = 'SQUARE',
  HEART = 'HEART',
  DIAMOND = 'DIAMOND',
  OBLONG = 'OBLONG'
}

export enum SkinTone {
  VERY_FAIR = 'VERY_FAIR',
  FAIR = 'FAIR',
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  OLIVE = 'OLIVE',
  TAN = 'TAN',
  DARK = 'DARK',
  VERY_DARK = 'VERY_DARK'
}

export enum StyleType {
  CASUAL = 'CASUAL',
  FORMAL = 'FORMAL',
  BUSINESS = 'BUSINESS',
  TRENDY = 'TRENDY',
  CLASSIC = 'CLASSIC',
  BOHEMIAN = 'BOHEMIAN',
  MINIMALIST = 'MINIMALIST',
  SPORTY = 'SPORTY',
  VINTAGE = 'VINTAGE',
  EDGY = 'EDGY'
}

export enum BudgetRange {
  BUDGET_FRIENDLY = 'BUDGET_FRIENDLY',
  MID_RANGE = 'MID_RANGE',
  PREMIUM = 'PREMIUM',
  LUXURY = 'LUXURY'
}

export enum PhotoType {
  FACE = 'FACE',
  FULL_BODY = 'FULL_BODY',
  OUTFIT = 'OUTFIT'
}

export enum Occasion {
  CASUAL = 'CASUAL',
  OFFICE = 'OFFICE',
  DATE = 'DATE',
  WEDDING = 'WEDDING',
  PARTY = 'PARTY',
  FORMAL_EVENT = 'FORMAL_EVENT',
  VACATION = 'VACATION',
  WORKOUT = 'WORKOUT',
  INTERVIEW = 'INTERVIEW'
}

export enum Platform {
  MYNTRA = 'MYNTRA',
  AMAZON = 'AMAZON',
  HM = 'HM',
  AJIO = 'AJIO',
  NYKAA = 'NYKAA'
}

export enum ProductCategory {
  CLOTHING = 'CLOTHING',
  FOOTWEAR = 'FOOTWEAR',
  ACCESSORIES = 'ACCESSORIES',
  SKINCARE = 'SKINCARE',
  HAIRCARE = 'HAIRCARE',
  MAKEUP = 'MAKEUP'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface AnalysisResult {
  detected: string;
  confidence: number;
  alternatives?: string[];
  measurements?: Record<string, number>;
  recommendations?: StyleRecommendations;
}

export interface StyleRecommendations {
  clothing: string[];
  avoid: string[];
  tips: string;
}

export interface AIStyleSuggestion {
  outfit: string;
  hairstyle?: string;
  accessories?: string;
  skincare?: string;
  colors: string[];
  imageUrl?: string;
}

export interface VirtualTryOnResult {
  imageUrl: string;
  confidence: number;
  processingTime: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  name: string;
}

export interface ProfileForm {
  gender: Gender;
  height?: number;
  weight?: number;
  bodyType?: BodyType;
  faceShape?: FaceShape;
  skinTone?: SkinTone;
  styleType: StyleType[];
  budgetRange?: BudgetRange;
}

export interface SuggestionRequest {
  occasion: Occasion;
  preferences?: Record<string, any>;
}

export interface FeedbackForm {
  suggestionId: string;
  rating: number;
  liked: boolean;
  comment?: string;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Constants
export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  [BodyType.ECTOMORPH]: 'Ectomorph (Lean)',
  [BodyType.MESOMORPH]: 'Mesomorph (Athletic)',
  [BodyType.ENDOMORPH]: 'Endomorph (Curvy)',
  [BodyType.PEAR]: 'Pear Shape',
  [BodyType.APPLE]: 'Apple Shape',
  [BodyType.HOURGLASS]: 'Hourglass',
  [BodyType.RECTANGLE]: 'Rectangle',
  [BodyType.INVERTED_TRIANGLE]: 'Inverted Triangle'
};

export const FACE_SHAPE_LABELS: Record<FaceShape, string> = {
  [FaceShape.OVAL]: 'Oval',
  [FaceShape.ROUND]: 'Round',
  [FaceShape.SQUARE]: 'Square',
  [FaceShape.HEART]: 'Heart',
  [FaceShape.DIAMOND]: 'Diamond',
  [FaceShape.OBLONG]: 'Oblong'
};

export const SKIN_TONE_LABELS: Record<SkinTone, string> = {
  [SkinTone.VERY_FAIR]: 'Very Fair',
  [SkinTone.FAIR]: 'Fair',
  [SkinTone.LIGHT]: 'Light',
  [SkinTone.MEDIUM]: 'Medium',
  [SkinTone.OLIVE]: 'Olive',
  [SkinTone.TAN]: 'Tan',
  [SkinTone.DARK]: 'Dark',
  [SkinTone.VERY_DARK]: 'Very Dark'
};

export const OCCASION_LABELS: Record<Occasion, string> = {
  [Occasion.CASUAL]: 'Casual',
  [Occasion.OFFICE]: 'Office',
  [Occasion.DATE]: 'Date',
  [Occasion.WEDDING]: 'Wedding',
  [Occasion.PARTY]: 'Party',
  [Occasion.FORMAL_EVENT]: 'Formal Event',
  [Occasion.VACATION]: 'Vacation',
  [Occasion.WORKOUT]: 'Workout',
  [Occasion.INTERVIEW]: 'Interview'
};

export const STYLE_TYPE_LABELS: Record<StyleType, string> = {
  [StyleType.CASUAL]: 'Casual',
  [StyleType.FORMAL]: 'Formal',
  [StyleType.BUSINESS]: 'Business',
  [StyleType.TRENDY]: 'Trendy',
  [StyleType.CLASSIC]: 'Classic',
  [StyleType.BOHEMIAN]: 'Bohemian',
  [StyleType.MINIMALIST]: 'Minimalist',
  [StyleType.SPORTY]: 'Sporty',
  [StyleType.VINTAGE]: 'Vintage',
  [StyleType.EDGY]: 'Edgy'
};