import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Loader2, Crown, Zap } from 'lucide-react'
import { subscriptionApi } from '@/services/api'
import type { PricingPlan, SubscriptionTier } from '@/types'

interface PricingCardProps {
  plan: PricingPlan
  isYearly: boolean
  currentTier: SubscriptionTier
}

export function PricingCard({ plan, isYearly, currentTier }: PricingCardProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  const price = isYearly ? plan.price_yearly : plan.price_monthly
  const variantId = isYearly ? plan.variant_id_yearly : plan.variant_id_monthly
  const isCurrentPlan = plan.tier === currentTier
  const isFree = plan.tier === 'free'

  const handleSubscribe = async () => {
    if (isFree || isCurrentPlan || !variantId) return

    setLoading(true)
    try {
      const { checkout_url } = await subscriptionApi.createCheckout(variantId)
      window.location.href = checkout_url
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierIcon = () => {
    switch (plan.tier) {
      case 'premium':
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 'pro':
        return <Zap className="h-6 w-6 text-purple-500" />
      default:
        return null
    }
  }

  const getButtonText = () => {
    if (isCurrentPlan) return t('pricing.currentPlan', 'Plan actuel')
    if (isFree) return t('pricing.free', 'Gratuit')
    return t('pricing.subscribe', "S'abonner")
  }

  return (
    <div
      className={`relative rounded-2xl p-6 ${
        plan.popular
          ? 'border-2 border-primary bg-primary/5 shadow-lg scale-105'
          : 'border border-gray-200 bg-white'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
            {t('pricing.popular', 'Populaire')}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        {getTierIcon()}
        <h3 className="text-xl font-bold">{plan.name}</h3>
      </div>

      <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

      <div className="mb-6">
        <span className="text-4xl font-bold">{price}€</span>
        {!isFree && (
          <span className="text-gray-500 ml-1">
            /{isYearly ? t('pricing.year', 'an') : t('pricing.month', 'mois')}
          </span>
        )}
        {isYearly && !isFree && (
          <p className="text-sm text-green-600 mt-1">
            {t('pricing.savePercent', 'Économisez 33%')}
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSubscribe}
        disabled={loading || isCurrentPlan || isFree}
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
          isCurrentPlan
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : isFree
              ? 'bg-gray-100 text-gray-700 cursor-default'
              : plan.popular
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        ) : (
          getButtonText()
        )}
      </button>
    </div>
  )
}
