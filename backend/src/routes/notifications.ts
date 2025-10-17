import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { notificationService } from '../services/notificationService';
import { cronService } from '../services/cronService';

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const notifications = await notificationService.getUserNotifications(userId, limit, offset);

    res.json({
      success: true,
      data: { notifications },
    });
  } catch (error) {
    console.error('❌ Failed to get notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notifications',
    });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    await notificationService.markAsRead(notificationId, userId);

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('❌ Failed to mark notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
    });
  }
});

// Register device token for push notifications
router.post('/device-token', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { token, platform } = req.body;

    if (!token || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Token and platform are required',
      });
    }

    await notificationService.registerDeviceToken(userId, token, platform);

    res.json({
      success: true,
      message: 'Device token registered successfully',
    });
  } catch (error) {
    console.error('❌ Failed to register device token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register device token',
    });
  }
});

// Update notification preferences
router.put('/preferences', authenticateToken, async (req, res) => {
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
  } catch (error) {
    console.error('❌ Failed to update notification preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notification preferences',
    });
  }
});

// Get notification preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const preferences = await req.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    res.json({
      success: true,
      data: { preferences },
    });
  } catch (error) {
    console.error('❌ Failed to get notification preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notification preferences',
    });
  }
});

// Admin: Trigger trending outfits cron manually (for testing)
router.post('/admin/trigger-trending', authenticateToken, async (req, res) => {
  try {
    // In production, add admin role check here
    const result = await cronService.triggerTrendingOutfitsCron();

    res.json({
      success: result.success,
      message: result.message || result.error,
    });
  } catch (error) {
    console.error('❌ Failed to trigger trending cron:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger trending cron',
    });
  }
});

// Admin: Get cron job status
router.get('/admin/cron-status', authenticateToken, async (req, res) => {
  try {
    // In production, add admin role check here
    const status = await cronService.getCronJobStatus();

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('❌ Failed to get cron status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cron status',
    });
  }
});

export default router;