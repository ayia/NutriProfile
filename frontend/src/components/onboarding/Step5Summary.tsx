import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { useOnboardingStore } from '@/store/onboardingStore'
import { profileApi } from '@/services/profileApi'
import { ACTIVITY_LABELS, GOAL_LABELS, DIET_LABELS } from '@/types/profile'

interface Step5SummaryProps {
  onSubmit: () => void
  isLoading: boolean
}

export function Step5Summary({ onSubmit, isLoading }: Step5SummaryProps) {
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
        <p className="text-red-600">Données incomplètes. Veuillez revenir en arrière.</p>
        <Button onClick={prevStep} className="mt-4">Retour</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Récapitulatif</h2>
        <p className="text-gray-600 mt-2">
          Vérifiez vos informations avant de créer votre profil.
        </p>
      </div>

      {/* Nutrition Preview */}
      {nutrition && (
        <div className="p-6 bg-primary-50 rounded-xl">
          <h3 className="font-semibold text-lg mb-4 text-primary-800">
            Vos besoins nutritionnels estimés
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">
                {nutrition.daily_calories}
              </div>
              <div className="text-sm text-gray-600">kcal/jour</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {nutrition.protein_g}g
              </div>
              <div className="text-sm text-gray-600">Protéines</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {nutrition.carbs_g}g
              </div>
              <div className="text-sm text-gray-600">Glucides</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {nutrition.fat_g}g
              </div>
              <div className="text-sm text-gray-600">Lipides</div>
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
          <h4 className="font-medium mb-2">Informations de base</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Âge: <strong>{step1.age} ans</strong></li>
            <li>Genre: <strong>{step1.gender === 'male' ? 'Homme' : step1.gender === 'female' ? 'Femme' : 'Autre'}</strong></li>
            <li>Taille: <strong>{step1.height_cm} cm</strong></li>
            <li>Poids: <strong>{step1.weight_kg} kg</strong></li>
          </ul>
        </div>

        {/* Activité */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Activité & Objectif</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Activité: <strong>{step2.activity_level ? ACTIVITY_LABELS[step2.activity_level] : '-'}</strong></li>
            <li>Objectif: <strong>{step2.goal ? GOAL_LABELS[step2.goal] : '-'}</strong></li>
            {step2.target_weight_kg && (
              <li>Poids cible: <strong>{step2.target_weight_kg} kg</strong></li>
            )}
          </ul>
        </div>

        {/* Régime */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Préférences alimentaires</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Régime: <strong>{step3.diet_type ? DIET_LABELS[step3.diet_type] : 'Omnivore'}</strong></li>
            {step3.allergies && step3.allergies.length > 0 && (
              <li>Allergies: <strong>{step3.allergies.join(', ')}</strong></li>
            )}
          </ul>
        </div>

        {/* Santé */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Santé</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {step4.medical_conditions && step4.medical_conditions.length > 0 ? (
              <li>Conditions: <strong>{step4.medical_conditions.join(', ')}</strong></li>
            ) : (
              <li className="text-gray-400">Aucune condition renseignée</li>
            )}
            {step4.medications && step4.medications.length > 0 && (
              <li>Médicaments: <strong>{step4.medications.join(', ')}</strong></li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          Retour
        </Button>
        <Button onClick={onSubmit} isLoading={isLoading}>
          Créer mon profil
        </Button>
      </div>
    </div>
  )
}
