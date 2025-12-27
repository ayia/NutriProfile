import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { trackingApi } from '@/services/trackingApi'
import { ProgressChart } from '@/components/tracking/ProgressChart'
import { ActivityForm } from '@/components/tracking/ActivityForm'
import { WeightForm } from '@/components/tracking/WeightForm'
import { GoalForm } from '@/components/tracking/GoalForm'
import { GoalCard } from '@/components/tracking/GoalCard'
import { WaterForm } from '@/components/tracking/WaterForm'
import { Button } from '@/components/ui/Button'
import { ACTIVITY_TYPES } from '@/types/tracking'

type Tab = 'overview' | 'activities' | 'weight' | 'goals'
type Modal = 'activity' | 'weight' | 'goal' | 'water' | null

export function TrackingPage() {
  const { t, i18n } = useTranslation('tracking')
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [activeModal, setActiveModal] = useState<Modal>(null)
  const [chartPeriod, setChartPeriod] = useState<7 | 14 | 30>(30)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const summaryQuery = useQuery({
    queryKey: ['tracking', 'summary'],
    queryFn: trackingApi.getSummary,
  })

  const progressQuery = useQuery({
    queryKey: ['tracking', 'progress', chartPeriod],
    queryFn: () => trackingApi.getProgressData(chartPeriod),
  })

  const activitiesQuery = useQuery({
    queryKey: ['activities'],
    queryFn: () => trackingApi.getActivities(),
    enabled: activeTab === 'activities',
  })

  const weightsQuery = useQuery({
    queryKey: ['weight'],
    queryFn: () => trackingApi.getWeightLogs(),
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

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: t('tabs.overview'), icon: '📊' },
    { id: 'activities', label: t('tabs.activities'), icon: '🏃' },
    { id: 'weight', label: t('tabs.weight'), icon: '⚖️' },
    { id: 'goals', label: t('tabs.goals'), icon: '🎯' },
  ]

  const summary = summaryQuery.data
  const progress = progressQuery.data

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-accent-100/40 to-amber-100/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-primary-100/40 to-emerald-100/40 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card text-accent-700 text-sm font-medium mb-4">
            <span className="animate-pulse">🏃</span>
            {t('subtitle')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            {t('title')}
          </h1>
        </div>

        {/* Tabs - Enhanced */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-accent-500 to-amber-500 text-white shadow-lg shadow-accent-500/30 scale-105'
                  : 'glass-card text-gray-600 hover:text-gray-900 hover:shadow-md hover:-translate-y-0.5'
              }`}
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <span className={`text-lg ${activeTab === tab.id ? 'animate-bounce-soft' : ''}`}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && summary && (
          <div className="space-y-6">
            {/* Stats du jour - Enhanced */}
            <div className="glass-card p-6 reveal animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">📈</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('today.title')}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-primary p-4 text-center hover-lift">
                  <div className="text-3xl font-bold text-primary-600">
                    {summary.today.calories_consumed}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{t('today.caloriesConsumed')}</div>
                </div>
                <div className="glass-accent p-4 text-center hover-lift">
                  <div className="text-3xl font-bold text-accent-600">
                    {summary.today.calories_burned}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{t('today.caloriesBurned')}</div>
                </div>
                <div className="bg-warning-50/80 backdrop-blur border border-warning-100 rounded-2xl p-4 text-center hover-lift">
                  <div className="text-3xl font-bold text-warning-600">
                    {summary.today.activity_minutes}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{t('today.activityMinutes')}</div>
                </div>
                <button
                  onClick={() => setActiveModal('water')}
                  className="bg-gradient-to-br from-cyan-50 to-blue-50 backdrop-blur border border-cyan-200 rounded-2xl p-4 text-center hover-lift cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20 transition-all group"
                >
                  <div className="text-3xl font-bold text-cyan-600 group-hover:scale-110 transition-transform">
                    {summary.today.water_ml}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{t('today.waterMl')}</div>
                  <div className="text-xs text-cyan-500 mt-2 font-medium flex items-center justify-center gap-1">
                    <span className="animate-pulse">💧</span> {t('today.addWater')}
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
                      <span className="text-xl">📊</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t('progress.title')}</h3>
                  </div>
                  <div className="flex gap-2 bg-gray-100/80 backdrop-blur-sm p-1 rounded-xl">
                    {([7, 14, 30] as const).map((days) => (
                      <button
                        key={days}
                        onClick={() => setChartPeriod(days)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          chartPeriod === days
                            ? 'bg-white text-gray-900 shadow-md'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {t(`progress.days${days}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-emerald-50 border border-primary-100">
                    <h4 className="text-sm font-semibold text-primary-700 mb-4 flex items-center gap-2">
                      <span>🔥</span> {t('progress.calories')}
                    </h4>
                    <ProgressChart data={progress} metric="calories" color="#10B981" />
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-warning-50 to-amber-50 border border-warning-100">
                    <h4 className="text-sm font-semibold text-warning-700 mb-4 flex items-center gap-2">
                      <span>🏃</span> {t('progress.activityMinutes')}
                    </h4>
                    <ProgressChart data={progress} metric="activity_minutes" color="#F59E0B" />
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                    <h4 className="text-sm font-semibold text-indigo-700 mb-4 flex items-center gap-2">
                      <span>⚖️</span> {t('progress.weight')}
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
                  <span className="text-xl">📅</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('week.title')}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover-lift">
                  <div className="text-sm text-gray-500 mb-1">{t('week.avgCalories')}</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(summary.week.avg_calories_consumed)}
                    <span className="text-sm font-normal text-gray-400 ml-1">{t('common.kcal')}</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover-lift">
                  <div className="text-sm text-gray-500 mb-1">{t('week.totalActivity')}</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {summary.week.total_activity_minutes}
                    <span className="text-sm font-normal text-gray-400 ml-1">{t('common.min')}</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover-lift">
                  <div className="text-sm text-gray-500 mb-1">{t('week.totalSteps')}</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {summary.week.total_steps.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover-lift">
                  <div className="text-sm text-gray-500 mb-1">{t('week.weightChange')}</div>
                  <div className={`text-2xl font-bold flex items-center gap-2 ${
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
                    <span className="text-xl">🏆</span>
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
                          <span className="text-3xl">{activity.icon}</span>
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
                <span>🏃</span> {t('actions.addActivity')}
              </button>
              <button
                onClick={() => setActiveModal('weight')}
                className="flex-1 min-w-[140px] px-6 py-4 glass-card text-gray-700 font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <span>⚖️</span> {t('actions.addWeight')}
              </button>
              <button
                onClick={() => setActiveModal('water')}
                className="flex-1 min-w-[140px] px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <span>💧</span> {t('actions.addWater')}
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
                <span>➕</span> {t('activities.newActivity')}
              </button>
            </div>

            {activitiesQuery.isLoading && (
              <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 mt-4 animate-pulse">Chargement...</p>
              </div>
            )}

            {activitiesQuery.data?.length === 0 && (
              <div className="glass-card p-12 text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-gradient-to-br from-accent-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🏃</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{t('activities.noActivities')}</h4>
                <p className="text-gray-500 mb-6">Enregistrez vos activités pour suivre vos progrès</p>
                <Button onClick={() => setActiveModal('activity')} className="gap-2">
                  <span>➕</span>
                  {t('activities.addActivity')}
                </Button>
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
                      <span className="text-4xl">{activityInfo.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-lg text-gray-900">{activityName}</span>
                        <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full text-xs font-medium text-gray-600">
                          {intensityLabel}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span>📅</span>
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
                        <span>🔥</span> {activity.calories_burned} {t('common.kcal')}
                      </div>
                    </div>
                  </div>
                  {activity.notes && (
                    <div className="mt-4 text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl border border-gray-100">
                      💬 {activity.notes}
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
                <span>➕</span> {t('weight.newWeight')}
              </button>
            </div>

            {progress && (
              <div className="glass-card p-6 animate-fade-in-up reveal" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">📈</span>
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
              <div className="glass-card p-12 text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">⚖️</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{t('weight.noWeight')}</h4>
                <p className="text-gray-500 mb-6">Enregistrez votre poids pour suivre votre progression</p>
                <Button onClick={() => setActiveModal('weight')} className="gap-2">
                  <span>➕</span>
                  {t('weight.addWeight')}
                </Button>
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
                        <span>📅</span>
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

        {/* Objectifs */}
        {activeTab === 'goals' && summary && (
          <div className="space-y-4">
            <div className="flex justify-end animate-fade-in">
              <button
                onClick={() => setActiveModal('goal')}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-emerald-500 text-white rounded-2xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span>➕</span> {t('goals.newGoal')}
              </button>
            </div>

            {summary.goals.length === 0 && (
              <div className="glass-card p-12 text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🎯</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{t('goals.noGoals')}</h4>
                <p className="text-gray-500 mb-6">Définissez vos objectifs pour rester motivé</p>
                <Button onClick={() => setActiveModal('goal')} className="gap-2">
                  <span>➕</span>
                  {t('goals.createGoal')}
                </Button>
              </div>
            )}

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

        {/* Modals - Enhanced */}
        {activeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/50 animate-scale-in">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                    activeModal === 'activity' ? 'bg-gradient-to-br from-accent-500 to-amber-500' :
                    activeModal === 'weight' ? 'bg-gradient-to-br from-indigo-500 to-purple-500' :
                    activeModal === 'goal' ? 'bg-gradient-to-br from-primary-500 to-emerald-500' :
                    'bg-gradient-to-br from-cyan-500 to-blue-500'
                  }`}>
                    <span className="text-2xl">
                      {activeModal === 'activity' ? '🏃' :
                       activeModal === 'weight' ? '⚖️' :
                       activeModal === 'goal' ? '🎯' : '💧'}
                    </span>
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

        {/* Loading global */}
        {summaryQuery.isLoading && (
          <div className="glass-card p-12 text-center animate-fade-in">
            <div className="w-16 h-16 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-4 animate-pulse">{t('common.loading')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
