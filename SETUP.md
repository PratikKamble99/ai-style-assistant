# AI Stylist & Grooming Assistant - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (recommended)

### 1. Clone and Setup Environment

```bash
git clone <repository-url>
cd ai-stylist-app
cp .env.example .env
# Edit .env with your API keys and configuration
```

### 2. Docker Setup (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Manual Setup

#### Backend API
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

#### Web Frontend
```bash
cd web-frontend
npm install
npm run dev
```

#### Mobile App
```bash
cd mobile-app
npm install
npx expo start
```

#### AI Services
```bash
cd ai-services
pip install -r requirements.txt
python src/app.py
```

## 🔧 Configuration

### Required API Keys

1. **OpenAI API Key**
   - Visit: https://platform.openai.com/api-keys
   - Create new key and add to `OPENAI_API_KEY`

2. **Replicate API Token**
   - Visit: https://replicate.com/account/api-tokens
   - Create token and add to `REPLICATE_API_TOKEN`

3. **Cloudinary Account**
   - Visit: https://cloudinary.com/users/register/free
   - Get cloud name, API key, and secret

4. **E-commerce APIs** (Optional)
   - Myntra: Contact Myntra for API access
   - Amazon: Use Amazon Product Advertising API
   - H&M: Contact H&M for API access

### Database Setup

```bash
# Create PostgreSQL database
createdb ai_stylist

# Run migrations
cd backend
npx prisma migrate dev --name init
```

### OAuth Setup (Optional)

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
   - `http://localhost:5000/auth/google/callback`

#### Apple Sign In
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create App ID with Sign In with Apple capability
3. Create Service ID for web authentication
4. Configure domains and redirect URLs

## 📱 Mobile App Setup

### iOS Setup
```bash
cd mobile-app
npx expo run:ios
```

### Android Setup
```bash
cd mobile-app
npx expo run:android
```

### Expo Development
```bash
cd mobile-app
npx expo start
# Scan QR code with Expo Go app
```

## 🤖 AI Services Configuration

### Python Dependencies
```bash
cd ai-services
pip install -r requirements.txt

# For face recognition (optional)
# macOS: brew install cmake
# Ubuntu: sudo apt-get install cmake
```

### Model Downloads
The AI services will automatically download required models on first run:
- MediaPipe Pose model
- Face recognition models
- OpenCV cascade classifiers

## 🔍 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd web-frontend
npm test
```

### API Testing
```bash
# Test backend health
curl http://localhost:5000/health

# Test AI services health
curl http://localhost:8000/health
```

## 🚀 Deployment

### Backend (AWS EC2/Railway/Render)
```bash
cd backend
npm run build
npm start
```

### Frontend (Vercel/Netlify)
```bash
cd web-frontend
npm run build
# Deploy dist folder
```

### Mobile App (Expo/App Stores)
```bash
cd mobile-app
npx expo build:ios
npx expo build:android
```

### AI Services (Python/Docker)
```bash
cd ai-services
docker build -t ai-stylist-services .
docker run -p 8000:8000 ai-stylist-services
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check PostgreSQL is running
   pg_isready
   
   # Reset database
   npx prisma migrate reset
   ```

2. **Python Dependencies Error**
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate     # Windows
   pip install -r requirements.txt
   ```

3. **Mobile App Metro Error**
   ```bash
   cd mobile-app
   npx expo start --clear
   ```

4. **CORS Issues**
   - Check `CORS_ORIGINS` in .env
   - Ensure frontend URL is included

### Performance Optimization

1. **Database Indexing**
   ```sql
   CREATE INDEX idx_user_suggestions ON style_suggestions(user_id, created_at);
   CREATE INDEX idx_product_platform ON product_recommendations(platform, category);
   ```

2. **Redis Caching**
   - AI analysis results cached for 1 hour
   - Product recommendations cached for 30 minutes
   - User sessions cached for 7 days

3. **Image Optimization**
   - Use Cloudinary auto-optimization
   - Implement lazy loading
   - Compress images before upload

## 📊 Monitoring

### Health Checks
- Backend: `GET /health`
- AI Services: `GET /health`
- Database: Connection pooling status
- Redis: Memory usage and hit rate

### Logging
- Application logs: `logs/app.log`
- Error logs: `logs/error.log`
- AI processing logs: `logs/ai.log`

### Metrics
- API response times
- AI processing duration
- User engagement rates
- Conversion rates (favorites to purchases)

## 🔐 Security

### Environment Variables
- Never commit .env files
- Use different keys for development/production
- Rotate API keys regularly

### Data Protection
- User photos encrypted at rest
- PII data anonymized in logs
- GDPR compliance for EU users

### API Security
- Rate limiting enabled
- JWT token expiration
- Input validation and sanitization
- SQL injection prevention with Prisma

## 📞 Support

For issues and questions:
1. Check this setup guide
2. Review error logs
3. Check GitHub issues
4. Contact development team

## 🎯 Next Steps

After setup:
1. Test all API endpoints
2. Upload sample photos for AI analysis
3. Configure e-commerce integrations
4. Set up monitoring and alerts
5. Deploy to production environment