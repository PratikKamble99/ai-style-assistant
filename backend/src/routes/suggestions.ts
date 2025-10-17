import express, { Request, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import { prisma } from '../lib/prisma';
import { OutfitSuggestionService, OutfitSuggestionInput } from '../services/outfitSuggestionService';

const router = express.Router();
const outfitService = new OutfitSuggestionService();

// Health check endpoint
router.get('/health', async (_req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});



// Generate AI outfit suggestions with product links
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError('Authentication required', 401));
    }

    const {
      occasion,
      budget,
      season
    } = req.body;

    // Basic validation - only occasion is required now
    if (!occasion) {
      return next(createError('Missing required field: occasion is required', 400));
    }

    // Fetch user profile to get body type, gender, and preferences
    const userWithProfile = await prisma.user.findUnique({
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
      return next(createError('User profile not found. Please complete your profile first.', 400));
    }

    const { bodyType, gender } = userWithProfile.profile;

    if (!bodyType || !gender) {
      return next(createError('Incomplete profile. Please update your body type and gender in your profile.', 400));
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
    const suggestionInput: OutfitSuggestionInput = {
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
    } catch (aiError: any) {
      console.error('AI service error:', aiError.message);
      return next(createError('AI service temporarily unavailable. Please try again later.', 500));
    }

    // Save suggestion to database
    const savedSuggestion = await prisma.styleSuggestion.create({
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

        await prisma.outfit.create({
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
        })
      })
    }



    // Fetch the complete suggestion with products
    const completeSuggestion = await prisma.styleSuggestion.findUnique({
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

  } catch (error: any) {
    console.error('Suggestion generation error:', error);
    next(createError('Failed to generate outfit suggestion', 500));
  }
});

// Get user's suggestion history
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError('Authentication required', 401));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const suggestions = await prisma.styleSuggestion.findMany({
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

    const total = await prisma.styleSuggestion.count({
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

  } catch (error: any) {
    console.error('Suggestion history error:', error);
    next(createError('Failed to fetch suggestion history', 500));
  }
});

// Get specific suggestion with all products
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const suggestionId = req.params.id;

    if (!userId) {
      return next(createError('Authentication required', 401));
    }

    const suggestion = await prisma.styleSuggestion.findFirst({
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
      return next(createError('Suggestion not found', 404));
    }

    res.json({
      success: true,
      data: { suggestion }
    });

  } catch (error: any) {
    console.error('Get suggestion error:', error);
    next(createError('Failed to fetch suggestion', 500));
  }
});

// Provide feedback on suggestion
router.post('/:id/feedback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const suggestionId = req.params.id;
    const { rating, liked, comment } = req.body;

    if (!userId) {
      return next(createError('Authentication required', 401));
    }

    // Validate suggestion exists and belongs to user
    const suggestion = await prisma.styleSuggestion.findFirst({
      where: {
        id: suggestionId,
        userId
      }
    });

    if (!suggestion) {
      return next(createError('Suggestion not found', 404));
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        userId,
        suggestionId
      }
    });

    let feedback;
    if (existingFeedback) {
      // Update existing feedback
      feedback = await prisma.feedback.update({
        where: { id: existingFeedback.id },
        data: {
          rating,
          liked,
          comment
        }
      });
    } else {
      // Create new feedback
      feedback = await prisma.feedback.create({
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

  } catch (error: any) {
    console.error('Feedback error:', error);
    next(createError('Failed to save feedback', 500));
  }
});

// Get trending suggestions (popular combinations)
router.get('/trending/popular', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Get most liked suggestions from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendingSuggestions = await prisma.styleSuggestion.findMany({
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

  } catch (error: any) {
    console.error('Trending suggestions error:', error);
    next(createError('Failed to fetch trending suggestions', 500));
  }
});

export default router;