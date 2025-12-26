import { useTranslation } from 'react-i18next'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export function OnboardingPage() {
  const { t } = useTranslation('onboarding')

  return (
    <div className="min-h-[70vh] py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('title')}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('subtitle')}
        </p>
      </div>

      <OnboardingWizard />
    </div>
  )
}
