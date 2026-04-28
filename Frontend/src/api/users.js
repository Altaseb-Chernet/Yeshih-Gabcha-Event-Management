import api from '../utils/api'

// GET /api/users/profile
export const getProfile = () => api.get('/users/profile')

// PUT /api/users/profile
export const updateProfile = (profileData) => api.put('/users/profile', profileData)

// PUT /api/users/change-password
export const changePassword = (passwordData) => 
  api.put('/users/change-password', passwordData)

// PUT /api/users/deactivate
export const deactivateAccount = () => api.put('/users/deactivate')