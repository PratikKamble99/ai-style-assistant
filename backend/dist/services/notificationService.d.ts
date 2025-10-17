interface NotificationData {
    userId: string;
    title: string;
    body: string;
    type: 'TRENDING_OUTFITS' | 'NEW_SUGGESTIONS' | 'WEEKLY_DIGEST' | 'PERSONALIZED_TIPS' | 'SEASONAL_TRENDS' | 'SYSTEM_UPDATE';
    data?: any;
    imageUrl?: string;
    scheduledFor?: Date;
}
interface PushNotificationPayload {
    title: string;
    body: string;
    imageUrl?: string;
    data?: any;
}
declare class NotificationService {
    createNotification(notificationData: NotificationData): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        imageUrl: string | null;
        data: string | null;
        body: string;
        isRead: boolean;
        isSent: boolean;
        sentAt: Date | null;
        scheduledFor: Date | null;
    }>;
    sendPushNotification(userId: string, payload: PushNotificationPayload): Promise<import("firebase-admin/lib/messaging/messaging-api").BatchResponse | undefined>;
    sendEmailNotification(userId: string, subject: string, htmlContent: string): Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo | undefined>;
    sendTrendingOutfitsNotification(userId: string, trendingOutfits: any[]): Promise<void>;
    sendBulkTrendingNotifications(trendingOutfits: any[]): Promise<void>;
    registerDeviceToken(userId: string, token: string, platform: 'IOS' | 'ANDROID' | 'WEB'): Promise<void>;
    deactivateTokens(tokens: string[]): Promise<void>;
    getUserNotifications(userId: string, limit?: number, offset?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        imageUrl: string | null;
        data: string | null;
        body: string;
        isRead: boolean;
        isSent: boolean;
        sentAt: Date | null;
        scheduledFor: Date | null;
    }[]>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    private generateTrendingOutfitsEmail;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=notificationService.d.ts.map