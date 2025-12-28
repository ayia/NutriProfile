import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { subscriptionApi } from '@/services/api'

// Clé de query exportée pour permettre l'invalidation depuis d'autres composants
export const USAGE_QUERY_KEY = ['usage']

interface UsageBannerProps {
  action?: 'vision_analyses' | 'recipe_generations' | 'coach_messages'
  showAlways?: boolean
  compact?: boolean
}

const featureIcons = {
  vision_analyses: '📸',
  recipe_generations: '🍳',
  coach_messages: '💬',
}

export function UsageBanner({ action = 'vision_analyses', showAlways = false, compact = false }: UsageBannerProps) {
  const { t } = useTranslation('common')
  const [dismissed, setDismissed] = useState(false)

  const { data: usage, isLoading } = useQuery({
    queryKey: USAGE_QUERY_KEY,
    queryFn: subscriptionApi.getUsage,
    staleTime: 30 * 1000, // 30 secondes
    refetchOnWindowFocus: true,
  })

  if (isLoading || !usage || dismissed) return null

  const used = usage.usage[action]
  const limit = usage.limits[action]
  const icon = featureIcons[action]
  const label = t(`usage.features.${action}`)
  const remaining = limit === -1 ? -1 : limit - used
  const percentage = limit === -1 ? 0 : (used / limit) * 100

  // Afficher badge PRO si illimité
  if (limit === -1) {
    if (!showAlways) return null
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-emerald-50 rounded-xl border border-primary-100">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-primary-700">
          {label} {t('usage.unlimited')}
        </span>
        <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-xs font-bold rounded-full">
          PRO
        </span>
      </div>
    )
  }

  // Ne pas afficher si plus de 50% restant et showAlways est false
  if (!showAlways && percentage < 50) return null

  const isLow = remaining <= 1
  const isZero = remaining === 0

  // Version compacte
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
        isZero ? 'bg-red-100 text-red-700' :
        isLow ? 'bg-warning-100 text-warning-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        <span>{icon}</span>
        <span>{used}/{limit}</span>
        {(isLow || isZero) && (
          <Link to="/pricing" className="ml-1 underline">
            {t('usage.upgrade')}
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className={`glass-card p-4 mb-4 relative overflow-hidden ${
      isZero ? 'border-red-200' : isLow ? 'border-warning-200' : ''
    }`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 opacity-30 ${
        isZero ? 'bg-gradient-to-r from-red-100 to-rose-100' :
        isLow ? 'bg-gradient-to-r from-warning-100 to-amber-100' :
        'bg-gradient-to-r from-gray-50 to-gray-100'
      }`} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <div>
              <span className="text-sm font-semibold text-gray-800">
                {label.charAt(0).toUpperCase() + label.slice(1)}
              </span>
              <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                isZero ? 'bg-red-100 text-red-700' :
                isLow ? 'bg-warning-100 text-warning-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {used}/{limit}
              </span>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isZero ? 'bg-gradient-to-r from-red-500 to-rose-500' :
              isLow ? 'bg-gradient-to-r from-warning-500 to-amber-500' :
              'bg-gradient-to-r from-primary-500 to-emerald-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        {/* Message et CTA */}
        <div className="flex items-center justify-between">
          <p className={`text-sm ${
            isZero ? 'text-red-600 font-medium' :
            isLow ? 'text-warning-600' :
            'text-gray-600'
          }`}>
            {isZero ? (
              <>
                <span className="font-semibold">{t('usage.limitReached')}</span> {t('usage.comeBackTomorrow')}
              </>
            ) : isLow ? (
              <>{t('usage.remaining')} <span className="font-semibold">{remaining}</span> {label} {t('usage.remaining', { count: remaining })}</>
            ) : (
              <>{remaining} {label} {t('usage.remainingToday')}</>
            )}
          </p>

          {(isLow || isZero) && (
            <Link
              to="/pricing"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all"
            >
              <span>⚡</span>
              <span>{t('usage.upgradeToPremium')}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
