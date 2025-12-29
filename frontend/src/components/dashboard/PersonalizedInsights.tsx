import { useTranslation } from 'react-i18next'
import type { PersonalizedInsight } from '@/types/dashboard'

interface PersonalizedInsightsProps {
  insights: PersonalizedInsight[]
}

export function PersonalizedInsights({ insights }: PersonalizedInsightsProps) {
  const { t } = useTranslation('dashboard')

  if (!insights || insights.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <span className="text-lg">💡</span>
        {t('personalization.insights')}
      </h3>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={`${insight.type}-${index}`}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <span className="text-xl flex-shrink-0">{insight.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900">{insight.title}</h4>
              <p className="text-sm text-gray-600 mt-0.5">{insight.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
