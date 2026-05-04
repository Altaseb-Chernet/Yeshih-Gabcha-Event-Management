const normalizeError = async (response) => {
  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  const message =
    data?.message ||
    data?.error ||
    (Array.isArray(data?.errors)
      ? data.errors.map((e) => e.message || e.msg || JSON.stringify(e)).join(', ')
      : null) ||
    (Array.isArray(data?.details) ? data.details.map((d) => d.message).join(', ') : null) ||
    `Request failed with status ${response.status}`

  const error = new Error(message)
  error.status = response.status
  error.data = data
  throw error
}

const getBaseUrl = () => {
  const base = import.meta.env?.VITE_API_BASE_URL
  return base && typeof base === 'string' ? base.replace(/\/$/, '') : '/api'
}

/**
 * Build a full URL for a backend-uploaded file.
 * Pass the relative path returned by the API (e.g. "uploads/profiles/avatar.png")
 * and get back a URL that works in both dev (proxied) and production.
 *
 * Examples:
 *   getUploadUrl('uploads/profiles/avatar.png')  → '/uploads/profiles/avatar.png'
 *   getUploadUrl('/uploads/profiles/avatar.png') → '/uploads/profiles/avatar.png'
 *   getUploadUrl(null)                           → ''
 */
export const getUploadUrl = (path) => {
  if (!path) return ''
  // If the backend already returns a full URL, use it as-is
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const uploadsBase = import.meta.env?.VITE_UPLOADS_BASE_URL || '/uploads'
  const base = uploadsBase.replace(/\/$/, '')

  // Strip leading "uploads/" prefix if present so we don't double it
  const clean = path.replace(/^\/?(uploads\/)?/, '')
  return `${base}/${clean}`
}

const request = async (method, path, body, options = {}) => {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`

  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')

  const headers = {
    ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body == null ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    ...options,
  })

  if (!response.ok) {
    return normalizeError(response)
  }

  if (response.status === 204) return null

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  // Backend standard response: { success, message, data }
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data
  }

  return payload
}

const api = {
  get: (path, options) => request('GET', path, null, options),
  post: (path, body, options) => request('POST', path, body, options),
  put: (path, body, options) => request('PUT', path, body, options),
  patch: (path, body, options) => request('PATCH', path, body, options),
  delete: (path, options) => request('DELETE', path, null, options),
}

export default api
