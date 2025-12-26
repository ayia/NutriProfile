import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useOnboardingStore } from '@/store/onboardingStore'
import type { ProfileStep3, DietType } from '@/types/profile'

const DIET_TYPES: DietType[] = ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'mediterranean']
const ALLERGY_KEYS = ['gluten', 'lactose', 'peanuts', 'treeNuts', 'eggs', 'fish', 'shellfish', 'soy', 'sesame'] as const

interface Step3FormData {
  diet_type: DietType
  allergies: string[]
  excluded_foods_text: string
  favorite_foods_text: string
}

export function Step3Diet() {
  const { t } = useTranslation('onboarding')
  const { step3, setStep3, nextStep, prevStep } = useOnboardingStore()

  const { register, handleSubmit, watch, setValue } = useForm<Step3FormData>({
    defaultValues: {
      diet_type: step3.diet_type || 'omnivore',
      allergies: step3.allergies || [],
      excluded_foods_text: Array.isArray(step3.excluded_foods) ? step3.excluded_foods.join(', ') : '',
      favorite_foods_text: Array.isArray(step3.favorite_foods) ? step3.favorite_foods.join(', ') : '',
    },
  })

  const [customAllergy, setCustomAllergy] = useState('')
  const allergies = watch('allergies') || []

  const toggleAllergy = (allergy: string) => {
    const current = allergies
    if (current.includes(allergy)) {
      setValue('allergies', current.filter((a) => a !== allergy))
    } else {
      setValue('allergies', [...current, allergy])
    }
  }

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setValue('allergies', [...allergies, customAllergy.trim()])
      setCustomAllergy('')
    }
  }

  const onSubmit = (data: Step3FormData) => {
    const profileData: ProfileStep3 = {
      diet_type: data.diet_type,
      allergies: data.allergies,
      excluded_foods: data.excluded_foods_text ? data.excluded_foods_text.split(',').map(s => s.trim()).filter(Boolean) : [],
      favorite_foods: data.favorite_foods_text ? data.favorite_foods_text.split(',').map(s => s.trim()).filter(Boolean) : [],
    }
    setStep3(profileData)
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">{t('step3.title')}</h2>
        <p className="text-gray-600 mt-2">
          {t('step3.subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Type de régime */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('step3.dietType')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DIET_TYPES.map((value) => (
              <label
                key={value}
                className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors text-center ${
                  watch('diet_type') === value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value={value}
                  className="sr-only"
                  {...register('diet_type')}
                />
                <span className="text-sm">{t(`diets.${value}`)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('step3.allergies')}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {ALLERGY_KEYS.map((key) => {
              const label = t(`commonAllergies.${key}`)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleAllergy(label)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    allergies.includes(label)
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Allergies sélectionnées */}
          {allergies.filter((a) => !ALLERGY_KEYS.map(k => t(`commonAllergies.${k}`)).includes(a)).map((allergy) => (
            <span
              key={allergy}
              className="inline-flex items-center gap-1 px-3 py-1 mr-2 mb-2 rounded-full text-sm bg-red-100 text-red-700"
            >
              {allergy}
              <button
                type="button"
                onClick={() => toggleAllergy(allergy)}
                className="hover:text-red-900"
              >
                ×
              </button>
            </span>
          ))}

          {/* Ajout personnalisé */}
          <div className="flex gap-2 mt-2">
            <Input
              placeholder={t('step3.otherAllergy')}
              value={customAllergy}
              onChange={(e) => setCustomAllergy(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAllergy())}
            />
            <Button type="button" variant="outline" onClick={addCustomAllergy}>
              {t('step3.add')}
            </Button>
          </div>
        </div>

        {/* Aliments exclus */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('step3.excludedFoods')}
          </label>
          <Input
            placeholder={t('step3.excludedFoodsPlaceholder')}
            {...register('excluded_foods_text')}
          />
        </div>

        {/* Aliments préférés */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('step3.favoriteFoods')}
          </label>
          <Input
            placeholder={t('step3.favoriteFoodsPlaceholder')}
            {...register('favorite_foods_text')}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>
          {t('buttons.back')}
        </Button>
        <Button type="submit">{t('buttons.continue')}</Button>
      </div>
    </form>
  )
}
