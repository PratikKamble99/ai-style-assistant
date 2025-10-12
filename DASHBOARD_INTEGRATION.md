# Dashboard Integration Guide

## Overview

The AI Stylist application now includes a comprehensive real-time dashboard system that provides:

- **Real-time metrics** and user activity tracking
- **Personalized recommendations** based on user behavior
- **Live notifications** and updates
- **Analytics and insights** for user engagement
- **Weather-based style suggestions**

## Architecture

### Backend Components

1. **Dashboard Routes** (`/src/routes/dashboard.ts`)
   - `/api/dashboard/overview` - Main dashboard data
   - `/api/dashboard/metrics` - Real-time metrics
   - `/api/dashboard/notifications` - User notifications
   - `/api/dashboard/analytics` - User analytics data
   - `/api/dashboard/activity` - Track user activities
   - `/api/dashboard/updates` - Real-time updates endpoint

2. **Dashboard Service** (`/src/services/dashboardService.ts`)
   - Manages real-time metrics collection
   - Tracks user activities and engagement
   - Handles caching and performance optimization
   - Provides event-driven updates

3. **Cache Service** (`/src/services/cacheService.ts`)
   - In-memory caching for development
   - Optimized for dashboard data storage
   - Automatic cleanup and expiration

### Frontend Components

1. **Dashboard Context** (`/src/contexts/DashboardContext.tsx`)
   - Centralized state management for dashboard data
   - Real-time updates and polling
   - Activity tracking integration

2. **Dashboard Service** (`/src/services/dashboardService.ts`)
   - API integration layer
   - Real-time polling and updates
   - Helper methods for data formatting

3. **Dashboard Components** (`/src/components/dashboard/`)
   - `MetricsCard` - Reusable metrics display
   - `ActivityFeed` - User activity timeline
   - `RecommendationCard` - Personalized recommendations
   - `LiveIndicator` - Connection status and notifications

4. **Custom Hooks** (`/src/hooks/useDashboard.ts`)
   - Simplified dashboard data access
   - Real-time updates subscription
   - Activity tracking helpers

## API Endpoints

### GET /api/dashboard/overview
Returns comprehensive dashboard data including:
- User profile information
- Activity statistics
- Recent activity feed
- Quick action buttons
- Style insights and preferences
- Personalized recommendations

### GET /api/dashboard/metrics
Real-time system metrics:
- Active user count
- Daily statistics (outfits, photos, interactions)
- System health status
- Performance metrics

### GET /api/dashboard/notifications
User notifications:
- Recent notifications with read/unread status
- Notification count and pagination
- Action URLs for interactive notifications

### POST /api/dashboard/activity
Track user activities:
- Activity type (outfit_generated, photo_uploaded, etc.)
- Metadata for additional context
- Automatic timestamp and user association

### GET /api/dashboard/updates
Real-time updates for polling:
- Latest metrics
- New activity since last check
- Update flags for efficient polling

## Usage Examples

### Basic Dashboard Integration

```tsx
import { useDashboardContext } from '../contexts/DashboardContext';

const MyComponent = () => {
  const { 
    overview, 
    metrics, 
    isLoading, 
    trackActivity 
  } = useDashboardContext();

  const handleAction = async () => {
    await trackActivity('outfit_generated', { occasion: 'casual' });
  };

  return (
    <div>
      <h1>Welcome {overview?.user.name}</h1>
      <p>Total Outfits: {overview?.stats.totalOutfits}</p>
      <p>Active Users: {metrics?.activeUsers}</p>
      <button onClick={handleAction}>Generate Outfit</button>
    </div>
  );
};
```

### Using Dashboard Components

```tsx
import MetricsCard from '../components/dashboard/MetricsCard';
import { Sparkles } from 'lucide-react';

const Dashboard = () => {
  return (
    <MetricsCard
      title="Total Outfits"
      value={24}
      subtitle="5 generated today"
      icon={Sparkles}
      iconColor="text-primary-600"
      iconBgColor="bg-primary-100"
    />
  );
};
```

## Testing

### Test Page
Visit `/dashboard-test` to access the dashboard integration test page, which provides:
- Real-time connection status
- Manual data fetching controls
- Activity tracking testing
- Raw data inspection
- Error handling verification

### Backend Testing
Use the test server (`test-dashboard-api.js`) to verify API endpoints:

```bash
cd ai-stylist-app/backend
node test-dashboard-api.js
```

This starts a mock API server on port 3003 with sample data.

## Configuration

### Environment Variables
- `NODE_ENV` - Environment mode (development/production)
- `REDIS_URL` - Redis connection URL (optional, falls back to in-memory cache)

### API Base URL
The frontend automatically configures the API base URL:
- Development: `http://localhost:3002/api`
- Production: Configure in `src/services/api.ts`

## Real-time Features

### Polling
- Automatic polling every 30 seconds for real-time updates
- Efficient polling with timestamp-based filtering
- Automatic reconnection handling

### Activity Tracking
- Automatic activity tracking for user interactions
- Configurable activity types and metadata
- Real-time activity feed updates

### Notifications
- Live notification count updates
- Unread notification indicators
- Interactive notification actions

## Performance Optimization

### Caching Strategy
- Dashboard data cached for 5-10 minutes
- Metrics cached for 1 minute
- User activity cached for 24 hours
- Automatic cache invalidation on updates

### Efficient Updates
- Timestamp-based polling to reduce bandwidth
- Selective data updates based on change detection
- Component-level loading states

## Deployment Notes

### Production Considerations
1. Replace in-memory cache with Redis for scalability
2. Configure proper CORS settings for production domains
3. Set up proper authentication and rate limiting
4. Monitor API performance and caching effectiveness

### Security
- All dashboard endpoints require authentication
- Activity tracking includes user validation
- Rate limiting applied to prevent abuse
- Sensitive data properly sanitized

## Future Enhancements

1. **WebSocket Integration** - Replace polling with real-time WebSocket connections
2. **Advanced Analytics** - More detailed user behavior analytics
3. **Custom Dashboards** - User-configurable dashboard layouts
4. **Export Features** - Data export and reporting capabilities
5. **Mobile Optimization** - Enhanced mobile dashboard experience

## Troubleshooting

### Common Issues

1. **Dashboard not loading**
   - Check API server is running on correct port
   - Verify authentication token is valid
   - Check browser console for network errors

2. **Real-time updates not working**
   - Verify polling is enabled in dashboard context
   - Check network connectivity
   - Ensure API endpoints are accessible

3. **Activity tracking not working**
   - Verify user is authenticated
   - Check activity type is valid
   - Ensure API endpoint is reachable

### Debug Mode
Enable debug mode by visiting `/dashboard-test` to inspect:
- Raw API responses
- Connection status
- Error messages
- Data flow verification