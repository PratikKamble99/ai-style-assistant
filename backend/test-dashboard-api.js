const express = require('express');
const cors = require('cors');

// Simple test server to verify dashboard API structure
const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());

// Mock dashboard data
const mockDashboardData = {
  user: {
    name: 'Test User',
    email: 'test@example.com',
    memberSince: '2024-01-15',
    profileCompletion: 85
  },
  stats: {
    totalOutfits: 24,
    favoriteItems: 12,
    stylingsSessions: 8,
    photosUploaded: 15
  },
  recentActivity: [
    {
      id: 1,
      type: 'outfit_generated',
      title: 'New casual outfit created',
      description: 'AI generated a perfect casual look for weekend',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      icon: 'shirt-outline'
    },
    {
      id: 2,
      type: 'photo_uploaded',
      title: 'Photo uploaded',
      description: 'Added new photo for style analysis',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      icon: 'camera-outline'
    }
  ],
  quickActions: [
    {
      id: 'generate_outfit',
      title: 'Generate Outfit',
      description: 'Get AI-powered style suggestions',
      icon: 'flash',
      color: '#ec4899',
      route: '/suggestions'
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
  recommendations: [
    {
      id: 1,
      type: 'style_tip',
      title: 'Color Coordination Tip',
      message: 'Try pairing your favorite pink pieces with neutral tones for a balanced look',
      priority: 'medium'
    }
  ],
  lastUpdated: new Date().toISOString()
};

const mockMetrics = {
  timestamp: new Date().toISOString(),
  activeUsers: 127,
  todayStats: {
    outfitsGenerated: 8,
    photosAnalyzed: 5,
    userInteractions: 23
  },
  systemHealth: {
    aiServiceStatus: 'healthy',
    databaseStatus: 'healthy',
    cacheStatus: 'healthy',
    responseTime: 35
  },
  userEngagement: {
    averageSessionTime: '8m 32s',
    returnUserRate: '78%',
    satisfactionScore: 4.6
  }
};

// Dashboard API endpoints
app.get('/api/dashboard/overview', (req, res) => {
  console.log('📊 Dashboard overview requested');
  res.json(mockDashboardData);
});

app.get('/api/dashboard/metrics', (req, res) => {
  console.log('📈 Dashboard metrics requested');
  res.json(mockMetrics);
});

app.get('/api/dashboard/notifications', (req, res) => {
  console.log('🔔 Dashboard notifications requested');
  res.json({
    notifications: [
      {
        id: 1,
        type: 'info',
        title: 'New Style Trends Available',
        message: 'Check out the latest spring fashion trends!',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/suggestions'
      }
    ],
    unreadCount: 1,
    total: 1
  });
});

app.get('/api/dashboard/updates', (req, res) => {
  console.log('🔄 Dashboard updates requested');
  res.json({
    timestamp: new Date().toISOString(),
    metrics: mockMetrics,
    newActivity: [],
    hasUpdates: false
  });
});

app.post('/api/dashboard/activity', (req, res) => {
  console.log('📝 Activity tracked:', req.body);
  res.json({ success: true, message: 'Activity tracked successfully' });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Dashboard API Test Server'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Dashboard API Test Server running on port ${PORT}`);
  console.log(`📊 Test endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/dashboard/overview`);
  console.log(`   GET  http://localhost:${PORT}/api/dashboard/metrics`);
  console.log(`   GET  http://localhost:${PORT}/api/dashboard/notifications`);
  console.log(`   GET  http://localhost:${PORT}/api/dashboard/updates`);
  console.log(`   POST http://localhost:${PORT}/api/dashboard/activity`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`\n✅ Dashboard API is ready for frontend testing!`);
});