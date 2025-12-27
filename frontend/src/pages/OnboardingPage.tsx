import { useTranslation } from 'react-i18next'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export function OnboardingPage() {
  const { t } = useTranslation('onboarding')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 relative overflow-hidden py-12 px-4">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-primary-100/50 to-emerald-100/50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-secondary-100/50 to-cyan-100/50 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-accent-100/30 to-amber-100/30 rounded-full blur-3xl -z-10" />

      <div className="max-w-2xl mx-auto">
        {/* Header - Enhanced */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-emerald-400 rounded-2xl blur-lg opacity-40" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
              <span className="text-4xl">🌱</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            {t('title')}
          </h1>
          <p className="text-gray-500 mt-3 text-lg max-w-md mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <OnboardingWizard />
      </div>
    </div>
  )
}
