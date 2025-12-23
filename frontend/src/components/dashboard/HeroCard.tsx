import type { QuickStats, UserStats } from '@/types/dashboard'
import { LEVEL_TITLES } from '@/types/dashboard'
import { NotificationBell } from './NotificationBell'

interface HeroCardProps {
  userName: string
  quickStats: QuickStats
  userStats: UserStats
  notifications: any[]
  unreadCount: number
  onWaterClick: () => void
}

export function HeroCard({
  userName,
  quickStats,
  userStats,
  notifications,
  unreadCount,
  onWaterClick,
}: HeroCardProps) {
  const levelTitle = LEVEL_TITLES[userStats.level] || `Niveau ${userStats.level}`

  // Calcul du pourcentage des calories
  const caloriesPercent = Math.min((quickStats.calories_today / quickStats.calories_target) * 100, 100)
  const caloriesRemaining = Math.max(quickStats.calories_target - quickStats.calories_today, 0)

  // SVG pour le grand cercle
  const size = 180
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (caloriesPercent / 100) * circumference

  const getCalorieColor = () => {
    if (caloriesPercent >= 100) return '#EF4444' // Rouge si depassement
    if (caloriesPercent >= 85) return '#F59E0B' // Orange si proche
    return '#10B981' // Vert normal
  }

  // Macros progress bars
  const macros = [
    {
      label: 'Proteines',
      icon: '💪',
      value: quickStats.protein_today,
      max: quickStats.protein_target,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-200',
    },
    {
      label: 'Eau',
      icon: '💧',
      value: quickStats.water_today,
      max: quickStats.water_target,
      color: 'bg-cyan-500',
      bgColor: 'bg-cyan-200',
      onClick: onWaterClick,
      unit: 'ml',
    },
    {
      label: 'Activite',
      icon: '🏃',
      value: quickStats.activity_today,
      max: quickStats.activity_target,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-200',
      unit: 'min',
    },
  ]

  return (
    <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl">
      {/* Header avec nom et notifications */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Avatar avec niveau */}
          <div className="relative">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
              <span className="text-2xl">👤</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">
              {userStats.level}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold">Bonjour, {userName} !</h1>
            <p className="text-white/80 text-sm">
              {quickStats.streak_days > 0 ? (
                <span className="flex items-center gap-1">
                  🔥 {quickStats.streak_days} jours de suite !
                </span>
              ) : (
                "Commençons une nouvelle journée !"
              )}
            </p>
          </div>
        </div>
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
        />
      </div>

      {/* Contenu principal : Cercle + Niveau */}
      <div className="flex items-center justify-between gap-6">
        {/* Grand cercle calories */}
        <div className="flex-shrink-0">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={strokeWidth}
              />
              {/* Progress circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={getCalorieColor()}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-700 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))',
                }}
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl mb-1">🔥</span>
              <span className="text-3xl font-bold">{quickStats.calories_today}</span>
              <span className="text-sm text-white/80">/ {quickStats.calories_target} kcal</span>
              {caloriesRemaining > 0 && (
                <span className="text-xs text-white/60 mt-1">
                  {caloriesRemaining} restantes
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Niveau et XP */}
        <div className="flex-1 space-y-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{levelTitle}</span>
              <span className="text-sm text-white/80">{userStats.total_points} pts</span>
            </div>
            {/* XP Progress */}
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${userStats.xp_percent}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-white/70">
              <span>{userStats.xp_current} XP</span>
              <span>{userStats.xp_next_level} XP</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
              <div className="font-bold">{userStats.achievements_count}</div>
              <div className="text-xs text-white/70">Succes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
              <div className="font-bold">{userStats.total_meals_logged}</div>
              <div className="text-xs text-white/70">Repas</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
              <div className="font-bold">{userStats.best_streak_logging}</div>
              <div className="text-xs text-white/70">Record</div>
            </div>
          </div>
        </div>
      </div>

      {/* Barres de progression macros */}
      <div className="mt-6 space-y-3">
        {macros.map((macro) => {
          const percent = Math.min((macro.value / macro.max) * 100, 100)
          const Component = macro.onClick ? 'button' : 'div'
          return (
            <Component
              key={macro.label}
              onClick={macro.onClick}
              className={`w-full ${macro.onClick ? 'cursor-pointer hover:bg-white/10 rounded-lg transition-colors p-1 -m-1' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg w-6">{macro.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{macro.label}</span>
                    <span className="text-white/80">
                      {macro.value} / {macro.max} {macro.unit || 'g'}
                    </span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${macro.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
                {macro.onClick && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+ Ajouter</span>
                )}
              </div>
            </Component>
          )
        })}
      </div>
    </div>
  )
}
