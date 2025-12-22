import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { profileApi } from '@/services/profileApi'
import { Button } from '@/components/ui/Button'
import { GOAL_LABELS } from '@/types/profile'

export function DashboardPage() {
  const { user } = useAuth()

  const { data: summary, isLoading } = useQuery({
    queryKey: ['profile-summary'],
    queryFn: profileApi.getSummary,
  })

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  // Pas de profil - afficher CTA onboarding
  if (!summary?.has_profile) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🥗</div>
          <h1 className="text-2xl font-bold mb-4">Bienvenue, {user?.name} !</h1>
          <p className="text-gray-600 mb-8">
            Créez votre profil nutritionnel pour recevoir des recommandations
            personnalisées basées sur vos objectifs et préférences.
          </p>
          <Link to="/onboarding">
            <Button size="lg">Créer mon profil</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bienvenue */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-2">Bonjour, {user?.name}</h2>
          <p className="text-gray-600 mb-4">
            Objectif: <strong>{summary.goal ? GOAL_LABELS[summary.goal] : '-'}</strong>
          </p>
          <Link to="/onboarding">
            <Button variant="outline" size="sm">Modifier mon profil</Button>
          </Link>
        </div>

        {/* Calories */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-2">Calories cibles</h3>
          <p className="text-3xl font-bold text-primary-600">
            {summary.daily_calories || '--'}
          </p>
          <p className="text-gray-500 text-sm">kcal par jour</p>
        </div>

        {/* Statut */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-2">Statut du profil</h3>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${summary.is_complete ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            <span className={summary.is_complete ? 'text-green-600' : 'text-yellow-600'}>
              {summary.is_complete ? 'Profil complet' : 'Profil incomplet'}
            </span>
          </div>
        </div>
      </div>

      {/* Prochaines étapes */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Fonctionnalités à venir</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">📸</span>
            <span>Analyser vos repas par photo</span>
            <span className="ml-auto text-xs text-gray-400">Bientôt</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">🍳</span>
            <span>Générer des recettes personnalisées</span>
            <span className="ml-auto text-xs text-gray-400">Bientôt</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">📊</span>
            <span>Suivre votre progression</span>
            <span className="ml-auto text-xs text-gray-400">Bientôt</span>
          </div>
        </div>
      </div>
    </div>
  )
}
