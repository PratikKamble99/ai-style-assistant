# 🚀 AI Stylist App - Deployment Guide

## 📋 Prerequisites

### **Required Services**
- **PostgreSQL Database** (local or cloud)
- **Redis Cache** (local or cloud)
- **Cloudinary Account** (for image storage)
- **Node.js 18+** and **npm**
- **Expo CLI** for mobile development

## 🔧 Environment Setup

### **Backend Environment (.env)**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_stylist"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Server
PORT=3002
NODE_ENV="development"

# CORS
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:19006"
```

### **Mobile App Environment**
Update the API base URL in `mobile-app/src/services/api.ts`:
```typescript
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Replace with your computer's IP address
    return 'http://YOUR_IP_ADDRESS:3002/api';
  }
  return 'https://your-production-api.com/api';
};
```

## 🗄️ Database Setup

### **1. Install PostgreSQL**
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### **2. Create Database**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE ai_stylist;
CREATE USER ai_stylist_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_stylist TO ai_stylist_user;
\q
```

### **3. Run Migrations**
```bash
cd ai-stylist-app/backend
npm install
npx prisma migrate dev
npx prisma generate
```

## 🔴 Redis Setup

### **Install Redis**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

## ☁️ Cloudinary Setup

1. **Create Account** at [cloudinary.com](https://cloudinary.com)
2. **Get Credentials** from Dashboard
3. **Add to Environment** variables

## 🚀 Backend Deployment

### **Development**
```bash
cd ai-stylist-app/backend
npm install
npm run dev
```

### **Production**
```bash
cd ai-stylist-app/backend
npm install
npm run build
npm start
```

### **Docker Deployment**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t ai-stylist-backend .
docker run -p 3002:3002 --env-file .env ai-stylist-backend
```

## 📱 Mobile App Deployment

### **Development**
```bash
cd ai-stylist-app/mobile-app
npm install
npx expo start
```

### **iOS Simulator**
```bash
npx expo start --ios
```

### **Android Emulator**
```bash
npx expo start --android
```

### **Physical Device**
1. Install **Expo Go** app
2. Scan QR code from terminal
3. App loads on device

### **Production Build**

#### **iOS**
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure
eas build:configure

# Build for iOS
eas build --platform ios
```

#### **Android**
```bash
# Build for Android
eas build --platform android

# Or build APK locally
npx expo build:android
```

## 🔍 Health Checks

### **Backend Health Check**
```bash
curl http://localhost:3002/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### **API Test**
```bash
curl http://localhost:3002/api/test
```

### **Database Connection**
```bash
cd ai-stylist-app/backend
npx prisma studio
```

## 🐛 Troubleshooting

### **Common Issues**

#### **Database Connection Error**
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Restart if needed
brew services restart postgresql
```

#### **Redis Connection Error**
```bash
# Check Redis status
redis-cli ping

# Should return: PONG
```

#### **Mobile App Network Error**
1. **Check IP Address** - Use your computer's IP, not localhost
2. **Firewall** - Ensure port 3002 is open
3. **Network** - Mobile device and computer on same network

#### **Cloudinary Upload Error**
1. **Check Credentials** - Verify API key and secret
2. **Permissions** - Ensure upload permissions enabled
3. **Quota** - Check if within free tier limits

### **Debug Commands**

#### **Backend Logs**
```bash
cd ai-stylist-app/backend
npm run dev
# Logs will show in terminal
```

#### **Mobile App Logs**
```bash
cd ai-stylist-app/mobile-app
npx expo start
# Press 'j' to open debugger
```

#### **Database Inspection**
```bash
cd ai-stylist-app/backend
npx prisma studio
# Opens web interface at http://localhost:5555
```

## 📊 Monitoring

### **Backend Monitoring**
- **Health Endpoint**: `/health`
- **Metrics Endpoint**: `/api/dashboard/metrics`
- **Logs**: Console output or log files

### **Mobile App Monitoring**
- **Expo DevTools**: Built-in debugging
- **Network Tab**: API call monitoring
- **Console Logs**: Error tracking

## 🔐 Security Checklist

### **Backend Security**
- ✅ **JWT Secret** - Strong, unique secret key
- ✅ **CORS** - Proper origin configuration
- ✅ **Rate Limiting** - API protection enabled
- ✅ **Input Validation** - All inputs validated
- ✅ **HTTPS** - SSL/TLS in production

### **Mobile App Security**
- ✅ **Secure Storage** - Expo SecureStore for tokens
- ✅ **API Validation** - All API responses validated
- ✅ **Error Handling** - No sensitive data in errors
- ✅ **Permissions** - Minimal required permissions

## 🚀 Production Deployment

### **Backend Production**
1. **Cloud Provider** - AWS, Google Cloud, or Heroku
2. **Database** - Managed PostgreSQL service
3. **Redis** - Managed Redis service
4. **Environment** - Production environment variables
5. **SSL Certificate** - HTTPS configuration
6. **Domain** - Custom domain setup

### **Mobile App Production**
1. **App Store** - iOS App Store submission
2. **Play Store** - Google Play Store submission
3. **OTA Updates** - Expo OTA for quick updates
4. **Analytics** - App analytics integration
5. **Crash Reporting** - Error tracking service

## ✅ Deployment Checklist

### **Pre-Deployment**
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Redis connection tested
- [ ] Cloudinary credentials verified
- [ ] API endpoints tested
- [ ] Mobile app builds successfully

### **Post-Deployment**
- [ ] Health checks passing
- [ ] API responses working
- [ ] Mobile app connects to backend
- [ ] Image upload working
- [ ] AI analysis functioning
- [ ] User registration/login working

## 🎉 Ready to Launch!

Your AI Stylist app is now ready for deployment! 

**Quick Start Commands:**
```bash
# Terminal 1 - Backend
cd ai-stylist-app/backend && npm run dev

# Terminal 2 - Mobile App
cd ai-stylist-app/mobile-app && npx expo start
```

**Access Points:**
- **Backend API**: http://localhost:3002
- **Mobile App**: Expo QR code or simulator
- **Database Admin**: http://localhost:5555 (Prisma Studio)

Happy deploying! 🚀