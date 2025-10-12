import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDashboardContext } from '../contexts/DashboardContext'
import { Camera, Sparkles, Heart, TrendingUp, Star, RefreshCw } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import MetricsCard from '../components/dashboard/MetricsCard'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import RecommendationCard from '../components/dashboard/RecommendationCard'
import LiveIndicator from '../components/dashboard/LiveIndicator'

const HomePage = () => {
  const { user } = useAuth()
  const { 
    overview, 
    metrics, 
    notifications, 
    isConnected, 
    isLoading, 
    error,
    refetchAll,
    trackActivity
  } = useDashboardContext()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-red-900 mb-2">Failed to load dashboard</h3>
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={refetchAll}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-pink-600 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <LiveIndicator 
            isConnected={isConnected} 
            unreadCount={notifications?.unreadCount} 
          />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {overview?.user.name || user?.name}! ✨
        </h1>
        <p className="text-primary-100 mb-2">
          Ready to discover your perfect style? Let's create some amazing looks together.
        </p>
        {overview?.user.profileCompletion && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-primary-100">Profile completion</span>
              <span className="text-white font-medium">{overview.user.profileCompletion}%</span>
            </div>
            <div className="w-full bg-primary-700 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${overview.user.profileCompletion}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-4">
          <Link
            to="/suggestions"
            onClick={() => trackActivity('outfit_generated')}
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Get Style Suggestions</span>
          </Link>
          <Link
            to="/profile"
            onClick={() => trackActivity('photo_uploaded')}
            className="bg-primary-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-800 transition-colors flex items-center space-x-2"
          >
            <Camera className="w-5 h-5" />
            <span>Update Photos</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Outfits"
          value={overview?.stats.totalOutfits || 0}
          subtitle={`${metrics?.todayStats.outfitsGenerated || 0} generated today`}
          icon={Sparkles}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-100"
        />
        
        <MetricsCard
          title="Favorites"
          value={overview?.stats.favoriteItems || 0}
          subtitle="Saved items"
          icon={Heart}
          iconColor="text-pink-600"
          iconBgColor="bg-pink-100"
        />
        
        <MetricsCard
          title="Photos Uploaded"
          value={overview?.stats.photosUploaded || 0}
          subtitle={`${metrics?.todayStats.photosAnalyzed || 0} analyzed today`}
          icon={Camera}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        
        <MetricsCard
          title="Style Score"
          value={85}
          subtitle="Your style rating"
          icon={Star}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <ActivityFeed 
          activities={overview?.recentActivity?.slice(0, 3) || []}
          title="Recent Activity"
          emptyMessage="No recent activity"
        />

        {/* Style Insights & Recommendations */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Style Insights</h2>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span>Personalized for you</span>
            </div>
          </div>
          
          {overview?.styleInsights && (
            <div className="space-y-6">
              {/* Preferred Styles */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Your Style Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {overview.styleInsights.preferredStyles.map((style, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Your Color Palette</h3>
                <div className="flex space-x-2">
                  {overview.styleInsights.dominantColors.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Seasonal Trends */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  {overview.styleInsights.seasonalTrends.current} Trends
                </h3>
                <div className="space-y-2">
                  {overview.styleInsights.seasonalTrends.trending.map((trend, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-700">{trend}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {overview?.recommendations && overview.recommendations.length > 0 && (
        <div className="space-y-4">
          {overview.recommendations.map((recommendation) => (
            <RecommendationCard 
              key={recommendation.id} 
              recommendation={{
                ...recommendation,
                priority: recommendation.priority as 'low' | 'medium' | 'high'
              }} 
            />
          ))}
        </div>
      )}


    </div>
  )
}

export default HomePage