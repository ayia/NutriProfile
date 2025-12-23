import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/services/dashboardApi'
import { HeroCard } from '@/components/dashboard/HeroCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ScannerCard } from '@/components/dashboard/ScannerCard'
import { CoachCard } from '@/components/dashboard/CoachCard'
import { WeeklyChart } from '@/components/dashboard/WeeklyChart'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { WaterForm } from '@/components/tracking/WaterForm'
import { Button } from '@/components/ui/Button'
import { STREAK_LABELS } from '@/types/dashboard'

export function MainDashboardPage() {
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
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <p className="body-lg text-neutral-600 mb-2">Erreur lors du chargement du dashboard</p>
          <p className="text-error-600 text-sm mb-4">
            {dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Erreur inconnue'}
          </p>
          <Button onClick={() => dashboardQuery.refetch()}>
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="card-elevated p-8">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <p className="body-lg text-neutral-600 mb-4">Aucune donnée disponible</p>
          <Button onClick={() => dashboardQuery.refetch()}>
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Hero Card - Stats principales */}
      <HeroCard
        userName={data.user_name}
        quickStats={data.quick_stats}
        userStats={data.user_stats}
        notifications={data.notifications}
        unreadCount={data.unread_notifications}
        onWaterClick={() => setShowWaterModal(true)}
      />

      {/* Actions rapides - scroll horizontal */}
      <QuickActions onWaterClick={() => setShowWaterModal(true)} />

      {/* Scanner + Coach cote a cote */}
      <div className="grid md:grid-cols-2 gap-4">
        <ScannerCard />
        {data.coach_advice && <CoachCard advice={data.coach_advice} />}
      </div>

      {/* Graphique de la semaine */}
      <WeeklyChart />

      {/* Streaks et Achievements */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Streaks */}
        <div className="card-elevated p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center text-lg">
              🔥
            </span>
            <h3 className="heading-4">Séries en cours</h3>
          </div>
          {data.active_streaks.length === 0 ? (
            <p className="body-md">
              Aucune série active. Commence à suivre tes repas !
            </p>
          ) : (
            <div className="space-y-3">
              {data.active_streaks.map((streak) => {
                const info = STREAK_LABELS[streak.streak_type] || {
                  name: streak.streak_type,
                  icon: '🔥',
                }
                return (
                  <div
                    key={streak.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-accent-50 to-warning-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{info.icon}</span>
                      <span className="font-medium text-neutral-700">{info.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-accent-600">
                        {streak.current_count} jours
                      </div>
                      <div className="text-xs text-neutral-500">
                        Record: {streak.best_count}
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
            <span className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center text-lg">
              🏆
            </span>
            <h3 className="heading-4">Succès récents</h3>
          </div>
          {data.recent_achievements.length === 0 ? (
            <p className="body-md">
              Aucun succès encore. Continue pour en débloquer !
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
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-xl">{achievement.icon}</span>
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
          <span className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center text-lg">
            📈
          </span>
          <h3 className="heading-4">Ton parcours</h3>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {[
            { value: data.user_stats.total_meals_logged, label: 'Repas', color: 'text-primary-600', bg: 'bg-primary-50' },
            { value: data.user_stats.total_activities, label: 'Activités', color: 'text-accent-600', bg: 'bg-accent-50' },
            { value: data.user_stats.total_recipes_generated, label: 'Recettes', color: 'text-secondary-600', bg: 'bg-secondary-50' },
            { value: data.user_stats.total_photos_analyzed, label: 'Photos', color: 'text-primary-600', bg: 'bg-primary-50' },
            { value: data.user_stats.achievements_count, label: 'Succès', color: 'text-warning-600', bg: 'bg-warning-50' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center`}>
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-neutral-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Water Modal */}
      {showWaterModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card-elevated w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">💧</span>
                  </div>
                  <h3 className="heading-3">Ajouter de l'eau</h3>
                </div>
                <button
                  onClick={() => setShowWaterModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"/>
                    <path d="m6 6 12 12"/>
                  </svg>
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
