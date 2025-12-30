import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, Loader2, Sparkles, Shield, Clock, Users, Star, Check, X,
  Camera, ChefHat, Bot, BarChart3, Download, Headphones
} from 'lucide-react'
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

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5 text-primary-500" />
                <span className="font-semibold">10,000+</span>
                <span>{t('socialProof.users')}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 font-semibold">4.9/5</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-5 h-5 text-green-500" />
                <span>{t('socialProof.guarantee')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm">
            <Shield className="w-4 h-4" />
            {t('trustBadges.moneyBack')}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm">
            <Clock className="w-4 h-4" />
            {t('trustBadges.cancelAnytime')}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full text-purple-700 text-sm">
            <Sparkles className="w-4 h-4" />
            {t('trustBadges.noHiddenFees')}
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
        <div className="grid md:grid-cols-3 gap-8 items-stretch mb-16">
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

        {/* Feature Comparison Table */}
        <div className="max-w-4xl mx-auto mb-20 reveal">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
            {t('comparison.title')}
          </h2>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">{t('comparison.feature')}</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-500">{t('free.name')}</th>
                    <th className="text-center py-4 px-4 font-semibold text-primary-600 bg-primary-50">{t('premium.name')}</th>
                    <th className="text-center py-4 px-4 font-semibold text-purple-600">{t('pro.name')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { feature: t('comparison.features.photoAnalysis'), free: '3/day', premium: true, pro: true, icon: Camera },
                    { feature: t('comparison.features.recipes'), free: '2/week', premium: '10/week', pro: true, icon: ChefHat },
                    { feature: t('comparison.features.aiCoach'), free: '1/day', premium: '5/day', pro: true, icon: Bot },
                    { feature: t('comparison.features.history'), free: '7 days', premium: '90 days', pro: true, icon: BarChart3 },
                    { feature: t('comparison.features.pdfExport'), free: false, premium: true, pro: true, icon: Download },
                    { feature: t('comparison.features.prioritySupport'), free: false, premium: true, pro: true, icon: Headphones },
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <row.icon className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{row.feature}</span>
                      </td>
                      <td className="text-center py-4 px-4">
                        {row.free === false ? (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : row.free === true ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-600 text-sm">{row.free}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4 bg-primary-50/50">
                        {row.premium === false ? (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : row.premium === true ? (
                          <Check className="w-5 h-5 text-primary-500 mx-auto" />
                        ) : (
                          <span className="text-primary-600 text-sm font-medium">{row.premium}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {row.pro === false ? (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : row.pro === true ? (
                          <div className="flex items-center justify-center gap-1">
                            <Check className="w-5 h-5 text-purple-500" />
                            <span className="text-purple-600 text-xs font-medium">{t('comparison.unlimited')}</span>
                          </div>
                        ) : (
                          <span className="text-purple-600 text-sm font-medium">{row.pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20 reveal">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
            {t('testimonials.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', role: t('testimonials.user1.role'), text: t('testimonials.user1.text'), rating: 5 },
              { name: 'Thomas R.', role: t('testimonials.user2.role'), text: t('testimonials.user2.text'), rating: 5 },
              { name: 'Julie D.', role: t('testimonials.user3.role'), text: t('testimonials.user3.text'), rating: 5 },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="glass-card p-6 hover-lift"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="max-w-2xl mx-auto mb-20 reveal">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('guarantee.title')}</h3>
            <p className="text-gray-600 max-w-md mx-auto">{t('guarantee.description')}</p>
          </div>
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
