"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const errorHandler_1 = require("../middleware/errorHandler");
const validation_1 = require("../middleware/validation");
const cloudinaryService_1 = require("../services/cloudinaryService");
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Configure multer for memory storage
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
        }
    }
});
// Upload single image
router.post('/image', upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            throw (0, errorHandler_1.createError)('No image file provided', 400);
        }
        const userId = req.user?.id;
        const uploadResult = await cloudinaryService_1.cloudinaryService.uploadBuffer(req.file.buffer);
        // For face photos, keep only the latest one active
        if (req.body.type === 'FACE') {
            await prisma_1.prisma.userPhoto.updateMany({
                where: { userId, type: 'FACE' },
                data: { isActive: false }
            });
        }
        const result = await prisma_1.prisma.userPhoto.create({
            data: {
                userId,
                url: uploadResult.secureUrl,
                type: req.body.type,
                publicId: uploadResult.publicId,
                isActive: true
            }
        });
        res.json({
            message: 'Image uploaded successfully',
            url: uploadResult.secureUrl,
            publicId: uploadResult.publicId,
            id: result.id,
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
            bytes: uploadResult.bytes
        });
    }
    catch (error) {
        next(error);
    }
});
// Upload multiple images
router.post('/images', upload.array('images', 5), async (req, res, next) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            throw (0, errorHandler_1.createError)('No image files provided', 400);
        }
        const userId = req.user?.id;
        const { folder = 'user-photos' } = req.body;
        const uploadPromises = req.files.map((file, index) => {
            return cloudinaryService_1.cloudinaryService.uploadBuffer(file.buffer, {
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
    }
    catch (error) {
        next(error);
    }
});
// Delete image from Cloudinary
router.delete('/image/:id', (0, validation_1.validate)(validation_1.uploadSchemas.deleteImage), async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const photo = await prisma_1.prisma.userPhoto.findFirst({
            where: {
                id,
                userId // Ensure user owns the photo
            }
        });
        if (!photo) {
            throw (0, errorHandler_1.createError)('Image not found or access denied', 404);
        }
        // Delete from Cloudinary using our service
        const success = await cloudinaryService_1.cloudinaryService.deleteImage(photo.publicId);
        // Delete from database regardless of Cloudinary result
        await prisma_1.prisma.userPhoto.delete({
            where: {
                id: photo.id
            }
        });
        if (success) {
            res.json({ message: 'Image deleted successfully' });
        }
        else {
            res.json({ message: 'Image deleted from database, but Cloudinary deletion failed' });
        }
    }
    catch (error) {
        next(error);
    }
});
// Get image transformation URL
router.post('/transform', (0, validation_1.validate)(validation_1.uploadSchemas.transform), async (req, res, next) => {
    try {
        const { publicId, transformations } = req.body;
        if (!publicId) {
            throw (0, errorHandler_1.createError)('Public ID is required', 400);
        }
        // Generate transformation URL using our service
        const transformedUrl = cloudinaryService_1.cloudinaryService.generateUrl(publicId, transformations || [
            { width: 500, height: 500, crop: 'fill' },
            { quality: 'auto' },
            { format: 'auto' }
        ]);
        res.json({
            message: 'Transformation URL generated',
            url: transformedUrl,
            publicId
        });
    }
    catch (error) {
        next(error);
    }
});
// Get upload signature for direct client uploads
router.post('/signature', (0, validation_1.validate)(validation_1.uploadSchemas.signature), async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { folder = 'user-photos' } = req.body;
        const uploadParams = {
            folder: `ai-stylist/${folder}`,
            public_id: `${userId}_${Date.now()}`,
            transformation: 'w_1000,h_1000,c_limit,q_auto,f_auto'
        };
        // Generate upload signature using our service
        const { signature, timestamp } = cloudinaryService_1.cloudinaryService.generateUploadSignature(uploadParams);
        res.json({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            ...uploadParams
        });
    }
    catch (error) {
        next(error);
    }
});
// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files. Maximum is 5 files.' });
        }
    }
    next(error);
});
exports.default = router;
//# sourceMappingURL=upload.js.map