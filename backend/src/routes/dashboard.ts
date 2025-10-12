import express from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { cacheService } from '../services/cacheService';
import { dashboardService } from '../services/dashboardService';

const router = express.Router();

// Dashboard overview data
router.get('/overview', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  // Get user dashboard data from service
  const userData = await dashboardService.getUserDashboardData(userId);
  const recommendations = await dashboardService.getPersonalizedRecommendations(userId);
  
  const dashboardData = {
    user: {
      name: (req.user as any)?.name || 'User',
      email: req.user?.email,
      memberSince: '2024-01-15',
      profileCompletion: 85
    },
    stats: (userData as any).stats,
    recentActivity: (userData as any).recentActivity,
    quickActions: [
      {
        id: 'generate_outfit',
        title: 'Generate Outfit',
        description: 'Get AI-powered style suggestions',
        icon: 'flash',
        color: '#ec4899',
        route: '/suggestions'
      },
      {
        id: 'take_photo',
        title: 'Take Photo',
        description: 'Upload photo for analysis',
        icon: 'camera',
        color: '#8b5cf6',
        route: '/camera'
      },
      {
        id: 'browse_favorites',
        title: 'My Favorites',
        description: 'View saved items',
        icon: 'heart',
        color: '#ef4444',
        route: '/favorites'
      },
      {
        id: 'update_profile',
        title: 'Update Profile',
        description: 'Manage your preferences',
        icon: 'person',
        color: '#06b6d4',
        route: '/profile'
      }
    ],
    styleInsights: {
      dominantColors: ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981'],
      preferredStyles: ['Casual', 'Business', 'Evening'],
      seasonalTrends: {
        current: 'Spring 2024',
        trending: ['Pastel colors', 'Flowy fabrics', 'Minimalist designs']
      }
    },
    recommendations,
    lastUpdated: (userData as any).lastUpdated
  };

  res.json(dashboardData);
}));

// Real-time metrics endpoint
router.get('/metrics', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  // Real-time metrics that update frequently
  const metrics = {
    timestamp: new Date().toISOString(),
    todayStats: {
      outfitsGenerated: Math.floor(Math.random() * 10) + 5,
      photosAnalyzed: Math.floor(Math.random() * 8) + 3,
      userInteractions: Math.floor(Math.random() * 25) + 15
    },
    systemHealth: {
      aiServiceStatus: 'healthy',
      databaseStatus: 'healthy',
      cacheStatus: 'healthy',
      responseTime: Math.floor(Math.random() * 50) + 20 // ms
    },
    userEngagement: {
      averageSessionTime: '8m 32s',
      returnUserRate: '78%',
      satisfactionScore: 4.6
    }
  };

  res.json(metrics);
}));

// User's personal analytics
router.get('/analytics', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const timeRange = req.query.range || '7d'; // 7d, 30d, 90d
  
  const cacheKey = `dashboard:analytics:${userId}:${timeRange}`;
  const cachedData = await cacheService.get(cacheKey);
  
  if (cachedData) {
    return res.json(cachedData);
  }

  // Generate analytics data based on time range
  const generateDataPoints = (days: number) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        outfits: Math.floor(Math.random() * 5),
        photos: Math.floor(Math.random() * 3),
        favorites: Math.floor(Math.random() * 2)
      });
    }
    return data;
  };

  const days = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 7;
  
  const analytics = {
    timeRange,
    summary: {
      totalOutfits: Math.floor(Math.random() * 20) + 10,
      totalPhotos: Math.floor(Math.random() * 15) + 8,
      totalFavorites: Math.floor(Math.random() * 10) + 5,
      averageRating: (Math.random() * 1.5 + 3.5).toFixed(1)
    },
    chartData: generateDataPoints(days),
    topCategories: [
      { name: 'Casual', count: Math.floor(Math.random() * 10) + 5, percentage: 35 },
      { name: 'Business', count: Math.floor(Math.random() * 8) + 3, percentage: 25 },
      { name: 'Evening', count: Math.floor(Math.random() * 6) + 2, percentage: 20 },
      { name: 'Sport', count: Math.floor(Math.random() * 4) + 1, percentage: 12 },
      { name: 'Other', count: Math.floor(Math.random() * 3) + 1, percentage: 8 }
    ],
    colorPreferences: [
      { color: '#ec4899', name: 'Pink', usage: 28 },
      { color: '#8b5cf6', name: 'Purple', usage: 22 },
      { color: '#06b6d4', name: 'Cyan', usage: 18 },
      { color: '#10b981', name: 'Green', usage: 15 },
      { color: '#f59e0b', name: 'Yellow', usage: 12 },
      { color: '#ef4444', name: 'Red', usage: 5 }
    ]
  };

  // Cache for 1 hour
  await cacheService.set(cacheKey, analytics, 3600);

  res.json(analytics);
}));

