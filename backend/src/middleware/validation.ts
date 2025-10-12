import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Middleware to validate request data using Zod schemas
export const validate = (schema: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  email: z.string().email('Please provide a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  uuid: z.string().uuid('Invalid ID format'),
  url: z.string().url('Please provide a valid URL'),
  positiveNumber: z.number().positive('Must be a positive number'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1).pipe(z.number().int().min(1)),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10).pipe(z.number().int().min(1).max(100))
};

// Auth schemas
export const authSchemas = {
  register: {
    body: z.object({
      email: commonSchemas.email,
      password: commonSchemas.password,
      name: commonSchemas.name
    })
  },
  login: {
    body: z.object({
      email: commonSchemas.email,
      password: z.string().min(1, 'Password is required')
    })
  }
};

// Profile schemas
export const profileSchemas = {
  update: {
    body: z.object({
      gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']).optional(),
      height: z.number().min(100).max(250).optional(),
      weight: z.number().min(30).max(300).optional(),
      bodyType: z.enum(['ECTOMORPH', 'MESOMORPH', 'ENDOMORPH', 'PEAR', 'APPLE', 'HOURGLASS', 'RECTANGLE', 'INVERTED_TRIANGLE']).optional(),
      faceShape: z.enum(['OVAL', 'ROUND', 'SQUARE', 'HEART', 'DIAMOND', 'OBLONG']).optional(),
      skinTone: z.enum(['VERY_FAIR', 'FAIR', 'LIGHT', 'MEDIUM', 'OLIVE', 'TAN', 'DARK', 'VERY_DARK']).optional(),
      styleType: z.array(z.enum(['CASUAL', 'FORMAL', 'BUSINESS', 'TRENDY', 'CLASSIC', 'BOHEMIAN', 'MINIMALIST', 'SPORTY', 'VINTAGE', 'EDGY'])).optional(),
      budgetRange: z.enum(['BUDGET_FRIENDLY', 'MID_RANGE', 'PREMIUM', 'LUXURY']).optional()
    })
  }
};

// Photo schemas
export const photoSchemas = {
  add: {
    body: z.object({
      url: commonSchemas.url.refine(url => /\.(jpg|jpeg|png|webp)$/i.test(url), 'Photo must be a valid image format'),
      type: z.enum(['FACE', 'FULL_BODY', 'OUTFIT'])
    })
  }
};

// AI schemas
export const aiSchemas = {
  analyzePhoto: {
    body: z.object({
      photoUrl: commonSchemas.url,
      analysisType: z.enum(['BODY_TYPE', 'FACE_SHAPE', 'SKIN_TONE'])
    })
  },
  getSuggestions: {
    body: z.object({
      occasion: z.enum(['CASUAL', 'OFFICE', 'DATE', 'WEDDING', 'PARTY', 'FORMAL_EVENT', 'VACATION', 'WORKOUT', 'INTERVIEW']),
      preferences: z.object({}).optional()
    })
  },
  virtualTryOn: {
    body: z.object({
      userPhotoUrl: commonSchemas.url,
      outfitDescription: z.string().min(1, 'Outfit description is required'),
      stylePrompt: z.string().optional()
    })
  },
  feedback: {
    body: z.object({
      suggestionId: commonSchemas.uuid,
      rating: commonSchemas.rating,
      liked: z.boolean(),
      comment: z.string().max(500, 'Comment must be less than 500 characters').optional()
    })
  },
  suggestionHistory: {
    query: z.object({
      page: commonSchemas.page,
      limit: commonSchemas.limit
    })
  }
};

// Product schemas
export const productSchemas = {
  search: {
    query: z.object({
      query: z.string().min(2, 'Search query must be at least 2 characters').max(100, 'Search query must be less than 100 characters'),
      category: z.enum(['CLOTHING', 'FOOTWEAR', 'ACCESSORIES', 'SKINCARE', 'HAIRCARE', 'MAKEUP']).optional(),
      platform: z.enum(['MYNTRA', 'AMAZON', 'HM', 'AJIO', 'NYKAA']).optional(),
      minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined).pipe(z.number().min(0).optional()),
      maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined).pipe(z.number().min(0).optional()),
      page: commonSchemas.page,
      limit: commonSchemas.limit
    }).refine(data => !data.minPrice || !data.maxPrice || data.maxPrice >= data.minPrice, {
      message: 'Maximum price must be greater than minimum price',
      path: ['maxPrice']
    })
  },
  details: {
    params: z.object({
      platform: z.enum(['MYNTRA', 'AMAZON', 'HM', 'AJIO', 'NYKAA']),
      productId: z.string().min(1, 'Product ID is required')
    })
  },
  trending: {
    query: z.object({
      category: z.enum(['CLOTHING', 'FOOTWEAR', 'ACCESSORIES', 'SKINCARE', 'HAIRCARE', 'MAKEUP']).optional(),
      gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY']).optional(),
      limit: commonSchemas.limit
    })
  },
  similar: {
    params: z.object({
      platform: z.enum(['MYNTRA', 'AMAZON', 'HM', 'AJIO', 'NYKAA']),
      productId: z.string().min(1, 'Product ID is required')
    }),
    query: z.object({
      limit: commonSchemas.limit
    })
  },
  trackView: {
    body: z.object({
      productId: z.string().min(1, 'Product ID is required'),
      platform: z.enum(['MYNTRA', 'AMAZON', 'HM', 'AJIO', 'NYKAA']),
      suggestionId: commonSchemas.uuid.optional()
    })
  }
};

// Favorite schemas
export const favoriteSchemas = {
  add: {
    body: z.object({
      productId: z.string().min(1, 'Product ID is required').max(100, 'Product ID is too long'),
      name: z.string().min(1, 'Product name is required').max(200, 'Product name is too long'),
      brand: z.string().min(1, 'Brand is required').max(100, 'Brand name is too long'),
      imageUrl: commonSchemas.url,
      productUrl: commonSchemas.url,
      platform: z.enum(['MYNTRA', 'AMAZON', 'HM', 'AJIO', 'NYKAA'])
    })
  },
  remove: {
    params: z.object({
      id: commonSchemas.uuid
    })
  }
};

// Upload schemas
export const uploadSchemas = {
  transform: {
    body: z.object({
      publicId: z.string().min(1, 'Public ID is required'),
      transformations: z.array(z.object({})).optional()
    })
  },
  signature: {
    body: z.object({
      folder: z.string().optional()
    })
  },
  deleteImage: {
    params: z.object({
      publicId: z.string().min(1, 'Public ID is required')
    })
  }
};