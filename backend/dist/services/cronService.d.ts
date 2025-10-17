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
        error: any;
        message?: undefined;
    }>;
    getCronJobStatus(): Promise<{
        jobs: any;
        activeJobs: string[];
        totalJobs: number;
    }>;
    stopCronJob(jobName: string): boolean;
    stopAllCronJobs(): void;
    restartCronJob(jobName: string): Promise<boolean>;
    private cleanupOldNotifications;
    getNextRunTimes(): {};
}
export declare const cronService: CronService;
export {};
//# sourceMappingURL=cronService.d.ts.map