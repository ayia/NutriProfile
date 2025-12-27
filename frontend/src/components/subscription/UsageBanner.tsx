import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { subscriptionApi } from '@/services/api'
import type { UsageStatusResponse } from '@/types'

interface UsageBannerProps {
  action?: 'vision_analyses' | 'recipe_generations' | 'coach_messages'
  showAlways?: boolean
  compact?: boolean
}

const featureConfig = {
  vision_analyses: { icon: '📸', label: 'analyses photo', color: 'primary' },
  recipe_generations: { icon: '🍳', label: 'recettes', color: 'secondary' },
  coach_messages: { icon: '💬', label: 'conseils coach', color: 'emerald' },
}

export function UsageBanner({ action = 'vision_analyses', showAlways = false, compact = false }: UsageBannerProps) {
  useTranslation() // Keep for potential future translations
  const [usage, setUsage] = useState<UsageStatusResponse | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const data = await subscriptionApi.getUsage()
        setUsage(data)
      } catch (error) {
        console.error('Failed to fetch usage:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsage()
  }, [])

  if (loading || !usage || dismissed) return null

  const used = usage.usage[action]
  const limit = usage.limits[action]
  const config = featureConfig[action]
  const remaining = limit === -1 ? -1 : limit - used
  const percentage = limit === -1 ? 0 : (used / limit) * 100

  // Afficher badge PRO si illimité
  if (limit === -1) {
    if (!showAlways) return null
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-emerald-50 rounded-xl border border-primary-100">
        <span className="text-lg">{config.icon}</span>
        <span className="text-sm font-medium text-primary-700">
          {config.label} illimitées
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
        <span>{config.icon}</span>
        <span>{used}/{limit}</span>
        {(isLow || isZero) && (
          <Link to="/pricing" className="ml-1 underline">
            Upgrade
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
            <span className="text-xl">{config.icon}</span>
            <div>
              <span className="text-sm font-semibold text-gray-800">
                {config.label.charAt(0).toUpperCase() + config.label.slice(1)}
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
                <span className="font-semibold">Limite atteinte !</span> Revenez demain ou passez à Premium.
              </>
            ) : isLow ? (
              <>Plus que <span className="font-semibold">{remaining}</span> {config.label} restante{remaining > 1 ? 's' : ''}</>
            ) : (
              <>{remaining} {config.label} restantes aujourd'hui</>
            )}
          </p>

          {(isLow || isZero) && (
            <Link
              to="/pricing"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all"
            >
              <span>⚡</span>
              <span>Passer à Premium</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
