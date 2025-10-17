"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_1 = require("../lib/prisma");
const outfitSuggestionService_1 = require("../services/outfitSuggestionService");
const router = express_1.default.Router();
const outfitService = new outfitSuggestionService_1.OutfitSuggestionService();
// Health check endpoint
router.get('/health', async (_req, res) => {
    try {
        // Test database connection
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.json({
            success: true,
            status: 'healthy',
            services: {
                database: 'connected',
                aiService: 'ready',
                productService: 'ready'
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Generate AI outfit suggestions with product links
router.post('/generate', async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next((0, errorHandler_1.createError)('Authentication required', 401));
        }
        const { occasion, budget, season } = req.body;
        // Basic validation - only occasion is required now
        if (!occasion) {
            return next((0, errorHandler_1.createError)('Missing required field: occasion is required', 400));
        }
        // Fetch user profile to get body type, gender, and preferences
        const userWithProfile = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                profile: {
                    select: {
                        bodyType: true,
                        gender: true,
                        height: true,
                        weight: true,
                        measurements: true,
                        skinTone: true
                    }
                },
                preferences: {
                    select: {
                        key: true,
                        value: true
                    }
                }
            }
        });
        if (!userWithProfile || !userWithProfile.profile) {
            return next((0, errorHandler_1.createError)('User profile not found. Please complete your profile first.', 400));
        }
        const { bodyType, gender } = userWithProfile.profile;
        if (!bodyType || !gender) {
            return next((0, errorHandler_1.createError)('Incomplete profile. Please update your body type and gender in your profile.', 400));
        }
        // Use budget from request or fall back to profile budget range
        const finalBudget = budget;
        console.log('Generating outfit suggestion for user:', userId, {
            bodyType,
            occasion,
            gender,
            budget: finalBudget
        });
        // Prepare input for AI service using profile data
        const suggestionInput = {
            bodyType,
            occasion,
            gender,
            budget: finalBudget,
            season: season || 'SPRING', // Default season if not provided
        };
        // Generate AI outfit suggestion
        let outfitSuggestion;
        try {
            outfitSuggestion = await outfitService.generateOutfitSuggestion(suggestionInput);
        }
        catch (aiError) {
            console.error('AI service error:', aiError.message);
            return next((0, errorHandler_1.createError)('AI service temporarily unavailable. Please try again later.', 500));
        }
        // Save suggestion to database
        const savedSuggestion = await prisma_1.prisma.styleSuggestion.create({
            data: {
                userId,
                occasion,
                bodyType,
                outfitDesc: outfitSuggestion.description,
                colors: outfitSuggestion.colors,
                confidence: outfitSuggestion.confidence
            }
        });
        if (outfitSuggestion.items.length > 0) {
            outfitSuggestion.items.forEach(async (item) => {
                await prisma_1.prisma.outfit.create({
                    data: {
                        brand: item.brand,
                        category: item.category,
                        fit_advice: item.fit_advice,
                        google_link: item.google_link,
                        name: item.name,
                        price_range: item.price_range,
                        styling_tip: item.styling_tip,
                        suggestionId: savedSuggestion.id,
                        userId: userId
                    }
                });
            });
        }
        // Fetch the complete suggestion with products
        const completeSuggestion = await prisma_1.prisma.styleSuggestion.findUnique({
            where: { id: savedSuggestion.id },
            include: {
                outfits: true,
            }
        });
        res.json({
            success: true,
            data: {
                suggestion: {
                    id: completeSuggestion?.id,
                    title: outfitSuggestion.title,
                    description: outfitSuggestion.description,
                    occasion,
                    bodyType,
                    colors: outfitSuggestion.colors,
                    tips: outfitSuggestion.tips,
                    confidence: outfitSuggestion.confidence,
                    items: outfitSuggestion.items,
                    createdAt: completeSuggestion?.createdAt
                },
                outfits: completeSuggestion?.outfits || []
            }
        });
    }
    catch (error) {
        console.error('Suggestion generation error:', error);
        next((0, errorHandler_1.createError)('Failed to generate outfit suggestion', 500));
    }
});
// Get user's suggestion history
router.get('/history', async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next((0, errorHandler_1.createError)('Authentication required', 401));
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const suggestions = await prisma_1.prisma.styleSuggestion.findMany({
            where: { userId },
            include: {
                outfits: {
                    take: 3, // Limit products per suggestion for list view
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });
        const total = await prisma_1.prisma.styleSuggestion.count({
            where: { userId }
        });
        res.json({
            success: true,
            data: {
                suggestions,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        console.error('Suggestion history error:', error);
        next((0, errorHandler_1.createError)('Failed to fetch suggestion history', 500));
    }
});
// Get specific suggestion with all products
router.get('/:id', async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const suggestionId = req.params.id;
        if (!userId) {
            return next((0, errorHandler_1.createError)('Authentication required', 401));
        }
        const suggestion = await prisma_1.prisma.styleSuggestion.findFirst({
            where: {
                id: suggestionId,
                userId
            },
            include: {
                outfits: {
                    orderBy: [
                        { category: 'asc' },
                    ]
                },
                feedback: true
            }
        });
        if (!suggestion) {
            return next((0, errorHandler_1.createError)('Suggestion not found', 404));
        }
        res.json({
            success: true,
            data: { suggestion }
        });
    }
    catch (error) {
        console.error('Get suggestion error:', error);
        next((0, errorHandler_1.createError)('Failed to fetch suggestion', 500));
    }
});
// Provide feedback on suggestion
router.post('/:id/feedback', async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const suggestionId = req.params.id;
        const { rating, liked, comment } = req.body;
        if (!userId) {
            return next((0, errorHandler_1.createError)('Authentication required', 401));
        }
        // Validate suggestion exists and belongs to user
        const suggestion = await prisma_1.prisma.styleSuggestion.findFirst({
            where: {
                id: suggestionId,
                userId
            }
        });
        if (!suggestion) {
            return next((0, errorHandler_1.createError)('Suggestion not found', 404));
        }
        // Check if feedback already exists
        const existingFeedback = await prisma_1.prisma.feedback.findFirst({
            where: {
                userId,
                suggestionId
            }
        });
        let feedback;
        if (existingFeedback) {
            // Update existing feedback
            feedback = await prisma_1.prisma.feedback.update({
                where: { id: existingFeedback.id },
                data: {
                    rating,
                    liked,
                    comment
                }
            });
        }
        else {
            // Create new feedback
            feedback = await prisma_1.prisma.feedback.create({
                data: {
                    userId,
                    suggestionId,
                    rating,
                    liked,
                    comment
                }
            });
        }
        res.json({
            success: true,
            data: { feedback }
        });
    }
    catch (error) {
        console.error('Feedback error:', error);
        next((0, errorHandler_1.createError)('Failed to save feedback', 500));
    }
});
// Get trending suggestions (popular combinations)
router.get('/trending/popular', async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        // Get most liked suggestions from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const trendingSuggestions = await prisma_1.prisma.styleSuggestion.findMany({
            where: {
                createdAt: {
                    gte: thirtyDaysAgo
                },
                feedback: {
                    some: {
                        liked: true,
                        rating: {
                            gte: 4
                        }
                    }
                }
            },
            include: {
                outfits: {
                    take: 3,
                },
                feedback: {
                    select: {
                        rating: true,
                        liked: true
                    }
                }
            },
            orderBy: {
                feedback: {
                    _count: 'desc'
                }
            },
            take: limit
        });
        res.json({
            success: true,
            data: { suggestions: trendingSuggestions }
        });
    }
    catch (error) {
        console.error('Trending suggestions error:', error);
        next((0, errorHandler_1.createError)('Failed to fetch trending suggestions', 500));
    }
});
exports.default = router;
//# sourceMappingURL=suggestions.js.map