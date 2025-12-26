import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { useOnboardingStore } from '@/store/onboardingStore'
import { profileApi } from '@/services/profileApi'

interface Step5SummaryProps {
  onSubmit: () => void
  isLoading: boolean
}

export function Step5Summary({ onSubmit, isLoading }: Step5SummaryProps) {
  const { t } = useTranslation('onboarding')
  const { step1, step2, step3, step4, getFullProfile, prevStep } = useOnboardingStore()

  const profile = getFullProfile()

  // Calculer les besoins nutritionnels en preview
  const { data: nutrition, isLoading: isCalculating } = useQuery({
    queryKey: ['nutrition-preview', profile],
    queryFn: () => profile ? profileApi.calculateNutrition(profile) : null,
    enabled: !!profile,
  })

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{t('step5.incompleteData')}</p>
        <Button onClick={prevStep} className="mt-4">{t('buttons.back')}</Button>
      </div>
    )
  }

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return t('step1.genders.male')
      case 'female': return t('step1.genders.female')
      default: return t('step1.genders.other')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">{t('step5.title')}</h2>
        <p className="text-gray-600 mt-2">
          {t('step5.subtitle')}
        </p>
      </div>

      {/* Nutrition Preview */}
      {nutrition && (
        <div className="p-6 bg-primary-50 rounded-xl">
          <h3 className="font-semibold text-lg mb-4 text-primary-800">
            {t('step5.nutritionTitle')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">
                {nutrition.daily_calories}
              </div>
              <div className="text-sm text-gray-600">{t('step5.kcalPerDay')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {nutrition.protein_g}g
              </div>
              <div className="text-sm text-gray-600">{t('step5.protein')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {nutrition.carbs_g}g
              </div>
              <div className="text-sm text-gray-600">{t('step5.carbs')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {nutrition.fat_g}g
              </div>
              <div className="text-sm text-gray-600">{t('step5.fat')}</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            BMR: {nutrition.bmr} kcal | TDEE: {nutrition.tdee} kcal
          </p>
        </div>
      )}

      {isCalculating && (
        <div className="p-6 bg-gray-50 rounded-xl animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      )}

      {/* Résumé des infos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Infos de base */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">{t('step5.basicInfo')}</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>{t('step1.age')}: <strong>{step1.age} {t('units.years')}</strong></li>
            <li>{t('step1.gender')}: <strong>{getGenderLabel(step1.gender || '')}</strong></li>
            <li>{t('step1.height')}: <strong>{step1.height_cm} {t('units.cm')}</strong></li>
            <li>{t('step1.weight')}: <strong>{step1.weight_kg} {t('units.kg')}</strong></li>
          </ul>
        </div>

        {/* Activité */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">{t('step5.activityGoal')}</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>{t('step5.activity')}: <strong>{step2.activity_level ? t(`activityLevels.${step2.activity_level}`) : '-'}</strong></li>
            <li>{t('step5.goal')}: <strong>{step2.goal ? t(`goals.${step2.goal}`) : '-'}</strong></li>
            {step2.target_weight_kg && (
              <li>{t('step5.targetWeight')}: <strong>{step2.target_weight_kg} {t('units.kg')}</strong></li>
            )}
          </ul>
        </div>

        {/* Régime */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">{t('step5.dietPreferences')}</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>{t('step5.diet')}: <strong>{step3.diet_type ? t(`diets.${step3.diet_type}`) : t('diets.omnivore')}</strong></li>
            {step3.allergies && step3.allergies.length > 0 && (
              <li>{t('step5.allergies')}: <strong>{step3.allergies.join(', ')}</strong></li>
            )}
          </ul>
        </div>

        {/* Santé */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">{t('step5.health')}</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {step4.medical_conditions && step4.medical_conditions.length > 0 ? (
              <li>{t('step5.conditions')}: <strong>{step4.medical_conditions.join(', ')}</strong></li>
            ) : (
              <li className="text-gray-400">{t('step5.noConditions')}</li>
            )}
            {step4.medications && step4.medications.length > 0 && (
              <li>{t('step5.medications')}: <strong>{step4.medications.join(', ')}</strong></li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          {t('buttons.back')}
        </Button>
        <Button onClick={onSubmit} isLoading={isLoading}>
          {t('step5.createProfile')}
        </Button>
      </div>
    </div>
  )
}
