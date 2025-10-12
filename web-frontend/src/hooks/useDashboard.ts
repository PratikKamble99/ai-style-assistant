import { useState, useEffect, useCallback } from 'react';
import { 
  dashboardService, 
  DashboardOverview, 
  DashboardMetrics, 
  DashboardAnalytics,
  DashboardNotifications,
  WeatherSuggestions,
  DashboardUpdates
} from '../services/dashboardService';

export const useDashboardOverview = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const overview = await dashboardService.getOverview();
      setData(overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useDashboardMetrics = (autoRefresh = true, intervalMs = 30000) => {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const metrics = await dashboardService.getMetrics();
      setData(metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, intervalMs);
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh, intervalMs]);

  return { data, loading, error, refetch: fetchData };
};

export const useDashboardAnalytics = (timeRange: '7d' | '30d' | '90d' = '7d') => {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const analytics = await dashboardService.getAnalytics(timeRange);
      setData(analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useDashboardNotifications = (limit = 10) => {
  const [data, setData] = useState<DashboardNotifications | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const notifications = await dashboardService.getNotifications(limit);
      setData(notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useWeatherSuggestions = (lat?: number, lon?: number) => {
  const [data, setData] = useState<WeatherSuggestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const weather = await dashboardService.getWeatherSuggestions(lat, lon);
      setData(weather);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather suggestions');
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useRealtimeUpdates = (enabled = true) => {
  const [updates, setUpdates] = useState<DashboardUpdates | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    setIsConnected(true);

    // Subscribe to updates
    const unsubscribe = dashboardService.onUpdate((newUpdates) => {
      setUpdates(newUpdates);
    });

    // Start polling
    dashboardService.startPolling();

    return () => {
      unsubscribe();
      dashboardService.stopPolling();
      setIsConnected(false);
    };
  }, [enabled]);

  return { updates, isConnected };
};

export const useActivityTracker = () => {
  const trackActivity = useCallback(async (type: string, metadata?: any) => {
    try {
      await dashboardService.trackActivity(type, metadata);
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  }, []);

  const trackOutfitGenerated = useCallback(async (outfitId?: string) => {
    await dashboardService.trackOutfitGenerated(outfitId);
  }, []);

  const trackPhotoUploaded = useCallback(async (photoId?: string) => {
    await dashboardService.trackPhotoUploaded(photoId);
  }, []);

  const trackItemFavorited = useCallback(async (itemId?: string) => {
    await dashboardService.trackItemFavorited(itemId);
  }, []);

  const trackProfileUpdated = useCallback(async (section?: string) => {
    await dashboardService.trackProfileUpdated(section);
  }, []);

  return {
    trackActivity,
    trackOutfitGenerated,
    trackPhotoUploaded,
    trackItemFavorited,
    trackProfileUpdated
  };
};

// Combined hook for dashboard page
export const useDashboard = () => {
  const overview = useDashboardOverview();
  const metrics = useDashboardMetrics();
  const notifications = useDashboardNotifications(5);
  const realtimeUpdates = useRealtimeUpdates();
  const activityTracker = useActivityTracker();

  const isLoading = overview.loading || metrics.loading || notifications.loading;
  const hasError = overview.error || metrics.error || notifications.error;

  const refetchAll = useCallback(() => {
    overview.refetch();
    metrics.refetch();
    notifications.refetch();
  }, [overview.refetch, metrics.refetch, notifications.refetch]);

  return {
    overview: overview.data,
    metrics: metrics.data,
    notifications: notifications.data,
    realtimeUpdates: realtimeUpdates.updates,
    isConnected: realtimeUpdates.isConnected,
    isLoading,
    hasError,
    refetchAll,
    ...activityTracker
  };
};