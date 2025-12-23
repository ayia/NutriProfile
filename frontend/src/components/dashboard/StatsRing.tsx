interface StatsRingProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  unit?: string
  icon?: string
}

export function StatsRing({
  value,
  max,
  size = 100,
  strokeWidth = 8,
  color: _color = '#10B981',
  label,
  unit = '',
  icon,
}: StatsRingProps) {
  void _color
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percent = Math.min((value / max) * 100, 100)
  const offset = circumference - (percent / 100) * circumference

  const getColor = () => {
    if (percent >= 100) return '#10B981' // Vert
    if (percent >= 75) return '#22C55E'
    if (percent >= 50) return '#F59E0B' // Orange
    if (percent >= 25) return '#F97316'
    return '#EF4444' // Rouge
  }

  return (
    <div className="flex flex-col items-center">
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
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon && <span className="text-xl mb-1">{icon}</span>}
          <span className="text-lg font-bold" style={{ color: getColor() }}>
            {Math.round(percent)}%
          </span>
        </div>
      </div>
      {label && (
        <div className="mt-2 text-center">
          <div className="text-sm font-medium text-gray-700">{label}</div>
          <div className="text-xs text-gray-500">
            {value} / {max} {unit}
          </div>
        </div>
      )}
    </div>
  )
}
