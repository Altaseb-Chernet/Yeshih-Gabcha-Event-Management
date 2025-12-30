import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { useState, useEffect } from 'react'

// User components
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Gallery from './pages/Gallery'
import Booking from './pages/Booking'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import EventBuyTicket from './pages/EventBuyTicket'
import MyEventTickets from './pages/MyEventTickets'
import Contact from './pages/Contact'
import Register from './pages/Register'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import VerifyEmail from './pages/VerifyEmail'
import ResetPassword from './pages/ResetPassword'

// Admin components
import AdminLayout from './admin/layouts/AdminLayout'
import AdminDashboard from './admin/pages/Dashboard'
import AdminUsers from './admin/pages/Users'
import AdminBookings from './admin/pages/Bookings'
import AdminServices from './admin/pages/Services'
import AdminGallery from './admin/pages/Gallery'
import AdminReports from './admin/pages/Reports'
import AdminPayments from './admin/pages/Payments'
import AdminPricingPayments from './admin/pages/PricingPayments'
import AdminEvents from './admin/pages/Events'
import AdminProfile from './admin/pages/Profile'
import AdminSettings from './admin/pages/Settings'

// Protected Route Components
const ProtectedUserRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  // Only allow users with role 'user'
  return isAuthenticated() && user?.role === 'user' ? children : <Navigate to="/login" />
}

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  return isAuthenticated() && user?.role === 'admin' ? children : <Navigate to="/admin/login" />
}

// Main App Content
function AppContent() {
  const { isAuthenticated, user } = useAuth()
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
      <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<MainLayout><ResetPassword /></MainLayout>} />
      
      {/* User Routes */}
      <Route path="/*" element={
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/events/:id/buy" element={<EventBuyTicket />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/contact" element={<Contact />} />
            <Route 
              path="/my-event-tickets" 
              element={
                <ProtectedUserRoute>
                  <MyEventTickets />
                </ProtectedUserRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedUserRoute>
                  <Profile />
                </ProtectedUserRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedUserRoute>
                  <Settings />
                </ProtectedUserRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MainLayout>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={
        isAuthenticated() && user?.role === 'admin' ? (
          <AdminLayout>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="pricing-payments" element={<AdminPricingPayments />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="/admin" />} />
            </Routes>
          </AdminLayout>
        ) : (
          <Navigate to="/admin/login" />
        )
      } />
      
      <Route path="/admin/login" element={<MainLayout><Login isAdminLogin={true} /></MainLayout>} />
    </Routes>
  )
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <AppContent />
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </I18nextProvider>
  )
}

export default App