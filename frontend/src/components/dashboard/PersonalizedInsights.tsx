import { useTranslation } from 'react-i18next'
import type { PersonalizedInsight } from '@/types/dashboard'
import {
  Lightbulb,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Activity,
  Heart,
  Leaf,
  AlertCircle,
  CheckCircle,
  type LucideIcon
} from '@/lib/icons'

interface PersonalizedInsightsProps {
  insights: PersonalizedInsight[]
}

// Mapping des types d'insights vers les icônes
const INSIGHT_ICONS: Record<string, LucideIcon> = {
  calories: Flame,
  protein: Dumbbell,
  carbs: Wheat,
  water: Droplets,
  activity: Activity,
  health: Heart,
  diet: Leaf,
  warning: AlertCircle,
  success: CheckCircle,
  default: Lightbulb,
}

function getInsightIcon(type: string): LucideIcon {
  return INSIGHT_ICONS[type] || INSIGHT_ICONS.default
}

export function PersonalizedInsights({ insights }: PersonalizedInsightsProps) {
  const { t } = useTranslation('dashboard')

  if (!insights || insights.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        {t('personalization.insights')}
      </h3>
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const InsightIcon = getInsightIcon(insight.type)
          return (
            <div
              key={`${insight.type}-${index}`}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <InsightIcon className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900">{insight.title}</h4>
                <p className="text-sm text-gray-600 mt-0.5">{insight.message}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
