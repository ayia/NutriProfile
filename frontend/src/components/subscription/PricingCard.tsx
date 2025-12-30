import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Loader2, Crown, Zap, Gift } from '@/lib/icons'
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

  const getButtonText = () => {
    if (isCurrentPlan) return t('pricing.currentPlan', 'Plan actuel')
    if (isFree) return t('pricing.free', 'Gratuit')
    return t('pricing.subscribe', "S'abonner")
  }

  const isPremium = plan.tier === 'premium'

  return (
    <div
      className={`relative rounded-3xl p-8 h-full flex flex-col transition-all duration-300 ${
        isPremium
          ? 'bg-gradient-to-br from-primary-600 via-emerald-600 to-cyan-600 text-white shadow-2xl shadow-primary-500/40 scale-105 ring-4 ring-primary-200'
          : plan.popular
          ? 'border-2 border-primary-300 bg-primary-50/50 shadow-xl'
          : 'border border-gray-200 bg-white shadow-md hover:shadow-lg'
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
            {t('pricing.popular', 'Populaire')}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isPremium
            ? 'bg-white/20'
            : plan.tier === 'pro'
            ? 'bg-gradient-to-br from-purple-100 to-pink-100'
            : 'bg-gray-100'
        }`}>
          {plan.tier === 'premium' && <Crown className="h-6 w-6 text-amber-300" />}
          {plan.tier === 'pro' && <Zap className="h-6 w-6 text-purple-500" />}
          {plan.tier === 'free' && <Gift className="h-6 w-6 text-gray-500" />}
        </div>
        <h3 className={`text-2xl font-bold ${isPremium ? 'text-white' : 'text-gray-900'}`}>
          {plan.name}
        </h3>
      </div>

      <p className={`text-sm mb-6 ${isPremium ? 'text-white/80' : 'text-gray-600'}`}>
        {plan.description}
      </p>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className={`text-5xl font-bold ${isPremium ? 'text-white' : 'text-gray-900'}`}>
            {price}€
          </span>
          {!isFree && (
            <span className={`text-lg ${isPremium ? 'text-white/70' : 'text-gray-500'}`}>
              /{isYearly ? t('pricing.year', 'an') : t('pricing.month', 'mois')}
            </span>
          )}
        </div>
        {isYearly && !isFree && (
          <p className={`text-sm mt-2 font-medium ${isPremium ? 'text-amber-300' : 'text-green-600'}`}>
            {t('pricing.savePercent', 'Economisez 33%')}
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
              isPremium ? 'bg-white/20' : 'bg-green-100'
            }`}>
              <Check className={`h-3 w-3 ${isPremium ? 'text-white' : 'text-green-600'}`} />
            </div>
            <span className={`text-sm ${isPremium ? 'text-white/90' : 'text-gray-700'}`}>
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
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : isFree
              ? 'bg-gray-100 text-gray-700 cursor-default'
              : isPremium
                ? 'bg-white text-primary-700 hover:bg-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                : plan.popular
                  ? 'bg-gradient-to-r from-primary-500 to-emerald-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5'
                  : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg'
        }`}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        ) : (
          <span className="flex items-center justify-center gap-2">
            {isPremium && !isCurrentPlan && <Crown className="w-5 h-5" />}
            {getButtonText()}
          </span>
        )}
      </button>
    </div>
  )
}
