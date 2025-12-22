import axios from 'axios'
import type { AuthToken, LoginCredentials, RegisterData, User } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, { hasToken: !!token })
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status}:`, response.config.url)
    return response
  },
  (error) => {
    console.error('[API] Error:', error.response?.status, error.response?.data, error.config?.url)
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post<User>('/auth/register', data)
    return response.data
  },

  login: async (credentials: LoginCredentials): Promise<AuthToken> => {
    const formData = new URLSearchParams()
    formData.append('username', credentials.email)
    formData.append('password', credentials.password)

    const response = await api.post<AuthToken>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return response.data
  },
}

// User API
export const userApi = {
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/users/me')
    return response.data
  },
}
