import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useAuthStore } from '@/store/authStore'
import { profileApi } from '@/services/profileApi'
import { Step1BasicInfo } from './Step1BasicInfo'
import { Step2Activity } from './Step2Activity'
import { Step3Diet } from './Step3Diet'
import { Step4Health } from './Step4Health'
import { Step5Summary } from './Step5Summary'

const TOTAL_STEPS = 5

export function OnboardingWizard() {
  const navigate = useNavigate()
  const { currentStep, getFullProfile, reset } = useOnboardingStore()
  const { setProfileStatus } = useAuthStore()

  const createProfile = useMutation({
    mutationFn: profileApi.createProfile,
    onSuccess: () => {
      setProfileStatus(true) // Marquer que le profil existe maintenant
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
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                i + 1 <= currentStep
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-gray-300 text-gray-400'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-primary-600 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Error message */}
      {createProfile.error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          Une erreur est survenue. Veuillez réessayer.
        </div>
      )}

      {/* Steps */}
      <div className="bg-white rounded-xl shadow-sm p-6">
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
  )
}
