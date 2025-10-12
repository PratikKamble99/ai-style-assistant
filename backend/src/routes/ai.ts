import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AIService } from '../services/aiService';
import { createError } from '../middleware/errorHandler';
import { validate, aiSchemas } from '../middleware/validation';

const router = express.Router();
const prisma = new PrismaClient();
const aiService = new AIService();

// Analyze user photos for comprehensive analysis
router.post('/analyze-photos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { facePhotos, bodyPhotos } = req.body;
    const userId = req.user?.id!;

    if (!facePhotos?.length || !bodyPhotos?.length) {
      throw createError('Both face and body photos are required', 400);
    }

    // Simulate AI analysis with mock results
    const analysisResults = {
      bodyType: ['HOURGLASS', 'PEAR', 'RECTANGLE', 'APPLE', 'INVERTED_TRIANGLE'][Math.floor(Math.random() * 5)],
      faceShape: ['OVAL', 'ROUND', 'SQUARE', 'HEART', 'DIAMOND'][Math.floor(Math.random() * 5)],
      skinTone: ['FAIR', 'LIGHT', 'MEDIUM', 'OLIVE', 'TAN'][Math.floor(Math.random() * 5)],
      confidence: 0.82 + (Math.random() * 0.15) // 82-97% confidence
    };

    // Save analysis results (temporarily disabled until Prisma client is regenerated)
    try {
      // This will work after running `npx prisma generate`
      // await Promise.all([
      //   prisma.photoAnalysis.create({
      //     data: {
      //       userId,
      //       photoUrl: facePhotos[0],
      //       analysisType: 'FACE_SHAPE',
      //       detectedValue: analysisResults.faceShape,
      //       confidence: analysisResults.confidence
      //     }
      //   }),
      //   prisma.photoAnalysis.create({
      //     data: {
      //       userId,
      //       photoUrl: bodyPhotos[0],
      //       analysisType: 'BODY_TYPE',
      //       detectedValue: analysisResults.bodyType,
      //       confidence: analysisResults.confidence
      //     }
      //   }),
      //   prisma.photoAnalysis.create({
      //     data: {
      //       userId,
      //       photoUrl: facePhotos[0],
      //       analysisType: 'SKIN_TONE',
      //       detectedValue: analysisResults.skinTone,
      //       confidence: analysisResults.confidence
      //     }
      //   })
      // ]);
      console.log('Analysis results would be saved:', analysisResults);
    } catch (error) {
      console.log('PhotoAnalysis model not yet available, skipping save');
    }

    // Update user profile with AI analysis
    await prisma.userProfile.upsert({
      where: { userId },
      update: {
        bodyType: analysisResults.bodyType as any,
        faceShape: analysisResults.faceShape as any,
        skinTone: analysisResults.skinTone as any,
        updatedAt: new Date()
      },
      create: {
        userId,
        gender: 'PREFER_NOT_TO_SAY',
        bodyType: analysisResults.bodyType as any,
        faceShape: analysisResults.faceShape as any,
        skinTone: analysisResults.skinTone as any
      }
    });

    res.json({
      message: 'Photo analysis completed',
      results: analysisResults
    });
  } catch (error) {
    next(error);
  }
});

