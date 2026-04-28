import api from '../utils/api'

// GET /api/dashboard/jobseeker
export const getJobSeekerDashboard = () => api.get('/dashboard/jobseeker')

// GET /api/dashboard/employer
export const getEmployerDashboard = () => api.get('/dashboard/employer')

// GET /api/dashboard/admin
export const getAdminDashboard = () => api.get('/dashboard/admin')