import api from '../utils/api.js'

export const getEvents = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    qs.append(k, String(v))
  })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return api.get(`/events${suffix}`)
}

export const getEventById = (id) => api.get(`/events/${id}`)

export const proceedEventPayment = (id, payload) => api.post(`/events/${id}/proceed-payment`, payload)

// Admin
export const createEvent = async (payload) => {
  const fd = new FormData()
  fd.append('title', payload.title)
  if (payload.description) fd.append('description', payload.description)
  fd.append('eventType', payload.eventType)
  if (payload.location) fd.append('location', payload.location)
  if (payload.latitude !== undefined && payload.latitude !== null && payload.latitude !== '') {
    fd.append('latitude', String(payload.latitude))
  }
  if (payload.longitude !== undefined && payload.longitude !== null && payload.longitude !== '') {
    fd.append('longitude', String(payload.longitude))
  }
  fd.append('eventDate', payload.eventDate)
  fd.append('eventTime', payload.eventTime)
  fd.append('ticketPrice', String(payload.ticketPrice))
  if (payload.totalTickets !== undefined && payload.totalTickets !== null && payload.totalTickets !== '') {
    fd.append('totalTickets', String(payload.totalTickets))
  }
  if (payload.status) fd.append('status', payload.status)
  if (payload.imageFile instanceof File) fd.append('image', payload.imageFile)
  return api.post('/events', fd)
}

export const updateEvent = async (id, payload) => {
  // allow image update too
  const hasFile = payload?.imageFile instanceof File
  if (hasFile) {
    const fd = new FormData()
    Object.entries(payload).forEach(([k, v]) => {
      if (v === undefined) return
      if (k === 'imageFile') return
      if (v === null) return
      fd.append(k, String(v))
    })
    fd.append('image', payload.imageFile)
    return api.put(`/events/${id}`, fd)
  }
  return api.put(`/events/${id}`, payload)
}

export const deleteEvent = (id) => api.delete(`/events/${id}`)
