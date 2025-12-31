import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Lock, Crown, Sparkles } from 'lucide-react'

interface PremiumBadgeProps {
  variant?: 'inline' | 'corner' | 'overlay' | 'chip'
  size?: 'sm' | 'md' | 'lg'
  featureName?: string
  showLink?: boolean
  className?: string
  onClick?: () => void
}

export function PremiumBadge({
  variant = 'inline',
  size = 'md',
  featureName,
  showLink = true,
  className,
  onClick,
}: PremiumBadgeProps) {
  const { t } = useTranslation('common')

  const sizeClasses = {
    sm: {
      badge: 'px-2 py-0.5 text-xs gap-1',
      icon: 'w-3 h-3',
    },
    md: {
      badge: 'px-3 py-1 text-sm gap-1.5',
      icon: 'w-4 h-4',
    },
    lg: {
      badge: 'px-4 py-2 text-base gap-2',
      icon: 'w-5 h-5',
    },
  }

  const sizes = sizeClasses[size]

  // Inline badge (next to text)
  if (variant === 'inline') {
    const content = (
      <span
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          'bg-gradient-to-r from-amber-400 to-orange-500 text-white',
          'shadow-sm hover:shadow-md transition-all',
          sizes.badge,
          className
        )}
        onClick={onClick}
      >
        <Crown className={sizes.icon} />
        <span>Premium</span>
      </span>
    )

    if (showLink && !onClick) {
      return <Link to="/pricing">{content}</Link>
    }
    return content
  }

  // Corner badge (positioned at corner of container)
  if (variant === 'corner') {
    const content = (
      <div
        className={cn(
          'absolute -top-1 -right-1 z-10',
          'bg-gradient-to-r from-amber-400 to-orange-500',
          'rounded-full shadow-lg',
          'flex items-center justify-center',
          size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8',
          'hover:scale-110 transition-transform cursor-pointer',
          className
        )}
        onClick={onClick}
        title={t('usage.upgradeToPremium')}
      >
        <Lock className={size === 'sm' ? 'w-3 h-3 text-white' : 'w-4 h-4 text-white'} />
      </div>
    )

    if (showLink && !onClick) {
      return <Link to="/pricing">{content}</Link>
    }
    return content
  }

  // Overlay badge (covers the parent with a locked overlay)
  if (variant === 'overlay') {
    const content = (
      <div
        className={cn(
          'absolute inset-0 z-10',
          'bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-transparent',
          'backdrop-blur-[1px]',
          'flex flex-col items-center justify-center gap-3',
          'cursor-pointer group transition-all',
          className
        )}
        onClick={onClick}
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
          <Lock className="w-7 h-7 text-white" />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-sm shadow-sm">
            {featureName || t('usage.upgrade')}
          </p>
          <p className="text-white/80 text-xs mt-1">
            {t('usage.upgradeToPremium')}
          </p>
        </div>
      </div>
    )

    if (showLink && !onClick) {
      return <Link to="/pricing" className="contents">{content}</Link>
    }
    return content
  }

  // Chip badge (small chip-style badge)
  if (variant === 'chip') {
    const content = (
      <span
        className={cn(
          'inline-flex items-center rounded-md font-medium',
          'bg-gradient-to-r from-violet-500 to-purple-600 text-white',
          'shadow-sm hover:shadow-md transition-all cursor-pointer',
          sizes.badge,
          className
        )}
        onClick={onClick}
      >
        <Sparkles className={sizes.icon} />
        <span>Pro</span>
      </span>
    )

    if (showLink && !onClick) {
      return <Link to="/pricing">{content}</Link>
    }
    return content
  }

  return null
}

// Wrapper component for locked features
interface LockedFeatureProps {
  isLocked: boolean
  featureName?: string
  children: React.ReactNode
  className?: string
  onUnlock?: () => void
}

export function LockedFeature({
  isLocked,
  featureName,
  children,
  className,
  onUnlock,
}: LockedFeatureProps) {
  if (!isLocked) {
    return <>{children}</>
  }

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      {/* Slightly faded content */}
      <div className="opacity-60 pointer-events-none select-none">
        {children}
      </div>

      {/* Overlay */}
      <PremiumBadge
        variant="overlay"
        featureName={featureName}
        showLink={!onUnlock}
        onClick={onUnlock}
      />
    </div>
  )
}

// Feature teaser card - shows a preview of a premium feature
interface FeatureTeaserProps {
  title: string
  description: string
  icon: React.ReactNode
  tier?: 'premium' | 'pro'
  className?: string
}

export function FeatureTeaser({
  title,
  description,
  icon,
  tier = 'premium',
  className,
}: FeatureTeaserProps) {
  const { t } = useTranslation('common')

  const tierConfig = {
    premium: {
      gradient: 'from-amber-400 to-orange-500',
      badgeGradient: 'from-amber-100 to-orange-100',
      textColor: 'text-amber-700',
      Icon: Crown,
    },
    pro: {
      gradient: 'from-violet-500 to-purple-600',
      badgeGradient: 'from-violet-100 to-purple-100',
      textColor: 'text-violet-700',
      Icon: Sparkles,
    },
  }

  const config = tierConfig[tier]

  return (
    <Link
      to="/pricing"
      className={cn(
        'block relative overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900',
        'border border-gray-200 dark:border-gray-700',
        'p-6 transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1 hover:border-transparent',
        `hover:shadow-${tier === 'pro' ? 'violet' : 'amber'}-500/20`,
        'group cursor-pointer',
        className
      )}
    >
      {/* Decorative gradient corner */}
      <div
        className={cn(
          'absolute top-0 right-0 w-32 h-32',
          `bg-gradient-to-br ${config.gradient}`,
          'opacity-10 rounded-bl-full',
          'group-hover:opacity-20 transition-opacity'
        )}
      />

      {/* Badge */}
      <div
        className={cn(
          'absolute top-4 right-4',
          `bg-gradient-to-r ${config.badgeGradient}`,
          'px-3 py-1.5 rounded-full',
          'flex items-center gap-1.5'
        )}
      >
        <config.Icon className={cn('w-4 h-4', config.textColor)} />
        <span className={cn('text-xs font-semibold', config.textColor)}>
          {tier === 'pro' ? 'Pro' : 'Premium'}
        </span>
      </div>

      {/* Content */}
      <div className="relative">
        {/* Icon */}
        <div
          className={cn(
            'w-14 h-14 rounded-xl',
            `bg-gradient-to-br ${config.gradient}`,
            'flex items-center justify-center mb-4',
            'shadow-lg group-hover:scale-110 transition-transform'
          )}
        >
          {icon}
        </div>

        {/* Text */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {description}
        </p>

        {/* CTA */}
        <div
          className={cn(
            'inline-flex items-center gap-2',
            `${config.textColor} font-medium text-sm`,
            'group-hover:underline'
          )}
        >
          <Lock className="w-4 h-4" />
          {t('usage.upgradeToPremium')}
        </div>
      </div>
    </Link>
  )
}

export default PremiumBadge
