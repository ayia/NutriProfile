import { useTranslation } from 'react-i18next'
import {
  HeartPulse,
  Heart,
  Activity,
  Droplet,
  Wheat,
  TrendingDown,
  Dumbbell,
  Scale,
  Leaf,
  Salad,
  Carrot,
  Waves,
  Star,
  User,
  type LucideIcon
} from '@/lib/icons'

interface ProfileSummaryBannerProps {
  summary: string
  healthContext: string[]
  userName: string
}

// Mapping des contextes de santé vers des badges visuels
const CONTEXT_BADGES: Record<string, { label: string; color: string; IconComponent: LucideIcon }> = {
  // Conditions médicales
  condition_diabetes: { label: 'Diabète', color: 'bg-amber-100 text-amber-800', IconComponent: Activity },
  condition_hypertension: { label: 'Hypertension', color: 'bg-red-100 text-red-800', IconComponent: Heart },
  condition_heart_disease: { label: 'Cœur', color: 'bg-red-100 text-red-800', IconComponent: HeartPulse },
  condition_kidney_disease: { label: 'Reins', color: 'bg-purple-100 text-purple-800', IconComponent: Droplet },
  condition_anemia: { label: 'Anémie', color: 'bg-rose-100 text-rose-800', IconComponent: Droplet },
  condition_osteoporosis: { label: 'Os', color: 'bg-gray-100 text-gray-800', IconComponent: Activity },
  condition_celiac: { label: 'Cœliaque', color: 'bg-yellow-100 text-yellow-800', IconComponent: Wheat },

  // Objectifs
  goal_lose_weight: { label: 'Perte de poids', color: 'bg-green-100 text-green-800', IconComponent: TrendingDown },
  goal_gain_muscle: { label: 'Prise de muscle', color: 'bg-blue-100 text-blue-800', IconComponent: Dumbbell },
  goal_maintain: { label: 'Maintien', color: 'bg-gray-100 text-gray-800', IconComponent: Scale },
  goal_improve_health: { label: 'Santé', color: 'bg-teal-100 text-teal-800', IconComponent: Leaf },

  // Régimes
  diet_vegan: { label: 'Végan', color: 'bg-green-100 text-green-800', IconComponent: Leaf },
  diet_vegetarian: { label: 'Végétarien', color: 'bg-green-100 text-green-800', IconComponent: Salad },
  diet_keto: { label: 'Keto', color: 'bg-purple-100 text-purple-800', IconComponent: Carrot },
  diet_mediterranean: { label: 'Méditerranéen', color: 'bg-blue-100 text-blue-800', IconComponent: Salad },
  diet_pescatarian: { label: 'Pescétarien', color: 'bg-cyan-100 text-cyan-800', IconComponent: Waves },

  // Âge
  age_young: { label: 'Croissance', color: 'bg-pink-100 text-pink-800', IconComponent: Star },
  age_adult: { label: 'Adulte', color: 'bg-gray-100 text-gray-800', IconComponent: User },
  age_senior: { label: 'Senior', color: 'bg-indigo-100 text-indigo-800', IconComponent: User },
}

export function ProfileSummaryBanner({ summary, healthContext, userName }: ProfileSummaryBannerProps) {
  const { t } = useTranslation('dashboard')

  // Filtrer les contextes qui ont un badge défini
  const visibleContexts = healthContext.filter(ctx => CONTEXT_BADGES[ctx])

  return (
    <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-primary-900">
            {t('personalization.greeting')}, {userName}
          </h2>
          <p className="text-sm text-primary-700 mt-1">{summary}</p>
        </div>

        {visibleContexts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {visibleContexts.slice(0, 4).map((ctx) => {
              const badge = CONTEXT_BADGES[ctx]
              return (
                <span
                  key={ctx}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
                >
                  <badge.IconComponent className="w-3 h-3" />
                  {badge.label}
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
