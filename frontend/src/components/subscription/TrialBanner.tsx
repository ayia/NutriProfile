import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Clock, Crown, Zap } from 'lucide-react'
import { subscriptionApi } from '@/services/api'
import { cn } from '@/lib/utils'

interface TrialBannerProps {
  className?: string
  variant?: 'full' | 'compact'
}

export function TrialBanner({ className, variant = 'full' }: TrialBannerProps) {
  const { t } = useTranslation('pricing')

  const { data: status, isLoading } = useQuery({
    queryKey: ['subscription', 'status'],
    queryFn: subscriptionApi.getStatus,
    staleTime: 60 * 1000, // 1 minute
  })

  // Ne pas afficher si pas de trial ou si abonnement payé
  if (isLoading || !status?.is_trial || status.days_remaining === null) {
    return null
  }

  const daysRemaining = status.days_remaining
  const isExpiringSoon = daysRemaining <= 3
  const isLastDay = daysRemaining <= 1

  // Version compacte (pour le header)
  if (variant === 'compact') {
    return (
      <Link
        to="/pricing"
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all',
          isLastDay
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : isExpiringSoon
            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            : 'bg-primary-100 text-primary-700 hover:bg-primary-200',
          className
        )}
      >
        <Clock className="w-3 h-3" />
        <span>
          {t('trial.daysRemaining', { count: daysRemaining })}
        </span>
      </Link>
    )
  }

  // Version complète
  return (
    <div
      className={cn(
        'rounded-xl p-4 border transition-all',
        isLastDay
          ? 'bg-red-50 border-red-200'
          : isExpiringSoon
          ? 'bg-orange-50 border-orange-200'
          : 'bg-gradient-to-r from-primary-50 to-emerald-50 border-primary-200',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              isLastDay
                ? 'bg-red-100'
                : isExpiringSoon
                ? 'bg-orange-100'
                : 'bg-primary-100'
            )}
          >
            {isLastDay ? (
              <Clock className="w-5 h-5 text-red-600" />
            ) : (
              <Crown className="w-5 h-5 text-primary-600" />
            )}
          </div>
          <div>
            <p
              className={cn(
                'font-semibold',
                isLastDay
                  ? 'text-red-800'
                  : isExpiringSoon
                  ? 'text-orange-800'
                  : 'text-gray-800'
              )}
            >
              {t('trial.title', { days: daysRemaining })}
            </p>
            <p className="text-sm text-gray-600">
              {t('trial.description')}
            </p>
          </div>
        </div>
        <Link
          to="/pricing"
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
            'bg-gradient-to-r from-primary-500 to-emerald-500 text-white',
            'hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5'
          )}
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">{t('trial.upgrade')}</span>
          <span className="sm:hidden">{t('trial.upgradeShort')}</span>
        </Link>
      </div>
    </div>
  )
}

export default TrialBanner
