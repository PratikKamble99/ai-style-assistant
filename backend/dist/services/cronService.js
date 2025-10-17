"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const trendingService_1 = require("./trendingService");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class CronService {
    constructor() {
        this.jobs = new Map();
    }
    // Initialize all cron jobs
    async initializeCronJobs() {
        try {
            console.log('⏰ Initializing cron jobs...');
            // Trending outfits cron - every 2 days at 9 AM
            this.scheduleTrendingOutfitsCron();
            // Daily trending score update - every day at 6 AM
            this.scheduleTrendingScoreUpdate();
            // Weekly cleanup - every Sunday at 2 AM
            this.scheduleWeeklyCleanup();
            console.log('✅ All cron jobs initialized');
        }
        catch (error) {
            console.error('❌ Failed to initialize cron jobs:', error);
            throw error;
        }
    }
    // Schedule trending outfits generation - every 2 days at 9 AM
    scheduleTrendingOutfitsCron() {
        const task = node_cron_1.default.schedule('0 9 */2 * *', async () => {
            console.log('🚀 Running trending outfits cron job...');
            try {
                await trendingService_1.trendingService.runTrendingOutfitsCron();
                console.log('✅ Trending outfits cron completed');
            }
            catch (error) {
                console.error('❌ Trending outfits cron failed:', error);
            }
        }, {
            scheduled: true,
            timezone: 'Asia/Kolkata',
        });
        this.jobs.set('trending-outfits', task);
        console.log('📅 Trending outfits cron scheduled: every 2 days at 9 AM IST');
    }
    // Schedule daily trending score updates - every day at 6 AM
    scheduleTrendingScoreUpdate() {
        const task = node_cron_1.default.schedule('0 6 * * *', async () => {
            console.log('📊 Running daily trending score update...');
            try {
                await trendingService_1.trendingService.updateTrendingScores();
                console.log('✅ Trending scores updated');
            }
            catch (error) {
                console.error('❌ Trending score update failed:', error);
            }
        }, {
            scheduled: true,
            timezone: 'Asia/Kolkata',
        });
        this.jobs.set('trending-scores', task);
        console.log('📅 Trending scores cron scheduled: daily at 6 AM IST');
    }
    // Schedule weekly cleanup - every Sunday at 2 AM
    scheduleWeeklyCleanup() {
        const task = node_cron_1.default.schedule('0 2 * * 0', async () => {
            console.log('🧹 Running weekly cleanup...');
            try {
                await trendingService_1.trendingService.cleanupOldOutfits();
                await this.cleanupOldNotifications();
                console.log('✅ Weekly cleanup completed');
            }
            catch (error) {
                console.error('❌ Weekly cleanup failed:', error);
            }
        }, {
            scheduled: true,
            timezone: 'Asia/Kolkata',
        });
        this.jobs.set('weekly-cleanup', task);
        console.log('📅 Weekly cleanup cron scheduled: Sundays at 2 AM IST');
    }
    // Manual trigger for trending outfits (for testing)
    async triggerTrendingOutfitsCron() {
        try {
            console.log('🔧 Manually triggering trending outfits cron...');
            await trendingService_1.trendingService.runTrendingOutfitsCron();
            return { success: true, message: 'Trending outfits cron completed successfully' };
        }
        catch (error) {
            console.error('❌ Manual trending outfits cron failed:', error);
            return { success: false, error: error.message };
        }
    }
    // Get cron job status
    async getCronJobStatus() {
        try {
            const cronJobs = await prisma.cronJob.findMany({
                orderBy: { lastRun: 'desc' },
            });
            const status = {
                jobs: cronJobs.map(job => ({
                    name: job.name,
                    schedule: job.schedule,
                    isActive: job.isActive,
                    lastRun: job.lastRun,
                    nextRun: job.nextRun,
                    runCount: job.runCount,
                    failCount: job.failCount,
                    lastError: job.lastError,
                    successRate: job.runCount > 0 ? ((job.runCount - job.failCount) / job.runCount * 100).toFixed(2) + '%' : 'N/A',
                })),
                activeJobs: Array.from(this.jobs.keys()),
                totalJobs: this.jobs.size,
            };
            return status;
        }
        catch (error) {
            console.error('❌ Failed to get cron job status:', error);
            throw error;
        }
    }
    // Stop a specific cron job
    stopCronJob(jobName) {
        const task = this.jobs.get(jobName);
        if (task) {
            task.stop();
            this.jobs.delete(jobName);
            console.log(`⏹️ Stopped cron job: ${jobName}`);
            return true;
        }
        return false;
    }
    // Stop all cron jobs
    stopAllCronJobs() {
        this.jobs.forEach((task, name) => {
            task.stop();
            console.log(`⏹️ Stopped cron job: ${name}`);
        });
        this.jobs.clear();
        console.log('⏹️ All cron jobs stopped');
    }
    // Restart a cron job
    async restartCronJob(jobName) {
        this.stopCronJob(jobName);
        switch (jobName) {
            case 'trending-outfits':
                this.scheduleTrendingOutfitsCron();
                break;
            case 'trending-scores':
                this.scheduleTrendingScoreUpdate();
                break;
            case 'weekly-cleanup':
                this.scheduleWeeklyCleanup();
                break;
            default:
                return false;
        }
        console.log(`🔄 Restarted cron job: ${jobName}`);
        return true;
    }
    // Clean up old notifications (helper for weekly cleanup)
    async cleanupOldNotifications() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const result = await prisma.notification.deleteMany({
                where: {
                    createdAt: { lt: thirtyDaysAgo },
                    isRead: true,
                },
            });
            console.log(`🗑️ Cleaned up ${result.count} old notifications`);
        }
        catch (error) {
            console.error('❌ Failed to cleanup old notifications:', error);
        }
    }
    // Get next run times for all jobs
    getNextRunTimes() {
        const nextRuns = {};
        this.jobs.forEach((task, name) => {
            // Note: node-cron doesn't provide direct access to next run time
            // This is a simplified version - in production, you might want to use a more sophisticated scheduler
            nextRuns[name] = 'Check database for accurate next run time';
        });
        return nextRuns;
    }
}
exports.cronService = new CronService();
//# sourceMappingURL=cronService.js.map