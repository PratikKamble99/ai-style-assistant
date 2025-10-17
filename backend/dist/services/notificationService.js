"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const client_1 = require("@prisma/client");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const prisma = new client_1.PrismaClient();
// Initialize Firebase Admin (you'll need to set up Firebase project)
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}
// Email transporter
const emailTransporter = nodemailer_1.default.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});
class NotificationService {
    // Create notification in database
    async createNotification(notificationData) {
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId: notificationData.userId,
                    title: notificationData.title,
                    body: notificationData.body,
                    type: notificationData.type,
                    data: notificationData.data ? JSON.stringify(notificationData.data) : null,
                    imageUrl: notificationData.imageUrl,
                    scheduledFor: notificationData.scheduledFor,
                },
            });
            console.log(`📝 Notification created: ${notification.id}`);
            return notification;
        }
        catch (error) {
            console.error('❌ Failed to create notification:', error);
            throw error;
        }
    }
    // Send push notification to user's devices
    async sendPushNotification(userId, payload) {
        try {
            // Get user's device tokens
            const deviceTokens = await prisma.deviceToken.findMany({
                where: {
                    userId,
                    isActive: true,
                },
            });
            if (deviceTokens.length === 0) {
                console.log(`📱 No active device tokens for user: ${userId}`);
                return;
            }
            const tokens = deviceTokens.map(dt => dt.token);
            // Prepare FCM message
            const message = {
                notification: {
                    title: payload.title,
                    body: payload.body,
                    imageUrl: payload.imageUrl,
                },
                data: payload.data ? {
                    ...payload.data,
                    type: 'outfit_notification',
                } : {
                    type: 'outfit_notification',
                },
                tokens,
            };
            // Send to Firebase
            const response = await firebase_admin_1.default.messaging().sendMulticast(message);
            console.log(`📱 Push notifications sent: ${response.successCount}/${tokens.length}`);
            // Handle failed tokens
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(tokens[idx]);
                        console.error(`❌ Failed to send to token ${tokens[idx]}:`, resp.error);
                    }
                });
                // Deactivate invalid tokens
                await this.deactivateTokens(failedTokens);
            }
            return response;
        }
        catch (error) {
            console.error('❌ Failed to send push notification:', error);
            throw error;
        }
    }
    // Send email notification
    async sendEmailNotification(userId, subject, htmlContent) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { notificationPreferences: true },
            });
            if (!user || !user.notificationPreferences?.emailNotifications) {
                console.log(`📧 Email notifications disabled for user: ${userId}`);
                return;
            }
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject,
                html: htmlContent,
            };
            const result = await emailTransporter.sendMail(mailOptions);
            console.log(`📧 Email sent to ${user.email}:`, result.messageId);
            return result;
        }
        catch (error) {
            console.error('❌ Failed to send email notification:', error);
            throw error;
        }
    }
    // Send trending outfits notification
    async sendTrendingOutfitsNotification(userId, trendingOutfits) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { notificationPreferences: true },
            });
            if (!user?.notificationPreferences?.trendingOutfits) {
                return;
            }
            const title = '🔥 New Trending Outfits Just Dropped!';
            const body = `Discover ${trendingOutfits.length} fresh outfit ideas that are trending right now`;
            // Create notification record
            const notification = await this.createNotification({
                userId,
                title,
                body,
                type: 'TRENDING_OUTFITS',
                data: { outfits: trendingOutfits.slice(0, 3) }, // Send top 3
                imageUrl: trendingOutfits[0]?.imageUrl,
            });
            // Send push notification
            if (user.notificationPreferences?.pushNotifications) {
                await this.sendPushNotification(userId, {
                    title,
                    body,
                    imageUrl: trendingOutfits[0]?.imageUrl,
                    data: {
                        notificationId: notification.id,
                        type: 'trending_outfits',
                        outfitCount: trendingOutfits.length,
                    },
                });
            }
            // Send email notification
            if (user.notificationPreferences?.emailNotifications) {
                const emailHtml = this.generateTrendingOutfitsEmail(user.name, trendingOutfits);
                await this.sendEmailNotification(userId, title, emailHtml);
            }
            // Mark as sent
            await prisma.notification.update({
                where: { id: notification.id },
                data: { isSent: true, sentAt: new Date() },
            });
            console.log(`✅ Trending outfits notification sent to user: ${userId}`);
        }
        catch (error) {
            console.error('❌ Failed to send trending outfits notification:', error);
            throw error;
        }
    }
    // Send bulk notifications to all users
    async sendBulkTrendingNotifications(trendingOutfits) {
        try {
            const users = await prisma.user.findMany({
                where: {
                    notificationPreferences: {
                        trendingOutfits: true,
                    },
                },
                include: { notificationPreferences: true },
            });
            console.log(`📢 Sending trending notifications to ${users.length} users`);
            const promises = users.map(user => this.sendTrendingOutfitsNotification(user.id, trendingOutfits));
            await Promise.allSettled(promises);
            console.log(`✅ Bulk trending notifications completed`);
        }
        catch (error) {
            console.error('❌ Failed to send bulk notifications:', error);
            throw error;
        }
    }
    // Register device token
    async registerDeviceToken(userId, token, platform) {
        try {
            await prisma.deviceToken.upsert({
                where: { token },
                update: {
                    userId,
                    platform,
                    isActive: true,
                    lastUsed: new Date(),
                },
                create: {
                    userId,
                    token,
                    platform,
                    isActive: true,
                },
            });
            console.log(`📱 Device token registered for user: ${userId}`);
        }
        catch (error) {
            console.error('❌ Failed to register device token:', error);
            throw error;
        }
    }
    // Deactivate invalid tokens
    async deactivateTokens(tokens) {
        try {
            await prisma.deviceToken.updateMany({
                where: { token: { in: tokens } },
                data: { isActive: false },
            });
            console.log(`🗑️ Deactivated ${tokens.length} invalid tokens`);
        }
        catch (error) {
            console.error('❌ Failed to deactivate tokens:', error);
        }
    }
    // Get user notifications
    async getUserNotifications(userId, limit = 20, offset = 0) {
        try {
            const notifications = await prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            });
            return notifications;
        }
        catch (error) {
            console.error('❌ Failed to get user notifications:', error);
            throw error;
        }
    }
    // Mark notification as read
    async markAsRead(notificationId, userId) {
        try {
            await prisma.notification.updateMany({
                where: {
                    id: notificationId,
                    userId,
                },
                data: { isRead: true },
            });
            console.log(`✅ Notification marked as read: ${notificationId}`);
        }
        catch (error) {
            console.error('❌ Failed to mark notification as read:', error);
            throw error;
        }
    }
    // Generate trending outfits email HTML
    generateTrendingOutfitsEmail(userName, outfits) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Trending Outfits - AI Stylist</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .outfit-card { border: 1px solid #ddd; border-radius: 8px; margin: 20px 0; padding: 15px; }
          .outfit-image { width: 100%; max-width: 300px; height: 200px; object-fit: cover; border-radius: 4px; }
          .cta-button { background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔥 New Trending Outfits!</h1>
            <p>Hi ${userName}, check out these amazing outfit ideas that are trending right now!</p>
          </div>
          
          ${outfits.slice(0, 3).map(outfit => `
            <div class="outfit-card">
              <img src="${outfit.imageUrl}" alt="${outfit.title}" class="outfit-image">
              <h3>${outfit.title}</h3>
              <p>${outfit.description}</p>
              <p><strong>Occasion:</strong> ${outfit.occasion}</p>
              <a href="${process.env.FRONTEND_URL}/trending" class="cta-button">View Outfit</a>
            </div>
          `).join('')}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/trending" class="cta-button">See All Trending Outfits</a>
          </div>
          
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
            <p>You're receiving this because you've enabled trending outfit notifications.</p>
            <a href="${process.env.FRONTEND_URL}/settings/notifications">Manage notification preferences</a>
          </div>
        </div>
      </body>
      </html>
    `;
    }
}
exports.notificationService = new NotificationService();
//# sourceMappingURL=notificationService.js.map