// Notifications/alerts endpoint
router.get('/notifications', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const notifications = [
    {
      id: 1,
      type: 'info',
      title: 'New Style Trends Available',
      message: 'Check out the latest spring fashion trends curated just for you!',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
      actionUrl: '/suggestions'
    },
    {
      id: 2,
      type: 'success',
      title: 'Outfit Generation Complete',
      message: 'Your casual weekend outfit is ready for review.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionUrl: '/suggestions/123'
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Complete Your Profile',
      message: 'Add your measurements for better style recommendations.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: true,
      actionUrl: '/profile'
    },
    {
      id: 4,
      type: 'achievement',
      title: 'Style Milestone Reached!',
      message: 'Congratulations! You\'ve generated 25 outfits this month.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      actionUrl: null
    }
  ].slice(0, limit);

  res.json({
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    total: notifications.length
  });
}));

// Weather-based suggestions
router.get('/weather-suggestions', asyncHandler(async (req, res) => {
  const { lat, lon } = req.query;
  
  // Simulate weather data (in real app, integrate with weather API)
  const weatherData = {
    current: {
      temperature: Math.floor(Math.random() * 20) + 15, // 15-35°C
      condition: ['sunny', 'cloudy', 'rainy', 'windy'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      uvIndex: Math.floor(Math.random() * 8) + 1
    },
    suggestions: [] as Array<{
      type: string;
      message: string;
      items: string[];
    }>
  };

  // Generate suggestions based on weather
  if (weatherData.current.temperature > 25) {
    weatherData.suggestions.push({
      type: 'clothing',
      message: 'Perfect weather for light, breathable fabrics',
      items: ['Cotton t-shirts', 'Linen pants', 'Sundresses', 'Sandals']
    });
  } else if (weatherData.current.temperature < 15) {
    weatherData.suggestions.push({
      type: 'clothing',
      message: 'Layer up with these cozy options',
      items: ['Sweaters', 'Jackets', 'Boots', 'Scarves']
    });
  }

  if (weatherData.current.condition === 'rainy') {
    weatherData.suggestions.push({
      type: 'accessories',
      message: 'Don\'t forget rain protection',
      items: ['Umbrella', 'Waterproof jacket', 'Rain boots']
    });
  }

  if (weatherData.current.uvIndex > 6) {
    weatherData.suggestions.push({
      type: 'protection',
      message: 'High UV - protect your skin',
      items: ['Sunglasses', 'Hat', 'Long sleeves', 'Sunscreen']
    });
  }

  res.json(weatherData);
}));

// Track user activity
router.post('/activity', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { type, metadata } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!type) {
    return res.status(400).json({ error: 'Activity type is required' });
  }

  const validTypes = ['outfit_generated', 'photo_uploaded', 'item_favorited', 'profile_updated'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid activity type' });
  }

  await dashboardService.trackUserActivity({
    userId,
    type,
    timestamp: new Date().toISOString(),
    metadata
  });

  res.json({ success: true, message: 'Activity tracked successfully' });
}));

// Get real-time updates (for polling)
router.get('/updates', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const lastUpdate = req.query.since as string;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Get latest metrics
  const metrics = await cacheService.get('dashboard:latest_metrics');
  
  // Get user's recent activity since last update
  const recentActivity = (await cacheService.get(`dashboard:recent_activity:${userId}`)) || [];
  
  // Filter activity since last update if timestamp provided
  let newActivity = recentActivity as any[];
  if (lastUpdate && Array.isArray(recentActivity)) {
    const sinceDate = new Date(lastUpdate);
    newActivity = (recentActivity as any[]).filter((activity: any) => 
      new Date(activity.timestamp) > sinceDate
    );
  }

  res.json({
    timestamp: new Date().toISOString(),
    metrics,
    newActivity,
    hasUpdates: newActivity.length > 0 || !lastUpdate
  });
}));

export default router;