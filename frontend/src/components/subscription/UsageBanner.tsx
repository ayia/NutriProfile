import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AlertCircle, X } from 'lucide-react'
import { subscriptionApi } from '@/services/api'
import type { UsageStatusResponse } from '@/types'

interface UsageBannerProps {
  action?: 'vision_analyses' | 'recipe_generations' | 'coach_messages'
}

export function UsageBanner({ action = 'vision_analyses' }: UsageBannerProps) {
  const { t } = useTranslation()
  const [usage, setUsage] = useState<UsageStatusResponse | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const data = await subscriptionApi.getUsage()
        setUsage(data)
      } catch (error) {
        console.error('Failed to fetch usage:', error)
      }
    }
    fetchUsage()
  }, [])

  if (!usage || usage.tier !== 'free' || dismissed) return null

  const used = usage.usage[action]
  const limit = usage.limits[action]

  if (limit === -1) return null // Unlimited

  const percentage = (used / limit) * 100

  if (percentage < 70) return null // Not close to limit

  const isAtLimit = percentage >= 100

  const getActionName = () => {
    switch (action) {
      case 'vision_analyses':
        return t('usage.visionAnalyses', 'analyses photo')
      case 'recipe_generations':
        return t('usage.recipeGenerations', 'recettes')
      case 'coach_messages':
        return t('usage.coachMessages', 'conseils coach')
      default:
        return action
    }
  }

  return (
    <div
      className={`rounded-lg p-4 mb-4 flex items-start gap-3 ${
        isAtLimit
          ? 'bg-red-50 border border-red-200'
          : 'bg-yellow-50 border border-yellow-200'
      }`}
    >
      <AlertCircle
        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
          isAtLimit ? 'text-red-500' : 'text-yellow-500'
        }`}
      />

      <div className="flex-1">
        <p className={`text-sm ${isAtLimit ? 'text-red-700' : 'text-yellow-700'}`}>
          {isAtLimit
            ? t('usage.limitReached', {
                feature: getActionName(),
                defaultValue: `Limite de ${getActionName()} atteinte pour aujourd'hui`,
              })
            : t('usage.approaching', {
                used,
                limit,
                defaultValue: `${used}/${limit} ${getActionName()} utilisées`,
              })}
        </p>

        <Link
          to="/pricing"
          className={`text-sm font-medium mt-1 inline-block ${
            isAtLimit
              ? 'text-red-600 hover:text-red-700'
              : 'text-yellow-600 hover:text-yellow-700'
          }`}
        >
          {t('usage.upgrade', 'Passer à Premium')} →
        </Link>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
