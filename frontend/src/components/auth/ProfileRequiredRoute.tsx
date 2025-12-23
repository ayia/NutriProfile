import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { profileApi } from '@/services/profileApi'

interface ProfileRequiredRouteProps {
  children: React.ReactNode
}

export function ProfileRequiredRoute({ children }: ProfileRequiredRouteProps) {
  const { isAuthenticated, hasProfile, setProfileStatus, setCheckingProfile, checkAuthState } = useAuthStore()
  const hasValidTokens = checkAuthState()

  const { data: profileSummary, isLoading, isError } = useQuery({
    queryKey: ['profile-summary'],
    queryFn: profileApi.getSummary,
    enabled: hasValidTokens && hasProfile === null,
    retry: false,
  })

  useEffect(() => {
    setCheckingProfile(isLoading)
  }, [isLoading, setCheckingProfile])

  useEffect(() => {
    if (profileSummary !== undefined) {
      setProfileStatus(profileSummary.has_profile)
    } else if (isError) {
      setProfileStatus(false)
    }
  }, [profileSummary, isError, setProfileStatus])

  if (!isAuthenticated && !hasValidTokens) {
    return <Navigate to="/login" replace />
  }

  if (isLoading || hasProfile === null) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (hasProfile === false) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
