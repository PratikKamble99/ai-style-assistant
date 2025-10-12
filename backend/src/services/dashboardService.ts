import { EventEmitter } from 'events';
import { cacheService } from './cacheService';

interface DashboardMetrics {
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
}

interface UserActivity {
  userId: string;
  type: 'outfit_generated' | 'photo_uploaded' | 'item_favorited' | 'profile_updated';
  timestamp: string;
  metadata?: any;
}

class DashboardService extends EventEmitter {
  private metricsInterval: NodeJS.Timeout | null = null;
  private activeUsers = new Set<string>();

  constructor() {
    super();
    this.startMetricsCollection();
  }

  // Start collecting real-time metrics
  private startMetricsCollection() {
    // Update metrics every 30 seconds
    this.metricsInterval = setInterval(async () => {
      const metrics = await this.generateMetrics();
      this.emit('metricsUpdate', metrics);
      
      // Cache the latest metrics
      await cacheService.set('dashboard:latest_metrics', metrics, 60);
    }, 30000);
  }

  // Generate current metrics
  private async generateMetrics(): Promise<DashboardMetrics> {
    return {
      timestamp: new Date().toISOString(),
      activeUsers: this.activeUsers.size,
      todayStats: {
        outfitsGenerated: await this.getTodayCount('outfits_generated'),
        photosAnalyzed: await this.getTodayCount('photos_analyzed'),
        userInteractions: await this.getTodayCount('user_interactions')
      },
      systemHealth: {
        aiServiceStatus: await this.checkServiceHealth('ai'),
        databaseStatus: await this.checkServiceHealth('database'),
        cacheStatus: await this.checkServiceHealth('cache'),
        responseTime: await this.getAverageResponseTime()
      }
    };
  }

  // Track user activity
  async trackUserActivity(activity: UserActivity) {
    // Add to active users
    this.activeUsers.add(activity.userId);
    
    // Remove user after 5 minutes of inactivity
    setTimeout(() => {
      this.activeUsers.delete(activity.userId);
    }, 5 * 60 * 1000);

    // Increment daily counters
    const today = new Date().toISOString().split('T')[0];
    const counterKey = `dashboard:daily:${activity.type}:${today}`;
    
    const currentCount = (await cacheService.get(counterKey) as number) || 0;
    await cacheService.set(counterKey, currentCount + 1, 24 * 60 * 60); // 24 hours

    // Emit activity event for real-time updates
    this.emit('userActivity', activity);

    // Update user's recent activity
    await this.updateUserRecentActivity(activity.userId, activity);
  }

  // Get today's count for a specific metric
  private async getTodayCount(metric: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const counterKey = `dashboard:daily:${metric}:${today}`;
    return (await cacheService.get(counterKey) as number) || 0;
  }

  // Check service health
  private async checkServiceHealth(service: string): Promise<string> {
    try {
      switch (service) {
        case 'ai':
          // In real implementation, ping AI service
          return 'healthy';
        case 'database':
          // In real implementation, check database connection
          return 'healthy';
        case 'cache':
          // Check cache service
          await cacheService.set('health_check', 'ok', 10);
          const result = await cacheService.get('health_check');
          return result === 'ok' ? 'healthy' : 'degraded';
        default:
          return 'unknown';
      }
    } catch (error) {
      return 'unhealthy';
    }
  }

  // Get average response time
  private async getAverageResponseTime(): Promise<number> {
    // In real implementation, calculate from actual response times
    return Math.floor(Math.random() * 50) + 20;
  }

  // Update user's recent activity
  private async updateUserRecentActivity(userId: string, activity: UserActivity) {
    const cacheKey = `dashboard:recent_activity:${userId}`;
    const recentActivities = (await cacheService.get(cacheKey) as any[]) || [];
    
    // Add new activity to the beginning
    recentActivities.unshift({
      id: Date.now(),
      type: activity.type,
      title: this.getActivityTitle(activity.type),
      description: this.getActivityDescription(activity.type, activity.metadata),
      timestamp: activity.timestamp,
      icon: this.getActivityIcon(activity.type)
    });

    // Keep only last 10 activities
    const limitedActivities = recentActivities.slice(0, 10);
    
    // Cache for 24 hours
    await cacheService.set(cacheKey, limitedActivities, 24 * 60 * 60);
  }

  // Get activity title based on type
  private getActivityTitle(type: string): string {
    const titles = {
      outfit_generated: 'New outfit created',
      photo_uploaded: 'Photo uploaded',
      item_favorited: 'Item added to favorites',
      profile_updated: 'Profile updated'
    };
    return titles[type as keyof typeof titles] || 'Activity recorded';
  }

  // Get activity description
  private getActivityDescription(type: string, metadata?: any): string {
    const descriptions = {
      outfit_generated: 'AI generated a perfect look for you',
      photo_uploaded: 'Added new photo for style analysis',
      item_favorited: 'Saved an item to your favorites',
      profile_updated: 'Updated your style preferences'
    };
    return descriptions[type as keyof typeof descriptions] || 'User activity recorded';
  }

  // Get activity icon
  private getActivityIcon(type: string): string {
    const icons = {
      outfit_generated: 'shirt-outline',
      photo_uploaded: 'camera-outline',
      item_favorited: 'heart-outline',
      profile_updated: 'settings-outline'
    };
    return icons[type as keyof typeof icons] || 'information-circle-outline';
  }

  // Get user's dashboard data
  async getUserDashboardData(userId: string) {
    const cacheKey = `dashboard:user_data:${userId}`;
    let userData = await cacheService.get(cacheKey);

    if (!userData) {
      // Generate fresh user data
      userData = {
        stats: {
          totalOutfits: Math.floor(Math.random() * 50) + 10,
          favoriteItems: Math.floor(Math.random() * 30) + 5,
          stylingsSessions: Math.floor(Math.random() * 20) + 3,
          photosUploaded: Math.floor(Math.random() * 40) + 8
        },
        recentActivity: (await cacheService.get(`dashboard:recent_activity:${userId}`) as any[]) || [],
        lastUpdated: new Date().toISOString()
      };

      // Cache for 10 minutes
      await cacheService.set(cacheKey, userData, 600);
    }

    return userData;
  }

  // Generate personalized recommendations
  async getPersonalizedRecommendations(userId: string) {
    const cacheKey = `dashboard:recommendations:${userId}`;
    let recommendations = await cacheService.get(cacheKey);

    if (!recommendations) {
      recommendations = [
        {
          id: 1,
          type: 'style_tip',
          title: 'Color Coordination Tip',
          message: 'Try pairing your favorite colors with neutral tones for a balanced look',
          priority: 'medium',
          actionUrl: '/suggestions'
        },
        {
          id: 2,
          type: 'seasonal_update',
          title: 'Seasonal Trends',
          message: 'New seasonal trends are available! Check out the latest styles',
          priority: 'high',
          actionUrl: '/suggestions'
        },
        {
          id: 3,
          type: 'profile_completion',
          title: 'Complete Your Profile',
          message: 'Add more details to get better personalized recommendations',
          priority: 'low',
          actionUrl: '/profile'
        }
      ];

      // Cache for 1 hour
      await cacheService.set(cacheKey, recommendations, 3600);
    }

    return recommendations;
  }

  // Cleanup resources
  destroy() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    this.removeAllListeners();
  }
}

export const dashboardService = new DashboardService();

// Graceful shutdown
process.on('SIGTERM', () => {
  dashboardService.destroy();
});

process.on('SIGINT', () => {
  dashboardService.destroy();
});