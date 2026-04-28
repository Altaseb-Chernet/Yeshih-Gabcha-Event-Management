import api from '../utils/api.js'

export const getAdminDashboardMetrics = () => api.get('/reports/admin/dashboard/metrics')

export const getAdminBookingsOverTime = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    qs.append(k, String(v))
  })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return api.get(`/reports/admin/reports/bookings-over-time${suffix}`)
}

export const getAdminRevenueOverTime = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    qs.append(k, String(v))
  })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return api.get(`/reports/admin/reports/revenue-over-time${suffix}`)
}

export const getAdminServiceDistribution = () => api.get('/reports/admin/reports/service-distribution')

export const getAdminUserGrowthOverTime = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    qs.append(k, String(v))
  })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return api.get(`/reports/admin/reports/user-growth${suffix}`)
}

export const getAdminTrafficSource = () => api.get('/reports/admin/reports/traffic-source')
