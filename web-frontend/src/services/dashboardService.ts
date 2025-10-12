import { dashboardService as dashboardAPI } from './api';

export interface DashboardOverview {
  user: {
    name: string;
    email: string;
    memberSince: string;
    profileCompletion: number;
  };
  stats: {
    totalOutfits: number;
    favoriteItems: number;
    stylingsSessions: number;
    photosUploaded: number;
  };
  recentActivity: Array<{
    id: number;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    icon: string;
  }>;
  quickActions: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    route: string;
  }>;
  styleInsights: {
    dominantColors: string[];
    preferredStyles: string[];
    seasonalTrends: {
      current: string;
      trending: string[];
    };
  };
  recommendations: Array<{
    id: number;
    type: string;
    title: string;
    message: string;
    priority: string;
    actionUrl?: string;
  }>;
  lastUpdated: string;
}

export interface DashboardMetrics {
  timestamp: string;
  activeUsers: number;
  todayStats: {
    outfitsGenerated: number;
    photosAnalyzed: number;
    userInteractions: number;
  };
  systemHealth: {
    aiServiceStatus: string;
    databaseStatus: string;
    cacheStatus: string;
    responseTime: number;
  };
  userEngagement: {
    averageSessionTime: string;
    returnUserRate: string;
    satisfactionScore: number;
  };
}

export interface DashboardAnalytics {
  timeRange: string;
  summary: {
    totalOutfits: number;
    totalPhotos: number;
    totalFavorites: number;
    averageRating: string;
  };
  chartData: Array<{
    date: string;
    outfits: number;
    photos: number;
    favorites: number;
  }>;
  topCategories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  colorPreferences: Array<{
    color: string;
    name: string;
    usage: number;
  }>;
}

export interface DashboardNotifications {
  notifications: Array<{
    id: number;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
  }>;
  unreadCount: number;
  total: number;
}

export interface WeatherSuggestions {
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    uvIndex: number;
  };
  suggestions: Array<{
    type: string;
    message: string;
    items: string[];
  }>;
}

export interface DashboardUpdates {
  timestamp: string;
  metrics: DashboardMetrics;
  newActivity: any[];
  hasUpdates: boolean;
}

class DashboardService {
  private pollingInterval: number | null = null;
  private updateCallbacks: Array<(updates: DashboardUpdates) => void> = [];
  private lastUpdateTime: string | null = null;

  // Get dashboard overview data
  async getOverview(): Promise<DashboardOverview> {
    const response = await dashboardAPI.getOverview();
    return response.data;
  }

  // Get real-time metrics
  async getMetrics(): Promise<DashboardMetrics> {
    const response = await dashboardAPI.getMetrics();
    return response.data;
  }

  // Get analytics data
  async getAnalytics(timeRange: '7d' | '30d' | '90d' = '7d'): Promise<DashboardAnalytics> {
    const response = await dashboardAPI.getAnalytics(timeRange);
    return response.data;
  }

  // Get notifications
  async getNotifications(limit: number = 10): Promise<DashboardNotifications> {
    const response = await dashboardAPI.getNotifications(limit);
    return response.data;
  }

  // Get weather-based suggestions
  async getWeatherSuggestions(lat?: number, lon?: number): Promise<WeatherSuggestions> {
    const response = await dashboardAPI.getWeatherSuggestions(lat, lon);
    return response.data;
  }

  // Track user activity
  async trackActivity(type: string, metadata?: any): Promise<void> {
    await dashboardAPI.trackActivity(type, metadata);
  }

  // Get real-time updates
  async getUpdates(): Promise<DashboardUpdates> {
    const response = await dashboardAPI.getUpdates(this.lastUpdateTime || undefined);
    this.lastUpdateTime = response.data.timestamp;
    return response.data;
  }

  // Start polling for real-time updates
  startPolling(intervalMs: number = 30000) {
    if (this.pollingInterval) {
      this.stopPolling();
    }

    this.pollingInterval = setInterval(async () => {
      try {
        const updates = await this.getUpdates();
        if (updates.hasUpdates) {
          this.updateCallbacks.forEach(callback => callback(updates));
        }
      } catch (error) {
        console.error('Error polling dashboard updates:', error);
      }
    }, intervalMs);
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Subscribe to real-time updates
  onUpdate(callback: (updates: DashboardUpdates) => void) {
    this.updateCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  // Helper methods for tracking common activities
  async trackOutfitGenerated(outfitId?: string) {
    await this.trackActivity('outfit_generated', { outfitId });
  }

  async trackPhotoUploaded(photoId?: string) {
    await this.trackActivity('photo_uploaded', { photoId });
  }

  async trackItemFavorited(itemId?: string) {
    await this.trackActivity('item_favorited', { itemId });
  }

  async trackProfileUpdated(section?: string) {
    await this.trackActivity('profile_updated', { section });
  }

  // Format time ago helper
  formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  // Get health status color
  getHealthStatusColor(status: string): string {
    switch (status) {
      case 'healthy':
        return '#10b981'; // green
      case 'degraded':
        return '#f59e0b'; // yellow
      case 'unhealthy':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  }

  // Format numbers with K/M suffixes
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Cleanup resources
  destroy() {
    this.stopPolling();
    this.updateCallbacks = [];
    this.lastUpdateTime = null;
  }
}

export const dashboardService = new DashboardService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    dashboardService.destroy();
  });
}