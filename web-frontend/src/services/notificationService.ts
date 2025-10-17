import api from './api';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'TRENDING_OUTFITS' | 'NEW_SUGGESTIONS' | 'WEEKLY_DIGEST' | 'PERSONALIZED_TIPS' | 'SEASONAL_TRENDS' | 'SYSTEM_UPDATE';
  data?: any;
  imageUrl?: string;
  isRead: boolean;
  isSent: boolean;
  sentAt?: string;
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  id: string;
  trendingOutfits: boolean;
  newSuggestions: boolean;
  weeklyDigest: boolean;
  personalizedTips: boolean;
  seasonalTrends: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  preferredTime?: string;
  timezone?: string;
}

class NotificationService {
  // Get user notifications
  async getNotifications(limit?: number, offset?: number): Promise<Notification[]> {
    try {
      const response = await api.get('/notifications', {
        params: { limit, offset },
      });
      return response.data.data.notifications;
    } catch (error) {
      console.error('❌ Failed to get notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<void> {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Register device token for push notifications (web)
  async registerDeviceToken(token: string): Promise<void> {
    try {
      await api.post('/notifications/device-token', {
        token,
        platform: 'WEB',
      });
    } catch (error) {
      console.error('❌ Failed to register device token:', error);
      throw error;
    }
  }

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    try {
      const response = await api.put('/notifications/preferences', preferences);
      return response.data.data.preferences;
    } catch (error) {
      console.error('❌ Failed to update notification preferences:', error);
      throw error;
    }
  }

  // Get notification preferences
  async getPreferences(): Promise<NotificationPreferences | null> {
    try {
      const response = await api.get('/notifications/preferences');
      return response.data.data.preferences;
    } catch (error) {
      console.error('❌ Failed to get notification preferences:', error);
      throw error;
    }
  }

  // Admin: Trigger trending cron (for testing)
  async triggerTrendingCron(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/notifications/admin/trigger-trending');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to trigger trending cron:', error);
      throw error;
    }
  }

  // Admin: Get cron status
  async getCronStatus(): Promise<any> {
    try {
      const response = await api.get('/notifications/admin/cron-status');
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to get cron status:', error);
      throw error;
    }
  }

  // Request notification permission (web)
  async requestNotificationPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        console.warn('⚠️ This browser does not support notifications');
        return false;
      }

      if (Notification.permission === 'granted') {
        return true;
      }

      if (Notification.permission === 'denied') {
        console.warn('⚠️ Notification permission denied');
        return false;
      }

      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Failed to request notification permission:', error);
      return false;
    }
  }

  // Show browser notification
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    try {
      if (!('Notification' in window)) {
        console.warn('⚠️ This browser does not support notifications');
        return;
      }

      if (Notification.permission !== 'granted') {
        const granted = await this.requestNotificationPermission();
        if (!granted) {
          return;
        }
      }

      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (error) {
      console.error('❌ Failed to show notification:', error);
    }
  }

  // Initialize web push notifications
  async initializeWebPush(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('⚠️ Push messaging is not supported');
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service worker registered');

      // Request notification permission
      const permissionGranted = await this.requestNotificationPermission();
      if (!permissionGranted) {
        return false;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || ''),
      });

      // Register token with backend
      await this.registerDeviceToken(JSON.stringify(subscription));

      console.log('✅ Web push notifications initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize web push:', error);
      return false;
    }
  }

  // Helper function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const notificationService = new NotificationService();