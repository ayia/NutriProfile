import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi, userApi, tokenStorage } from '@/services/api'
import { profileApi } from '@/services/profileApi'
import { useAuthStore } from '@/store/authStore'
import type { LoginCredentials, RegisterData } from '@/types'

export function useAuth() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setAuth, setProfileStatus, logout: storeLogout, isAuthenticated, checkAuthState } = useAuthStore()

  // Vérifier l'état d'authentification au chargement
  const hasValidTokens = checkAuthState()

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    enabled: hasValidTokens,
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  })

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const tokenData = await authApi.login(credentials)
      // Stocker les tokens de manière sécurisée
      tokenStorage.setTokens(tokenData)
      const userData = await userApi.getMe()
      // Vérifier si l'utilisateur a un profil
      const profileSummary = await profileApi.getSummary()
      return { tokenData, userData, hasProfile: profileSummary.has_profile }
    },
    onSuccess: ({ userData, hasProfile }) => {
      setAuth(userData)
      setProfileStatus(hasProfile)
      // Invalider les queries pour forcer le rechargement des données
      queryClient.invalidateQueries()
      // Rediriger vers onboarding si pas de profil, sinon dashboard
      if (hasProfile) {
        navigate('/dashboard')
      } else {
        navigate('/onboarding')
      }
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      await authApi.register(data)
      // Auto-login après inscription
      const tokenData = await authApi.login({ email: data.email, password: data.password })
      tokenStorage.setTokens(tokenData)
      const userData = await userApi.getMe()
      return { tokenData, userData }
    },
    onSuccess: ({ userData }) => {
      setAuth(userData)
      setProfileStatus(false) // Nouveau user = pas de profil
      queryClient.invalidateQueries()
      navigate('/onboarding')
    },
  })

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignorer les erreurs de logout côté serveur
    } finally {
      storeLogout()
      queryClient.clear()
      navigate('/login')
    }
  }

  return {
    user,
    isAuthenticated: isAuthenticated && hasValidTokens,
    isLoading,
    login: loginMutation.mutate,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,
    logout,
  }
}
