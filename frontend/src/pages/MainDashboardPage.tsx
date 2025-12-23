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
        <p className="text-gray-500">Erreur lors du chargement du dashboard</p>
        <p className="text-red-500 text-sm mt-2">
          {dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Erreur inconnue'}
        </p>
        <Button onClick={() => dashboardQuery.refetch()} className="mt-4">
          Reessayer
        </Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Aucune donnee disponible</p>
        <Button onClick={() => dashboardQuery.refetch()} className="mt-4">
          Reessayer
        </Button>
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
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
            <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              🔥
            </span>
            <span>Series en cours</span>
          </h3>
          {data.active_streaks.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Aucune serie active. Commence a suivre tes repas !
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
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{info.icon}</span>
                      <span className="font-medium text-gray-700">{info.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-orange-600">
                        {streak.current_count} jours
                      </div>
                      <div className="text-xs text-gray-500">
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
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
            <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              🏆
            </span>
            <span>Succes recents</span>
          </h3>
          {data.recent_achievements.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Aucun succes encore. Continue pour en debloquer !
            </p>
          ) : (
            <div className="space-y-3">
              {data.recent_achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    !achievement.seen
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-sm'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-xl">{achievement.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{achievement.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {achievement.description}
                    </div>
                  </div>
                  <div className="flex-shrink-0 bg-primary-100 text-primary-700 text-sm font-bold px-2 py-1 rounded-lg">
                    +{achievement.points}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats globales - version compacte */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
          <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            📈
          </span>
          <span>Ton parcours</span>
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {[
            { value: data.user_stats.total_meals_logged, label: 'Repas', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { value: data.user_stats.total_activities, label: 'Activites', color: 'text-orange-600', bg: 'bg-orange-50' },
            { value: data.user_stats.total_recipes_generated, label: 'Recettes', color: 'text-blue-600', bg: 'bg-blue-50' },
            { value: data.user_stats.total_photos_analyzed, label: 'Photos', color: 'text-purple-600', bg: 'bg-purple-50' },
            { value: data.user_stats.achievements_count, label: 'Succes', color: 'text-yellow-600', bg: 'bg-yellow-50' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center`}>
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Water Modal */}
      {showWaterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Ajouter de l'eau</h3>
                <button
                  onClick={() => setShowWaterModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
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
