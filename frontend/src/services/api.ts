import axios, { AxiosError } from 'axios'
import type { AuthToken, LoginCredentials, RegisterData, User } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

// Clés de stockage sécurisées
const TOKEN_KEY = 'np_access_token'
const REFRESH_TOKEN_KEY = 'np_refresh_token'
const TOKEN_EXPIRY_KEY = 'np_token_expiry'

// Helpers pour la gestion des tokens
export const tokenStorage = {
  getAccessToken: (): string | null => sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  getTokenExpiry: (): number | null => {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
    return expiry ? parseInt(expiry, 10) : null
  },

  setTokens: (tokens: AuthToken, rememberMe: boolean = true) => {
    const expiryTime = Date.now() + tokens.expires_in * 1000

    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, tokens.access_token)
    } else {
      sessionStorage.setItem(TOKEN_KEY, tokens.access_token)
    }
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
  },

  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
  },

  isTokenExpired: (): boolean => {
    const expiry = tokenStorage.getTokenExpiry()
    if (!expiry) return true
    // Considérer le token expiré 1 minute avant l'expiration réelle
    return Date.now() > expiry - 60000
  },
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout pour les requêtes
  timeout: 30000,
})

// Variable pour éviter les rafraîchissements multiples simultanés
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

// Fonction pour rafraîchir le token
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) return null

  try {
    const response = await axios.post<AuthToken>(`${API_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    })

    const newTokens = response.data
    tokenStorage.setTokens(newTokens)
    return newTokens.access_token
  } catch {
    tokenStorage.clearTokens()
    return null
  }
}

// Intercepteur pour ajouter le token et gérer le rafraîchissement
api.interceptors.request.use(async (config) => {
  let token = tokenStorage.getAccessToken()

  // Vérifier si le token est expiré et le rafraîchir si nécessaire
  if (token && tokenStorage.isTokenExpired() && !config.url?.includes('/auth/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true
      const newToken = await refreshAccessToken()
      isRefreshing = false

      if (newToken) {
        onTokenRefreshed(newToken)
        token = newToken
      } else {
        window.location.href = '/login'
        return Promise.reject(new Error('Session expirée'))
      }
    } else {
      // Attendre que le rafraîchissement en cours se termine
      token = await new Promise<string>((resolve) => {
        subscribeTokenRefresh(resolve)
      })
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config

    // Si erreur 401 et pas déjà en train de rafraîchir
    if (error.response?.status === 401 && originalRequest && !originalRequest.url?.includes('/auth/')) {
      const refreshToken = tokenStorage.getRefreshToken()

      if (refreshToken && !isRefreshing) {
        isRefreshing = true
        const newToken = await refreshAccessToken()
        isRefreshing = false

        if (newToken) {
          onTokenRefreshed(newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
      }

      // Si le rafraîchissement échoue, déconnecter
      tokenStorage.clearTokens()
      window.location.href = '/login'
    }

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

  refresh: async (refreshToken: string): Promise<AuthToken> => {
    const response = await api.post<AuthToken>('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } finally {
      tokenStorage.clearTokens()
    }
  },
}

// User API
export const userApi = {
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/users/me')
    return response.data
  },
}
