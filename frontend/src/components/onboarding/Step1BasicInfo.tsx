import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useOnboardingStore } from '@/store/onboardingStore'
import type { ProfileStep1 } from '@/types/profile'

export function Step1BasicInfo() {
  const { t } = useTranslation('onboarding')
  const { step1, setStep1, nextStep } = useOnboardingStore()

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ProfileStep1>({
    defaultValues: step1 as ProfileStep1,
  })

  const onSubmit = (data: ProfileStep1) => {
    setStep1(data)
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">{t('step1.title')}</h2>
        <p className="text-gray-600 mt-2">
          {t('step1.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="age"
          type="number"
          label={t('step1.age')}
          placeholder={t('step1.agePlaceholder')}
          error={errors.age?.message}
          {...register('age', {
            required: t('errors.ageRequired'),
            valueAsNumber: true,
            min: { value: 13, message: t('errors.ageMin') },
            max: { value: 120, message: t('errors.ageMax') },
          })}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">{t('step1.gender')}</label>
          <select
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500 focus:outline-none"
            {...register('gender', { required: t('errors.genderRequired') })}
          >
            <option value="">{t('step1.genderSelect')}</option>
            <option value="male">{t('step1.genders.male')}</option>
            <option value="female">{t('step1.genders.female')}</option>
            <option value="other">{t('step1.genders.other')}</option>
          </select>
          {errors.gender && (
            <p className="text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="height_cm"
          type="number"
          label={t('step1.height')}
          placeholder={t('step1.heightPlaceholder')}
          error={errors.height_cm?.message}
          {...register('height_cm', {
            required: t('errors.heightRequired'),
            valueAsNumber: true,
            min: { value: 100, message: t('errors.heightMin') },
            max: { value: 250, message: t('errors.heightMax') },
          })}
        />

        <Input
          id="weight_kg"
          type="number"
          step="0.1"
          label={t('step1.weight')}
          placeholder={t('step1.weightPlaceholder')}
          error={errors.weight_kg?.message}
          {...register('weight_kg', {
            required: t('errors.weightRequired'),
            valueAsNumber: true,
            min: { value: 30, message: t('errors.weightMin') },
            max: { value: 300, message: t('errors.weightMax') },
          })}
        />
      </div>

      {/* BMI Preview */}
      {(() => {
        const height = watch('height_cm')
        const weight = watch('weight_kg')
        if (height && weight && !isNaN(height) && !isNaN(weight) && height > 0 && weight > 0) {
          const bmi = weight / Math.pow(height / 100, 2)
          if (!isNaN(bmi) && isFinite(bmi)) {
            return (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  {t('step1.bmiEstimate')}:{' '}
                  <span className="font-semibold">{bmi.toFixed(1)}</span>
                </p>
              </div>
            )
          }
        }
        return null
      })()}

      <div className="flex justify-end">
        <Button type="submit">{t('buttons.continue')}</Button>
      </div>
    </form>
  )
}
