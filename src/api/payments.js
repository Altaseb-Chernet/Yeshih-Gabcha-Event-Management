import api from '../utils/api.js'

export const getMyPayments = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    qs.append(k, String(v))
  })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return api.get(`/payments/my-payments${suffix}`)
}

export const getPaymentById = (id) => api.get(`/payments/${id}`)

export const getAdminPayments = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    qs.append(k, String(v))
  })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return api.get(`/payments/admin/payments${suffix}`)
}

export const approvePayment = (paymentId) => api.post(`/payments/${paymentId}/process`, { simulateSuccess: true })

export const uploadPaymentProof = (paymentId, file) => {
  const fd = new FormData()
  fd.append('proof', file)
  return api.post(`/payments/${paymentId}/proof`, fd)
}
