export interface User {
  id: number
  email: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface AuthToken {
  access_token: string
  token_type: string
}

export interface ApiError {
  detail: string
}
