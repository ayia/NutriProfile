import type { UserStats } from '@/types/dashboard'
import { LEVEL_TITLES } from '@/types/dashboard'

interface LevelProgressProps {
  stats: UserStats
}

export function LevelProgress({ stats }: LevelProgressProps) {
  const levelTitle = LEVEL_TITLES[stats.level] || `Niveau ${stats.level}`

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">{stats.level}</span>
          </div>
          <div>
            <div className="font-semibold">{levelTitle}</div>
            <div className="text-sm text-white/80">{stats.total_points} points</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/80">Prochain niveau</div>
          <div className="text-lg font-semibold">
            {stats.xp_current} / {stats.xp_next_level} XP
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-500"
          style={{ width: `${stats.xp_percent}%` }}
        />
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-4 gap-2 mt-4 text-center text-sm">
        <div className="bg-white/10 rounded-lg p-2">
          <div className="font-semibold">{stats.achievements_count}</div>
          <div className="text-xs text-white/70">Succès</div>
        </div>
        <div className="bg-white/10 rounded-lg p-2">
          <div className="font-semibold">{stats.total_meals_logged}</div>
          <div className="text-xs text-white/70">Repas</div>
        </div>
        <div className="bg-white/10 rounded-lg p-2">
          <div className="font-semibold">{stats.total_activities}</div>
          <div className="text-xs text-white/70">Activités</div>
        </div>
        <div className="bg-white/10 rounded-lg p-2">
          <div className="font-semibold">{stats.best_streak_logging}</div>
          <div className="text-xs text-white/70">Meilleur streak</div>
        </div>
      </div>
    </div>
  )
}
