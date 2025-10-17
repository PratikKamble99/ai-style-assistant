import { EventEmitter } from 'events';
interface UserActivity {
    userId: string;
    type: 'outfit_generated' | 'photo_uploaded' | 'item_favorited' | 'profile_updated';
    timestamp: string;
    metadata?: any;
}
declare class DashboardService extends EventEmitter {
    private metricsInterval;
    private activeUsers;
    constructor();
    private startMetricsCollection;
    private generateMetrics;
    trackUserActivity(activity: UserActivity): Promise<void>;
    private getTodayCount;
    private checkServiceHealth;
    private getAverageResponseTime;
    private updateUserRecentActivity;
    private getActivityTitle;
    private getActivityDescription;
    private getActivityIcon;
    getUserDashboardData(userId: string): Promise<unknown>;
    getPersonalizedRecommendations(userId: string): Promise<unknown>;
    destroy(): void;
}
export declare const dashboardService: DashboardService;
export {};
//# sourceMappingURL=dashboardService.d.ts.map