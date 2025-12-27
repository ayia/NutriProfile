import { useTranslation } from 'react-i18next'
import type { QuickStats, UserStats } from '@/types/dashboard'
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
  const { t } = useTranslation('dashboard')
  const levelTitle = t(`levels.${userStats.level}`, { defaultValue: `Level ${userStats.level}` })

  // Calcul du pourcentage des calories
  const caloriesPercent = Math.min((quickStats.calories_today / quickStats.calories_target) * 100, 100)
  const caloriesRemaining = Math.max(quickStats.calories_target - quickStats.calories_today, 0)
  const isOverCalories = quickStats.calories_today > quickStats.calories_target

  // SVG pour le cercle
  const size = 180
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(caloriesPercent, 100) / 100) * circumference

  const getCalorieColor = () => {
    if (isOverCalories) return { stroke: 'url(#errorGradient)', bg: 'bg-error-50', text: 'text-error-600', glow: 'shadow-error-500/20' }
    if (caloriesPercent >= 85) return { stroke: 'url(#warningGradient)', bg: 'bg-warning-50', text: 'text-warning-600', glow: 'shadow-warning-500/20' }
    return { stroke: 'url(#primaryGradient)', bg: 'bg-primary-50', text: 'text-primary-600', glow: 'shadow-primary-500/20' }
  }

  const calorieColors = getCalorieColor()

  // Macros data
  const macros = [
    {
      label: t('macros.protein'),
      icon: '💪',
      value: quickStats.protein_today,
      max: quickStats.protein_target,
      color: 'bg-gradient-to-r from-secondary-500 to-cyan-500',
      bgColor: 'bg-secondary-100/50',
      textColor: 'text-secondary-600',
    },
    {
      label: t('macros.water'),
      icon: '💧',
      value: quickStats.water_today,
      max: quickStats.water_target,
      color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-100/50',
      textColor: 'text-blue-600',
      onClick: onWaterClick,
      unit: 'ml',
    },
    {
      label: t('macros.activity'),
      icon: '🏃',
      value: quickStats.activity_today,
      max: quickStats.activity_target,
      color: 'bg-gradient-to-r from-accent-500 to-amber-500',
      bgColor: 'bg-accent-100/50',
      textColor: 'text-accent-600',
      unit: 'min',
    },
  ]

  return (
    <div className="space-y-5">
      {/* Header Card - Glassmorphism */}
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar avec niveau - animated */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-cyan-400 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                <span className="text-3xl">👤</span>
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-gradient-to-br from-warning-400 to-amber-500 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg ring-2 ring-white">
                {userStats.level}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('hello')}, {userName} !</h1>
              <p className="text-gray-600 mt-0.5">
                {quickStats.streak_days > 0 ? (
                  <span className="flex items-center gap-1.5 text-accent-600 font-semibold">
                    <span className="animate-pulse">🔥</span> {t('streakMessage', { count: quickStats.streak_days })}
                  </span>
                ) : (
                  t('newDayMessage')
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
      <div className="grid md:grid-cols-2 gap-5">
        {/* Calories Card - Premium design */}
        <div className="glass-card p-6 animate-fade-in-up group" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-6">
            {/* Cercle calories - Enhanced */}
            <div className="flex-shrink-0 relative">
              {/* Glow effect */}
              <div className={`absolute inset-0 rounded-full blur-xl opacity-30 ${calorieColors.glow} transition-opacity group-hover:opacity-50`}
                   style={{ background: isOverCalories ? 'rgba(239, 68, 68, 0.3)' : caloriesPercent >= 85 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)' }} />

              <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                    <linearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#F97316" />
                    </linearGradient>
                    <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="100%" stopColor="#F43F5E" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  {/* Background circle */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                    className="opacity-50"
                  />
                  {/* Progress circle with glow */}
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
                    className="transition-all duration-1000 ease-out"
                    filter="url(#glow)"
                  />
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl mb-1 transform group-hover:scale-110 transition-transform">🔥</span>
                  <span className={`text-4xl font-bold ${calorieColors.text}`}>
                    {quickStats.calories_today}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    / {quickStats.calories_target} kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Info calories */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{t('hero.calories')}</h3>
                {isOverCalories ? (
                  <p className="text-sm text-error-600 font-medium">
                    {t('hero.caloriesOver', { count: quickStats.calories_today - quickStats.calories_target })}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    {t('hero.caloriesRemaining', { count: caloriesRemaining })}
                  </p>
                )}
              </div>

              {/* Mini stats - Glass style */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-100 hover-lift cursor-default">
                  <div className="text-2xl font-bold text-gradient">
                    {Math.round(caloriesPercent)}%
                  </div>
                  <div className="text-xs text-gray-500 font-medium">{t('hero.reached')}</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-100 hover-lift cursor-default">
                  <div className="text-2xl font-bold text-gray-800">
                    {userStats.total_meals_logged}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">{t('hero.meals')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Niveau et XP Card - Premium design */}
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-warning-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">🏆</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t('hero.progression')}</h3>
          </div>

          {/* Level info - Glassmorphism */}
          <div className="relative overflow-hidden rounded-2xl p-5 mb-5">
            <div className="absolute inset-0 bg-gradient-to-r from-warning-100 to-amber-100" />
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-900 text-lg">{levelTitle}</span>
                <span className="px-3 py-1 bg-gradient-to-r from-warning-500 to-amber-500 text-white text-sm font-bold rounded-full shadow-lg">
                  {userStats.total_points} pts
                </span>
              </div>
              {/* XP Progress - Enhanced */}
              <div className="h-3 bg-white/80 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-warning-400 via-amber-400 to-orange-400 rounded-full transition-all duration-700 ease-out progress-animated"
                  style={{ width: `${userStats.xp_percent}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600 font-medium">
                <span>{userStats.xp_current} XP</span>
                <span>{userStats.xp_next_level} XP</span>
              </div>
            </div>
          </div>

          {/* Quick Stats - Glass cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-primary p-4 text-center hover-lift cursor-default">
              <div className="text-2xl font-bold text-primary-600">{userStats.achievements_count}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">{t('hero.achievements')}</div>
            </div>
            <div className="bg-secondary-50/80 backdrop-blur border border-secondary-100 rounded-2xl p-4 text-center hover-lift cursor-default">
              <div className="text-2xl font-bold text-secondary-600">{userStats.total_meals_logged}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">{t('hero.meals')}</div>
            </div>
            <div className="glass-accent p-4 text-center hover-lift cursor-default">
              <div className="text-2xl font-bold text-accent-600">{userStats.best_streak_logging}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">{t('hero.record')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Macros Card - Enhanced */}
      <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl">📊</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t('hero.today')}</h3>
        </div>

        <div className="space-y-4">
          {macros.map((macro, index) => {
            const percent = Math.min((macro.value / macro.max) * 100, 100)
            const isOver = macro.value > macro.max
            const Component = macro.onClick ? 'button' : 'div'

            return (
              <Component
                key={macro.label}
                onClick={macro.onClick}
                className={`w-full group/macro ${macro.onClick ? 'cursor-pointer' : ''}`}
              >
                <div className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${macro.onClick ? 'hover:bg-white/80 hover:shadow-md' : ''}`}>
                  <div className={`w-12 h-12 ${macro.bgColor} backdrop-blur-sm rounded-xl flex items-center justify-center transition-transform duration-300 group-hover/macro:scale-110`}>
                    <span className="text-2xl">{macro.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">{macro.label}</span>
                      <span className={`text-sm font-bold ${isOver ? 'text-error-600' : macro.textColor}`}>
                        {macro.value} / {macro.max} {macro.unit || 'g'}
                      </span>
                    </div>
                    <div className={`h-2.5 ${macro.bgColor} rounded-full overflow-hidden`}>
                      <div
                        className={`h-full ${isOver ? 'bg-gradient-to-r from-error-500 to-rose-500' : macro.color} rounded-full transition-all duration-700 ease-out`}
                        style={{
                          width: `${Math.min(percent, 100)}%`,
                          animationDelay: `${index * 0.1}s`
                        }}
                      />
                    </div>
                  </div>
                  {macro.onClick && (
                    <button className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105">
                      + {t('hero.addButton')}
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