// Get style suggestions
router.post('/suggestions', async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { occasion, preferences = {} } = req.body;
    const userId = req.user?.id!;

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        photos: {
          where: { isActive: true }
        }
      }
    });

    if (!user?.profile) {
      throw createError('Please complete your profile first', 400);
    }

    // Generate AI suggestions (using mock data for development)
    const suggestions = {
      outfit: `A sophisticated ${occasion.toLowerCase()} outfit featuring carefully selected pieces that complement your ${user.profile.bodyType || 'body type'} and ${user.profile.faceShape || 'face shape'}. The ensemble includes well-fitted garments in flattering colors that enhance your ${user.profile.skinTone || 'skin tone'}.`,
      hairstyle: `A stylish hairstyle that complements your ${user.profile.faceShape || 'face shape'} and suits the ${occasion.toLowerCase()} occasion.`,
      accessories: `Carefully chosen accessories that complete the look and match the ${occasion.toLowerCase()} setting.`,
      skincare: `Skincare routine and makeup tips that enhance your ${user.profile.skinTone || 'skin tone'} for the ${occasion.toLowerCase()} occasion.`,
      colors: ['#3b82f6', '#ffffff', '#6b7280', '#f3f4f6', '#ec4899']
    };

    // For production, use:
    // const suggestions = await aiService.generateStyleSuggestions({
    //   occasion,
    //   bodyType: user.profile.bodyType || undefined,
    //   faceShape: user.profile.faceShape || undefined,
    //   skinTone: user.profile.skinTone || undefined,
    //   gender: user.profile.gender,
    //   styleType: user.profile.styleType,
    //   preferences
    // });

    // Generate mock outfit image URL based on occasion
    const outfitImages: Record<string, string> = {
      CASUAL: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop',
      OFFICE: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
      DATE: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
      WEDDING: 'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1b5?w=400&h=600&fit=crop',
      PARTY: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=600&fit=crop',
      FORMAL_EVENT: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=400&h=600&fit=crop',
      VACATION: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop',
      WORKOUT: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop',
      INTERVIEW: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop'
    };

    const confidence = 0.85 + (Math.random() * 0.12); // 85-97% confidence

    // Prepare data for suggestion creation
    const suggestionData: any = {
      userId,
      occasion,
      outfitDesc: suggestions.outfit,
      hairstyle: suggestions.hairstyle,
      accessories: suggestions.accessories,
      skincare: suggestions.skincare,
      colors: suggestions.colors,
      outfitImageUrl: outfitImages[occasion] || outfitImages.CASUAL,
      styleImageUrl: user.photos.find(p => p.type === 'FACE')?.url,
      confidence,
      products: {
        create: [
          {
            productId: `${Date.now()}-1`,
            name: 'Stylish Top',
            brand: 'Zara',
            price: 2999,
            currency: 'INR',
            imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
            productUrl: 'https://zara.com/top',
            platform: 'MYNTRA',
            category: 'CLOTHING',
            rating: 4.5,
            inStock: true
          },
          {
            productId: `${Date.now()}-2`,
            name: 'Perfect Bottoms',
            brand: 'H&M',
            price: 2499,
            currency: 'INR',
            imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop',
            productUrl: 'https://hm.com/bottoms',
            platform: 'HM',
            category: 'CLOTHING',
            rating: 4.3,
            inStock: true
          },
          {
            productId: `${Date.now()}-3`,
            name: 'Comfortable Shoes',
            brand: 'Nike',
            price: 5999,
            currency: 'INR',
            imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop',
            productUrl: 'https://nike.com/shoes',
            platform: 'AMAZON',
            category: 'FOOTWEAR',
            rating: 4.7,
            inStock: true
          }
        ]
      }
    };

    // Add optional fields only if they exist
    if (user.profile.bodyType) {
      suggestionData.bodyType = user.profile.bodyType;
    }
    if (user.profile.faceShape) {
      suggestionData.faceShape = user.profile.faceShape;
    }
    if (user.profile.skinTone) {
      suggestionData.skinTone = user.profile.skinTone;
    }

    // Save suggestion to database
    const savedSuggestion = await prisma.styleSuggestion.create({
      data: suggestionData,
      include: {
        products: true
      }
    });

    res.json({
      message: 'Style suggestions generated',
      suggestion: savedSuggestion,
      aiResponse: suggestions
    });
  } catch (error) {
    next(error);
  }
});



// Submit feedback on suggestions
router.post('/feedback', async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { suggestionId, rating, liked, comment } = req.body;
    const userId = req.user?.id!;

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        suggestionId,
        rating,
        liked,
        comment
      }
    });

    res.status(201).json({
      message: 'Feedback submitted',
      feedback
    });
  } catch (error) {
    next(error);
  }
});

// Get user's suggestion history
router.get('/suggestions/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const suggestions = await prisma.styleSuggestion.findMany({
      where: { userId },
      include: {
        products: true,
        feedback: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.styleSuggestion.count({
      where: { userId }
    });

    res.json({
      suggestions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;