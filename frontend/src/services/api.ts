import axios, { AxiosError } from 'axios'
import type {
  AuthToken,
  LoginCredentials,
  RegisterData,
  User,
  SubscriptionStatusResponse,
  UsageStatusResponse,
  LimitCheckResult,
  PricingResponse,
} from '@/types'

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

const _subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}
void _subscribeTokenRefresh

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

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('API Request with token:', config.url)
  } else {
    console.log('API Request WITHOUT token:', config.url)
  }

  return config
})

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config

    console.log('API Error:', error.response?.status, error.config?.url, error.message)

    // Si erreur 401 et pas déjà en train de rafraîchir
    if (error.response?.status === 401 && originalRequest && !originalRequest.url?.includes('/auth/')) {
      const refreshToken = tokenStorage.getRefreshToken()
      console.log('401 Error - Refresh token exists:', !!refreshToken, 'isRefreshing:', isRefreshing)

      if (refreshToken && !isRefreshing) {
        isRefreshing = true
        const newToken = await refreshAccessToken()
        isRefreshing = false

        if (newToken) {
          console.log('Token refreshed successfully')
          onTokenRefreshed(newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
      }

      // Si le rafraîchissement échoue, déconnecter
      console.log('Token refresh failed, redirecting to login')
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

  updateMe: async (data: { name?: string; preferred_language?: string }): Promise<User> => {
    const response = await api.patch<User>('/users/me', data)
    return response.data
  },
}

// Subscription API
export const subscriptionApi = {
  getStatus: async (): Promise<SubscriptionStatusResponse> => {
    const response = await api.get<SubscriptionStatusResponse>('/subscriptions/status')
    return response.data
  },

  getUsage: async (): Promise<UsageStatusResponse> => {
    const response = await api.get<UsageStatusResponse>('/subscriptions/usage')
    return response.data
  },

  checkLimit: async (action: string): Promise<LimitCheckResult> => {
    const response = await api.get<LimitCheckResult>(`/subscriptions/check-limit/${action}`)
    return response.data
  },

  getPricing: async (): Promise<PricingResponse> => {
    const response = await api.get<PricingResponse>('/subscriptions/pricing')
    return response.data
  },

  createCheckout: async (variantId: string): Promise<{ checkout_url: string }> => {
    const response = await api.post<{ checkout_url: string }>('/subscriptions/checkout', {
      variant_id: variantId,
    })
    return response.data
  },

  getPortal: async (): Promise<{ portal_url: string }> => {
    const response = await api.post<{ portal_url: string }>('/subscriptions/portal')
    return response.data
  },

  cancel: async (): Promise<{ message: string; ends_at: string }> => {
    const response = await api.post<{ message: string; ends_at: string }>('/subscriptions/cancel')
    return response.data
  },
}

// Export PDF API
export interface ExportPDFRequest {
  report_type: 'weekly' | 'monthly' | 'custom'
  start_date?: string
  end_date?: string
  include_meals?: boolean
  include_activities?: boolean
  include_weight?: boolean
  include_recommendations?: boolean
}

export interface ExportPDFResponse {
  filename: string
  content_type: string
  size_bytes: number
}

export const exportApi = {
  generatePDF: async (request: ExportPDFRequest): Promise<ExportPDFResponse> => {
    const response = await api.post<ExportPDFResponse>('/export/pdf', request)
    return response.data
  },

  downloadPDF: async (request: ExportPDFRequest): Promise<Blob> => {
    const response = await api.post('/export/pdf/download', request, {
      responseType: 'blob',
    })
    return response.data
  },
}

// Meal Plans API
export interface MealPlanRequest {
  days?: number
  start_date?: string
  meals_per_day?: number
  include_snacks?: boolean
  budget_level?: 'low' | 'medium' | 'high'
  cooking_time_max?: number
  variety_level?: 'low' | 'medium' | 'high'
}

export interface MealPlanMeal {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  name: string
  description: string
  ingredients: { name: string; quantity: string }[]
  prep_time: number
  cook_time: number
  calories: number
  protein: number
  carbs: number
  fat: number
  tags: string[]
}

export interface MealPlanDay {
  date: string
  day_name: string
  meals: MealPlanMeal[]
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
}

export interface MealPlanResponse {
  id?: number
  user_id: number
  start_date: string
  end_date: string
  days: MealPlanDay[]
  avg_daily_calories: number
  avg_daily_protein: number
  avg_daily_carbs: number
  avg_daily_fat: number
  confidence: number
  generation_time_ms: number
  models_used: string[]
  shopping_list?: { name: string; quantity: string; category: string }[]
}

export const mealPlansApi = {
  generate: async (request: MealPlanRequest): Promise<MealPlanResponse> => {
    const response = await api.post<MealPlanResponse>('/meal-plans/generate', request)
    return response.data
  },

  preview: async (request: MealPlanRequest): Promise<MealPlanResponse> => {
    const response = await api.post<MealPlanResponse>('/meal-plans/preview', request)
    return response.data
  },

  getCurrent: async (): Promise<MealPlanResponse | null> => {
    const response = await api.get<MealPlanResponse | null>('/meal-plans/current')
    return response.data
  },
}
