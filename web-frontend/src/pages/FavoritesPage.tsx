import { useState, useEffect } from 'react'
import { userService } from '../services/api'
import { Heart, ExternalLink, Trash2, ShoppingBag, Filter, Search } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

interface Favorite {
  id: string
  productId: string
  name: string
  brand: string
  imageUrl: string
  productUrl: string
  platform: string
  createdAt: string
}

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')
  const [message, setMessage] = useState('')

  const platforms = ['MYNTRA', 'AMAZON', 'HM', 'AJIO', 'NYKAA']

  useEffect(() => {
    fetchFavorites()
  }, [])

  useEffect(() => {
    filterFavorites()
  }, [favorites, searchTerm, selectedPlatform])

  const fetchFavorites = async () => {
    setIsLoading(true)
    try {
      const response = await userService.getFavorites()
      setFavorites(response.data.favorites)
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to fetch favorites')
    } finally {
      setIsLoading(false)
    }
  }

  const filterFavorites = () => {
    let filtered = favorites

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedPlatform) {
      filtered = filtered.filter(item => item.platform === selectedPlatform)
    }

    setFilteredFavorites(filtered)
  }

  const removeFavorite = async (favoriteId: string) => {
    try {
      await userService.removeFavorite(favoriteId)
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId))
      setMessage('Removed from favorites')
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to remove favorite')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      MYNTRA: 'bg-pink-100 text-pink-800',
      AMAZON: 'bg-orange-100 text-orange-800',
      HM: 'bg-red-100 text-red-800',
      AJIO: 'bg-purple-100 text-purple-800',
      NYKAA: 'bg-green-100 text-green-800'
    }
    return colors[platform] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-red-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Favorites</h1>
            <p className="text-pink-100">
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          <Heart className="w-12 h-12 text-white/80 fill-current" />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('success') || message.includes('Removed') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Platform Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="input"
            >
              <option value="">All Platforms</option>
              {platforms.map(platform => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedPlatform) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedPlatform('')
              }}
              className="btn-outline text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Favorites Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {favorites.length === 0 ? 'No favorites yet' : 'No items match your filters'}
          </h3>
          <p className="text-gray-500 mb-6">
            {favorites.length === 0 
              ? 'Start adding items to your favorites from style suggestions!'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {favorites.length === 0 && (
            <button className="btn-primary">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Explore Suggestions
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFavorites.map((favorite) => (
            <div key={favorite.id} className="bg-white rounded-xl shadow-sm border overflow-hidden group hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="relative aspect-square">
                <img
                  src={favorite.imageUrl}
                  alt={favorite.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    className="p-2 bg-white rounded-full shadow-lg text-red-600 hover:text-red-700 transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(favorite.platform)}`}>
                    {favorite.platform}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                  {favorite.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{favorite.brand}</p>
                <p className="text-xs text-gray-500 mb-4">
                  Added {formatDate(favorite.createdAt)}
                </p>

                {/* Actions */}
                <div className="flex space-x-2">
                  <a
                    href={favorite.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn-primary text-sm flex items-center justify-center space-x-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Product</span>
                  </a>
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove from favorites"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {favorites.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Favorites Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{favorites.length}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {new Set(favorites.map(f => f.brand)).size}
              </div>
              <div className="text-sm text-gray-600">Brands</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {new Set(favorites.map(f => f.platform)).size}
              </div>
              <div className="text-sm text-gray-600">Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {Math.round((Date.now() - new Date(favorites[favorites.length - 1]?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-gray-600">Days Active</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FavoritesPage