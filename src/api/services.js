import api from '../utils/api.js'

export const getServices = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    qs.append(k, String(v))
  })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return api.get(`/services${suffix}`)
}

export const getServiceById = (id) => api.get(`/services/${id}`)

export const createService = async (payload) => {
  const formData = new FormData()
  formData.append('name', payload.name)
  if (payload.description) formData.append('description', payload.description)
  formData.append('price', String(payload.price))
  formData.append('category', payload.category)
  if (payload.status) formData.append('status', payload.status)
  if (payload.featured !== undefined) formData.append('featured', String(payload.featured))

  const images = Array.isArray(payload.images) ? payload.images : []
  images.forEach((file) => {
    if (file instanceof File) formData.append('images', file)
  })

  return api.post('/services', formData)
}

export const updateService = async (id, payload) => {
  const formData = new FormData()
  Object.entries(payload).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    if (k === 'images') return
    formData.append(k, String(v))
  })

  const images = Array.isArray(payload.images) ? payload.images : []
  images.forEach((file) => {
    if (file instanceof File) formData.append('images', file)
  })

  return api.put(`/services/${id}`, formData)
}

export const deleteService = (id) => api.delete(`/services/${id}`)

export const deleteServiceImage = (id, imageIndex) => api.delete(`/services/${id}/images/${imageIndex}`)
