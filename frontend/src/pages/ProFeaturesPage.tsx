import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Crown, FileDown, Calendar, ArrowLeft } from 'lucide-react'
import { subscriptionApi } from '@/services/api'
import { ExportPDFCard } from '@/components/pro/ExportPDFCard'
import { MealPlanGenerator } from '@/components/pro/MealPlanGenerator'
import { UpgradeModal } from '@/components/subscription/UpgradeModal'

type TabType = 'export' | 'meal-plans'

export function ProFeaturesPage() {
  const { t } = useTranslation('pro')
  const [activeTab, setActiveTab] = useState<TabType>('meal-plans')
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const usage = await subscriptionApi.getUsage()
        setIsPro(usage.tier === 'pro')
      } catch (error) {
        console.error('Error checking subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSubscription()
  }, [])

  const tabs = [
    {
      id: 'meal-plans' as TabType,
      label: t('tabs.mealPlans'),
      icon: Calendar,
      color: 'purple',
    },
    {
      id: 'export' as TabType,
      label: t('tabs.export'),
      icon: FileDown,
      color: 'emerald',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/dashboard"
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6" />
              <h1 className="text-xl font-bold">
                {t('title')}
              </h1>
            </div>
          </div>

          {!isPro && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
              <p className="text-white/90 mb-3">
                {t('upgradeMessage')}
              </p>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 font-semibold rounded-xl hover:bg-white/90 transition-colors"
              >
                <Crown className="h-4 w-4" />
                {t('upgradeCta')}
              </Link>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {activeTab === 'export' && (
          <ExportPDFCard
            isPro={isPro}
            onUpgradeClick={() => setShowUpgradeModal(true)}
          />
        )}

        {activeTab === 'meal-plans' && (
          <MealPlanGenerator
            isPro={isPro}
            onUpgradeClick={() => setShowUpgradeModal(true)}
          />
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="recipe_generations"
      />
    </div>
  )
}
