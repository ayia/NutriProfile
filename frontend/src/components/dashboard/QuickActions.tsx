import { Link } from 'react-router-dom'

interface QuickAction {
  icon: string
  label: string
  to?: string
  onClick?: () => void
  color: string
  bgColor: string
}

interface QuickActionsProps {
  onWaterClick: () => void
}

export function QuickActions({ onWaterClick }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      icon: '📸',
      label: 'Scanner',
      to: '/vision',
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      icon: '🔍',
      label: 'Recettes',
      to: '/recipes',
      color: 'text-accent-600',
      bgColor: 'bg-accent-100',
    },
    {
      icon: '💧',
      label: 'Eau',
      onClick: onWaterClick,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
    {
      icon: '🏃',
      label: 'Activités',
      to: '/tracking',
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      icon: '⚖️',
      label: 'Poids',
      to: '/tracking?tab=weight',
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
    },
    {
      icon: '📊',
      label: 'Stats',
      to: '/tracking?tab=history',
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
  ]

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-3 pb-2" style={{ minWidth: 'max-content' }}>
        {actions.map((action) => {
          const content = (
            <>
              <div
                className={`w-14 h-14 ${action.bgColor} rounded-2xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-sm`}
              >
                <span className="text-2xl">{action.icon}</span>
              </div>
              <span className={`text-xs font-medium text-neutral-700`}>
                {action.label}
              </span>
            </>
          )

          if (action.to) {
            return (
              <Link
                key={action.label}
                to={action.to}
                className="group flex flex-col items-center p-3 bg-white rounded-2xl shadow-card hover:shadow-elevated transition-all min-w-[80px]"
              >
                {content}
              </Link>
            )
          }

          return (
            <button
              key={action.label}
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
