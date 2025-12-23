import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { tokenStorage } from '@/services/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  hasProfile: boolean | null
  isCheckingProfile: boolean
  setAuth: (user: User) => void
  setProfileStatus: (hasProfile: boolean) => void
  setCheckingProfile: (isChecking: boolean) => void
  logout: () => void
  checkAuthState: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasProfile: null,
      isCheckingProfile: false,

      setAuth: (user) => {
        set({ user, isAuthenticated: true })
      },

      setProfileStatus: (hasProfile) => {
        set({ hasProfile })
      },

      setCheckingProfile: (isChecking) => {
        set({ isCheckingProfile: isChecking })
      },

      logout: () => {
        tokenStorage.clearTokens()
        set({ user: null, isAuthenticated: false, hasProfile: null })
      },

      // Vérifie si l'utilisateur est authentifié (token valide)
      checkAuthState: () => {
        const token = tokenStorage.getAccessToken()
        const refreshToken = tokenStorage.getRefreshToken()

        if (!token && !refreshToken) {
          if (get().isAuthenticated) {
            set({ user: null, isAuthenticated: false, hasProfile: null })
          }
          return false
        }

        return true
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        hasProfile: state.hasProfile,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
