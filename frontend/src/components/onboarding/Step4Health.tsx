import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useOnboardingStore } from '@/store/onboardingStore'
import type { ProfileStep4 } from '@/types/profile'

interface Step4FormData {
  medical_conditions: string[]
  other_conditions_text: string
  medications_text: string
}

export function Step4Health() {
  const { t } = useTranslation('onboarding')
  const { step4, setStep4, nextStep, prevStep } = useOnboardingStore()

  const COMMON_CONDITIONS = [
    { key: 'diabetes', label: t('conditions.diabetes') },
    { key: 'hypertension', label: t('conditions.hypertension') },
    { key: 'cholesterol', label: t('conditions.cholesterol') },
    { key: 'heartDisease', label: t('conditions.heartDisease') },
    { key: 'kidneyFailure', label: t('conditions.kidneyFailure') },
    { key: 'digestiveDisorders', label: t('conditions.digestiveDisorders') },
  ]

  const { register, handleSubmit, watch, setValue } = useForm<Step4FormData>({
    defaultValues: {
      medical_conditions: step4.medical_conditions || [],
      other_conditions_text: '',
      medications_text: Array.isArray(step4.medications) ? step4.medications.join(', ') : '',
    },
  })

  const conditions = watch('medical_conditions') || []

  const toggleCondition = (condition: string) => {
    const current = conditions
    if (current.includes(condition)) {
      setValue('medical_conditions', current.filter((c) => c !== condition))
    } else {
      setValue('medical_conditions', [...current, condition])
    }
  }

  const onSubmit = (data: Step4FormData) => {
    const otherConditions = data.other_conditions_text
      ? data.other_conditions_text.split(',').map(s => s.trim()).filter(Boolean)
      : []
    const allConditions = [...new Set([...data.medical_conditions, ...otherConditions])]

    const profileData: ProfileStep4 = {
      medical_conditions: allConditions,
      medications: data.medications_text ? data.medications_text.split(',').map(s => s.trim()).filter(Boolean) : [],
    }
    setStep4(profileData)
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">{t('step4.title')}</h2>
        <p className="text-gray-600 mt-2">
          {t('step4.subtitle')}
        </p>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>{t('step4.note')}</strong> {t('step4.noteText')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Conditions médicales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('step4.medicalConditions')}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {COMMON_CONDITIONS.map((condition) => (
              <button
                key={condition.key}
                type="button"
                onClick={() => toggleCondition(condition.label)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  conditions.includes(condition.label)
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {condition.label}
              </button>
            ))}
          </div>

          <Input
            placeholder={t('step4.otherConditions')}
            {...register('other_conditions_text')}
          />
        </div>

        {/* Médicaments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('step4.medications')}
          </label>
          <Input
            placeholder={t('step4.medicationsPlaceholder')}
            {...register('medications_text')}
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('step4.medicationsNote')}
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>
          {t('buttons.back')}
        </Button>
        <Button type="submit">{t('buttons.viewSummary')}</Button>
      </div>
    </form>
  )
}
