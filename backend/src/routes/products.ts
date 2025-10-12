import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ProductService } from '../services/productService';
import { createError } from '../middleware/errorHandler';
import { validate, productSchemas } from '../middleware/validation';

const router = express.Router();
const prisma = new PrismaClient();
const productService = new ProductService();

// Search products across platforms
router.get('/search', validate(productSchemas.search), async (req: Request, res: Response, next: NextFunction) => {
  try {

    const {
      query: searchQuery,
      category,
      platform,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      category: category as string,
      platform: platform as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const results = await productService.searchProducts(searchQuery as string, filters);

    res.json({
      message: 'Products found',
      ...results
    });
  } catch (error) {
    next(error);
  }
});

// Get product recommendations for a style suggestion
router.get('/recommendations/:suggestionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { suggestionId } = req.params;
    const userId = req.user?.id!;

    // Verify suggestion belongs to user
    const suggestion = await prisma.styleSuggestion.findFirst({
      where: { id: suggestionId, userId }
    });

    if (!suggestion) {
      throw createError('Style suggestion not found', 404);
    }

    // Get existing recommendations
    let recommendations = await prisma.productRecommendation.findMany({
      where: { suggestionId },
      orderBy: { createdAt: 'desc' }
    });

    // If no recommendations exist, generate them
    if (recommendations.length === 0) {
      const newRecommendations = await productService.generateRecommendations(suggestion);
      
      // Save recommendations to database
      if (newRecommendations.length > 0) {
        await prisma.productRecommendation.createMany({
          data: newRecommendations.map(rec => ({
            suggestionId,
            ...rec
          }))
        });

        recommendations = await prisma.productRecommendation.findMany({
          where: { suggestionId },
          orderBy: { createdAt: 'desc' }
        });
      }
    }

    res.json({
      message: 'Product recommendations retrieved',
      recommendations,
      total: recommendations.length
    });
  } catch (error) {
    next(error);
  }
});

// Get product details by ID and platform
router.get('/details/:platform/:productId', validate(productSchemas.details), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { platform, productId } = req.params;

    if (!['MYNTRA', 'AMAZON', 'HM', 'AJIO', 'NYKAA'].includes(platform)) {
      throw createError('Invalid platform', 400);
    }

    const productDetails = await productService.getProductDetails(
      platform as any,
      productId
    );

    res.json({
      message: 'Product details retrieved',
      product: productDetails
    });
  } catch (error) {
    next(error);
  }
});

// Get trending products
router.get('/trending', validate(productSchemas.trending), async (req: Request, res: Response, next: NextFunction) => {
  try {

    const {
      category,
      gender,
      limit = 20
    } = req.query;

    const filters = {
      category: category as string,
      gender: gender as string,
      limit: parseInt(limit as string)
    };

    const trendingProducts = await productService.getTrendingProducts(filters);

    res.json({
      message: 'Trending products retrieved',
      products: trendingProducts
    });
  } catch (error) {
    next(error);
  }
});

// Get similar products
router.get('/similar/:platform/:productId', validate(productSchemas.similar), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { platform, productId } = req.params;
    const { limit = 10 } = req.query;

    if (!['MYNTRA', 'AMAZON', 'HM', 'AJIO', 'NYKAA'].includes(platform)) {
      throw createError('Invalid platform', 400);
    }

    const similarProducts = await productService.getSimilarProducts(
      platform as any,
      productId,
      parseInt(limit as string)
    );

    res.json({
      message: 'Similar products retrieved',
      products: similarProducts
    });
  } catch (error) {
    next(error);
  }
});

// Track product click/view
router.post('/track-view', validate(productSchemas.trackView), async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { productId, platform, suggestionId } = req.body;
    const userId = req.user?.id!;

    // Track the view for analytics
    await productService.trackProductView({
      userId,
      productId,
      platform,
      suggestionId
    });

    res.json({ message: 'Product view tracked' });
  } catch (error) {
    next(error);
  }
});

export default router;