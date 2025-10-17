declare class CronService {
    private jobs;
    initializeCronJobs(): Promise<void>;
    private scheduleTrendingOutfitsCron;
    private scheduleTrendingScoreUpdate;
    private scheduleWeeklyCleanup;
    triggerTrendingOutfitsCron(): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message?: undefined;
    }>;
    getCronJobStatus(): Promise<{
        jobs: {
            name: string;
            schedule: string;
            isActive: boolean;
            lastRun: Date | null;
            nextRun: Date | null;
            runCount: number;
            failCount: number;
            lastError: string | null;
            successRate: string;
        }[];
        activeJobs: string[];
        totalJobs: number;
    }>;
    stopCronJob(jobName: string): boolean;
    stopAllCronJobs(): void;
    restartCronJob(jobName: string): Promise<boolean>;
    private cleanupOldNotifications;
    getNextRunTimes(): Record<string, string>;
}
export declare const cronService: CronService;
export {};
//# sourceMappingURL=cronService.d.ts.map