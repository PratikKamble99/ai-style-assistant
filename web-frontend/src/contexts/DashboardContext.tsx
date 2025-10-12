import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { dashboardService, DashboardOverview, DashboardMetrics, DashboardNotifications } from '../services/dashboardService';

interface DashboardState {
  overview: DashboardOverview | null;
  metrics: DashboardMetrics | null;
  notifications: DashboardNotifications | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  lastUpdated: string | null;
}

type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_OVERVIEW'; payload: DashboardOverview }
  | { type: 'SET_METRICS'; payload: DashboardMetrics }
  | { type: 'SET_NOTIFICATIONS'; payload: DashboardNotifications }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'UPDATE_LAST_UPDATED' }
  | { type: 'RESET' };

const initialState: DashboardState = {
  overview: null,
  metrics: null,
  notifications: null,
  isLoading: false,
  error: null,
  isConnected: false,
  lastUpdated: null,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_OVERVIEW':
      return { ...state, overview: action.payload, error: null };
    case 'SET_METRICS':
      return { ...state, metrics: action.payload, error: null };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload, error: null };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'UPDATE_LAST_UPDATED':
      return { ...state, lastUpdated: new Date().toISOString() };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface DashboardContextType extends DashboardState {
  fetchOverview: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  trackActivity: (type: string, metadata?: any) => Promise<void>;
  refetchAll: () => Promise<void>;
  startRealTimeUpdates: () => void;
  stopRealTimeUpdates: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const fetchOverview = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const overview = await dashboardService.getOverview();
      dispatch({ type: 'SET_OVERVIEW', payload: overview });
      dispatch({ type: 'UPDATE_LAST_UPDATED' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch overview' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchMetrics = async () => {
    try {
      const metrics = await dashboardService.getMetrics();
      dispatch({ type: 'SET_METRICS', payload: metrics });
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const notifications = await dashboardService.getNotifications(5);
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const trackActivity = async (type: string, metadata?: any) => {
    try {
      await dashboardService.trackActivity(type, metadata);
      // Optionally refresh data after tracking activity
      await fetchOverview();
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  };

  const refetchAll = async () => {
    await Promise.all([
      fetchOverview(),
      fetchMetrics(),
      fetchNotifications(),
    ]);
  };

  const startRealTimeUpdates = () => {
    dispatch({ type: 'SET_CONNECTED', payload: true });
    dashboardService.startPolling(30000); // Poll every 30 seconds

    // Subscribe to updates
    const unsubscribe = dashboardService.onUpdate((updates) => {
      if (updates.metrics) {
        dispatch({ type: 'SET_METRICS', payload: updates.metrics });
      }
      if (updates.hasUpdates) {
        // Refresh overview data when there are updates
        fetchOverview();
      }
    });

    // Store unsubscribe function for cleanup
    (window as any).__dashboardUnsubscribe = unsubscribe;
  };

  const stopRealTimeUpdates = () => {
    dispatch({ type: 'SET_CONNECTED', payload: false });
    dashboardService.stopPolling();
    
    // Cleanup subscription
    if ((window as any).__dashboardUnsubscribe) {
      (window as any).__dashboardUnsubscribe();
      delete (window as any).__dashboardUnsubscribe;
    }
  };

  // Initialize dashboard data on mount
  useEffect(() => {
    refetchAll();
    startRealTimeUpdates();

    // Cleanup on unmount
    return () => {
      stopRealTimeUpdates();
    };
  }, []);

  // Cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopRealTimeUpdates();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const contextValue: DashboardContextType = {
    ...state,
    fetchOverview,
    fetchMetrics,
    fetchNotifications,
    trackActivity,
    refetchAll,
    startRealTimeUpdates,
    stopRealTimeUpdates,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};