"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productService_1 = require("../services/productService");
const errorHandler_1 = require("../middleware/errorHandler");
const validation_1 = require("../middleware/validation");
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
const productService = new productService_1.ProductService();
// Search products across platforms
router.get('/search', (0, validation_1.validate)(validation_1.productSchemas.search), async (req, res, next) => {
    try {
        const { query: searchQuery, category, platform, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
        const filters = {
            category: category,
            platform: platform,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            page: parseInt(page),
            limit: parseInt(limit)
        };
        const results = await productService.searchProducts(searchQuery, filters);
        res.json({
            message: 'Products found',
            ...results
        });
    }
    catch (error) {
        next(error);
    }
});
// Get product recommendations for a style suggestion
router.get('/recommendations/:suggestionId', async (req, res, next) => {
    try {
        const { suggestionId } = req.params;
        const userId = req.user?.id;
        // Verify suggestion belongs to user
        const suggestion = await prisma_1.prisma.styleSuggestion.findFirst({
            where: { id: suggestionId, userId }
        });
        if (!suggestion) {
            throw (0, errorHandler_1.createError)('Style suggestion not found', 404);
        }
        // Get existing recommendations
        let recommendations = await prisma_1.prisma.outfit.findMany({
            where: { suggestionId },
        });
        // If no recommendations exist, generate them
        if (recommendations.length === 0) {
            const newRecommendations = await productService.generateRecommendations(suggestion);
            // Save recommendations to database
            if (newRecommendations.length > 0) {
                await prisma_1.prisma.outfit.createMany({
                    data: newRecommendations.map(rec => ({
                        suggestionId,
                        ...rec
                    }))
                });
                recommendations = await prisma_1.prisma.outfit.findMany({
                    where: { suggestionId },
                });
            }
        }
        res.json({
            message: 'Product recommendations retrieved',
            recommendations,
            total: recommendations.length
        });
    }
    catch (error) {
        next(error);
    }
});
// Get product details by ID and platform
router.get('/details/:platform/:productId', (0, validation_1.validate)(validation_1.productSchemas.details), async (req, res, next) => {
    try {
        const { platform, productId } = req.params;
        if (!['MYNTRA', 'AMAZON', 'HM', 'AJIO', 'NYKAA'].includes(platform)) {
            throw (0, errorHandler_1.createError)('Invalid platform', 400);
        }
        const productDetails = await productService.getProductDetails(platform, productId);
        res.json({
            message: 'Product details retrieved',
            product: productDetails
        });
    }
    catch (error) {
        next(error);
    }
});
// Get trending products
router.get('/trending', (0, validation_1.validate)(validation_1.productSchemas.trending), async (req, res, next) => {
    try {
        const { category, gender, limit = 20 } = req.query;
        const filters = {
            category: category,
            gender: gender,
            limit: parseInt(limit)
        };
        const trendingProducts = await productService.getTrendingProducts(filters);
        res.json({
            message: 'Trending products retrieved',
            products: trendingProducts
        });
    }
    catch (error) {
        next(error);
    }
});
// Get similar products
router.get('/similar/:platform/:productId', (0, validation_1.validate)(validation_1.productSchemas.similar), async (req, res, next) => {
    try {
        const { platform, productId } = req.params;
        const { limit = 10 } = req.query;
        if (!['MYNTRA', 'AMAZON', 'HM', 'AJIO', 'NYKAA'].includes(platform)) {
            throw (0, errorHandler_1.createError)('Invalid platform', 400);
        }
        const similarProducts = await productService.getSimilarProducts(platform, productId, parseInt(limit));
        res.json({
            message: 'Similar products retrieved',
            products: similarProducts
        });
    }
    catch (error) {
        next(error);
    }
});
// Track product click/view
router.post('/track-view', (0, validation_1.validate)(validation_1.productSchemas.trackView), async (req, res, next) => {
    try {
        const { productId, platform, suggestionId } = req.body;
        const userId = req.user?.id;
        // Track the view for analytics
        await productService.trackProductView({
            userId,
            productId,
            platform,
            suggestionId
        });
        res.json({ message: 'Product view tracked' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map