import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { subscriptionApi } from '@/services/api'
import { PricingCard } from '@/components/subscription/PricingCard'
import type { PricingPlan, SubscriptionTier } from '@/types'

export default function PricingPage() {
  const { t } = useTranslation('pricing')
  const { t: tCommon } = useTranslation('common')
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('free')
  const [isYearly, setIsYearly] = useState(true)
  const [loading, setLoading] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricingData, statusData] = await Promise.all([
          subscriptionApi.getPricing(),
          subscriptionApi.getStatus(),
        ])
        setPlans(pricingData.plans)
        setCurrentTier(statusData.tier)
      } catch (error) {
        console.error('Failed to fetch pricing:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Scroll reveal animation
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.reveal').forEach((el) => {
      observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-500 animate-pulse">Loading plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary-100/40 to-cyan-100/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-100/40 to-pink-100/40 rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 group transition-colors"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {tCommon('back')}
          </Link>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card text-primary-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {t('subtitle')}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              {t('title')}
            </h1>
          </div>
        </div>

        {/* Toggle Yearly/Monthly - Enhanced */}
        <div className="flex items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span
            className={`text-sm font-medium transition-colors ${!isYearly ? 'text-gray-900' : 'text-gray-400'}`}
          >
            {t('monthly')}
          </span>

          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
              isYearly ? 'bg-gradient-to-r from-primary-500 to-emerald-500 shadow-lg shadow-primary-500/30' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                isYearly ? 'translate-x-8' : 'translate-x-0'
              }`}
            />
          </button>

          <span
            className={`text-sm font-medium transition-colors flex items-center gap-2 ${isYearly ? 'text-gray-900' : 'text-gray-400'}`}
          >
            {t('yearly')}
            <span className="px-2 py-1 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
              -33%
            </span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch mb-20">
          {plans.map((plan, index) => (
            <div
              key={plan.tier}
              className="reveal"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <PricingCard
                plan={plan}
                isYearly={isYearly}
                currentTier={currentTier}
              />
            </div>
          ))}
        </div>

        {/* FAQ Section - Enhanced */}
        <div id="faq" className="max-w-3xl mx-auto reveal">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('faq')}
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'faq1q', a: 'faq1a' },
              { q: 'faq2q', a: 'faq2a' },
              { q: 'faq3q', a: 'faq3a' },
            ].map((faq, index) => (
              <div
                key={faq.q}
                className="glass-card p-6 hover-lift reveal"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    ?
                  </span>
                  {t(faq.q)}
                </h3>
                <p className="text-gray-600 ml-11 leading-relaxed">
                  {t(faq.a)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16 reveal">
          <div className="glass-card inline-block px-8 py-6">
            <p className="text-gray-600 mb-3">
              {t('questions')}
            </p>
            <a
              href="mailto:support@nutriprofile.app"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              {t('contact')}
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
