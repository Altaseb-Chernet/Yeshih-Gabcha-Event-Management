import api from '../utils/api.js'

export const getAdminNotifications = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    qs.append(k, String(v))
  })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return api.get(`/notifications/admin${suffix}`)
}

export const getAdminUnreadCount = () => api.get('/notifications/admin/unread-count')

export const markAdminNotificationAsRead = (id) => api.patch(`/notifications/admin/${id}/read`)

export const markAllAdminNotificationsAsRead = () => api.patch('/notifications/admin/read-all')
