import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useOnboardingStore } from '@/store/onboardingStore'
import type { ProfileStep1 } from '@/types/profile'

export function Step1BasicInfo() {
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
        <h2 className="text-2xl font-bold">Informations de base</h2>
        <p className="text-gray-600 mt-2">
          Ces informations nous permettent de calculer vos besoins caloriques.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="age"
          type="number"
          label="Âge"
          placeholder="25"
          error={errors.age?.message}
          {...register('age', {
            required: 'Âge requis',
            valueAsNumber: true,
            min: { value: 13, message: 'Minimum 13 ans' },
            max: { value: 120, message: 'Maximum 120 ans' },
          })}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Genre</label>
          <select
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500 focus:outline-none"
            {...register('gender', { required: 'Genre requis' })}
          >
            <option value="">Sélectionner</option>
            <option value="male">Homme</option>
            <option value="female">Femme</option>
            <option value="other">Autre</option>
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
          label="Taille (cm)"
          placeholder="175"
          error={errors.height_cm?.message}
          {...register('height_cm', {
            required: 'Taille requise',
            valueAsNumber: true,
            min: { value: 100, message: 'Minimum 100 cm' },
            max: { value: 250, message: 'Maximum 250 cm' },
          })}
        />

        <Input
          id="weight_kg"
          type="number"
          step="0.1"
          label="Poids (kg)"
          placeholder="70"
          error={errors.weight_kg?.message}
          {...register('weight_kg', {
            required: 'Poids requis',
            valueAsNumber: true,
            min: { value: 30, message: 'Minimum 30 kg' },
            max: { value: 300, message: 'Maximum 300 kg' },
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
                  IMC estimé:{' '}
                  <span className="font-semibold">{bmi.toFixed(1)}</span>
                </p>
              </div>
            )
          }
        }
        return null
      })()}

      <div className="flex justify-end">
        <Button type="submit">Continuer</Button>
      </div>
    </form>
  )
}
