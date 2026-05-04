// dashboard.js — Admin dashboard data via the /reports endpoints
// The backend does not have a /dashboard resource; all dashboard
// metrics are served through /reports/admin/dashboard/metrics
import api from '../utils/api.js'

// GET /reports/admin/dashboard/metrics
// Returns: totalUsers, totalBookings, totalRevenue, pendingBookings, etc.
export const getAdminDashboard = () => api.get('/reports/admin/dashboard/metrics')

// Kept for backwards-compatibility — both resolve to the same endpoint
export const getAdminDashboardMetrics = getAdminDashboard
