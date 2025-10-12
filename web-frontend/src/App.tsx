import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { DashboardProvider } from './contexts/DashboardContext'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import SuggestionsPage from './pages/SuggestionsPage'
import FavoritesPage from './pages/FavoritesPage'
import DashboardTestPage from './pages/DashboardTestPage'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <DashboardProvider>
            <Layout />
          </DashboardProvider>
        </PrivateRoute>
      }>
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="suggestions" element={<SuggestionsPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="dashboard-test" element={<DashboardTestPage />} />
      </Route>
    </Routes>
  )
}

export default App