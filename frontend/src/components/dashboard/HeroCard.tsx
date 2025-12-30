import { useTranslation } from 'react-i18next'
import type { QuickStats, UserStats, UIConfig } from '@/types/dashboard'
import { NotificationBell } from './NotificationBell'
import {
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Droplets,
  Trophy,
  BarChart3,
  User,
  Zap,
} from '@/lib/icons'

interface HeroCardProps {
  userName: string
  quickStats: QuickStats
  userStats: UserStats
  notifications: any[]
  unreadCount: number
  onWaterClick: () => void
  uiConfig?: UIConfig | null
}

export function HeroCard({
  userName,
  quickStats,
  userStats,
  notifications,
  unreadCount,
  onWaterClick,
  uiConfig,
}: HeroCardProps) {
  const { t } = useTranslation('dashboard')
  const levelTitle = t(`levels.${userStats.level}`, { defaultValue: `Level ${userStats.level}` })

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
    if (isOverCalories) return { stroke: 'url(#errorGradient)', bg: 'bg-error-50', text: 'text-error-600', glow: 'shadow-error-500/20' }
    if (caloriesPercent >= 85) return { stroke: 'url(#warningGradient)', bg: 'bg-warning-50', text: 'text-warning-600', glow: 'shadow-warning-500/20' }
    return { stroke: 'url(#primaryGradient)', bg: 'bg-primary-50', text: 'text-primary-600', glow: 'shadow-primary-500/20' }
  }

  const calorieColors = getCalorieColor()

  // Déterminer si les glucides doivent être mis en évidence (diabète, keto, etc.)
  const showCarbsProminently = uiConfig?.show_carbs_prominently ?? false

  // TOUJOURS afficher les 4 macros principales - Protéines, Glucides, Lipides, Eau
  const macros = [
    {
      id: 'protein',
      label: t('macros.protein'),
      IconComponent: Dumbbell,
      iconColor: 'text-blue-500',
      value: quickStats.protein_today,
      max: quickStats.protein_target,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-100/50',
      textColor: 'text-blue-600',
      prominent: false,
    },
    {
      id: 'carbs',
      label: t('macros.carbs'),
      IconComponent: Wheat,
      iconColor: showCarbsProminently ? 'text-red-500' : 'text-amber-500',
      value: quickStats.carbs_today,
      max: quickStats.carbs_target,
      color: showCarbsProminently
        ? 'bg-gradient-to-r from-red-500 to-orange-500'
        : 'bg-gradient-to-r from-yellow-500 to-amber-500',
      bgColor: showCarbsProminently ? 'bg-red-100/50' : 'bg-yellow-100/50',
      textColor: showCarbsProminently ? 'text-red-600' : 'text-yellow-600',
      prominent: showCarbsProminently,
    },
    {
      id: 'fat',
      label: t('macros.fat'),
      IconComponent: Droplet,
      iconColor: 'text-purple-500',
      value: quickStats.fat_today,
      max: quickStats.fat_target,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      bgColor: 'bg-purple-100/50',
      textColor: 'text-purple-600',
      prominent: false,
    },
    {
      id: 'water',
      label: t('macros.water'),
      IconComponent: Droplets,
      iconColor: 'text-cyan-500',
      value: quickStats.water_today,
      max: quickStats.water_target,
      color: 'bg-gradient-to-r from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-100/50',
      textColor: 'text-cyan-600',
      onClick: onWaterClick,
      unit: 'ml',
      prominent: false,
    },
  ]

  // Trier pour mettre les glucides en premier si prominent (diabétique)
  if (showCarbsProminently) {
    macros.sort((a, b) => {
      if (a.prominent && !b.prominent) return -1
      if (!a.prominent && b.prominent) return 1
      return 0
    })
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="glass-card p-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar avec niveau */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-cyan-400 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-warning-400 to-amber-500 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg ring-2 ring-white">
                {userStats.level}
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('hello')}, {userName} !</h1>
              <p className="text-gray-600 text-sm">
                {quickStats.streak_days > 0 ? (
                  <span className="flex items-center gap-1.5 text-accent-600 font-semibold">
                    <Zap className="w-4 h-4 text-orange-500 animate-pulse" /> {t('streakMessage', { count: quickStats.streak_days })}
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
      <div className="grid md:grid-cols-2 gap-4">
        {/* Calories Card */}
        <div className="glass-card p-5 animate-fade-in-up group" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-5">
            {/* Cercle calories */}
            <div className="flex-shrink-0 relative">
              <div className={`absolute inset-0 rounded-full blur-xl opacity-30 ${calorieColors.glow} transition-opacity group-hover:opacity-50`}
                   style={{ background: isOverCalories ? 'rgba(239, 68, 68, 0.3)' : caloriesPercent >= 85 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)' }} />

              <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
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
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                    className="opacity-50"
                  />
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
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-1 transform group-hover:scale-110 transition-transform shadow-lg">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-3xl font-bold ${calorieColors.text}`}>
                    {quickStats.calories_today}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    / {quickStats.calories_target} kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Info calories */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{t('hero.calories')}</h3>
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

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 text-center border border-gray-100">
                  <div className="text-xl font-bold text-gradient">
                    {Math.round(caloriesPercent)}%
                  </div>
                  <div className="text-xs text-gray-500">{t('hero.reached')}</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 text-center border border-gray-100">
                  <div className="text-xl font-bold text-gray-800">
                    {quickStats.meals_today}
                  </div>
                  <div className="text-xs text-gray-500">{t('hero.meals')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Niveau et XP Card */}
        <div className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-warning-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{t('hero.progression')}</h3>
          </div>

          {/* Level info */}
          <div className="relative overflow-hidden rounded-xl p-4 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-warning-100 to-amber-100" />
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900">{levelTitle}</span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-warning-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
                  {userStats.total_points} pts
                </span>
              </div>
              <div className="h-2.5 bg-white/80 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-warning-400 via-amber-400 to-orange-400 rounded-full transition-all duration-700 ease-out progress-animated"
                  style={{ width: `${userStats.xp_percent}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-600 font-medium">
                <span>{userStats.xp_current} XP</span>
                <span>{userStats.xp_next_level} XP</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="glass-primary p-3 text-center">
              <div className="text-xl font-bold text-primary-600">{userStats.achievements_count}</div>
              <div className="text-xs text-gray-600 mt-0.5">{t('hero.achievements')}</div>
            </div>
            <div className="bg-secondary-50/80 backdrop-blur border border-secondary-100 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-secondary-600">{userStats.total_meals_logged}</div>
              <div className="text-xs text-gray-600 mt-0.5">{t('hero.meals')}</div>
            </div>
            <div className="glass-accent p-3 text-center">
              <div className="text-xl font-bold text-accent-600">{userStats.best_streak_logging}</div>
              <div className="text-xs text-gray-600 mt-0.5">{t('hero.record')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Macros Card - TOUJOURS afficher les 4 macros */}
      <div className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{t('hero.today')}</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {macros.map((macro) => {
            const percent = Math.min((macro.value / macro.max) * 100, 100)
            const isOver = macro.value > macro.max
            const Component = macro.onClick ? 'button' : 'div'

            return (
              <Component
                key={macro.id}
                onClick={macro.onClick}
                className={`w-full group/macro ${macro.onClick ? 'cursor-pointer' : ''}`}
              >
                <div className={`relative p-3 rounded-xl transition-all duration-300 ${
                  macro.prominent
                    ? 'bg-red-50 ring-2 ring-red-300 shadow-lg'
                    : 'bg-white/80 hover:bg-white hover:shadow-md'
                }`}>
                  {macro.prominent && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 ${macro.bgColor} backdrop-blur-sm rounded-lg flex items-center justify-center transition-transform duration-300 group-hover/macro:scale-110`}>
                      <macro.IconComponent className={`w-4 h-4 ${macro.iconColor}`} />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{macro.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`text-xl font-bold ${isOver ? 'text-error-600' : macro.textColor}`}>
                      {Math.round(macro.value)}
                    </span>
                    <span className="text-xs text-gray-400">/ {macro.max} {macro.unit || 'g'}</span>
                  </div>
                  <div className={`h-1.5 ${macro.bgColor} rounded-full overflow-hidden`}>
                    <div
                      className={`h-full ${isOver ? 'bg-gradient-to-r from-error-500 to-rose-500' : macro.color} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  {macro.onClick && (
                    <button className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
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
