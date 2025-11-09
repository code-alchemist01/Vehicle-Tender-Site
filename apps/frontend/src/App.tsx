import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'

// Layouts
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import VehicleDetail from './pages/VehicleDetail'
import Auctions from './pages/Auctions'
import AuctionDetail from './pages/AuctionDetail'
import Profile from './pages/Profile'
import MyBids from './pages/MyBids'
import CreateVehicle from './pages/CreateVehicle'
import EditVehicle from './pages/EditVehicle'
import MyVehicles from './pages/MyVehicles'
import CreateAuction from './pages/CreateAuction'
import EditAuction from './pages/EditAuction'
import Categories from './pages/Categories'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, fetchProfile } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      const token = localStorage.getItem('accessToken')
      if (token) {
        fetchProfile().catch(() => {
          // Token invalid, will redirect to login
        })
      }
    }
  }, [isAuthenticated, isLoading, fetchProfile])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="vehicles/:id" element={<VehicleDetail />} />
          <Route path="auctions" element={<Auctions />} />
          <Route path="auctions/:id" element={<AuctionDetail />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bids" element={<MyBids />} />
          <Route path="vehicles/create" element={<CreateVehicle />} />
          <Route path="vehicles/edit/:id" element={<EditVehicle />} />
          <Route path="vehicles/my" element={<MyVehicles />} />
          <Route path="auctions/create" element={<CreateAuction />} />
          <Route path="auctions/edit/:id" element={<EditAuction />} />
          <Route path="categories" element={<Categories />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

