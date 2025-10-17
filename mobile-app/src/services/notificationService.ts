import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { notificationService as apiNotificationService } from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

interface NotificationData {
    type: string;
    outfitCount?: number;
    notificationId?: string;
    [key: string]: any;
}

class MobileNotificationService {
    private expoPushToken: string | null = null;

    // Initialize notifications
    async initialize() {
        try {
            console.log('📱 Initializing mobile notifications...');

            // Request permissions
            const { status } = await this.requestPermissions();

            if (status !== 'granted') {
                console.warn('⚠️ Notification permissions not granted');
                return false;
            }

            // Get push token
            const token = await this.getPushToken();

            if (token) {
                // Register token with backend
                await this.registerTokenWithBackend(token);
                console.log('✅ Mobile notifications initialized successfully');
                return true;
            }

            return false;
        } catch (error) {
            console.error('❌ Failed to initialize notifications:', error);
            return false;
        }
    }

    // Request notification permissions
    async requestPermissions() {
        try {
            if (!Device.isDevice) {
                console.warn('⚠️ Push notifications only work on physical devices');
                return { status: 'denied' };
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            console.log(`📱 Notification permission status: ${finalStatus}`);
            return { status: finalStatus };
        } catch (error) {
            console.error('❌ Failed to request notification permissions:', error);
            return { status: 'denied' };
        }
    }

    // Get Expo push token
    async getPushToken() {
        try {
            if (!Device.isDevice) {
                console.warn('⚠️ Must use physical device for push notifications');
                return null;
            }

            const token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('📱 Expo push token obtained:', token.substring(0, 20) + '...');

            this.expoPushToken = token;
            return token;
        } catch (error) {
            console.error('❌ Failed to get push token:', error);
            return null;
        }
    }

    // Register token with backend
    async registerTokenWithBackend(token: string) {
        try {
            const platform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

            await apiNotificationService.registerDeviceToken(token, platform);
            console.log('✅ Device token registered with backend');
        } catch (error) {
            console.error('❌ Failed to register token with backend:', error);
            throw error;
        }
    }

    // Set up notification listeners
    setupNotificationListeners() {
        // Handle notification received while app is in foreground
        const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
            console.log('📱 Notification received in foreground:', notification);
            this.handleNotificationReceived(notification);
        });

        // Handle notification tapped
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('📱 Notification tapped:', response);
            this.handleNotificationTapped(response);
        });

        return {
            foregroundSubscription,
            responseSubscription,
        };
    }

    // Handle notification received
    private handleNotificationReceived(notification: Notifications.Notification) {
        const data = notification.request.content.data as NotificationData;

        console.log('📱 Processing notification:', {
            title: notification.request.content.title,
            body: notification.request.content.body,
            type: data.type,
        });

        // You can add custom logic here based on notification type
        switch (data.type) {
            case 'trending_outfits':
                console.log(`🔥 New trending outfits notification: ${data.outfitCount} outfits`);
                break;
            case 'new_suggestions':
                console.log('✨ New suggestions available');
                break;
            default:
                console.log('📢 General notification received');
        }
    }

    // Handle notification tapped
    private handleNotificationTapped(response: Notifications.NotificationResponse) {
        const data = response.notification.request.content.data as NotificationData;

        console.log('📱 Notification tapped, navigating...', data);

        // Mark notification as read
        if (data.notificationId) {
            this.markNotificationAsRead(data.notificationId);
        }

        // Navigate based on notification type
        // Note: You'll need to implement navigation logic based on your app structure
        this.navigateBasedOnNotification(data);
    }

    // Navigate based on notification type
    private navigateBasedOnNotification(data: NotificationData) {
        // This is a placeholder - implement actual navigation logic
        console.log('🧭 Would navigate to:', data.type);

        switch (data.type) {
            case 'trending_outfits':
                // Navigate to trending screen
                console.log('🔥 Navigate to trending outfits');
                break;
            case 'new_suggestions':
                // Navigate to suggestions screen
                console.log('✨ Navigate to suggestions');
                break;
            default:
                // Navigate to notifications screen
                console.log('📢 Navigate to notifications');
        }
    }

    // Mark notification as read
    async markNotificationAsRead(notificationId: string) {
        try {
            await apiNotificationService.markAsRead(notificationId);
            console.log('✅ Notification marked as read:', notificationId);
        } catch (error) {
            console.error('❌ Failed to mark notification as read:', error);
        }
    }

    // Get user notifications
    async getNotifications(limit = 20, offset = 0) {
        try {
            const response = await apiNotificationService.getNotifications(limit, offset);
            return response.data.data.notifications;
        } catch (error) {
            console.error('❌ Failed to get notifications:', error);
            throw error;
        }
    }

    // Update notification preferences
    async updatePreferences(preferences: any) {
        try {
            const response = await apiNotificationService.updatePreferences(preferences);
            console.log('✅ Notification preferences updated');
            return response.data.data.preferences;
        } catch (error) {
            console.error('❌ Failed to update notification preferences:', error);
            throw error;
        }
    }

    // Get notification preferences
    async getPreferences() {
        try {
            const response = await apiNotificationService.getPreferences();
            return response.data.data.preferences;
        } catch (error) {
            console.error('❌ Failed to get notification preferences:', error);
            throw error;
        }
    }

    // Schedule local notification (for testing)
    async scheduleLocalNotification(title: string, body: string, data?: any) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: data || {},
                },
                trigger: { seconds: 1 },
            });

            console.log('📱 Local notification scheduled');
        } catch (error) {
            console.error('❌ Failed to schedule local notification:', error);
        }
    }

    // Cancel all notifications
    async cancelAllNotifications() {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log('🗑️ All scheduled notifications cancelled');
        } catch (error) {
            console.error('❌ Failed to cancel notifications:', error);
        }
    }

    // Get notification badge count
    async getBadgeCount() {
        try {
            const count = await Notifications.getBadgeCountAsync();
            return count;
        } catch (error) {
            console.error('❌ Failed to get badge count:', error);
            return 0;
        }
    }

    // Set notification badge count
    async setBadgeCount(count: number) {
        try {
            await Notifications.setBadgeCountAsync(count);
            console.log(`📱 Badge count set to: ${count}`);
        } catch (error) {
            console.error('❌ Failed to set badge count:', error);
        }
    }

    // Clear badge
    async clearBadge() {
        await this.setBadgeCount(0);
    }

    // Get current push token
    getCurrentPushToken() {
        return this.expoPushToken;
    }
}

export const mobileNotificationService = new MobileNotificationService();