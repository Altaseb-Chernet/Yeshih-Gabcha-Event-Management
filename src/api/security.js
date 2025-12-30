import api from '../utils/api.js'

export const resendVerificationEmail = () => api.post('/auth/resend-verification')

export const changePassword = (payload) => api.post('/auth/change-password', payload)

export const enableTwoFactor = () => api.post('/auth/2fa/enable')

export const disableTwoFactor = () => api.post('/auth/2fa/disable')

export const verifyTwoFactor = (payload) => api.post('/auth/2fa/verify', payload)

export const verifyEmailToken = (token) => api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
