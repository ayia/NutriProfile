import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { dashboardApi } from '@/services/dashboardApi'
import { CoachCard } from '@/components/dashboard/CoachCard'
import { StatsRing } from '@/components/dashboard/StatsRing'
import { LevelProgress } from '@/components/dashboard/LevelProgress'
import { NotificationBell } from '@/components/dashboard/NotificationBell'
import { Button } from '@/components/ui/Button'
import { STREAK_LABELS } from '@/types/dashboard'

export function MainDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboard,
    refetchInterval: 60000, // Refresh toutes les minutes
  })

  const data = dashboardQuery.data

  if (dashboardQuery.isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Erreur lors du chargement du dashboard</p>
        <Button onClick={() => dashboardQuery.refetch()} className="mt-4">
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {data.user_name} !
          </h1>
          <p className="text-gray-600">
            {data.quick_stats.streak_days > 0
              ? `🔥 ${data.quick_stats.streak_days} jours de suite !`
              : 'Commençons une nouvelle journée !'}
          </p>
        </div>
        <NotificationBell
          notifications={data.notifications}
          unreadCount={data.unread_notifications}
        />
      </div>

      {/* Niveau et XP */}
      <LevelProgress stats={data.user_stats} />

      {/* Stats du jour */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold mb-4">Aujourd'hui</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatsRing
            value={data.quick_stats.calories_today}
            max={data.quick_stats.calories_target}
            label="Calories"
            unit="kcal"
            icon="🔥"
          />
          <StatsRing
            value={data.quick_stats.protein_today}
            max={data.quick_stats.protein_target}
            label="Protéines"
            unit="g"
            icon="💪"
          />
          <StatsRing
            value={data.quick_stats.water_today}
            max={data.quick_stats.water_target}
            label="Eau"
            unit="ml"
            icon="💧"
          />
          <StatsRing
            value={data.quick_stats.activity_today}
            max={data.quick_stats.activity_target}
            label="Activité"
            unit="min"
            icon="🏃"
          />
        </div>
      </div>

      {/* Coach */}
      {data.coach_advice && <CoachCard advice={data.coach_advice} />}

      {/* Actions rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          to="/vision"
          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow text-center"
        >
          <span className="text-3xl">📸</span>
          <div className="text-sm font-medium mt-2">Scanner repas</div>
        </Link>
        <Link
          to="/recipes"
          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow text-center"
        >
          <span className="text-3xl">🍳</span>
          <div className="text-sm font-medium mt-2">Recettes</div>
        </Link>
        <Link
          to="/tracking"
          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow text-center"
        >
          <span className="text-3xl">🏃</span>
          <div className="text-sm font-medium mt-2">Activités</div>
        </Link>
        <Link
          to="/tracking?tab=weight"
          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow text-center"
        >
          <span className="text-3xl">⚖️</span>
          <div className="text-sm font-medium mt-2">Poids</div>
        </Link>
      </div>

      {/* Streaks et Achievements */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Streaks */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>🔥</span>
            <span>Séries en cours</span>
          </h3>
          {data.active_streaks.length === 0 ? (
            <p className="text-gray-500 text-sm">
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
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{info.icon}</span>
                      <span className="font-medium">{info.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary-600">
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

        {/* Achievements récents */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>🏆</span>
            <span>Succès récents</span>
          </h3>
          {data.recent_achievements.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Aucun succès encore. Continue pour en débloquer !
            </p>
          ) : (
            <div className="space-y-3">
              {data.recent_achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    !achievement.seen
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{achievement.name}</div>
                    <div className="text-xs text-gray-500">
                      {achievement.description}
                    </div>
                  </div>
                  <div className="text-sm text-primary-600 font-medium">
                    +{achievement.points} pts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats globales */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold mb-4">Ton parcours</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">
              {data.user_stats.total_meals_logged}
            </div>
            <div className="text-xs text-gray-500">Repas suivis</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {data.user_stats.total_activities}
            </div>
            <div className="text-xs text-gray-500">Activités</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {data.user_stats.total_recipes_generated}
            </div>
            <div className="text-xs text-gray-500">Recettes</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {data.user_stats.total_photos_analyzed}
            </div>
            <div className="text-xs text-gray-500">Photos</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {data.user_stats.achievements_count}
            </div>
            <div className="text-xs text-gray-500">Succès</div>
          </div>
        </div>
      </div>
    </div>
  )
}
