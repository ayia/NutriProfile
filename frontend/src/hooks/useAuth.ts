import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi, userApi } from '@/services/api'
import { profileApi } from '@/services/profileApi'
import { useAuthStore } from '@/store/authStore'
import type { LoginCredentials, RegisterData } from '@/types'

export function useAuth() {
  const navigate = useNavigate()
  const { setAuth, setProfileStatus, logout: storeLogout, isAuthenticated, token } = useAuthStore()

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    enabled: !!token,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const tokenData = await authApi.login(credentials)
      // Stocker le token AVANT d'appeler getMe pour que l'intercepteur l'utilise
      localStorage.setItem('token', tokenData.access_token)
      const userData = await userApi.getMe()
      // Vérifier si l'utilisateur a un profil
      const profileSummary = await profileApi.getSummary()
      return { tokenData, userData, hasProfile: profileSummary.has_profile }
    },
    onSuccess: ({ tokenData, userData, hasProfile }) => {
      setAuth(userData, tokenData.access_token)
      setProfileStatus(hasProfile)
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
      localStorage.setItem('token', tokenData.access_token)
      const userData = await userApi.getMe()
      return { tokenData, userData }
    },
    onSuccess: ({ tokenData, userData }) => {
      setAuth(userData, tokenData.access_token)
      setProfileStatus(false) // Nouveau user = pas de profil
      navigate('/onboarding')
    },
  })

  const logout = () => {
    storeLogout()
    navigate('/login')
  }

  return {
    user,
    isAuthenticated,
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
