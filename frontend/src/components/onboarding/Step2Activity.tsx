import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useOnboardingStore } from '@/store/onboardingStore'
import type { ProfileStep2 } from '@/types/profile'
import { ACTIVITY_LABELS, GOAL_LABELS } from '@/types/profile'

export function Step2Activity() {
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
        <h2 className="text-2xl font-bold">Activité & Objectifs</h2>
        <p className="text-gray-600 mt-2">
          Dites-nous votre niveau d'activité et vos objectifs.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Niveau d'activité physique
          </label>
          <div className="space-y-2">
            {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
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
                  {...register('activity_level', { required: 'Niveau d\'activité requis' })}
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
          {errors.activity_level && (
            <p className="text-sm text-red-600 mt-1">{errors.activity_level.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Objectif principal
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(GOAL_LABELS).map(([value, label]) => (
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
                  {...register('goal', { required: 'Objectif requis' })}
                />
                <span className="text-sm">{label}</span>
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
            label="Poids cible (kg) - optionnel"
            placeholder="65"
            error={errors.target_weight_kg?.message}
            {...register('target_weight_kg', {
              valueAsNumber: true,
              min: { value: 30, message: 'Minimum 30 kg' },
              max: { value: 300, message: 'Maximum 300 kg' },
            })}
          />
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>
          Retour
        </Button>
        <Button type="submit">Continuer</Button>
      </div>
    </form>
  )
}
