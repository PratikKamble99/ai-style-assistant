"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const notificationService_1 = require("../services/notificationService");
const cronService_1 = require("../services/cronService");
const router = express_1.default.Router();
// Get user notifications
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const notifications = await notificationService_1.notificationService.getUserNotifications(userId, limit, offset);
        res.json({
            success: true,
            data: { notifications },
        });
    }
    catch (error) {
        console.error('❌ Failed to get notifications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get notifications',
        });
    }
});
// Mark notification as read
router.patch('/:id/read', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;
        await notificationService_1.notificationService.markAsRead(notificationId, userId);
        res.json({
            success: true,
            message: 'Notification marked as read',
        });
    }
    catch (error) {
        console.error('❌ Failed to mark notification as read:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark notification as read',
        });
    }
});
// Register device token for push notifications
router.post('/device-token', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { token, platform } = req.body;
        if (!token || !platform) {
            return res.status(400).json({
                success: false,
                error: 'Token and platform are required',
            });
        }
        await notificationService_1.notificationService.registerDeviceToken(userId, token, platform);
        res.json({
            success: true,
            message: 'Device token registered successfully',
        });
    }
    catch (error) {
        console.error('❌ Failed to register device token:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to register device token',
        });
    }
});
// Update notification preferences
router.put('/preferences', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const preferences = req.body;
        const updatedPreferences = await req.prisma.notificationPreferences.upsert({
            where: { userId },
            update: preferences,
            create: {
                userId,
                ...preferences,
            },
        });
        res.json({
            success: true,
            data: { preferences: updatedPreferences },
        });
    }
    catch (error) {
        console.error('❌ Failed to update notification preferences:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update notification preferences',
        });
    }
});
// Get notification preferences
router.get('/preferences', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const preferences = await req.prisma.notificationPreferences.findUnique({
            where: { userId },
        });
        res.json({
            success: true,
            data: { preferences },
        });
    }
    catch (error) {
        console.error('❌ Failed to get notification preferences:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get notification preferences',
        });
    }
});
// Admin: Trigger trending outfits cron manually (for testing)
router.post('/admin/trigger-trending', auth_1.authenticateToken, async (req, res) => {
    try {
        // In production, add admin role check here
        const result = await cronService_1.cronService.triggerTrendingOutfitsCron();
        res.json({
            success: result.success,
            message: result.message || result.error,
        });
    }
    catch (error) {
        console.error('❌ Failed to trigger trending cron:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to trigger trending cron',
        });
    }
});
// Admin: Get cron job status
router.get('/admin/cron-status', auth_1.authenticateToken, async (req, res) => {
    try {
        // In production, add admin role check here
        const status = await cronService_1.cronService.getCronJobStatus();
        res.json({
            success: true,
            data: status,
        });
    }
    catch (error) {
        console.error('❌ Failed to get cron status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get cron status',
        });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map