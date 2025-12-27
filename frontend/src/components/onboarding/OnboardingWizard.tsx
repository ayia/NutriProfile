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
const stepLabels = ['Info', 'Activité', 'Régime', 'Santé', 'Résumé']

export function OnboardingWizard() {
  const { t } = useTranslation('onboarding')
  const navigate = useNavigate()
  const { currentStep, getFullProfile, reset } = useOnboardingStore()
  const { setProfileStatus } = useAuthStore()

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
      {/* Progress bar - Enhanced */}
      <div className="mb-10">
        {/* Steps indicators */}
        <div className="flex justify-between mb-4 relative">
          {/* Background line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />
          {/* Progress line */}
          <div
            className="absolute top-5 left-0 h-1 bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
          />

          {Array.from({ length: TOTAL_STEPS }, (_, i) => {
            const stepNumber = i + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep

            return (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-primary-500 to-emerald-500 text-white shadow-lg shadow-primary-500/30'
                      : isCurrent
                      ? 'bg-gradient-to-br from-primary-500 to-emerald-500 text-white shadow-xl shadow-primary-500/40 scale-110'
                      : 'bg-white border-2 border-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <span className="text-lg">✓</span>
                  ) : (
                    <span className="text-lg">{stepIcons[i]}</span>
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium transition-colors ${
                  isCurrent ? 'text-primary-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {stepLabels[i]}
                </span>
              </div>
            )
          })}
        </div>

        {/* Progress percentage */}
        <div className="text-center mt-4">
          <span className="text-sm font-medium text-gray-500">
            Étape <span className="text-primary-600 font-bold">{currentStep}</span> sur {TOTAL_STEPS}
          </span>
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
        <p className="text-sm text-gray-400">
          💡 Toutes vos informations sont sécurisées et utilisées uniquement pour personnaliser votre expérience
        </p>
      </div>
    </div>
  )
}
