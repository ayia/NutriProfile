import { useTranslation } from 'react-i18next'
import type { QuickStats, UIConfig, PersonalizedStat } from '@/types/dashboard'
import { Flame, Dumbbell, Wheat, Droplet, Droplets, Activity, type LucideIcon } from '@/lib/icons'

interface AdaptiveStatsGridProps {
  stats: QuickStats
  uiConfig?: UIConfig
  personalizedStats?: PersonalizedStat[]
}

interface StatCardProps {
  label: string
  value: number
  target: number
  percent: number
  unit: string
  color: string
  IconComponent: LucideIcon
  prominent?: boolean
}

function StatCard({ label, value, target, percent, unit, color, IconComponent, prominent }: StatCardProps) {
  const clampedPercent = Math.min(percent, 100)

  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 ${prominent ? 'ring-2 ring-primary-200 bg-primary-50/30' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{label}</span>
        <IconComponent className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className={`text-2xl font-bold ${color}`}>{Math.round(value)}</span>
        <span className="text-gray-400 text-sm">/ {target}{unit}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percent > 100 ? 'bg-red-500' : color.replace('text-', 'bg-')
          }`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1 text-right">{Math.round(percent)}%</div>
    </div>
  )
}

export function AdaptiveStatsGrid({ stats, uiConfig, personalizedStats }: AdaptiveStatsGridProps) {
  const { t } = useTranslation('dashboard')

  // Déterminer les stats prioritaires basées sur la personnalisation
  const priorityIds = personalizedStats?.slice(0, 4).map(s => s.id) || []

  // Stats de base toujours affichées
  const baseStats = [
    {
      id: 'calories',
      label: t('stats.calories'),
      value: stats.calories_today,
      target: stats.calories_target,
      percent: stats.calories_percent,
      unit: '',
      color: 'text-orange-600',
      IconComponent: Flame,
      prominent: priorityIds.includes('calories'),
    },
    {
      id: 'protein',
      label: t('stats.protein'),
      value: stats.protein_today,
      target: stats.protein_target,
      percent: stats.protein_percent,
      unit: 'g',
      color: 'text-blue-600',
      IconComponent: Dumbbell,
      prominent: priorityIds.includes('protein'),
    },
  ]

  // Stats conditionnelles basées sur uiConfig
  const conditionalStats = []

  // Glucides - important pour diabétiques et keto
  if (uiConfig?.show_carbs_prominently || priorityIds.includes('carbs')) {
    conditionalStats.push({
      id: 'carbs',
      label: t('stats.carbs'),
      value: stats.carbs_today,
      target: stats.carbs_target,
      percent: stats.carbs_percent,
      unit: 'g',
      color: 'text-yellow-600',
      IconComponent: Wheat,
      prominent: uiConfig?.show_carbs_prominently || priorityIds.includes('carbs'),
    })
  }

  // Lipides - important pour santé cardiaque et keto
  if (uiConfig?.show_fat_breakdown || priorityIds.includes('fat')) {
    conditionalStats.push({
      id: 'fat',
      label: t('stats.fat'),
      value: stats.fat_today,
      target: stats.fat_target,
      percent: stats.fat_percent,
      unit: 'g',
      color: 'text-purple-600',
      IconComponent: Droplet,
      prominent: uiConfig?.show_fat_breakdown,
    })
  }

  // Eau - toujours affichée mais mise en évidence si important
  baseStats.push({
    id: 'water',
    label: t('stats.water'),
    value: stats.water_today,
    target: stats.water_target,
    percent: stats.water_percent,
    unit: 'ml',
    color: 'text-cyan-600',
    IconComponent: Droplets,
    prominent: uiConfig?.show_hydration_prominently || priorityIds.includes('water'),
  })

  // Activité
  baseStats.push({
    id: 'activity',
    label: t('stats.activity'),
    value: stats.activity_today,
    target: stats.activity_target,
    percent: stats.activity_percent,
    unit: 'min',
    color: 'text-green-600',
    IconComponent: Activity,
    prominent: uiConfig?.show_activity_prominently || priorityIds.includes('activity'),
  })

  // Combiner et trier par priorité
  const allStats = [...baseStats, ...conditionalStats]

  // Trier pour mettre les stats "prominent" en premier
  allStats.sort((a, b) => {
    if (a.prominent && !b.prominent) return -1
    if (!a.prominent && b.prominent) return 1
    return 0
  })

  // Déterminer le layout basé sur uiConfig
  const layout = uiConfig?.stats_layout || 'standard'
  const gridCols = layout === 'compact'
    ? 'grid-cols-2 md:grid-cols-4'
    : layout === 'detailed'
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    : 'grid-cols-2 md:grid-cols-4'

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {allStats.map((stat) => (
        <StatCard key={stat.id} {...stat} />
      ))}
    </div>
  )
}
