"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSchemas = exports.favoriteSchemas = exports.productSchemas = exports.aiSchemas = exports.photoSchemas = exports.profileSchemas = exports.authSchemas = exports.commonSchemas = exports.validate = void 0;
const zod_1 = require("zod");
// Middleware to validate request data using Zod schemas
const validate = (schema) => {
    return (req, res, next) => {
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
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
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
exports.validate = validate;
// Common validation schemas
exports.commonSchemas = {
    email: zod_1.z.string().email('Please provide a valid email address'),
    password: zod_1.z.string()
        .min(6, 'Password must be at least 6 characters long')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    name: zod_1.z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters')
        .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    uuid: zod_1.z.string().uuid('Invalid ID format'),
    url: zod_1.z.string().url('Please provide a valid URL'),
    positiveNumber: zod_1.z.number().positive('Must be a positive number'),
    rating: zod_1.z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
    page: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 1).pipe(zod_1.z.number().int().min(1)),
    limit: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 10).pipe(zod_1.z.number().int().min(1).max(100))
};
// Auth schemas
exports.authSchemas = {
    register: {
        body: zod_1.z.object({
            email: exports.commonSchemas.email,
            password: exports.commonSchemas.password,
            name: exports.commonSchemas.name
        })
    },
    login: {
        body: zod_1.z.object({
            email: exports.commonSchemas.email,
            password: zod_1.z.string().min(1, 'Password is required')
        })
    },
    googleLogin: {
        body: zod_1.z.object({
            idToken: zod_1.z.string().min(1, 'Google ID token is required'),
            accessToken: zod_1.z.string().optional()
        })
    }
};
// Profile schemas
exports.profileSchemas = {
    update: {
        body: zod_1.z.object({
            name: zod_1.z.string().min(1).max(100).optional(),
            gender: zod_1.z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']).optional(),
            height: zod_1.z.number().min(100).max(250).optional(),
            weight: zod_1.z.number().min(30).max(300).optional(),
            bodyType: zod_1.z.enum(['ECTOMORPH', 'MESOMORPH', 'ENDOMORPH', 'PEAR', 'APPLE', 'HOURGLASS', 'RECTANGLE', 'INVERTED_TRIANGLE']).optional(),
            faceShape: zod_1.z.enum(['OVAL', 'ROUND', 'SQUARE', 'HEART', 'DIAMOND', 'OBLONG']).optional(),
            skinTone: zod_1.z.enum(['VERY_FAIR', 'FAIR', 'LIGHT', 'MEDIUM', 'OLIVE', 'TAN', 'DARK', 'VERY_DARK']).optional(),
        })
    }
};
// Photo schemas
exports.photoSchemas = {
    add: {
        body: zod_1.z.object({
            url: exports.commonSchemas.url.refine(url => /\.(jpg|jpeg|png|webp)$/i.test(url), 'Photo must be a valid image format'),
            type: zod_1.z.enum(['FACE', 'FULL_BODY', 'OUTFIT'])
        })
    }
};
// AI schemas
exports.aiSchemas = {
    analyzePhoto: {
        body: zod_1.z.object({
            photoUrl: exports.commonSchemas.url,
            analysisType: zod_1.z.enum(['BODY_TYPE', 'FACE_SHAPE', 'SKIN_TONE'])
        })
    },
    getSuggestions: {
        body: zod_1.z.object({
            occasion: zod_1.z.enum(['CASUAL', 'OFFICE', 'DATE', 'WEDDING', 'PARTY', 'FORMAL_EVENT', 'VACATION', 'WORKOUT', 'INTERVIEW']),
            preferences: zod_1.z.object({}).optional()
        })
    },
    virtualTryOn: {
        body: zod_1.z.object({
            userPhotoUrl: exports.commonSchemas.url,
            outfitDescription: zod_1.z.string().min(1, 'Outfit description is required'),
            stylePrompt: zod_1.z.string().optional()
        })
    },
    feedback: {
        body: zod_1.z.object({
            suggestionId: exports.commonSchemas.uuid,
            rating: exports.commonSchemas.rating,
            liked: zod_1.z.boolean(),
            comment: zod_1.z.string().max(500, 'Comment must be less than 500 characters').optional()
        })
    },
    suggestionHistory: {
        query: zod_1.z.object({
            page: exports.commonSchemas.page,
            limit: exports.commonSchemas.limit
        })
    }
};
// Product schemas
exports.productSchemas = {
    search: {
        query: zod_1.z.object({
            query: zod_1.z.string().min(2, 'Search query must be at least 2 characters').max(100, 'Search query must be less than 100 characters'),
            category: zod_1.z.enum(['CLOTHING', 'FOOTWEAR', 'ACCESSORIES', 'SKINCARE', 'HAIRCARE', 'MAKEUP']).optional(),
            platform: zod_1.z.enum(['MYNTRA', 'AMAZON', 'HM', 'AJIO', 'NYKAA']).optional(),
            minPrice: zod_1.z.string().optional().transform(val => val ? parseFloat(val) : undefined).pipe(zod_1.z.number().min(0).optional()),
            maxPrice: zod_1.z.string().optional().transform(val => val ? parseFloat(val) : undefined).pipe(zod_1.z.number().min(0).optional()),
            page: exports.commonSchemas.page,
            limit: exports.commonSchemas.limit
        }).refine(data => !data.minPrice || !data.maxPrice || data.maxPrice >= data.minPrice, {
            message: 'Maximum price must be greater than minimum price',
            path: ['maxPrice']
        })
    },
    details: {
        params: zod_1.z.object({
            platform: zod_1.z.enum(['MYNTRA', 'AMAZON', 'HM', 'AJIO', 'NYKAA']),
            productId: zod_1.z.string().min(1, 'Product ID is required')
        })
    },
    trending: {
        query: zod_1.z.object({
            category: zod_1.z.enum(['CLOTHING', 'FOOTWEAR', 'ACCESSORIES', 'SKINCARE', 'HAIRCARE', 'MAKEUP']).optional(),
            gender: zod_1.z.enum(['MALE', 'FEMALE', 'NON_BINARY']).optional(),
            limit: exports.commonSchemas.limit
        })
    },
    similar: {
        params: zod_1.z.object({
            platform: zod_1.z.enum(['MYNTRA', 'AMAZON', 'HM', 'AJIO', 'NYKAA']),
            productId: zod_1.z.string().min(1, 'Product ID is required')
        }),
        query: zod_1.z.object({
            limit: exports.commonSchemas.limit
        })
    },
    trackView: {
        body: zod_1.z.object({
            productId: zod_1.z.string().min(1, 'Product ID is required'),
            platform: zod_1.z.enum(['MYNTRA', 'AMAZON', 'HM', 'AJIO', 'NYKAA']),
            suggestionId: exports.commonSchemas.uuid.optional()
        })
    }
};
// Favorite schemas
exports.favoriteSchemas = {
    add: {
        body: zod_1.z.object({
            type: zod_1.z.enum(['PRODUCT', 'SUGGESTION']),
            itemId: zod_1.z.string().min(1, 'Item ID is required').max(100, 'Item ID is too long'),
            title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title is too long'),
            description: zod_1.z.string().min(1, 'Description is required').max(500, 'Description is too long'),
            imageUrl: exports.commonSchemas.url,
            metadata: zod_1.z.string().optional()
        })
    },
    remove: {
        params: zod_1.z.object({
            id: exports.commonSchemas.uuid
        })
    }
};
// Upload schemas
exports.uploadSchemas = {
    transform: {
        body: zod_1.z.object({
            publicId: zod_1.z.string().min(1, 'Public ID is required'),
            transformations: zod_1.z.array(zod_1.z.object({})).optional()
        })
    },
    signature: {
        body: zod_1.z.object({
            folder: zod_1.z.string().optional()
        })
    },
    deleteImage: {
        params: zod_1.z.object({
            id: zod_1.z.string().min(1, 'ID is required')
        })
    }
};
//# sourceMappingURL=validation.js.map