import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { tokenStorage } from '@/services/api'
import { HomePage } from '@/pages/HomePage'

/**
 * Wrapper for HomePage that redirects authenticated users to dashboard.
 * Shows the landing page only to unauthenticated visitors.
 */
export function HomeRedirect() {
  const { isAuthenticated, user } = useAuthStore()
  const hasToken = !!tokenStorage.getAccessToken()

  // If user is authenticated and has valid tokens, redirect to dashboard
  if (isAuthenticated && hasToken && user) {
    return <Navigate to="/dashboard" replace />
  }

  // Otherwise show the landing page
  return <HomePage />
}
