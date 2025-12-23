import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { tokenStorage } from '@/services/api'
import { useState, useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, checkAuthState } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    // Vérifier l'état d'authentification
    const hasValidTokens = checkAuthState()
    const hasAccessToken = !!tokenStorage.getAccessToken()
    const hasRefreshToken = !!tokenStorage.getRefreshToken()

    setIsValid(hasValidTokens && (hasAccessToken || hasRefreshToken))
    setIsChecking(false)
  }, [checkAuthState])

  // Afficher un loading pendant la vérification
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  // Rediriger vers login si non authentifié
  if (!isAuthenticated && !isValid) {
    // Sauvegarder l'URL de destination pour rediriger après login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
