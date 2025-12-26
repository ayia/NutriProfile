import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useOnboardingStore } from '@/store/onboardingStore'
import type { ProfileStep2, ActivityLevel, Goal } from '@/types/profile'

const ACTIVITY_LEVELS: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'very_active']
const GOALS: Goal[] = ['lose_weight', 'maintain', 'gain_muscle', 'improve_health']

export function Step2Activity() {
  const { t } = useTranslation('onboarding')
  const { step2, setStep2, nextStep, prevStep } = useOnboardingStore()

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ProfileStep2>({
    defaultValues: step2 as ProfileStep2,
  })

  const goal = watch('goal')

  const onSubmit = (data: ProfileStep2) => {
    setStep2(data)
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">{t('step2.title')}</h2>
        <p className="text-gray-600 mt-2">
          {t('step2.subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('step2.activityLevel')}
          </label>
          <div className="space-y-2">
            {ACTIVITY_LEVELS.map((value) => (
              <label
                key={value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  watch('activity_level') === value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value={value}
                  className="sr-only"
                  {...register('activity_level', { required: t('errors.activityRequired') })}
                />
                <span className="text-sm">{t(`activityLevels.${value}`)}</span>
              </label>
            ))}
          </div>
          {errors.activity_level && (
            <p className="text-sm text-red-600 mt-1">{errors.activity_level.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('step2.goal')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((value) => (
              <label
                key={value}
                className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors text-center ${
                  watch('goal') === value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value={value}
                  className="sr-only"
                  {...register('goal', { required: t('errors.goalRequired') })}
                />
                <span className="text-sm">{t(`goals.${value}`)}</span>
              </label>
            ))}
          </div>
          {errors.goal && (
            <p className="text-sm text-red-600 mt-1">{errors.goal.message}</p>
          )}
        </div>

        {goal === 'lose_weight' && (
          <Input
            id="target_weight_kg"
            type="number"
            step="0.1"
            label={t('step2.targetWeight')}
            placeholder={t('step2.targetWeightPlaceholder')}
            error={errors.target_weight_kg?.message}
            {...register('target_weight_kg', {
              valueAsNumber: true,
              min: { value: 30, message: t('errors.weightMin') },
              max: { value: 300, message: t('errors.weightMax') },
            })}
          />
        )}
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
