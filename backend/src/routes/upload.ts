import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { createError } from '../middleware/errorHandler';
import { validate, uploadSchemas } from '../middleware/validation';
import { cloudinaryService } from '../services/cloudinaryService';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

// Upload single image
router.post('/image', upload.single('image'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw createError('No image file provided', 400);
    }

    const userId = req.user?.id!;
    console.log(req.body)


    const uplaodResult = await cloudinaryService.uploadBuffer(req.file.buffer);

    // For face photos, keep only the latest one active
    if (req.body.type === 'FACE') {
      await prisma.userPhoto.updateMany({
        where: { userId, type: 'FACE' },
        data: { isActive: false }
      });
    }

    const result = await prisma.userPhoto.create({
      data: {
        userId,
        url: uplaodResult.secureUrl,
        type: req.body.type,
        publicId: uplaodResult.publicId,
        isActive: true
      }
    });

    res.json({
      message: 'Image uploaded successfully',
      url: uplaodResult.secureUrl,
      publicId: uplaodResult.publicId,
      width: uplaodResult.width,
      height: uplaodResult.height,
      format: uplaodResult.format,
      bytes: uplaodResult.bytes
    });


  } catch (error) {
    next(error);
  }
});

// Upload multiple images
router.post('/images', upload.array('images', 5), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw createError('No image files provided', 400);
    }

    const userId = req.user?.id!;
    const { folder = 'user-photos' } = req.body;

    const uploadPromises = req.files.map((file, index) => {
      return cloudinaryService.uploadBuffer(file.buffer, {
        folder: `ai-stylist/${folder}`,
        publicId: `${userId}_${Date.now()}_${index}`,
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' }
        ]
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    const images = uploadResults.map(result => ({
      url: result.secureUrl,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    }));

    res.json({
      message: 'Images uploaded successfully',
      images,
      count: images.length
    });
  } catch (error) {
    next(error);
  }
});

// Delete image from Cloudinary
router.delete('/image/:publicId', validate(uploadSchemas.deleteImage), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { publicId } = req.params;
    const userId = req.user?.id!;

    // Verify the image belongs to the user (basic security check)
    if (!publicId.includes(userId)) {
      throw createError('Unauthorized to delete this image', 403);
    }

    // Delete from Cloudinary using our service
    const success = await cloudinaryService.deleteImage(publicId);

    if (success) {
      res.json({ message: 'Image deleted successfully' });
    } else {
      throw createError('Failed to delete image', 500);
    }
  } catch (error) {
    next(error);
  }
});

// Get image transformation URL
router.post('/transform', validate(uploadSchemas.transform), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { publicId, transformations } = req.body;

    if (!publicId) {
      throw createError('Public ID is required', 400);
    }

    // Generate transformation URL using our service
    const transformedUrl = cloudinaryService.generateUrl(publicId, transformations || [
      { width: 500, height: 500, crop: 'fill' },
      { quality: 'auto' },
      { format: 'auto' }
    ]);

    res.json({
      message: 'Transformation URL generated',
      url: transformedUrl,
      publicId
    });
  } catch (error) {
    next(error);
  }
});

// Get upload signature for direct client uploads
router.post('/signature', validate(uploadSchemas.signature), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { folder = 'user-photos' } = req.body;

    const uploadParams = {
      folder: `ai-stylist/${folder}`,
      public_id: `${userId}_${Date.now()}`,
      transformation: 'w_1000,h_1000,c_limit,q_auto,f_auto'
    };

    // Generate upload signature using our service
    const { signature, timestamp } = cloudinaryService.generateUploadSignature(uploadParams);

    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      ...uploadParams
    });
  } catch (error) {
    next(error);
  }
});

// Error handling middleware for multer
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 5 files.' });
    }
  }
  next(error);
});

export default router;