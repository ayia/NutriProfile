import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useOnboardingStore } from '@/store/onboardingStore'
import type { ProfileStep4 } from '@/types/profile'

const COMMON_CONDITIONS = [
  'Diabète',
  'Hypertension',
  'Cholestérol',
  'Maladie cardiaque',
  'Insuffisance rénale',
  'Troubles digestifs',
]

interface Step4FormData {
  medical_conditions: string[]
  other_conditions_text: string
  medications_text: string
}

export function Step4Health() {
  const { step4, setStep4, nextStep, prevStep } = useOnboardingStore()

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
        <h2 className="text-2xl font-bold">Informations de santé</h2>
        <p className="text-gray-600 mt-2">
          Ces informations sont optionnelles mais nous aident à personnaliser vos recommandations.
        </p>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note :</strong> Ces informations sont confidentielles et stockées de manière sécurisée.
          Elles nous permettent d'adapter les recommandations et d'éviter les contre-indications.
        </p>
      </div>

      <div className="space-y-4">
        {/* Conditions médicales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conditions médicales (optionnel)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {COMMON_CONDITIONS.map((condition) => (
              <button
                key={condition}
                type="button"
                onClick={() => toggleCondition(condition)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  conditions.includes(condition)
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {condition}
              </button>
            ))}
          </div>

          <Input
            placeholder="Autres conditions (séparées par des virgules)"
            {...register('other_conditions_text')}
          />
        </div>

        {/* Médicaments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Médicaments actuels (optionnel)
          </label>
          <Input
            placeholder="Ex: metformine, statines (séparés par des virgules)"
            {...register('medications_text')}
          />
          <p className="text-xs text-gray-500 mt-1">
            Certains aliments peuvent interagir avec des médicaments.
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>
          Retour
        </Button>
        <Button type="submit">Voir le résumé</Button>
      </div>
    </form>
  )
}
