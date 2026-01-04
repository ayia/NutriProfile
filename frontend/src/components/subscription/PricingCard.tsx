import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Loader2, Crown, Zap, Gift, Sparkles } from '@/lib/icons'
import { subscriptionApi } from '@/services/api'
import type { PricingPlan, SubscriptionTier, FullTierLimits } from '@/types'

interface PricingCardProps {
  plan: PricingPlan
  isYearly: boolean
  currentTier: SubscriptionTier
  limits?: FullTierLimits // Limites complètes provenant de l'API pour synchronisation
}

export function PricingCard({ plan, isYearly, currentTier, limits }: PricingCardProps) {
  const { t } = useTranslation('pricing')
  const [loading, setLoading] = useState(false)

  const price = isYearly ? plan.price_yearly : plan.price_monthly
  const variantId = isYearly ? plan.variant_id_yearly : plan.variant_id_monthly
  const isCurrentPlan = plan.tier === currentTier
  const isFree = plan.tier === 'free'
  const isPremium = plan.tier === 'premium'

  // Calculate monthly equivalent for yearly plans
  const monthlyEquivalent = isYearly && plan.price_yearly
    ? (plan.price_yearly / 12).toFixed(2)
    : null

  // Build translated features from API limits (synchronized with backend)
  const getTranslatedFeatures = (): string[] => {
    // Si on a les limites de l'API, les utiliser (synchronisé avec backend)
    if (limits) {
      const features: string[] = []

      // Vision analyses
      if (limits.vision_analyses.limit === -1) {
        features.push(t('features.vision_unlimited'))
      } else {
        features.push(t(`features.vision_${limits.vision_analyses.limit}`))
      }

      // Recipe generations
      if (limits.recipe_generations.limit === -1) {
        features.push(t('features.recipes_unlimited'))
      } else {
        features.push(t(`features.recipes_${limits.recipe_generations.limit}`))
      }

      // Coach messages
      if (limits.coach_messages.limit === -1) {
        features.push(t('features.coach_unlimited'))
      } else {
        features.push(t(`features.coach_${limits.coach_messages.limit}`))
      }

      // History days
      if (limits.history_days.limit === -1) {
        features.push(t('features.history_unlimited'))
      } else {
        features.push(t(`features.history_${limits.history_days.limit}`))
      }

      // Boolean features - only show if enabled (limit === 1)
      if (limits.advanced_stats?.limit === 1) {
        features.push(t('features.advanced_stats'))
      }
      if (limits.priority_support?.limit === 1) {
        features.push(t('features.priority_support'))
      }
      if (limits.export_pdf?.limit === 1) {
        features.push(t('features.export_pdf'))
      }
      if (limits.meal_plans?.limit === 1) {
        features.push(t('features.meal_plans'))
      }
      if (limits.dedicated_support?.limit === 1) {
        features.push(t('features.dedicated_support'))
      }
      if (limits.api_access?.limit === 1) {
        features.push(t('features.api_access'))
      }

      // Basic tracking only for free tier
      if (plan.tier === 'free') {
        features.push(t('features.basicTracking'))
      }

      return features
    }

    // Fallback: valeurs statiques si API non disponible
    switch (plan.tier) {
      case 'free':
        return [
          t('features.vision_3'),
          t('features.recipes_2'),
          t('features.coach_1'),
          t('features.history_7'),
          t('features.basicTracking'),
        ]
      case 'premium':
        return [
          t('features.vision_unlimited'),
          t('features.recipes_10'),
          t('features.coach_5'),
          t('features.history_90'),
          t('features.advanced_stats'),
          t('features.priority_support'),
        ]
      case 'pro':
        return [
          t('features.vision_unlimited'),
          t('features.recipes_unlimited'),
          t('features.coach_unlimited'),
          t('features.history_unlimited'),
          t('features.export_pdf'),
          t('features.meal_plans'),
          t('features.dedicated_support'),
        ]
      default:
        return plan.features
    }
  }

  const translatedFeatures = getTranslatedFeatures()

  const handleSubscribe = async () => {
    if (isFree || isCurrentPlan || !variantId) {
      console.log('Subscribe blocked:', { isFree, isCurrentPlan, variantId })
      return
    }

    setLoading(true)
    try {
      console.log('Creating checkout for variant:', variantId)
      const response = await subscriptionApi.createCheckout(variantId)
      console.log('Checkout response:', response)

      if (response?.checkout_url) {
        window.location.href = response.checkout_url
      } else {
        console.error('No checkout_url in response')
        alert(t('checkoutError', 'Payment service unavailable. Please try again.'))
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert(t('checkoutError', 'Payment service unavailable. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const getButtonText = () => {
    if (isCurrentPlan) return t('currentPlan')
    if (isFree) return t('freePlan')
    return t('subscribe')
  }

  return (
    <div
      className={`relative rounded-3xl p-8 h-full flex flex-col transition-all duration-300 ${
        isPremium
          ? 'bg-gradient-to-br from-primary-600 via-emerald-600 to-cyan-600 text-white shadow-2xl shadow-primary-500/40 scale-105 ring-4 ring-primary-200'
          : plan.popular
          ? 'border-2 border-primary-300 bg-primary-50/50 shadow-xl'
          : 'border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-md hover:shadow-lg'
      }`}
    >
      {/* Decorative elements for Premium */}
      {isPremium && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -z-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -z-10" />
        </>
      )}

      {/* Popular badge - enhanced */}
      {(plan.popular || isPremium) && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className={`px-4 py-1.5 text-sm font-bold rounded-full shadow-lg flex items-center gap-1.5 ${
            isPremium
              ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 animate-pulse'
              : 'bg-gradient-to-r from-primary-500 to-emerald-500 text-white'
          }`}>
            {isPremium && <Crown className="w-4 h-4" />}
            {t('popular')}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isPremium
            ? 'bg-white/20'
            : plan.tier === 'pro'
            ? 'bg-gradient-to-br from-purple-100 to-pink-100'
            : 'bg-gray-100 dark:bg-gray-700'
        }`}>
          {plan.tier === 'premium' && <Crown className="h-6 w-6 text-amber-300" />}
          {plan.tier === 'pro' && <Zap className="h-6 w-6 text-purple-500" />}
          {plan.tier === 'free' && <Gift className="h-6 w-6 text-gray-500 dark:text-gray-400" />}
        </div>
        <h3 className={`text-2xl font-bold ${isPremium ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
          {t(`${plan.tier}.name`)}
        </h3>
      </div>

      <p className={`text-sm mb-6 ${isPremium ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
        {t(`${plan.tier}.description`)}
      </p>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className={`text-5xl font-bold ${isPremium ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
            {price}€
          </span>
          {!isFree && (
            <span className={`text-lg ${isPremium ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
              /{isYearly ? t('year') : t('month')}
            </span>
          )}
        </div>

        {/* Monthly equivalent for yearly plans */}
        {isYearly && !isFree && monthlyEquivalent && (
          <div className="mt-2 space-y-1">
            <p className={`text-sm ${isPremium ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
              {t('monthlyEquivalent', { price: monthlyEquivalent })}
            </p>
            <p className={`text-sm font-semibold ${isPremium ? 'text-amber-300' : 'text-green-600 dark:text-green-400'}`}>
              {t('savePercent')}
            </p>
          </div>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
        {translatedFeatures.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
              isPremium ? 'bg-white/20' : 'bg-green-100 dark:bg-green-900/30'
            }`}>
              <Check className={`h-3 w-3 ${isPremium ? 'text-white' : 'text-green-600 dark:text-green-400'}`} />
            </div>
            <span className={`text-sm ${isPremium ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSubscribe}
        disabled={loading || isCurrentPlan || isFree}
        className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
          isCurrentPlan
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : isFree
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-default'
              : isPremium
                ? 'bg-white text-primary-700 hover:bg-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                : plan.popular
                  ? 'bg-gradient-to-r from-primary-500 to-emerald-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5'
                  : 'bg-gray-900 dark:bg-gray-600 text-white hover:bg-gray-800 dark:hover:bg-gray-500 shadow-md hover:shadow-lg'
        }`}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        ) : (
          <span className="flex items-center justify-center gap-2">
            {!isCurrentPlan && !isFree && <Sparkles className="w-5 h-5" />}
            {getButtonText()}
          </span>
        )}
      </button>

      {/* Cancel anytime disclaimer under CTA */}
      {!isFree && !isCurrentPlan && (
        <p className={`mt-3 text-center text-xs ${isPremium ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'}`}>
          {t('cancelAnytime')}
        </p>
      )}
    </div>
  )
}
