import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export function OnboardingPage() {
  return (
    <div className="min-h-[70vh] py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Créez votre profil nutritionnel
        </h1>
        <p className="text-gray-600 mt-2">
          Répondez à quelques questions pour recevoir des recommandations personnalisées.
        </p>
      </div>

      <OnboardingWizard />
    </div>
  )
}
