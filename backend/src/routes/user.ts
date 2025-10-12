import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { validate, profileSchemas, photoSchemas, favoriteSchemas } from '../middleware/validation';

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id! },
      include: {
        profile: true,
        photos: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        },
        preferences: true
      }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', validate(profileSchemas.update), async (req: Request, res: Response, next: NextFunction) => {
  try {

    const userId = req.user?.id!;
    const profileData = req.body;

    // Upsert profile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...profileData,
        updatedAt: new Date()
      },
      create: {
        userId,
        ...profileData
      }
    });

    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    next(error);
  }
});

// // Add user photo
// router.post('/photos', async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { url, type, publicId } = req.body;
//     const userId = req.user?.id!;

//     if (!url || !type) {
//       throw createError('URL and type are required', 400);
//     }

//     // For face photos, keep only the latest one active
//     if (type === 'FACE') {
//       await prisma.userPhoto.updateMany({
//         where: { userId, type: 'FACE' },
//         data: { isActive: false }
//       });
//     }

//     // Add new photo
//     const photo = await prisma.userPhoto.create({
//       data: {
//         userId,
//         url,
//         type,
//         publicId,
//         isActive: true
//       }
//     });

//     res.status(201).json({
//       message: 'Photo added successfully',
//       photo
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// Delete user photo
router.delete('/photos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id!;

    await prisma.userPhoto.deleteMany({
      where: { id, userId }
    });

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get user favorites
router.get('/favorites', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user?.id! },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ favorites });
  } catch (error) {
    next(error);
  }
});

// Add to favorites
router.post('/favorites', validate(favoriteSchemas.add), async (req: Request, res: Response, next: NextFunction) => {
  try {

    const userId = req.user?.id!;
    const favoriteData = req.body;

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        ...favoriteData
      }
    });

    res.status(201).json({
      message: 'Added to favorites',
      favorite
    });
  } catch (error) {
    next(error);
  }
});

// Remove from favorites
router.delete('/favorites/:id', validate(favoriteSchemas.remove), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id!;

    await prisma.favorite.deleteMany({
      where: { id, userId }
    });

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    next(error);
  }
});

export default router;