import { NavLink } from 'react-router-dom'
import { Home, User, Sparkles, Heart, Camera } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Style Suggestions', href: '/suggestions', icon: Sparkles },
  { name: 'Favorites', href: '/favorites', icon: Heart },
]

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow-sm border-r min-h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-pink-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Camera className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-primary-900">Quick Tip</span>
          </div>
          <p className="text-sm text-primary-700">
            Upload clear, well-lit photos for better AI analysis and style recommendations.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar