import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import aiRoutes from './routes/ai';
import productRoutes from './routes/products';
import uploadRoutes from './routes/upload';
import dashboardRoutes from './routes/dashboard';
import trendsRoutes from './routes/trends';
import suggestionsRoutes from './routes/suggestions';
import notificationsRoutes from './routes/notifications';
import trendingRoutes from './routes/trending';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';
import { prismaMiddleware } from './middleware/prisma';

// Import services
import { cronService } from './services/cronService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-domain.com']
    : true, // Allow all origins in development for mobile app testing
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Prisma middleware
app.use(prismaMiddleware);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mobile connection test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend connection successful!',
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.socket.remoteAddress
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/upload', authenticateToken, uploadRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/trends', authenticateToken, trendsRoutes);
app.use('/api/suggestions', authenticateToken, suggestionsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/trending', trendingRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  
  // Initialize cron jobs
  try {
    await cronService.initializeCronJobs();
    console.log('⏰ Cron jobs initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize cron jobs:', error);
  }
});