import { useState } from 'react';
import { useDashboardContext } from '../contexts/DashboardContext';
import { RefreshCw, Activity, BarChart3, Bell } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardTestPage = () => {
  const {
    overview,
    metrics,
    notifications,
    isLoading,
    error,
    isConnected,
    lastUpdated,
    refetchAll,
    trackActivity,
    fetchOverview,
    fetchMetrics,
    fetchNotifications
  } = useDashboardContext();

  const [testActivityType, setTestActivityType] = useState('outfit_generated');

  const handleTrackActivity = async () => {
    await trackActivity(testActivityType, { test: true, timestamp: new Date().toISOString() });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Integration Test</h1>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button
              onClick={refetchAll}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh All</span>
            </button>
          </div>
        </div>
        
        {lastUpdated && (
          <p className="text-sm text-gray-500">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Test Controls */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button
            onClick={fetchOverview}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Fetch Overview</span>
          </button>
          
          <button
            onClick={fetchMetrics}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Activity className="w-4 h-4" />
            <span>Fetch Metrics</span>
          </button>
          
          <button
            onClick={fetchNotifications}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Bell className="w-4 h-4" />
            <span>Fetch Notifications</span>
          </button>
          
          <button
            onClick={handleTrackActivity}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Activity className="w-4 h-4" />
            <span>Track Activity</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Activity Type:</label>
          <select
            value={testActivityType}
            onChange={(e) => setTestActivityType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="outfit_generated">Outfit Generated</option>
            <option value="photo_uploaded">Photo Uploaded</option>
            <option value="item_favorited">Item Favorited</option>
            <option value="profile_updated">Profile Updated</option>
          </select>
        </div>
      </div>

      {/* Data Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overview Data */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview Data</h3>
          {overview ? (
            <div className="space-y-2 text-sm">
              <div><strong>User:</strong> {overview.user.name}</div>
              <div><strong>Profile Completion:</strong> {overview.user.profileCompletion}%</div>
              <div><strong>Total Outfits:</strong> {overview.stats.totalOutfits}</div>
              <div><strong>Favorites:</strong> {overview.stats.favoriteItems}</div>
              <div><strong>Photos:</strong> {overview.stats.photosUploaded}</div>
              <div><strong>Recent Activities:</strong> {overview.recentActivity.length}</div>
              <div><strong>Recommendations:</strong> {overview.recommendations.length}</div>
            </div>
          ) : (
            <p className="text-gray-500">No overview data</p>
          )}
        </div>

        {/* Metrics Data */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Metrics Data</h3>
          {metrics ? (
            <div className="space-y-2 text-sm">
              <div><strong>Active Users:</strong> {metrics.activeUsers}</div>
              <div><strong>Outfits Generated Today:</strong> {metrics.todayStats.outfitsGenerated}</div>
              <div><strong>Photos Analyzed Today:</strong> {metrics.todayStats.photosAnalyzed}</div>
              <div><strong>User Interactions:</strong> {metrics.todayStats.userInteractions}</div>
              <div><strong>AI Service:</strong> {metrics.systemHealth.aiServiceStatus}</div>
              <div><strong>Database:</strong> {metrics.systemHealth.databaseStatus}</div>
              <div><strong>Cache:</strong> {metrics.systemHealth.cacheStatus}</div>
              <div><strong>Response Time:</strong> {metrics.systemHealth.responseTime}ms</div>
            </div>
          ) : (
            <p className="text-gray-500">No metrics data</p>
          )}
        </div>

        {/* Notifications Data */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications Data</h3>
          {notifications ? (
            <div className="space-y-2 text-sm">
              <div><strong>Total:</strong> {notifications.total}</div>
              <div><strong>Unread:</strong> {notifications.unreadCount}</div>
              <div className="mt-4">
                <strong>Recent Notifications:</strong>
                <div className="mt-2 space-y-2">
                  {notifications.notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="p-2 bg-gray-50 rounded text-xs">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-gray-600">{notification.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No notifications data</p>
          )}
        </div>
      </div>

      {/* Raw Data (for debugging) */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw Data (Debug)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Overview</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(overview, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Metrics</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(metrics, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Notifications</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(notifications, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTestPage;