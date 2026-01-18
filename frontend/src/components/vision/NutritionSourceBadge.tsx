/**
 * NutritionSourceBadge - Display source of nutrition data
 *
 * Shows badges indicating where nutrition data came from:
 * - USDA verified (green): Data verified against USDA database
 * - USDA translation (blue): Found via language translation
 * - AI estimated (orange): VLM estimation, may need verification
 * - Local database (green): From local nutrition database
 * - Manual (blue): User entered manually
 *
 * Also shows "needs verification" warning badge for low confidence items
 */

import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Database, Sparkles, Edit3, AlertTriangle, Check } from '@/lib/icons'
import type { NutritionSource } from '@/types/foodLog'

interface NutritionSourceBadgeProps {
  source: NutritionSource
  needsVerification?: boolean
  usdaFoodName?: string | null
  originalName?: string | null
  showDetails?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function NutritionSourceBadge({
  source,
  needsVerification = false,
  usdaFoodName,
  originalName,
  showDetails = false,
  size = 'sm',
  className,
}: NutritionSourceBadgeProps) {
  const { t } = useTranslation('vision')

  // Determine badge config based on source
  const getBadgeConfig = () => {
    switch (source) {
      case 'usda_verified':
        return {
          label: t('source.usda'),
          icon: Check,
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
        }
      case 'usda_translation':
        return {
          label: t('source.usdaTranslation'),
          icon: Database,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
        }
      case 'local_database':
      case 'database':
        return {
          label: t('source.local'),
          icon: Database,
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
        }
      case 'manual':
        return {
          label: t('source.manual'),
          icon: Edit3,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
        }
      case 'ai_estimated':
      case 'ai':
      default:
        return {
          label: t('source.ai'),
          icon: Sparkles,
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
        }
    }
  }

  const config = getBadgeConfig()
  const Icon = config.icon
  const isSmall = size === 'sm'

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {/* Main source badge */}
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full border font-medium',
          config.bgColor,
          config.textColor,
          config.borderColor,
          isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        )}
        title={usdaFoodName ? `USDA: ${usdaFoodName}` : undefined}
      >
        <Icon className={cn(isSmall ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
        {config.label}
      </span>

      {/* Needs verification warning badge */}
      {needsVerification && (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border font-medium',
            'bg-yellow-100 text-yellow-700 border-yellow-200',
            isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          )}
          title={t('source.needsVerificationTooltip')}
        >
          <AlertTriangle className={cn(isSmall ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
          {t('source.needsVerification')}
        </span>
      )}

      {/* Show translation details if available */}
      {showDetails && originalName && originalName !== usdaFoodName && (
        <span
          className={cn(
            'text-gray-500 italic',
            isSmall ? 'text-[10px]' : 'text-xs'
          )}
        >
          ({originalName} &rarr; {usdaFoodName})
        </span>
      )}
    </div>
  )
}

/**
 * Simplified badge for inline use in lists
 */
export function NutritionSourceBadgeInline({
  source,
  needsVerification = false,
  className,
}: {
  source: NutritionSource
  needsVerification?: boolean
  className?: string
}) {
  const { t } = useTranslation('vision')

  // Simplified icon-only badges for inline display
  const getConfig = () => {
    switch (source) {
      case 'usda_verified':
        return {
          icon: Check,
          color: 'text-green-600',
          title: t('source.usda'),
        }
      case 'usda_translation':
        return {
          icon: Database,
          color: 'text-blue-600',
          title: t('source.usdaTranslation'),
        }
      case 'local_database':
      case 'database':
        return {
          icon: Database,
          color: 'text-green-600',
          title: t('source.local'),
        }
      case 'manual':
        return {
          icon: Edit3,
          color: 'text-blue-600',
          title: t('source.manual'),
        }
      case 'ai_estimated':
      case 'ai':
      default:
        return {
          icon: Sparkles,
          color: 'text-orange-500',
          title: t('source.ai'),
        }
    }
  }

  const config = getConfig()
  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} title={config.title}>
      <Icon className={cn('h-3 w-3', config.color)} />
      {needsVerification && (
        <span title={t('source.needsVerification')}>
          <AlertTriangle className="h-3 w-3 text-yellow-500" />
        </span>
      )}
    </span>
  )
}
