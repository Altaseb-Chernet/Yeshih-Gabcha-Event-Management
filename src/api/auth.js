import api from '../utils/api.js'

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials)
    localStorage.setItem('authToken', response.accessToken)
    localStorage.setItem('user', JSON.stringify(response.user))
    return response
  } catch (error) {
    throw error
  }
}

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData)
    localStorage.setItem('authToken', response.accessToken)
    localStorage.setItem('user', JSON.stringify(response.user))
    return response
  } catch (error) {
    throw error
  }
}

export const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
}

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const isAuthenticated = () => {
  return localStorage.getItem('authToken') !== null
}

export const getUserRole = () => {
  const user = getCurrentUser()
  return user?.role || null
}