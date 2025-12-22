import { useMemo } from 'react'
import type { ProgressData } from '@/types/tracking'

interface ProgressChartProps {
  data: ProgressData
  metric: 'calories' | 'protein' | 'weight' | 'activity_minutes'
  color?: string
  height?: number
}

export function ProgressChart({
  data,
  metric,
  color = '#10B981',
  height = 200,
}: ProgressChartProps) {
  const chartData = useMemo(() => {
    const values = data[metric] as (number | null)[]
    const filteredValues = values.filter((v): v is number => v !== null && v > 0)

    if (filteredValues.length === 0) return null

    const max = Math.max(...filteredValues)
    const min = Math.min(...filteredValues)
    const range = max - min || 1

    return {
      values,
      max,
      min,
      range,
    }
  }, [data, metric])

  if (!chartData) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ height }}
      >
        <p className="text-gray-500 text-sm">Pas de données</p>
      </div>
    )
  }

  const padding = 40
  const chartWidth = 100
  const chartHeight = height - padding * 2

  const getY = (value: number | null) => {
    if (value === null) return null
    return chartHeight - ((value - chartData.min) / chartData.range) * chartHeight + padding
  }

  const points = chartData.values
    .map((value, index) => {
      const x = (index / (chartData.values.length - 1)) * chartWidth
      const y = getY(value)
      return y !== null ? `${x},${y}` : null
    })
    .filter((p): p is string => p !== null)

  const pathD = points.length > 1 ? `M ${points.join(' L ')}` : ''

  // Créer le chemin pour l'aire sous la courbe
  const areaPoints = chartData.values
    .map((value, index) => {
      const x = (index / (chartData.values.length - 1)) * chartWidth
      const y = getY(value)
      return y !== null ? { x, y } : null
    })
    .filter((p): p is { x: number; y: number } => p !== null)

  const areaD =
    areaPoints.length > 1
      ? `M ${areaPoints[0].x},${chartHeight + padding} L ${areaPoints
          .map((p) => `${p.x},${p.y}`)
          .join(' L ')} L ${areaPoints[areaPoints.length - 1].x},${chartHeight + padding} Z`
      : ''

  const labels = useMemo(() => {
    const step = Math.ceil(data.dates.length / 7)
    return data.dates
      .filter((_, i) => i % step === 0)
      .map((date) => {
        const d = new Date(date)
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      })
  }, [data.dates])

  const getMetricLabel = () => {
    switch (metric) {
      case 'calories':
        return 'kcal'
      case 'protein':
        return 'g prot'
      case 'weight':
        return 'kg'
      case 'activity_minutes':
        return 'min'
      default:
        return ''
    }
  }

  return (
    <div className="relative" style={{ height }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Grille horizontale */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            y1={padding + chartHeight * (1 - ratio)}
            x2={chartWidth}
            y2={padding + chartHeight * (1 - ratio)}
            stroke="#E5E7EB"
            strokeWidth="0.5"
          />
        ))}

        {/* Aire sous la courbe */}
        <path d={areaD} fill={color} fillOpacity="0.1" />

        {/* Ligne principale */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {chartData.values.map((value, index) => {
          const y = getY(value)
          if (y === null) return null
          const x = (index / (chartData.values.length - 1)) * chartWidth
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1.5"
              fill={color}
            />
          )
        })}
      </svg>

      {/* Valeurs min/max */}
      <div className="absolute top-0 right-0 text-xs text-gray-500">
        {Math.round(chartData.max)} {getMetricLabel()}
      </div>
      <div className="absolute bottom-8 right-0 text-xs text-gray-500">
        {Math.round(chartData.min)} {getMetricLabel()}
      </div>

      {/* Labels dates */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-1">
        {labels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
    </div>
  )
}
