import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt'
import { HomeRedirect } from '@/components/auth/HomeRedirect'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { MainDashboardPage } from '@/pages/MainDashboardPage'
import { RecipesPage } from '@/pages/RecipesPage'
import { VisionPage } from '@/pages/VisionPage'
import { TrackingPage } from '@/pages/TrackingPage'
import { TermsPage } from '@/pages/TermsPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { RefundPage } from '@/pages/RefundPage'
import { CoachingPage } from '@/pages/CoachingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ProfileRequiredRoute } from '@/components/auth/ProfileRequiredRoute'

// Lazy-loaded pages (code splitting for less frequently used heavy pages)
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const PricingPage = lazy(() => import('@/pages/PricingPage'))
const ProFeaturesPage = lazy(() => import('@/pages/ProFeaturesPage'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )
}

function App() {
  return (
    <>
      <PWAInstallPrompt />
      <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomeRedirect />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="onboarding"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <OnboardingPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProfileRequiredRoute>
              <MainDashboardPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="recipes"
          element={
            <ProfileRequiredRoute>
              <RecipesPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="vision"
          element={
            <ProfileRequiredRoute>
              <VisionPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="tracking"
          element={
            <ProfileRequiredRoute>
              <TrackingPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProfileRequiredRoute>
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="pricing"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <PricingPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="pro"
          element={
            <ProfileRequiredRoute>
              <Suspense fallback={<PageLoader />}>
                <ProFeaturesPage />
              </Suspense>
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="coaching"
          element={
            <ProfileRequiredRoute>
              <CoachingPage />
            </ProfileRequiredRoute>
          }
        />
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="refund" element={<RefundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
    </>
  )
}

export default App
