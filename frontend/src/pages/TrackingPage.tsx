import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { trackingApi } from '@/services/trackingApi'
import { profileApi } from '@/services/profileApi'
import { subscriptionApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { tokenStorage } from '@/services/api'
import { ProgressChart } from '@/components/tracking/ProgressChart'
import { ActivityForm } from '@/components/tracking/ActivityForm'
import { WeightForm } from '@/components/tracking/WeightForm'
import { GoalForm } from '@/components/tracking/GoalForm'
import { GoalCard } from '@/components/tracking/GoalCard'
import { WaterForm } from '@/components/tracking/WaterForm'
import { Button } from '@/components/ui/Button'
import { USAGE_QUERY_KEY } from '@/components/subscription/UsageBanner'
import { ACTIVITY_TYPES } from '@/types/tracking'
import {
  BarChart3,
  Activity,
  Scale,
  Target,
  TrendingUp,
  Droplets,
  Calendar,
  Trophy,
  AlertTriangle,
  RefreshCw,
  Plus,
  Flame,
  MessageSquare,
  Sparkles,
  Dumbbell,
  Lock,
  Zap,
  getActivityIcon,
  type LucideIcon,
} from '@/lib/icons'

type Tab = 'overview' | 'activities' | 'weight' | 'goals'
type Modal = 'activity' | 'weight' | 'goal' | 'water' | null

export function TrackingPage() {
  const { t, i18n } = useTranslation('tracking')
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [activeModal, setActiveModal] = useState<Modal>(null)
  const [chartPeriod, setChartPeriod] = useState<7 | 14 | 30>(7)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Auth state - only fetch if authenticated with valid tokens
  const { isAuthenticated } = useAuthStore()
  const hasToken = !!tokenStorage.getAccessToken()
  const canFetch = isAuthenticated && hasToken

  // Check subscription tier for advanced stats
  const usageQuery = useQuery({
    queryKey: USAGE_QUERY_KEY,
    queryFn: subscriptionApi.getUsage,
    staleTime: 30 * 1000,
    enabled: canFetch,
  })

  // Check if user has premium (any limit is -1 means premium/pro)
  const isPremium = usageQuery.data?.limits?.vision_analyses?.limit === -1

  const summaryQuery = useQuery({
    queryKey: ['tracking', 'summary'],
    queryFn: trackingApi.getSummary,
    retry: 1,
    enabled: canFetch,
  })

  // Debug: log query state
  useEffect(() => {
    console.log('summaryQuery state:', {
      status: summaryQuery.status,
      isLoading: summaryQuery.isLoading,
      isFetching: summaryQuery.isFetching,
      isError: summaryQuery.isError,
      isSuccess: summaryQuery.isSuccess,
      data: summaryQuery.data,
      error: summaryQuery.error,
    })
  }, [summaryQuery.status, summaryQuery.data, summaryQuery.error])

  const progressQuery = useQuery({
    queryKey: ['tracking', 'progress', chartPeriod],
    queryFn: () => trackingApi.getProgressData(chartPeriod),
    enabled: canFetch,
  })

  const activitiesQuery = useQuery({
    queryKey: ['activities'],
    queryFn: () => trackingApi.getActivities(),
    enabled: canFetch && activeTab === 'activities',
  })

  const weightsQuery = useQuery({
    queryKey: ['weight'],
    queryFn: () => trackingApi.getWeightLogs(),
    enabled: canFetch,
  })

  // Récupérer le profil pour les objectifs intelligents
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
    enabled: canFetch,
  })

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
  }, [activeTab, summaryQuery.data, activitiesQuery.data])

  const tabs: { id: Tab; label: string; IconComponent: LucideIcon }[] = [
    { id: 'overview', label: t('tabs.overview'), IconComponent: BarChart3 },
    { id: 'activities', label: t('tabs.activities'), IconComponent: Activity },
    { id: 'weight', label: t('tabs.weight'), IconComponent: Scale },
    { id: 'goals', label: t('tabs.goals'), IconComponent: Target },
  ]

  const summary = summaryQuery.data
  const progress = progressQuery.data

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background decorations - Responsive */}
      <div className="absolute top-20 right-0 w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] md:w-[500px] md:h-[500px] bg-gradient-to-br from-accent-100/40 to-amber-100/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[150px] h-[150px] sm:w-[280px] sm:h-[280px] md:w-[400px] md:h-[400px] bg-gradient-to-br from-primary-100/40 to-emerald-100/40 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card text-accent-700 text-sm font-medium mb-4">
            <Activity className="w-4 h-4 animate-pulse" />
            {t('subtitle')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            {t('title')}
          </h1>
        </div>

        {/* Tabs - Enhanced & Responsive */}
        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 animate-fade-in-up scrollbar-hide" style={{ animationDelay: '0.1s' }}>
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-accent-500 to-amber-500 text-white shadow-lg shadow-accent-500/30 scale-105'
                  : 'glass-card text-gray-600 hover:text-gray-900 hover:shadow-md hover:-translate-y-0.5'
              }`}
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <tab.IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === tab.id ? 'animate-bounce-soft' : ''}`} />
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview - Loading (isPending covers initial load, isFetching covers refetch) */}
        {activeTab === 'overview' && (summaryQuery.isPending || (summaryQuery.isFetching && !summaryQuery.data)) && (
          <div className="space-y-6 animate-pulse">
            {/* Skeleton for Today stats */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 bg-gray-100 rounded-2xl">
                    <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
            {/* Skeleton for Progress */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-64 bg-gray-100 rounded-2xl"></div>
            </div>
            {/* Skeleton for Week stats */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 bg-gray-100 rounded-2xl">
                    <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Overview - Error */}
        {activeTab === 'overview' && summaryQuery.isError && (
          <div className="glass-card p-12 text-center animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-error-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-error-500" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">{t('error.title', 'Erreur de chargement')}</h4>
            <p className="text-gray-500 mb-6">{t('error.loadFailed', 'Impossible de charger les données. Veuillez réessayer.')}</p>
            <button
              onClick={() => summaryQuery.refetch()}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-emerald-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" /> {t('error.retry', 'Réessayer')}
            </button>
          </div>
        )}

        {/* Overview - Data */}
        {activeTab === 'overview' && summary && (
          <div className="space-y-6">
            {/* Stats du jour - Enhanced */}
            <div className="glass-card p-6 reveal animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('today.title')}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                <div className="glass-primary p-3 sm:p-4 text-center hover-lift">
                  <div className="text-2xl sm:text-3xl font-bold text-primary-600">
                    {summary.today.calories_consumed}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1">{t('today.caloriesConsumed')}</div>
                </div>
                <div className="glass-accent p-3 sm:p-4 text-center hover-lift">
                  <div className="text-2xl sm:text-3xl font-bold text-accent-600">
                    {summary.today.calories_burned}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1">{t('today.caloriesBurned')}</div>
                </div>
                <div className="bg-warning-50/80 backdrop-blur border border-warning-100 rounded-2xl p-3 sm:p-4 text-center hover-lift">
                  <div className="text-2xl sm:text-3xl font-bold text-warning-600">
                    {summary.today.activity_minutes}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1">{t('today.activityMinutes')}</div>
                </div>
                <button
                  onClick={() => setActiveModal('water')}
                  className="bg-gradient-to-br from-cyan-50 to-blue-50 backdrop-blur border border-cyan-200 rounded-2xl p-3 sm:p-4 text-center hover-lift cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20 transition-all group"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-cyan-600 group-hover:scale-110 transition-transform">
                    {summary.today.water_ml}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1">{t('today.waterMl')}</div>
                  <div className="text-[10px] sm:text-xs text-cyan-500 mt-1 sm:mt-2 font-medium flex items-center justify-center gap-1">
                    <Droplets className="w-3 h-3 animate-pulse" /> {t('today.addWater')}
                  </div>
                </button>
              </div>
            </div>

            {/* Graphiques - Enhanced */}
            {progress && (
              <div className="glass-card p-6 reveal" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t('progress.title')}</h3>
                  </div>
                  <div className="flex gap-2 bg-gray-100/80 backdrop-blur-sm p-1 rounded-xl">
                    {([7, 14, 30] as const).map((days) => {
                      const isLocked = !isPremium && days > 7
                      return (
                        <button
                          key={days}
                          onClick={() => !isLocked && setChartPeriod(days)}
                          disabled={isLocked}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                            chartPeriod === days
                              ? 'bg-white text-gray-900 shadow-md'
                              : isLocked
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          title={isLocked ? t('advancedStats.locked') : undefined}
                        >
                          {t(`progress.days${days}`)}
                          {isLocked && <Lock className="w-3 h-3 text-gray-400" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-emerald-50 border border-primary-100">
                    <h4 className="text-sm font-semibold text-primary-700 mb-4 flex items-center gap-2">
                      <Flame className="w-4 h-4" /> {t('progress.calories')}
                    </h4>
                    <ProgressChart data={progress} metric="calories" color="#10B981" />
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-warning-50 to-amber-50 border border-warning-100">
                    <h4 className="text-sm font-semibold text-warning-700 mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> {t('progress.activityMinutes')}
                    </h4>
                    <ProgressChart data={progress} metric="activity_minutes" color="#F59E0B" />
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                    <h4 className="text-sm font-semibold text-indigo-700 mb-4 flex items-center gap-2">
                      <Scale className="w-4 h-4" /> {t('progress.weight')}
                    </h4>
                    <ProgressChart data={progress} metric="weight" color="#6366F1" />
                  </div>
                </div>
              </div>
            )}

            {/* Stats semaine - Enhanced */}
            <div className="glass-card p-6 reveal" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-warning-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('week.title')}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover-lift">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">{t('week.avgCalories')}</div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {Math.round(summary.week.avg_calories_consumed)}
                    <span className="text-xs sm:text-sm font-normal text-gray-400 ml-1">{t('common.kcal')}</span>
                  </div>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover-lift">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">{t('week.totalActivity')}</div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {summary.week.total_activity_minutes}
                    <span className="text-xs sm:text-sm font-normal text-gray-400 ml-1">{t('common.min')}</span>
                  </div>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover-lift">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">{t('week.totalSteps')}</div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {summary.week.total_steps.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover-lift">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">{t('week.weightChange')}</div>
                  <div className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${
                    summary.week.weight_change === null
                      ? 'text-gray-400'
                      : summary.week.weight_change > 0
                      ? 'text-error-500'
                      : summary.week.weight_change < 0
                      ? 'text-success-500'
                      : 'text-gray-900'
                  }`}>
                    {summary.week.weight_change !== null ? (
                      <>
                        <span className={summary.week.weight_change > 0 ? '' : summary.week.weight_change < 0 ? '' : ''}>
                          {summary.week.weight_change > 0 ? '↑' : summary.week.weight_change < 0 ? '↓' : '→'}
                        </span>
                        {Math.abs(summary.week.weight_change).toFixed(1)}
                        <span className="text-sm font-normal text-gray-400">{t('common.kg')}</span>
                      </>
                    ) : '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Répartition activités - Enhanced */}
            {summary.activity_breakdown.length > 0 && (
              <div className="glass-card p-6 reveal" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{t('activities.title')}</h3>
                </div>
                <div className="space-y-4">
                  {summary.activity_breakdown.map((activity, index) => {
                    const activityName = t(`activityForm.types.${activity.activity_type}`, { defaultValue: activity.name })
                    const percent = (activity.total_duration / summary.activity_breakdown[0].total_duration) * 100
                    return (
                      <div
                        key={activity.activity_type}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                      >
                        <div className="w-14 h-14 bg-gradient-to-br from-accent-100 to-amber-100 rounded-xl flex items-center justify-center">
                          {(() => {
                            const ActivityIcon = getActivityIcon(activity.activity_type)
                            return <ActivityIcon className="w-7 h-7 text-accent-600" />
                          })()}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-gray-900">{activityName}</span>
                            <span className="text-gray-500 font-medium">{activity.total_duration} {t('common.min')}</span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-accent-500 to-amber-500 rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1 bg-accent-100 rounded-full">
                          <span className="text-sm font-bold text-accent-700">{activity.count}</span>
                          <span className="text-xs text-accent-600">x</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Actions rapides - Enhanced */}
            <div className="flex flex-wrap gap-3 reveal" style={{ animationDelay: '0.6s' }}>
              <button
                onClick={() => setActiveModal('activity')}
                className="flex-1 min-w-[140px] px-6 py-4 bg-gradient-to-r from-accent-500 to-amber-500 text-white rounded-2xl font-semibold shadow-lg shadow-accent-500/30 hover:shadow-xl hover:shadow-accent-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Activity className="w-5 h-5" /> {t('actions.addActivity')}
              </button>
              <button
                onClick={() => setActiveModal('weight')}
                className="flex-1 min-w-[140px] px-6 py-4 glass-card text-gray-700 font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Scale className="w-5 h-5" /> {t('actions.addWeight')}
              </button>
              <button
                onClick={() => setActiveModal('water')}
                className="flex-1 min-w-[140px] px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Droplets className="w-5 h-5" /> {t('actions.addWater')}
              </button>
            </div>
          </div>
        )}

        {/* Activités */}
        {activeTab === 'activities' && (
          <div className="space-y-4">
            <div className="flex justify-end animate-fade-in">
              <button
                onClick={() => setActiveModal('activity')}
                className="px-6 py-3 bg-gradient-to-r from-accent-500 to-amber-500 text-white rounded-2xl font-semibold shadow-lg shadow-accent-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> {t('activities.newActivity')}
              </button>
            </div>

            {activitiesQuery.isLoading && (
              <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 mt-4 animate-pulse">Chargement...</p>
              </div>
            )}

            {activitiesQuery.data?.length === 0 && (
              <div className="glass-card p-8 animate-fade-in-up overflow-hidden relative">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-accent-100/50 to-amber-100/50 rounded-full blur-3xl -z-10" />

                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-accent-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent-500/30">
                    <Activity className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{t('activities.emptyState.title')}</h4>
                  <p className="text-gray-500 max-w-md mx-auto">{t('activities.emptyState.subtitle')}</p>
                </div>

                {/* Benefits */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-accent-50 to-amber-50 border border-accent-100">
                    <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center mb-3">
                      <Flame className="w-5 h-5 text-accent-600" />
                    </div>
                    <p className="text-sm text-gray-700">{t('activities.emptyState.benefits.calories')}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-emerald-50 border border-primary-100">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
                      <TrendingUp className="w-5 h-5 text-primary-600" />
                    </div>
                    <p className="text-sm text-gray-700">{t('activities.emptyState.benefits.progress')}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-warning-50 to-orange-50 border border-warning-100">
                    <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center mb-3">
                      <Trophy className="w-5 h-5 text-warning-600" />
                    </div>
                    <p className="text-sm text-gray-700">{t('activities.emptyState.benefits.motivation')}</p>
                  </div>
                </div>

                {/* Quick Start Suggestions */}
                <div className="mb-8">
                  <p className="text-sm font-medium text-gray-500 mb-3 text-center">{t('activities.emptyState.quickStart')}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => setActiveModal('activity')}
                      className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-accent-50 hover:border-accent-200 hover:text-accent-700 transition-all"
                    >
                      🚶 {t('activities.emptyState.suggestions.walking')}
                    </button>
                    <button
                      onClick={() => setActiveModal('activity')}
                      className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-accent-50 hover:border-accent-200 hover:text-accent-700 transition-all"
                    >
                      🏃 {t('activities.emptyState.suggestions.running')}
                    </button>
                    <button
                      onClick={() => setActiveModal('activity')}
                      className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-accent-50 hover:border-accent-200 hover:text-accent-700 transition-all"
                    >
                      💪 {t('activities.emptyState.suggestions.gym')}
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <Button onClick={() => setActiveModal('activity')} className="gap-2 px-8 py-3">
                    <Plus className="w-5 h-5" />
                    {t('activities.addActivity')}
                  </Button>
                </div>
              </div>
            )}

            {activitiesQuery.data?.map((activity, index) => {
              const activityInfo = ACTIVITY_TYPES[activity.activity_type] || ACTIVITY_TYPES.other
              const activityName = t(`activityForm.types.${activity.activity_type}`, { defaultValue: activityInfo.name })
              const intensityLabel = t(`activityForm.intensities.${activity.intensity}`, { defaultValue: activity.intensity })
              return (
                <div
                  key={activity.id}
                  className="glass-card p-5 hover-lift reveal"
                  style={{ animationDelay: `${0.05 * (index + 1)}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-amber-100 rounded-2xl flex items-center justify-center shadow-inner">
                      {(() => {
                        const ActivityIcon = getActivityIcon(activity.activity_type)
                        return <ActivityIcon className="w-8 h-8 text-accent-600" />
                      })()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-lg text-gray-900">{activityName}</span>
                        <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full text-xs font-medium text-gray-600">
                          {intensityLabel}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(activity.activity_date).toLocaleDateString(i18n.language, {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{activity.duration_minutes} <span className="text-sm font-normal text-gray-400">{t('common.min')}</span></div>
                      <div className="text-sm font-semibold text-accent-600 flex items-center justify-end gap-1">
                        <Flame className="w-4 h-4" /> {activity.calories_burned} {t('common.kcal')}
                      </div>
                    </div>
                  </div>
                  {activity.notes && (
                    <div className="mt-4 text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl border border-gray-100 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" /> {activity.notes}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Poids */}
        {activeTab === 'weight' && (
          <div className="space-y-4">
            <div className="flex justify-end animate-fade-in">
              <button
                onClick={() => setActiveModal('weight')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> {t('weight.newWeight')}
              </button>
            </div>

            {progress && (
              <div className="glass-card p-6 animate-fade-in-up reveal" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{t('weight.title')}</h3>
                </div>
                <ProgressChart data={progress} metric="weight" color="#6366F1" height={250} />
              </div>
            )}

            {weightsQuery.isLoading && (
              <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 mt-4 animate-pulse">Chargement...</p>
              </div>
            )}

            {weightsQuery.data?.length === 0 && (
              <div className="glass-card p-8 animate-fade-in-up overflow-hidden relative">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl -z-10" />

                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
                    <Scale className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{t('weight.emptyState.title')}</h4>
                  <p className="text-gray-500 max-w-md mx-auto">{t('weight.emptyState.subtitle')}</p>
                </div>

                {/* Benefits */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-3">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-sm text-gray-700">{t('weight.emptyState.benefits.trends')}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-700">{t('weight.emptyState.benefits.insights')}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100">
                    <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center mb-3">
                      <Target className="w-5 h-5 text-pink-600" />
                    </div>
                    <p className="text-sm text-gray-700">{t('weight.emptyState.benefits.goals')}</p>
                  </div>
                </div>

                {/* Pro Tip */}
                <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
                  <p className="text-sm text-indigo-700 flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    {t('weight.emptyState.tip')}
                  </p>
                </div>

                <div className="text-center">
                  <Button onClick={() => setActiveModal('weight')} className="gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                    <Plus className="w-5 h-5" />
                    {t('weight.emptyState.startNow')}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {weightsQuery.data?.map((log, index) => {
                const prev = weightsQuery.data?.[index + 1]
                const diff = prev ? log.weight_kg - prev.weight_kg : null

                return (
                  <div
                    key={log.id}
                    className="glass-card p-5 flex items-center justify-between hover-lift reveal"
                    style={{ animationDelay: `${0.05 * (index + 1)}s` }}
                  >
                    <div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(log.log_date).toLocaleDateString(i18n.language, {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {log.weight_kg} <span className="text-lg font-normal text-gray-400">{t('common.kg')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {diff !== null && (
                        <div className={`text-lg font-bold flex items-center gap-1 ${
                          diff > 0 ? 'text-error-500' : diff < 0 ? 'text-success-500' : 'text-gray-500'
                        }`}>
                          <span>{diff > 0 ? '↑' : diff < 0 ? '↓' : '→'}</span>
                          {Math.abs(diff).toFixed(1)} {t('common.kg')}
                        </div>
                      )}
                      {log.body_fat_percent && (
                        <div className="text-sm text-gray-500 mt-1">
                          {log.body_fat_percent}% {t('weight.bodyFat')}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Objectifs - Loading */}
        {activeTab === 'goals' && summaryQuery.isLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="flex justify-end">
              <div className="w-40 h-12 bg-gray-200 rounded-2xl"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="glass-card p-6">
                  <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
                  <div className="h-8 w-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Objectifs - Error */}
        {activeTab === 'goals' && summaryQuery.isError && (
          <div className="glass-card p-12 text-center animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-error-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-error-500" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">{t('error.title', 'Erreur de chargement')}</h4>
            <p className="text-gray-500 mb-6">{t('error.loadFailed', 'Impossible de charger les objectifs.')}</p>
            <button
              onClick={() => summaryQuery.refetch()}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-emerald-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" /> {t('error.retry', 'Réessayer')}
            </button>
          </div>
        )}

        {/* Objectifs - Data */}
        {activeTab === 'goals' && summary && (
          <div className="space-y-6">
            {/* Header avec bouton */}
            <div className="flex items-center justify-between animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('goals.title', 'Vos Objectifs')}</h2>
                <p className="text-gray-500 text-sm mt-1">{t('goals.subtitle', 'Suivez votre progression vers vos objectifs')}</p>
              </div>
              <button
                onClick={() => setActiveModal('goal')}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-emerald-500 text-white rounded-2xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> {t('goals.newGoal')}
              </button>
            </div>

            {/* Objectifs automatiques basés sur le profil */}
            {profileQuery.data && (
              <div className="glass-card p-6 reveal animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t('goals.profileBased', 'Objectifs basés sur votre profil')}</h3>
                    <p className="text-sm text-gray-500">{t('goals.profileBasedDesc', 'Ces objectifs sont calculés automatiquement')}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Objectif Poids */}
                  {profileQuery.data.target_weight_kg && profileQuery.data.weight_kg && (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                          <Scale className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{t('goals.weightGoal', 'Objectif Poids')}</h4>
                          <span className="text-xs text-indigo-600 font-medium">{t('goals.fromProfile', 'Depuis votre profil')}</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-3xl font-bold text-gray-900">{profileQuery.data.weight_kg}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-2xl font-bold text-indigo-600">{profileQuery.data.target_weight_kg}</span>
                        <span className="text-sm text-gray-400">kg</span>
                      </div>
                      <div className="relative h-3 bg-white/60 rounded-full overflow-hidden shadow-inner">
                        {(() => {
                          const current = profileQuery.data.weight_kg || 0
                          const target = profileQuery.data.target_weight_kg || current
                          const diff = Math.abs(current - target)
                          const startWeight = current > target ? target : current
                          const progress = diff === 0 ? 100 : Math.min(100, Math.max(0, ((current - startWeight) / diff) * 100))
                          const isLosingWeight = current > target
                          return (
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                isLosingWeight
                                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                  : 'bg-gradient-to-r from-green-500 to-emerald-500'
                              }`}
                              style={{ width: `${isLosingWeight ? 100 - progress : progress}%` }}
                            />
                          )
                        })()}
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {profileQuery.data.weight_kg > profileQuery.data.target_weight_kg
                          ? `${(profileQuery.data.weight_kg - profileQuery.data.target_weight_kg).toFixed(1)} kg ${t('goals.tolose', 'à perdre')}`
                          : profileQuery.data.weight_kg < profileQuery.data.target_weight_kg
                          ? `${(profileQuery.data.target_weight_kg - profileQuery.data.weight_kg).toFixed(1)} kg ${t('goals.togain', 'à prendre')}`
                          : t('goals.achieved', 'Objectif atteint!')
                        }
                      </div>
                    </div>
                  )}

                  {/* Objectif Calories */}
                  {profileQuery.data.daily_calories && (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                          <Flame className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{t('goals.caloriesGoal', 'Calories quotidiennes')}</h4>
                          <span className="text-xs text-orange-600 font-medium">{t('goals.dailyTarget', 'Objectif journalier')}</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-3xl font-bold text-gray-900">{summary.today.calories_consumed}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-xl font-medium text-orange-600">{profileQuery.data.daily_calories}</span>
                        <span className="text-sm text-gray-400">kcal</span>
                      </div>
                      <div className="relative h-3 bg-white/60 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            summary.today.calories_consumed > profileQuery.data.daily_calories
                              ? 'bg-gradient-to-r from-red-500 to-rose-500'
                              : 'bg-gradient-to-r from-orange-500 to-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, (summary.today.calories_consumed / profileQuery.data.daily_calories) * 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {summary.today.calories_consumed < profileQuery.data.daily_calories
                          ? `${profileQuery.data.daily_calories - summary.today.calories_consumed} kcal ${t('goals.remaining', 'restantes')}`
                          : `${summary.today.calories_consumed - profileQuery.data.daily_calories} kcal ${t('goals.excess', 'en excès')}`
                        }
                      </div>
                    </div>
                  )}

                  {/* Objectif Protéines - Premium Only */}
                  {profileQuery.data.protein_g && (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 p-5">
                      {/* Premium Lock Overlay */}
                      {!isPremium && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                            <Lock className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-sm font-semibold text-gray-800 mb-1">{t('advancedStats.locked')}</p>
                          <p className="text-xs text-gray-500 text-center mb-3">{t('advancedStats.subtitle')}</p>
                          <Link
                            to="/pricing"
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
                          >
                            <Zap className="w-4 h-4" />
                            {t('advancedStats.unlock')}
                          </Link>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                          <Dumbbell className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{t('goals.proteinGoal', 'Protéines quotidiennes')}</h4>
                          <span className="text-xs text-rose-600 font-medium">{t('goals.dailyTarget', 'Objectif journalier')}</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-3xl font-bold text-gray-900">{summary.today.protein_g || 0}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-xl font-medium text-rose-600">{profileQuery.data.protein_g}</span>
                        <span className="text-sm text-gray-400">g</span>
                      </div>
                      <div className="relative h-3 bg-white/60 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, ((summary.today.protein_g || 0) / profileQuery.data.protein_g) * 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {(summary.today.protein_g || 0) < profileQuery.data.protein_g
                          ? `${profileQuery.data.protein_g - (summary.today.protein_g || 0)}g ${t('goals.remaining', 'restantes')}`
                          : t('goals.achieved', 'Objectif atteint!')
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Objectifs personnalisés créés par l'utilisateur */}
            {summary.goals.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary-500" /> {t('goals.customGoals', 'Vos objectifs personnalisés')}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {summary.goals.map((goal, index) => (
                    <div
                      key={goal.id}
                      className="reveal"
                      style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                    >
                      <GoalCard goal={goal} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message si pas d'objectifs personnalisés et pas de profil */}
            {summary.goals.length === 0 && !profileQuery.data && (
              <div className="glass-card p-8 animate-fade-in-up overflow-hidden relative">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-100/50 to-emerald-100/50 rounded-full blur-3xl -z-10" />

                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{t('goals.emptyState.title')}</h4>
                  <p className="text-gray-500 max-w-md mx-auto">{t('goals.emptyState.subtitle')}</p>
                </div>

                {/* Benefits */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-emerald-50 border border-primary-100">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
                      <Target className="w-5 h-5 text-primary-600" />
                    </div>
                    <p className="text-sm text-gray-700">{t('goals.emptyState.benefits.focus')}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-sm text-gray-700">{t('goals.emptyState.benefits.track')}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                      <Trophy className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-sm text-gray-700">{t('goals.emptyState.benefits.celebrate')}</p>
                  </div>
                </div>

                {/* Popular Goals */}
                <div className="mb-8">
                  <p className="text-sm font-medium text-gray-500 mb-3 text-center">{t('goals.emptyState.popular')}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => setActiveModal('goal')}
                      className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all"
                    >
                      👟 {t('goals.emptyState.popularGoals.steps')}
                    </button>
                    <button
                      onClick={() => setActiveModal('goal')}
                      className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all"
                    >
                      💧 {t('goals.emptyState.popularGoals.water')}
                    </button>
                    <button
                      onClick={() => setActiveModal('goal')}
                      className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all"
                    >
                      ⏱️ {t('goals.emptyState.popularGoals.activity')}
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <Button onClick={() => setActiveModal('goal')} className="gap-2 px-8 py-3">
                    <Plus className="w-5 h-5" />
                    {t('goals.createGoal')}
                  </Button>
                </div>
              </div>
            )}

            {/* Encouragement pour créer des objectifs personnalisés */}
            {summary.goals.length === 0 && profileQuery.data && (
              <div className="glass-card p-6 text-center animate-fade-in-up border-dashed border-2 border-gray-300">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">{t('goals.addCustom', 'Ajoutez vos propres objectifs')}</h4>
                    <p className="text-sm text-gray-500">{t('goals.addCustomDesc', 'Créez des objectifs personnalisés pour suivre votre progression')}</p>
                  </div>
                  <Button onClick={() => setActiveModal('goal')} variant="outline" className="ml-auto">
                    {t('goals.createGoal')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals - Enhanced & Responsive */}
        {activeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-[calc(100vw-24px)] sm:max-w-md max-h-[90vh] overflow-y-auto border border-white/50 animate-scale-in">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                    activeModal === 'activity' ? 'bg-gradient-to-br from-accent-500 to-amber-500' :
                    activeModal === 'weight' ? 'bg-gradient-to-br from-indigo-500 to-purple-500' :
                    activeModal === 'goal' ? 'bg-gradient-to-br from-primary-500 to-emerald-500' :
                    'bg-gradient-to-br from-cyan-500 to-blue-500'
                  }`}>
                    {activeModal === 'activity' && <Activity className="w-6 h-6 text-white" />}
                    {activeModal === 'weight' && <Scale className="w-6 h-6 text-white" />}
                    {activeModal === 'goal' && <Target className="w-6 h-6 text-white" />}
                    {activeModal === 'water' && <Droplets className="w-6 h-6 text-white" />}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {activeModal === 'activity' && t('modal.newActivity')}
                    {activeModal === 'weight' && t('modal.newWeight')}
                    {activeModal === 'goal' && t('modal.newGoal')}
                    {activeModal === 'water' && t('modal.addWater')}
                  </h3>
                </div>

                {activeModal === 'activity' && (
                  <ActivityForm
                    onSuccess={() => setActiveModal(null)}
                    onCancel={() => setActiveModal(null)}
                  />
                )}

                {activeModal === 'weight' && (
                  <WeightForm
                    onSuccess={() => setActiveModal(null)}
                    onCancel={() => setActiveModal(null)}
                    currentWeight={weightsQuery.data?.[0]?.weight_kg}
                  />
                )}

                {activeModal === 'goal' && (
                  <GoalForm
                    onSuccess={() => setActiveModal(null)}
                    onCancel={() => setActiveModal(null)}
                  />
                )}

                {activeModal === 'water' && (
                  <WaterForm
                    onSuccess={() => setActiveModal(null)}
                    onCancel={() => setActiveModal(null)}
                    currentWater={summary?.today.water_ml}
                  />
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
