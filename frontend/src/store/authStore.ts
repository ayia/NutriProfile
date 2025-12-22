import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  hasProfile: boolean | null
  isCheckingProfile: boolean
  setAuth: (user: User, token: string) => void
  setProfileStatus: (hasProfile: boolean) => void
  setCheckingProfile: (isChecking: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasProfile: null,
      isCheckingProfile: false,
      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      },
      setProfileStatus: (hasProfile) => {
        set({ hasProfile })
      },
      setCheckingProfile: (isChecking) => {
        set({ isCheckingProfile: isChecking })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false, hasProfile: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, hasProfile: state.hasProfile }),
    }
  )
)
