import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Camera,
  ChefHat,
  Droplets,
  Activity,
  Scale,
  BarChart3,
  type LucideIcon,
} from '@/lib/icons'

interface QuickAction {
  IconComponent: LucideIcon
  labelKey: string
  to?: string
  onClick?: () => void
  iconColor: string
  gradient: string
}

interface QuickActionsProps {
  onWaterClick: () => void
}

export function QuickActions({ onWaterClick }: QuickActionsProps) {
  const { t } = useTranslation('dashboard')

  const actions: QuickAction[] = [
    {
      IconComponent: Camera,
      labelKey: 'quickActions.scanMeal',
      to: '/vision',
      iconColor: 'text-white',
      gradient: 'from-primary-500 to-emerald-500',
    },
    {
      IconComponent: ChefHat,
      labelKey: 'quickActions.viewRecipes',
      to: '/recipes',
      iconColor: 'text-white',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      IconComponent: Droplets,
      labelKey: 'quickActions.addWater',
      onClick: onWaterClick,
      iconColor: 'text-white',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      IconComponent: Activity,
      labelKey: 'quickActions.logActivity',
      to: '/tracking',
      iconColor: 'text-white',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      IconComponent: Scale,
      labelKey: 'quickActions.logWeight',
      to: '/tracking?tab=weight',
      iconColor: 'text-white',
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      IconComponent: BarChart3,
      labelKey: 'quickActions.stats',
      to: '/tracking?tab=history',
      iconColor: 'text-white',
      gradient: 'from-rose-500 to-pink-500',
    },
  ]

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-3 pb-2" style={{ minWidth: 'max-content' }}>
        {actions.map((action) => {
          const IconComponent = action.IconComponent
          const content = (
            <>
              <div
                className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg`}
              >
                <IconComponent className={`w-6 h-6 ${action.iconColor}`} strokeWidth={2} />
              </div>
              <span className="text-xs font-medium text-neutral-700">
                {t(action.labelKey)}
              </span>
            </>
          )

          if (action.to) {
            return (
              <Link
                key={action.labelKey}
                to={action.to}
                className="group flex flex-col items-center p-3 bg-white rounded-2xl shadow-card hover:shadow-elevated transition-all min-w-[80px]"
              >
                {content}
              </Link>
            )
          }

          return (
            <button
              key={action.labelKey}
              onClick={action.onClick}
              className="group flex flex-col items-center p-3 bg-white rounded-2xl shadow-card hover:shadow-elevated transition-all min-w-[80px]"
            >
              {content}
            </button>
          )
        })}
      </div>
    </div>
  )
}
