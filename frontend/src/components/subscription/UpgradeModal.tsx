import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X, Camera, ChefHat, MessageSquare, Check, Sparkles, Shield, type LucideIcon } from '@/lib/icons'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature: 'vision_analyses' | 'recipe_generations' | 'coach_messages'
  used?: number
  limit?: number
}

const featureIcons: Record<string, LucideIcon> = {
  vision_analyses: Camera,
  recipe_generations: ChefHat,
  coach_messages: MessageSquare,
}

export function UpgradeModal({ isOpen, onClose, feature, used, limit }: UpgradeModalProps) {
  const { t } = useTranslation('common')
  const Icon = featureIcons[feature]

  // Close with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const featureTitle = t(`paywall.features.${feature}.title`)
  const benefits = [
    t(`paywall.features.${feature}.benefit1`),
    t(`paywall.features.${feature}.benefit2`),
    t(`paywall.features.${feature}.benefit3`),
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header gradient with positive framing */}
        <div className="bg-gradient-to-r from-primary-500 to-emerald-500 p-6 text-white relative overflow-hidden">
          {/* Sparkle decoration */}
          <div className="absolute top-2 right-16 opacity-50">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="absolute bottom-2 left-8 opacity-30">
            <Sparkles className="w-4 h-4 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label={t('actions.close')}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              {/* Positive framing - "You've discovered" instead of "Limit reached" */}
              <p className="text-white/80 text-sm font-medium">
                {t('paywall.discovered')}
              </p>
              <h2 className="text-xl font-bold">{featureTitle}</h2>
            </div>
          </div>

          {/* Usage info (subtle, not alarming) */}
          {used !== undefined && limit !== undefined && (
            <div className="mt-3 flex items-center gap-2 text-white/70 text-sm">
              <div className="flex gap-0.5">
                {Array.from({ length: limit }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < used ? 'bg-white/40' : 'bg-white'
                    }`}
                  />
                ))}
              </div>
              <span>{t('paywall.usageInfo', { used, limit })}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Benefits list */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              {t('paywall.unlockWith')}
            </p>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-full flex items-center justify-center text-white mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing teaser */}
          <div className="bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-900/20 dark:to-emerald-900/20 rounded-xl p-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('paywall.pricing.from')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  4,99€<span className="text-sm font-normal text-gray-500 dark:text-gray-400">{t('paywall.pricing.perMonth')}</span>
                </p>
              </div>
              <span className="px-3 py-1 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-xs font-bold rounded-full">
                {t('paywall.pricing.savePercent', { percent: 33 })}
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Link
              to="/pricing"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-gradient-to-r from-primary-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              {t('paywall.startFreeTrial')}
            </Link>
            <button
              onClick={onClose}
              className="w-full py-3 px-4 text-gray-600 dark:text-gray-400 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {t('paywall.maybeLater')}
            </button>
          </div>

          {/* Cancellation disclaimer - builds trust */}
          <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            {t('paywall.cancelAnytime')}
          </p>
        </div>
      </div>
    </div>
  )
}
