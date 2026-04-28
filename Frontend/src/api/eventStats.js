import api from '../utils/api.js'

export const getAdminEventStats = () => api.get('/reports/admin/reports/event-stats')
