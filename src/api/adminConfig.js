import api from '../utils/api.js'

export const getAdminPricingRules = () => api.get('/admin-config/pricing-rules')

export const upsertAdminPricingRule = (eventType, payload) =>
  api.put(`/admin-config/pricing-rules/${encodeURIComponent(eventType)}`, payload)

export const getAdminPaymentMethods = () => api.get('/admin-config/payment-methods')

export const upsertAdminPaymentMethod = (method, payload) =>
  api.put(`/admin-config/payment-methods/${encodeURIComponent(method)}`, payload)
