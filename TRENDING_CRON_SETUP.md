# Trending Outfits Cron Job & Notification System Setup

## Overview
This system automatically generates trending outfit suggestions every 2 days and sends notifications to users via push notifications and email.

## Features
- 🤖 **AI-Generated Trending Outfits**: Creates fresh outfit suggestions using AI
- ⏰ **Automated Cron Jobs**: Runs every 2 days at 9 AM IST
- 📱 **Push Notifications**: Mobile and web push notifications
- 📧 **Email Notifications**: HTML email notifications
- 🔥 **Trending Algorithm**: Smart scoring based on views, likes, and recency
- 🧹 **Auto Cleanup**: Removes old, low-engagement outfits

## Architecture

### Backend Services
1. **TrendingService** - Generates and manages trending outfits
2. **NotificationService** - Handles push and email notifications
3. **CronService** - Manages scheduled jobs

### Database Models
- `TrendingOutfit` - Stores trending outfit data
- `TrendingOutfitItem` - Individual clothing items
- `Notification` - User notifications
- `NotificationPreferences` - User notification settings
- `DeviceToken` - Push notification tokens
- `CronJob` - Cron job execution tracking

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Firebase Admin (for push notifications)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# VAPID Keys (for web push notifications)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### 2. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Cloud Messaging
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Extract the required fields for your `.env`

### 3. Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

### 4. Database Migration

Run the Prisma migration to create new tables:

```bash
cd backend
npx prisma migrate dev --name add-trending-notifications
npx prisma generate
```

### 5. Install Dependencies

```bash
# Backend
cd backend
npm install firebase-admin node-cron nodemailer @types/node-cron @types/nodemailer

# Mobile (if not already installed)
cd ../mobile-app
npm install expo-notifications expo-device

# Web (if not already installed)
cd ../web-frontend
npm install @mui/material @mui/icons-material
```

## Usage

### Backend API Endpoints

#### Trending Outfits
- `GET /api/trending` - Get trending outfits
- `GET /api/trending/featured` - Get featured outfits
- `GET /api/trending/:id` - Get outfit by ID
- `POST /api/trending/:id/like` - Like/unlike outfit
- `POST /api/trending/:id/share` - Share outfit
- `GET /api/trending/category/:category` - Get by category
- `GET /api/trending/occasion/:occasion` - Get by occasion

#### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/device-token` - Register device token
- `PUT /api/notifications/preferences` - Update preferences
- `GET /api/notifications/preferences` - Get preferences

#### Admin (Testing)
- `POST /api/notifications/admin/trigger-trending` - Manually trigger cron
- `GET /api/notifications/admin/cron-status` - Get cron job status

### Mobile Integration

```typescript
import { mobileNotificationService } from '../services/notificationService';
import { trendingService } from '../services/api';

// Initialize notifications
await mobileNotificationService.initialize();

// Get trending outfits
const trending = await trendingService.getTrending();

// Set up notification listeners
const listeners = mobileNotificationService.setupNotificationListeners();
```

### Web Integration

```typescript
import { notificationService } from '../services/notificationService';
import { trendingService } from '../services/trendingService';

// Initialize web push
await notificationService.initializeWebPush();

// Get trending outfits
const trending = await trendingService.getTrending();
```

## Cron Job Schedule

### Main Jobs
1. **Trending Outfits Generation**: Every 2 days at 9 AM IST
   - Generates new trending outfits
   - Sends notifications to users
   - Updates trending scores

2. **Daily Score Update**: Every day at 6 AM IST
   - Updates trending scores based on engagement
   - Maintains outfit rankings

3. **Weekly Cleanup**: Every Sunday at 2 AM IST
   - Removes old, low-engagement outfits
   - Cleans up old notifications

### Manual Testing

