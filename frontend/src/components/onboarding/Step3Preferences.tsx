import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { useOnboardingStore } from '@/store/onboardingStore'
import { profileApi } from '@/services/profileApi'
import type { ProfileStep3, DietType } from '@/types/profile'

const DIET_TYPES: DietType[] = ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'mediterranean']
const ALLERGY_KEYS = ['gluten', 'lactose', 'peanuts', 'treeNuts', 'eggs', 'fish', 'shellfish', 'soy'] as const

interface Step3FormData {
  diet_type: DietType
  allergies: string[]
}

interface Step3PreferencesProps {
  onSubmit: () => void
  isLoading: boolean
}

export function Step3Preferences({ onSubmit, isLoading }: Step3PreferencesProps) {
  const { t } = useTranslation('onboarding')
  const { step1, step2, step3, setStep3, getFullProfile, prevStep, skippedOptional } = useOnboardingStore()
  const [showPreferences, setShowPreferences] = useState(!skippedOptional)

  const { register, watch, setValue } = useForm<Step3FormData>({
    defaultValues: {
      diet_type: step3.diet_type || 'omnivore',
      allergies: step3.allergies || [],
    },
  })

  const allergies = watch('allergies') || []
  const dietType = watch('diet_type')

  const toggleAllergy = (allergy: string) => {
    const current = allergies
    if (current.includes(allergy)) {
      setValue('allergies', current.filter((a) => a !== allergy))
    } else {
      setValue('allergies', [...current, allergy])
    }
  }

  // Calcul nutrition preview
  const profile = getFullProfile()
  const { data: nutrition, isLoading: isCalculating } = useQuery({
    queryKey: ['nutrition-preview', profile],
    queryFn: () => profile ? profileApi.calculateNutrition(profile) : null,
    enabled: !!profile,
  })

  const handleSubmit = () => {
    // Sauvegarder les préférences
    const profileData: ProfileStep3 = {
      diet_type: dietType,
      allergies: allergies,
      excluded_foods: [],
      favorite_foods: [],
    }
    setStep3(profileData)
    onSubmit()
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
        <h2 className="text-2xl font-bold">{t('step3.titleFinal')}</h2>
        <p className="text-gray-600 mt-2">
          {t('step3.subtitleFinal')}
        </p>
      </div>

      {/* Nutrition Preview - Calculs basés sur les infos déjà saisies */}
      {nutrition && (
        <div className="p-6 bg-gradient-to-br from-primary-50 to-emerald-50 rounded-xl border border-primary-100">
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

      {/* Résumé compact des infos de base */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">{t('step1.age')}</span>
            <p className="font-semibold">{step1.age} {t('units.years')}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('step1.gender')}</span>
            <p className="font-semibold">{getGenderLabel(step1.gender || '')}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('step1.height')}</span>
            <p className="font-semibold">{step1.height_cm} {t('units.cm')}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('step1.weight')}</span>
            <p className="font-semibold">{step1.weight_kg} {t('units.kg')}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">{t('step5.activity')}</span>
            <p className="font-semibold">{step2.activity_level ? t(`activityLevels.${step2.activity_level}`) : '-'}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('step5.goal')}</span>
            <p className="font-semibold">{step2.goal ? t(`goals.${step2.goal}`) : '-'}</p>
          </div>
        </div>
      </div>

      {/* Préférences alimentaires - Collapsible */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPreferences(!showPreferences)}
          className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium text-gray-700">
            {t('step3.dietPreferencesOptional')}
          </span>
          <span className="text-gray-400">
            {showPreferences ? '−' : '+'}
          </span>
        </button>

        {showPreferences && (
          <div className="p-4 space-y-4">
            {/* Type de régime */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('step3.dietType')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DIET_TYPES.map((value) => (
                  <label
                    key={value}
                    className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-colors text-center text-sm ${
                      dietType === value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={value}
                      className="sr-only"
                      {...register('diet_type')}
                    />
                    <span>{t(`diets.${value}`)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('step3.allergiesOptional')}
              </label>
              <div className="flex flex-wrap gap-2">
                {ALLERGY_KEYS.map((key) => {
                  const label = t(`commonAllergies.${key}`)
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleAllergy(label)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        allergies.includes(label)
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          {t('buttons.back')}
        </Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>
          {t('step5.createProfile')}
        </Button>
      </div>
    </div>
  )
}
