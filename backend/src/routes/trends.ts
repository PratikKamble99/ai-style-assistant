import express, { Request, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Get current seasonal trends
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Mock trends data until Prisma client is regenerated
    const mockTrends = [
      {
        id: '1',
        title: 'Winter Cozy Layers',
        description: 'Embrace the art of layering with cozy knits, oversized blazers, and warm textures. Perfect for staying stylish during the colder months.',
        season: 'Winter 2024',
        popularity: 95,
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        colors: ['#8B4513', '#F5DEB3', '#2F4F4F', '#FFFFFF'],
        keyPieces: ['Oversized Blazer', 'Chunky Knit Sweater', 'Wide-leg Trousers', 'Ankle Boots'],
        tags: ['Cozy', 'Layering', 'Neutral Tones'],
        isActive: true,
        priority: 10,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        products: [
          {
            id: 't1-p1',
            name: 'Oversized Wool Blazer',
            brand: 'Zara',
            price: 7999,
            originalPrice: 9999,
            imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
            productUrl: 'https://zara.com/wool-blazer',
            category: 'CLOTHING',
            rating: 4.6,
            inStock: true,
            featured: true
          }
        ]
      },
      {
        id: '2',
        title: 'Minimalist Chic',
        description: 'Clean lines, neutral colors, and timeless pieces define this trend. Less is more with carefully curated wardrobe essentials.',
        season: 'All Season',
        popularity: 88,
        imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop',
        colors: ['#FFFFFF', '#000000', '#F5F5F5', '#C0C0C0'],
        keyPieces: ['White Button Shirt', 'Black Trousers', 'Minimalist Bag', 'Classic Sneakers'],
        tags: ['Minimalist', 'Timeless', 'Neutral'],
        isActive: true,
        priority: 8,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        products: [
          {
            id: 't2-p1',
            name: 'Classic White Shirt',
            brand: 'COS',
            price: 3999,
            imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
            productUrl: 'https://cos.com/white-shirt',
            category: 'CLOTHING',
            rating: 4.7,
            inStock: true,
            featured: true
          }
        ]
      },
      {
        id: '3',
        title: 'Bold Color Blocking',
        description: 'Make a statement with vibrant colors and bold combinations. This trend is all about confidence and creative expression.',
        season: 'Spring 2024',
        popularity: 76,
        imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=300&fit=crop',
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
        keyPieces: ['Bright Blazer', 'Colorful Dress', 'Statement Accessories', 'Bold Shoes'],
        tags: ['Bold', 'Colorful', 'Statement'],
        isActive: true,
        priority: 6,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
        products: [
          {
            id: 't3-p1',
            name: 'Bright Coral Blazer',
            brand: 'Mango',
            price: 5999,
            originalPrice: 7999,
            imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200&h=200&fit=crop',
            productUrl: 'https://mango.com/coral-blazer',
            category: 'CLOTHING',
            rating: 4.3,
            inStock: true,
            featured: true
          }
        ]
      }
    ];

    // Paginate mock data
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTrends = mockTrends.slice(startIndex, endIndex);

    res.json({
      trends: paginatedTrends,
      pagination: {
        page,
        limit,
        total: mockTrends.length,
        pages: Math.ceil(mockTrends.length / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get trend by ID with all products
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Mock trend data
    const mockTrends: Record<string, any> = {
      '1': {
        id: '1',
        title: 'Winter Cozy Layers',
        description: 'Embrace the art of layering with cozy knits, oversized blazers, and warm textures. Perfect for staying stylish during the colder months.',
        season: 'Winter 2024',
        popularity: 95,
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        colors: ['#8B4513', '#F5DEB3', '#2F4F4F', '#FFFFFF'],
        keyPieces: ['Oversized Blazer', 'Chunky Knit Sweater', 'Wide-leg Trousers', 'Ankle Boots'],
        tags: ['Cozy', 'Layering', 'Neutral Tones'],
        products: [
          {
            id: 't1-p1',
            productId: 'winter-blazer-1',
            name: 'Oversized Wool Blazer',
            brand: 'Zara',
            price: 7999,
            originalPrice: 9999,
            currency: 'INR',
            imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
            productUrl: 'https://zara.com/wool-blazer',
            category: 'CLOTHING',
            rating: 4.6,
            inStock: true
          },
          {
            id: 't1-p2',
            productId: 'winter-sweater-1',
            name: 'Chunky Knit Sweater',
            brand: 'H&M',
            price: 2999,
            currency: 'INR',
            imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&h=200&fit=crop',
            productUrl: 'https://hm.com/knit-sweater',
            category: 'CLOTHING',
            rating: 4.4,
            inStock: true
          }
        ]
      },
      '2': {
        id: '2',
        title: 'Minimalist Chic',
        description: 'Clean lines, neutral colors, and timeless pieces define this trend.',
        season: 'All Season',
        popularity: 88,
        imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop',
        colors: ['#FFFFFF', '#000000', '#F5F5F5', '#C0C0C0'],
        keyPieces: ['White Button Shirt', 'Black Trousers', 'Minimalist Bag'],
        tags: ['Minimalist', 'Timeless', 'Neutral'],
        products: [
          {
            id: 't2-p1',
            productId: 'minimal-shirt-1',
            name: 'Classic White Shirt',
            brand: 'COS',
            price: 3999,
            currency: 'INR',
            imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
            productUrl: 'https://cos.com/white-shirt',
            category: 'CLOTHING',
            rating: 4.7,
            inStock: true
          }
        ]
      },
      '3': {
        id: '3',
        title: 'Bold Color Blocking',
        description: 'Make a statement with vibrant colors and bold combinations.',
        season: 'Spring 2024',
        popularity: 76,
        imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=300&fit=crop',
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
        keyPieces: ['Bright Blazer', 'Colorful Dress', 'Statement Accessories'],
        tags: ['Bold', 'Colorful', 'Statement'],
        products: [
          {
            id: 't3-p1',
            productId: 'bold-blazer-1',
            name: 'Bright Coral Blazer',
            brand: 'Mango',
            price: 5999,
            originalPrice: 7999,
            currency: 'INR',
            imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200&h=200&fit=crop',
            productUrl: 'https://mango.com/coral-blazer',
            category: 'CLOTHING',
            rating: 4.3,
            inStock: true
          }
        ]
      }
    };

    const trend = mockTrends[id];

    if (!trend) {
      throw createError('Trend not found', 404);
    }

    res.json({ trend });
  } catch (error) {
    next(error);
  }
});

// Generate outfit based on trend
router.post('/:id/generate-outfit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id!;

    // Mock trend data (same as above)
    const mockTrends: Record<string, any> = {
      '1': {
        id: '1',
        title: 'Winter Cozy Layers',
        description: 'Embrace the art of layering with cozy knits, oversized blazers, and warm textures.',
        keyPieces: ['Oversized Blazer', 'Chunky Knit Sweater', 'Wide-leg Trousers', 'Ankle Boots'],
        colors: ['#8B4513', '#F5DEB3', '#2F4F4F', '#FFFFFF'],
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        products: [
          {
            productId: 'winter-blazer-1',
            name: 'Oversized Wool Blazer',
            brand: 'Zara',
            price: 7999,
            currency: 'INR',
            imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
            productUrl: 'https://zara.com/wool-blazer',
            category: 'CLOTHING',
            rating: 4.6,
            inStock: true
          }
        ]
      }
    };

    const trend = mockTrends[id];
    if (!trend) {
      throw createError('Trend not found', 404);
    }

    // Get user profile for personalization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true
      }
    });

    // Prepare suggestion data with proper null handling
    const suggestionData: any = {
      userId,
      occasion: 'CASUAL',
      outfitDesc: `Trendy ${trend.title.toLowerCase()} outfit featuring ${trend.keyPieces.slice(0, 3).join(', ')}. ${trend.description}`,
      hairstyle: `Hairstyle that complements the ${trend.title.toLowerCase()} trend`,
      accessories: `Accessories inspired by ${trend.title}: ${trend.keyPieces.slice(-2).join(', ')}`,
      colors: trend.colors,
      outfitImageUrl: trend.imageUrl,
      confidence: 0.88,
      products: {
        create: trend.products.slice(0, 4).map((product: any) => ({
          productId: product.productId,
          name: product.name,
          brand: product.brand,
          price: product.price,
          currency: product.currency || 'INR',
          imageUrl: product.imageUrl,
          productUrl: product.productUrl,
          platform: 'MYNTRA',
          category: product.category,
          rating: product.rating,
          inStock: product.inStock
        }))
      }
    };

    // Add optional fields only if they exist
    if (user?.profile?.bodyType) {
      suggestionData.bodyType = user.profile.bodyType;
    }
    if (user?.profile?.faceShape) {
      suggestionData.faceShape = user.profile.faceShape;
    }
    if (user?.profile?.skinTone) {
      suggestionData.skinTone = user.profile.skinTone;
    }

    // Create suggestion
    const suggestion = await prisma.styleSuggestion.create({
      data: suggestionData,
      include: {
        outfits: true
      }
    });

    res.json({
      message: 'Trend-based outfit generated',
      suggestion
    });
  } catch (error) {
    next(error);
  }
});

export default router;