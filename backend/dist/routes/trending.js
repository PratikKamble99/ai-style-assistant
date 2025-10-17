"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const trendingService_1 = require("../services/trendingService");
const router = express_1.default.Router();
// Get trending outfits
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const trendingOutfits = await trendingService_1.trendingService.getTrendingOutfits(limit, offset);
        res.json({
            success: true,
            data: { outfits: trendingOutfits },
        });
    }
    catch (error) {
        console.error('❌ Failed to get trending outfits:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get trending outfits',
        });
    }
});
// Get featured trending outfits
router.get('/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const featuredOutfits = await trendingService_1.trendingService.getFeaturedOutfits(limit);
        res.json({
            success: true,
            data: { outfits: featuredOutfits },
        });
    }
    catch (error) {
        console.error('❌ Failed to get featured outfits:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get featured outfits',
        });
    }
});
// Get trending outfit by ID
router.get('/:id', async (req, res) => {
    try {
        const outfitId = req.params.id;
        const outfit = await req.prisma.trendingOutfit.findUnique({
            where: { id: outfitId },
            include: { items: true },
        });
        if (!outfit) {
            return res.status(404).json({
                success: false,
                error: 'Trending outfit not found',
            });
        }
        // Increment view count
        await req.prisma.trendingOutfit.update({
            where: { id: outfitId },
            data: { viewCount: { increment: 1 } },
        });
        res.json({
            success: true,
            data: { outfit },
        });
    }
    catch (error) {
        console.error('❌ Failed to get trending outfit:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get trending outfit',
        });
    }
});
// Like/Unlike trending outfit
router.post('/:id/like', auth_1.authenticateToken, async (req, res) => {
    try {
        const outfitId = req.params.id;
        const userId = req.user.id;
        // Check if outfit exists
        const outfit = await req.prisma.trendingOutfit.findUnique({
            where: { id: outfitId },
        });
        if (!outfit) {
            return res.status(404).json({
                success: false,
                error: 'Trending outfit not found',
            });
        }
        // Check if user already liked this outfit
        const existingLike = await req.prisma.favorite.findFirst({
            where: {
                userId,
                productId: outfitId,
                platform: 'MYNTRA', // Using MYNTRA as placeholder for trending outfits
            },
        });
        let liked = false;
        if (existingLike) {
            // Unlike - remove from favorites
            await req.prisma.favorite.delete({
                where: { id: existingLike.id },
            });
            // Decrement like count
            await req.prisma.trendingOutfit.update({
                where: { id: outfitId },
                data: { likeCount: { decrement: 1 } },
            });
        }
        else {
            // Like - add to favorites
            await req.prisma.favorite.create({
                data: {
                    userId,
                    productId: outfitId,
                    name: outfit.title,
                    brand: 'AI Stylist',
                    imageUrl: outfit.imageUrl,
                    productUrl: `/trending/${outfitId}`,
                    platform: 'MYNTRA',
                },
            });
            // Increment like count
            await req.prisma.trendingOutfit.update({
                where: { id: outfitId },
                data: { likeCount: { increment: 1 } },
            });
            liked = true;
        }
        res.json({
            success: true,
            data: { liked },
        });
    }
    catch (error) {
        console.error('❌ Failed to like/unlike trending outfit:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to like/unlike trending outfit',
        });
    }
});
// Share trending outfit
router.post('/:id/share', auth_1.authenticateToken, async (req, res) => {
    try {
        const outfitId = req.params.id;
        // Increment share count
        await req.prisma.trendingOutfit.update({
            where: { id: outfitId },
            data: { shareCount: { increment: 1 } },
        });
        res.json({
            success: true,
            message: 'Share count updated',
        });
    }
    catch (error) {
        console.error('❌ Failed to update share count:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update share count',
        });
    }
});
// Get trending outfits by category
router.get('/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const outfits = await req.prisma.trendingOutfit.findMany({
            where: {
                category,
                isActive: true,
            },
            include: { items: true },
            orderBy: { trendingScore: 'desc' },
            take: limit,
            skip: offset,
        });
        res.json({
            success: true,
            data: { outfits },
        });
    }
    catch (error) {
        console.error('❌ Failed to get trending outfits by category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get trending outfits by category',
        });
    }
});
// Get trending outfits by occasion
router.get('/occasion/:occasion', async (req, res) => {
    try {
        const occasion = req.params.occasion;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const outfits = await req.prisma.trendingOutfit.findMany({
            where: {
                occasion: occasion.toUpperCase(),
                isActive: true,
            },
            include: { items: true },
            orderBy: { trendingScore: 'desc' },
            take: limit,
            skip: offset,
        });
        res.json({
            success: true,
            data: { outfits },
        });
    }
    catch (error) {
        console.error('❌ Failed to get trending outfits by occasion:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get trending outfits by occasion',
        });
    }
});
exports.default = router;
//# sourceMappingURL=trending.js.map