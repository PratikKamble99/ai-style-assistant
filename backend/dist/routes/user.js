"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("../middleware/errorHandler");
const validation_1 = require("../middleware/validation");
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Get user profile
router.get('/profile', async (req, res, next) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user?.id },
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
            throw (0, errorHandler_1.createError)('User not found', 404);
        }
        res.json({ user });
    }
    catch (error) {
        next(error);
    }
});
// Update user profile
router.put('/profile', (0, validation_1.validate)(validation_1.profileSchemas.update), async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { name, ...profileData } = req.body;
        // Update user name if provided
        if (name) {
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { name }
            });
        }
        // Upsert profile (excluding name which goes to user table)
        const profile = await prisma_1.prisma.userProfile.upsert({
            where: { userId },
            update: {
                ...profileData,
                updatedAt: new Date()
            },
            create: {
                userId,
                gender: 'PREFER_NOT_TO_SAY',
                ...profileData
            }
        });
        res.json({
            message: 'Profile updated successfully',
            profile
        });
    }
    catch (error) {
        next(error);
    }
});
// Add user photo
router.post('/photos', (0, validation_1.validate)(validation_1.photoSchemas.add), async (req, res, next) => {
    try {
        const { url, type, publicId } = req.body;
        const userId = req.user?.id;
        // For face photos, keep only the latest one active
        if (type === 'FACE') {
            await prisma_1.prisma.userPhoto.updateMany({
                where: { userId, type: 'FACE' },
                data: { isActive: false }
            });
        }
        // Add new photo
        const photo = await prisma_1.prisma.userPhoto.create({
            data: {
                userId,
                url,
                type,
                publicId: publicId || '',
                isActive: true
            }
        });
        res.status(201).json({
            message: 'Photo added successfully',
            photo
        });
    }
    catch (error) {
        next(error);
    }
});
// Delete user photo
router.delete('/photos/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        await prisma_1.prisma.userPhoto.deleteMany({
            where: { id, userId }
        });
        res.json({ message: 'Photo deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
// Get user favorites
router.get('/favorites', async (req, res, next) => {
    try {
        const favorites = await prisma_1.prisma.favorite.findMany({
            where: { userId: req.user?.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ favorites });
    }
    catch (error) {
        next(error);
    }
});
// Add to favorites
router.post('/favorites', (0, validation_1.validate)(validation_1.favoriteSchemas.add), async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const favoriteData = req.body;
        const favorite = await prisma_1.prisma.favorite.create({
            data: {
                userId,
                ...favoriteData
            }
        });
        res.status(201).json({
            message: 'Added to favorites',
            favorite
        });
    }
    catch (error) {
        next(error);
    }
});
// Remove from favorites
router.delete('/favorites/:id', (0, validation_1.validate)(validation_1.favoriteSchemas.remove), async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        await prisma_1.prisma.favorite.deleteMany({
            where: { id, userId }
        });
        res.json({ message: 'Removed from favorites' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=user.js.map