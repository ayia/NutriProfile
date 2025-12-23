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
  const isOverCalories = quickStats.calories_today > quickStats.calories_target

  // SVG pour le cercle
  const size = 160
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(caloriesPercent, 100) / 100) * circumference

  const getCalorieColor = () => {
    if (isOverCalories) return { stroke: '#EF4444', bg: 'bg-error-50', text: 'text-error-600' }
    if (caloriesPercent >= 85) return { stroke: '#F59E0B', bg: 'bg-warning-50', text: 'text-warning-600' }
    return { stroke: '#10B981', bg: 'bg-primary-50', text: 'text-primary-600' }
  }

  const calorieColors = getCalorieColor()

  // Macros data
  const macros = [
    {
      label: 'Protéines',
      icon: '💪',
      value: quickStats.protein_today,
      max: quickStats.protein_target,
      color: 'bg-secondary-500',
      bgColor: 'bg-secondary-100',
      textColor: 'text-secondary-600',
    },
    {
      label: 'Eau',
      icon: '💧',
      value: quickStats.water_today,
      max: quickStats.water_target,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      onClick: onWaterClick,
      unit: 'ml',
    },
    {
      label: 'Activité',
      icon: '🏃',
      value: quickStats.activity_today,
      max: quickStats.activity_target,
      color: 'bg-accent-500',
      bgColor: 'bg-accent-100',
      textColor: 'text-accent-600',
      unit: 'min',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header Card - Salutation */}
      <div className="card-elevated p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar avec niveau */}
            <div className="relative">
              <div className="w-14 h-14 gradient-vitality rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">👤</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-warning-400 rounded-lg flex items-center justify-center text-xs font-bold text-warning-900 shadow-md">
                {userStats.level}
              </div>
            </div>
            <div>
              <h1 className="heading-3">Bonjour, {userName} !</h1>
              <p className="body-md">
                {quickStats.streak_days > 0 ? (
                  <span className="flex items-center gap-1 text-accent-600 font-medium">
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
      </div>

      {/* Stats principales */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Calories Card */}
        <div className="card-elevated p-5">
          <div className="flex items-center gap-6">
            {/* Cercle calories */}
            <div className="flex-shrink-0">
              <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                  />
                  {/* Progress circle */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={calorieColors.stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl mb-1">🔥</span>
                  <span className={`text-3xl font-bold ${calorieColors.text}`}>
                    {quickStats.calories_today}
                  </span>
                  <span className="text-sm text-neutral-500">
                    / {quickStats.calories_target} kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Info calories */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="heading-4">Calories</h3>
                {isOverCalories ? (
                  <p className="body-sm text-error-600">
                    Dépassement de {quickStats.calories_today - quickStats.calories_target} kcal
                  </p>
                ) : (
                  <p className="body-sm">
                    {caloriesRemaining} kcal restantes
                  </p>
                )}
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-neutral-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-neutral-800">
                    {Math.round(caloriesPercent)}%
                  </div>
                  <div className="text-xs text-neutral-500">Atteint</div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-neutral-800">
                    {userStats.total_meals_logged}
                  </div>
                  <div className="text-xs text-neutral-500">Repas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Niveau et XP Card */}
        <div className="card-elevated p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center text-lg">
              🏆
            </span>
            <h3 className="heading-4">Progression</h3>
          </div>

          {/* Level info */}
          <div className="bg-gradient-to-r from-warning-50 to-accent-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-neutral-800">{levelTitle}</span>
              <span className="badge-accent">{userStats.total_points} pts</span>
            </div>
            {/* XP Progress */}
            <div className="h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-warning-400 to-accent-500 rounded-full transition-all duration-500"
                style={{ width: `${userStats.xp_percent}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-neutral-600">
              <span>{userStats.xp_current} XP</span>
              <span>{userStats.xp_next_level} XP</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-primary-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-primary-600">{userStats.achievements_count}</div>
              <div className="text-xs text-neutral-600">Succès</div>
            </div>
            <div className="bg-secondary-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-secondary-600">{userStats.total_meals_logged}</div>
              <div className="text-xs text-neutral-600">Repas</div>
            </div>
            <div className="bg-accent-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-accent-600">{userStats.best_streak_logging}</div>
              <div className="text-xs text-neutral-600">Record</div>
            </div>
          </div>
        </div>
      </div>

      {/* Macros Card */}
      <div className="card-elevated p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-lg">
            📊
          </span>
          <h3 className="heading-4">Aujourd'hui</h3>
        </div>

        <div className="space-y-4">
          {macros.map((macro) => {
            const percent = Math.min((macro.value / macro.max) * 100, 100)
            const isOver = macro.value > macro.max
            const Component = macro.onClick ? 'button' : 'div'

            return (
              <Component
                key={macro.label}
                onClick={macro.onClick}
                className={`w-full ${macro.onClick ? 'cursor-pointer hover:bg-neutral-50 rounded-xl transition-colors p-2 -m-2' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${macro.bgColor} rounded-xl flex items-center justify-center`}>
                    <span className="text-xl">{macro.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-medium text-neutral-800">{macro.label}</span>
                      <span className={`text-sm font-medium ${isOver ? 'text-error-600' : macro.textColor}`}>
                        {macro.value} / {macro.max} {macro.unit || 'g'}
                      </span>
                    </div>
                    <div className={`h-2 ${macro.bgColor} rounded-full overflow-hidden`}>
                      <div
                        className={`h-full ${isOver ? 'bg-error-500' : macro.color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                  {macro.onClick && (
                    <button className="flex-shrink-0 bg-blue-100 text-blue-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors">
                      + Ajouter
                    </button>
                  )}
                </div>
              </Component>
            )
          })}
        </div>
      </div>
    </div>
  )
}
