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
    createNotification(notificationData: NotificationData): Promise<any>;
    sendPushNotification(userId: string, payload: PushNotificationPayload): Promise<any>;
    sendEmailNotification(userId: string, subject: string, htmlContent: string): Promise<any>;
    sendTrendingOutfitsNotification(userId: string, trendingOutfits: any[]): Promise<void>;
    sendBulkTrendingNotifications(trendingOutfits: any[]): Promise<void>;
    registerDeviceToken(userId: string, token: string, platform: 'IOS' | 'ANDROID' | 'WEB'): Promise<void>;
    deactivateTokens(tokens: string[]): Promise<void>;
    getUserNotifications(userId: string, limit?: number, offset?: number): Promise<any>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    private generateTrendingOutfitsEmail;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=notificationService.d.ts.map