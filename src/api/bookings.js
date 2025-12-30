import api from '../utils/api.js'

export const calcBookingPrice = (payload) => api.post('/bookings/calc-price', payload)

export const createBooking = (payload) => api.post('/bookings', payload)

export const getMyBookings = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    qs.append(k, String(v))
  })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return api.get(`/bookings/my-bookings${suffix}`)
}

export const getBookingById = (id) => api.get(`/bookings/${id}`)

export const proceedPayment = (bookingId, payload) => api.post(`/bookings/${bookingId}/proceed-payment`, payload)

export const getBookingQr = (bookingId) => api.get(`/bookings/${bookingId}/qr`)

export const getAdminBookings = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    qs.append(k, String(v))
  })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return api.get(`/bookings/admin/bookings${suffix}`)
}

export const updateAdminBookingStatus = (bookingId, status) =>
  api.put(`/bookings/admin/bookings/${bookingId}/status`, { status })
