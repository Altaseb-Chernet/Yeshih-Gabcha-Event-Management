import api from '../utils/api.js'

// GET /users/me  (also aliased as /users/profile)
export const getMe = () => api.get('/users/me')
export const getProfile = () => api.get('/users/me')

// PUT /users/me  (also aliased as /users/profile)
export const updateMe = (profileData) => api.put('/users/me', profileData)
export const updateProfile = (profileData) => api.put('/users/me', profileData)

// PUT /users/me/profile-image-upload
export const uploadProfileImage = (file) => {
  const formData = new FormData()
  formData.append('profileImage', file)
  return api.put('/users/me/profile-image-upload', formData)
}

// PUT /users/change-password
export const changePassword = (passwordData) => api.put('/users/change-password', passwordData)

// PUT /users/deactivate
export const deactivateAccount = () => api.put('/users/deactivate')

// ── Admin ──────────────────────────────────────────────────────────────────

// GET /users/admin/users
export const getAdminUsers = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    qs.append(k, String(v))
  })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return api.get(`/users/admin/users${suffix}`)
}

// PUT /users/admin/users/{id}
export const updateAdminUser = (id, payload) => api.put(`/users/admin/users/${id}`, payload)
