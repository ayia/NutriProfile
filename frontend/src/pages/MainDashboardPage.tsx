import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { dashboardApi } from '@/services/dashboardApi'
import { HeroCard } from '@/components/dashboard/HeroCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ScannerCard } from '@/components/dashboard/ScannerCard'
import { CoachCard } from '@/components/dashboard/CoachCard'
import { WeeklyChart } from '@/components/dashboard/WeeklyChart'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { HealthAlerts } from '@/components/dashboard/HealthAlerts'
import { PersonalizedInsights } from '@/components/dashboard/PersonalizedInsights'
import { ProfileSummaryBanner } from '@/components/dashboard/ProfileSummaryBanner'
import { WaterForm } from '@/components/tracking/WaterForm'
import { Button } from '@/components/ui/Button'
import { DashboardTour } from '@/components/onboarding/DashboardTour'
import { TrialBanner } from '@/components/subscription/TrialBanner'
import {
  Zap,
  Trophy,
  TrendingUp,
  Droplets,
  XCircle,
  BarChart3,
  X,
  getStreakIcon,
  STREAK_COLORS,
} from '@/lib/icons'

export function MainDashboardPage() {
  const { t } = useTranslation('dashboard')
  const [showWaterModal, setShowWaterModal] = useState(false)
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboard,
    refetchInterval: 60000,
    retry: 1,
  })

  const data = dashboardQuery.data

  if (dashboardQuery.isLoading) {
    return <DashboardSkeleton />
  }

  if (dashboardQuery.isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="card-elevated p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="body-lg text-neutral-600 mb-2">{t('error.loading')}</p>
          <p className="text-error-600 text-sm mb-4">
            {dashboardQuery.error instanceof Error ? dashboardQuery.error.message : t('error.unknown')}
          </p>
          <Button onClick={() => dashboardQuery.refetch()}>
            {t('error.retry')}
          </Button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="card-elevated p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-primary-500" />
          </div>
          <p className="body-lg text-neutral-600 mb-4">{t('error.noData')}</p>
          <Button onClick={() => dashboardQuery.refetch()}>
            {t('error.retry')}
          </Button>
        </div>
      </div>
    )
  }

  const personalization = data.personalization

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Tour guidé pour les nouveaux utilisateurs */}
      <DashboardTour />

      {/* Bannière de trial Premium 14 jours */}
      <TrialBanner />

      {/* Bannière de profil personnalisée */}
      {personalization && (
        <ProfileSummaryBanner
          summary={personalization.profile_summary}
          healthContext={personalization.health_context}
          userName={data.user_name}
        />
      )}

      {/* Alertes de santé prioritaires */}
      {personalization?.health_alerts && personalization.health_alerts.length > 0 && (
        <HealthAlerts alerts={personalization.health_alerts} />
      )}

      {/* Hero Card - Stats principales avec les 4 macros */}
      <HeroCard
        userName={data.user_name}
        quickStats={data.quick_stats}
        userStats={data.user_stats}
        notifications={data.notifications}
        unreadCount={data.unread_notifications}
        onWaterClick={() => setShowWaterModal(true)}
        uiConfig={personalization?.ui_config}
      />

      {/* Actions rapides - scroll horizontal */}
      <QuickActions onWaterClick={() => setShowWaterModal(true)} />

      {/* Scanner + Coach cote a cote */}
      <div className="grid md:grid-cols-2 gap-4">
        <ScannerCard />
        {data.coach_advice && <CoachCard advice={data.coach_advice} />}
      </div>

      {/* Insights personnalisés */}
      {personalization?.insights && personalization.insights.length > 0 && (
        <PersonalizedInsights insights={personalization.insights} />
      )}

      {/* Graphique de la semaine */}
      <WeeklyChart />

      {/* Streaks et Achievements */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Streaks */}
        <div className="card-elevated p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h3 className="heading-4">{t('streak.title')}</h3>
          </div>
          {data.active_streaks.length === 0 ? (
            <p className="body-md">
              {t('streak.noStreaks')}
            </p>
          ) : (
            <div className="space-y-3">
              {data.active_streaks.map((streak) => {
                const StreakIcon = getStreakIcon(streak.streak_type)
                const colorClass = STREAK_COLORS[streak.streak_type] || STREAK_COLORS.default
                const name = t(`streakTypes.${streak.streak_type}`, { defaultValue: streak.streak_type })
                return (
                  <div
                    key={streak.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-accent-50 to-warning-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <StreakIcon className={`w-5 h-5 ${colorClass}`} />
                      </div>
                      <span className="font-medium text-neutral-700">{name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-accent-600">
                        {streak.current_count} {t('streak.days')}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {t('streak.record')}: {streak.best_count}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Achievements recents */}
        <div className="card-elevated p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-sm">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <h3 className="heading-4">{t('achievements.title')}</h3>
          </div>
          {data.recent_achievements.length === 0 ? (
            <p className="body-md">
              {t('achievements.noAchievements')}
            </p>
          ) : (
            <div className="space-y-3">
              {data.recent_achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    !achievement.seen
                      ? 'bg-gradient-to-r from-warning-50 to-accent-50 shadow-sm'
                      : 'bg-neutral-50'
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-sm">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-neutral-800 truncate">{achievement.name}</div>
                    <div className="text-xs text-neutral-500 truncate">
                      {achievement.description}
                    </div>
                  </div>
                  <span className="badge-primary">
                    +{achievement.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats globales - version compacte */}
      <div className="card-elevated p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-sm">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h3 className="heading-4">{t('journey.title')}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { value: data.user_stats.total_meals_logged, label: t('journey.meals'), color: 'text-primary-600', bg: 'bg-primary-50' },
            { value: data.user_stats.total_activities, label: t('journey.activities'), color: 'text-accent-600', bg: 'bg-accent-50' },
            { value: data.user_stats.total_recipes_generated, label: t('journey.recipes'), color: 'text-secondary-600', bg: 'bg-secondary-50' },
            { value: data.user_stats.total_photos_analyzed, label: t('journey.photos'), color: 'text-primary-600', bg: 'bg-primary-50' },
            { value: data.user_stats.achievements_count, label: t('journey.achievements'), color: 'text-warning-600', bg: 'bg-warning-50' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center`}>
              <div className={`text-lg sm:text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-neutral-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Water Modal */}
      {showWaterModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="card-elevated w-full max-w-[calc(100vw-24px)] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                    <Droplets className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="heading-3">{t('water.title')}</h3>
                </div>
                <button
                  onClick={() => setShowWaterModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
              <WaterForm
                onSuccess={() => setShowWaterModal(false)}
                onCancel={() => setShowWaterModal(false)}
                currentWater={data.quick_stats.water_today}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
