import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useAuthStore } from '@/store/authStore'
import { profileApi } from '@/services/profileApi'
import { Step1BasicInfo } from './Step1BasicInfo'
import { Step2Activity } from './Step2Activity'
import { Step3Diet } from './Step3Diet'
import { Step4Health } from './Step4Health'
import { Step5Summary } from './Step5Summary'

const TOTAL_STEPS = 5

const stepIcons = ['👤', '🏃', '🥗', '❤️', '✨']
const stepKeys = ['info', 'activity', 'diet', 'health', 'summary'] as const

export function OnboardingWizard() {
  const { t } = useTranslation('onboarding')
  const navigate = useNavigate()
  const { currentStep, getFullProfile, reset } = useOnboardingStore()
  const { setProfileStatus } = useAuthStore()

  const stepLabels = stepKeys.map(key => t(`steps.${key}`))

  const createProfile = useMutation({
    mutationFn: profileApi.createProfile,
    onSuccess: () => {
      setProfileStatus(true)
      reset()
      navigate('/dashboard')
    },
  })

  const handleSubmit = () => {
    const profile = getFullProfile()
    if (profile) {
      createProfile.mutate(profile)
    }
  }

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      {/* Progress bar - Enhanced for better visibility */}
      <div className="mb-10 px-2">
        {/* Steps indicators */}
        <div className="flex justify-between mb-4 relative">
          {/* Background line - thicker for visibility */}
          <div className="absolute top-6 left-0 right-0 h-1.5 bg-gray-200 rounded-full" />
          {/* Progress line - animated gradient */}
          <div
            className="absolute top-6 left-0 h-1.5 bg-gradient-to-r from-primary-600 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-sm shadow-primary-500/50"
            style={{ width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
          />

          {Array.from({ length: TOTAL_STEPS }, (_, i) => {
            const stepNumber = i + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep

            return (
              <div key={i} className="relative z-10 flex flex-col items-center">
                {/* Outer ring for current step - pulsing animation */}
                {isCurrent && (
                  <div className="absolute w-16 h-16 -top-1 rounded-2xl bg-primary-400/30 animate-pulse" />
                )}
                <div
                  className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-primary-600 to-emerald-500 text-white shadow-lg shadow-primary-600/40'
                      : isCurrent
                      ? 'bg-gradient-to-br from-primary-600 to-emerald-500 text-white shadow-xl shadow-primary-600/50 scale-110 ring-4 ring-primary-200'
                      : 'bg-white border-2 border-gray-300 text-gray-400 hover:border-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <span className="text-xl font-bold">✓</span>
                  ) : (
                    <span className="text-xl">{stepIcons[i]}</span>
                  )}
                </div>
                <span className={`mt-3 text-sm font-semibold transition-colors ${
                  isCurrent ? 'text-primary-700' : isCompleted ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {stepLabels[i]}
                </span>
              </div>
            )
          })}
        </div>

        {/* Progress percentage - enhanced */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full">
            <span className="text-sm font-medium text-gray-600">
              {t('stepOf', { current: currentStep, total: TOTAL_STEPS })}
            </span>
            <span className="text-xs text-gray-400">
              ({Math.round((currentStep / TOTAL_STEPS) * 100)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Error message - Enhanced */}
      {createProfile.error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-error-50 to-rose-50 border border-error-200 text-error-600 rounded-2xl flex items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 bg-error-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl">⚠️</span>
          </div>
          <span className="font-medium">{t('error')}</span>
        </div>
      )}

      {/* Steps content - Enhanced */}
      <div className="glass-card p-8 shadow-xl">
        <div className="animate-fade-in" key={currentStep}>
          {currentStep === 1 && <Step1BasicInfo />}
          {currentStep === 2 && <Step2Activity />}
          {currentStep === 3 && <Step3Diet />}
          {currentStep === 4 && <Step4Health />}
          {currentStep === 5 && (
            <Step5Summary
              onSubmit={handleSubmit}
              isLoading={createProfile.isPending}
            />
          )}
        </div>
      </div>

      {/* Help text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
          <span className="text-base">💡</span>
          <span>{t('securityNote')}</span>
        </p>
      </div>
    </div>
  )
}
