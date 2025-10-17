"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const ai_1 = __importDefault(require("./routes/ai"));
const products_1 = __importDefault(require("./routes/products"));
const upload_1 = __importDefault(require("./routes/upload"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const trends_1 = __importDefault(require("./routes/trends"));
const suggestions_1 = __importDefault(require("./routes/suggestions"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const trending_1 = __importDefault(require("./routes/trending"));
// Import middleware
const errorHandler_1 = require("./middleware/errorHandler");
const auth_2 = require("./middleware/auth");
// Import services
const cronService_1 = require("./services/cronService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://your-domain.com']
        : true, // Allow all origins in development for mobile app testing
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
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
app.use('/api/auth', auth_1.default);
app.use('/api/user', auth_2.authenticateToken, user_1.default);
app.use('/api/ai', auth_2.authenticateToken, ai_1.default);
app.use('/api/products', auth_2.authenticateToken, products_1.default);
app.use('/api/upload', auth_2.authenticateToken, upload_1.default);
app.use('/api/dashboard', auth_2.authenticateToken, dashboard_1.default);
app.use('/api/trends', auth_2.authenticateToken, trends_1.default);
app.use('/api/suggestions', auth_2.authenticateToken, suggestions_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/trending', trending_1.default);
// Error handling
app.use(errorHandler_1.errorHandler);
// 404 handler
app.use('*', (_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    // Initialize cron jobs
    try {
        await cronService_1.cronService.initializeCronJobs();
        console.log('⏰ Cron jobs initialized successfully');
    }
    catch (error) {
        console.error('❌ Failed to initialize cron jobs:', error);
    }
});
//# sourceMappingURL=server.js.map