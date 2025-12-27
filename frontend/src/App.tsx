import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { MainDashboardPage } from '@/pages/MainDashboardPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { RecipesPage } from '@/pages/RecipesPage'
import { VisionPage } from '@/pages/VisionPage'
import { TrackingPage } from '@/pages/TrackingPage'
import { SettingsPage } from '@/pages/SettingsPage'
import PricingPage from '@/pages/PricingPage'
import { ProFeaturesPage } from '@/pages/ProFeaturesPage'
import { TermsPage } from '@/pages/TermsPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ProfileRequiredRoute } from '@/components/auth/ProfileRequiredRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
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
              <SettingsPage />
            </ProfileRequiredRoute>
          }
        />
        <Route
          path="pricing"
          element={
            <ProtectedRoute>
              <PricingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="pro"
          element={
            <ProfileRequiredRoute>
              <ProFeaturesPage />
            </ProfileRequiredRoute>
          }
        />
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
      </Route>
    </Routes>
  )
}

export default App
