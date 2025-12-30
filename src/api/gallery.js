import api from '../utils/api.js'

export const getGalleryItems = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    qs.append(k, String(v))
  })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return api.get(`/gallery${suffix}`)
}

export const getGalleryItemById = (id) => api.get(`/gallery/${id}`)

export const createGalleryItem = async (payload) => {
  const formData = new FormData()
  formData.append('title', payload.title)
  if (payload.description) formData.append('description', payload.description)
  formData.append('category', payload.category)
  if (payload.location) formData.append('location', payload.location)
  if (payload.date) formData.append('date', payload.date)

  if (payload.imageFile instanceof File) {
    formData.append('image', payload.imageFile)
  }

  return api.post('/gallery', formData)
}

export const updateGalleryItem = (id, payload) => api.put(`/gallery/${id}`, payload)

export const deleteGalleryItem = (id) => api.delete(`/gallery/${id}`)

export const setGalleryReaction = (id, reaction) => api.post(`/gallery/${id}/reaction`, { reaction })
