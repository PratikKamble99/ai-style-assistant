import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { trendingService } from '../services/trendingService';

const router = express.Router();

// Get trending outfits
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const trendingOutfits = await trendingService.getTrendingOutfits(limit, offset);

    res.json({
      success: true,
      data: { outfits: trendingOutfits },
    });
  } catch (error) {
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
    const limit = parseInt(req.query.limit as string) || 5;

    const featuredOutfits = await trendingService.getFeaturedOutfits(limit);

    res.json({
      success: true,
      data: { outfits: featuredOutfits },
    });
  } catch (error) {
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
  } catch (error) {
    console.error('❌ Failed to get trending outfit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trending outfit',
    });
  }
});

// Like/Unlike trending outfit
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const outfitId = req.params.id;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

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
    } else {
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
  } catch (error) {
    console.error('❌ Failed to like/unlike trending outfit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like/unlike trending outfit',
    });
  }
});

// Share trending outfit
router.post('/:id/share', authenticateToken, async (req, res) => {
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
  } catch (error) {
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
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

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
  } catch (error) {
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
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const outfits = await req.prisma.trendingOutfit.findMany({
      where: {
        occasion: occasion.toUpperCase() as any,
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
  } catch (error) {
    console.error('❌ Failed to get trending outfits by occasion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trending outfits by occasion',
    });
  }
});

export default router;