```bash
# Trigger trending cron manually
curl -X POST http://localhost:3003/api/notifications/admin/trigger-trending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check cron status
curl -X GET http://localhost:3003/api/notifications/admin/cron-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Notification Types

### Push Notifications
- **Trending Outfits**: New trending outfits available
- **New Suggestions**: Personalized suggestions ready
- **Weekly Digest**: Weekly fashion summary
- **Seasonal Trends**: New seasonal trends

### Email Notifications
- HTML emails with outfit images
- Personalized content based on user preferences
- Unsubscribe links and preference management

## Trending Algorithm

The trending score is calculated based on:
- **Views**: 1 point per view
- **Likes**: 3 points per like
- **Shares**: 5 points per share
- **Recency**: Decay factor (5 points per day)

Formula: `(views × 1 + likes × 3 + shares × 5 + recency_score) / 2`

## User Preferences

Users can control:
- Trending outfit notifications
- New suggestion notifications
- Weekly digest
- Personalized tips
- Seasonal trends
- Push vs email delivery
- Preferred notification time
- Timezone settings

## Monitoring

### Cron Job Status
- Last run time
- Next scheduled run
- Success/failure count
- Error messages
- Success rate percentage

### Notification Metrics
- Delivery success rate
- User engagement
- Preference changes
- Device token management

## Troubleshooting

### Common Issues

1. **Firebase Authentication Error**
   - Check service account key format
   - Verify project ID and credentials
   - Ensure Firebase Admin SDK is properly initialized

2. **Email Delivery Failure**
   - Verify Gmail app password
   - Check email service configuration
   - Test with a simple email first

3. **Cron Jobs Not Running**
   - Check server timezone settings
   - Verify cron expressions
   - Check server logs for errors

4. **Push Notifications Not Working**
   - Verify device token registration
   - Check Firebase project configuration
   - Test with Firebase Console

### Debug Commands

```bash
# Check cron job status
node -e "
const { cronService } = require('./dist/services/cronService');
cronService.getCronJobStatus().then(console.log);
"

# Test notification service
node -e "
const { notificationService } = require('./dist/services/notificationService');
notificationService.sendPushNotification('user-id', {
  title: 'Test',
  body: 'Test notification'
}).then(() => console.log('Sent'));
"
```

## Production Deployment

### Environment Setup
1. Set production environment variables
2. Configure proper SMTP server (not Gmail)
3. Set up Firebase project for production
4. Configure proper domain for web push

### Scaling Considerations
- Use Redis for cron job coordination in multi-instance deployments
- Implement notification queues for high volume
- Monitor notification delivery rates
- Set up proper logging and alerting

### Security
- Secure Firebase service account keys
- Use environment-specific configurations
- Implement rate limiting for notification endpoints
- Validate user permissions for admin endpoints

## API Documentation

### Trending Outfits Response Format

```json
{
  "success": true,
  "data": {
    "outfits": [
      {
        "id": "outfit-id",
        "title": "Casual Streetwear Look",
        "description": "Perfect for weekend outings",
        "imageUrl": "https://...",
        "category": "Streetwear",
        "occasion": "CASUAL",
        "season": "Winter 2024",
        "trendingScore": 85.5,
        "viewCount": 1250,
        "likeCount": 89,
        "shareCount": 23,
        "tags": ["trending", "casual", "streetwear"],
        "colors": ["#000000", "#FFFFFF"],
        "priceRange": "MID_RANGE",
        "isFeatured": true,
        "items": [
          {
            "id": "item-id",
            "name": "Trendy Hoodie",
            "category": "TOP",
            "brand": "Nike",
            "price": 2999,
            "imageUrl": "https://...",
            "productUrl": "https://...",
            "fitAdvice": "True to size",
            "stylingTip": "Layer with a jacket"
          }
        ]
      }
    ]
  }
}
```

### Notification Response Format

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification-id",
        "title": "🔥 New Trending Outfits!",
        "body": "Discover 5 fresh outfit ideas",
        "type": "TRENDING_OUTFITS",
        "data": {
          "outfitCount": 5,
          "category": "all"
        },
        "imageUrl": "https://...",
        "isRead": false,
        "createdAt": "2024-01-15T09:00:00Z"
      }
    ]
  }
}
```

This system provides a comprehensive solution for automated trending outfit generation and user notifications across both mobile and web platforms.