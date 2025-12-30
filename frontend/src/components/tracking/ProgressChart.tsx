import { useMemo, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProgressData } from '@/types/tracking'
import { Flame, Dumbbell, Scale, Activity, type LucideIcon } from '@/lib/icons'

interface ProgressChartProps {
  data: ProgressData
  metric: 'calories' | 'protein' | 'weight' | 'activity_minutes'
  color?: string
  height?: number
  showTrend?: boolean
}

interface TooltipData {
  x: number
  y: number
  value: number
  date: string
  index: number
}

const METRIC_CONFIG: Record<string, { labelKey: string; unit: string; IconComponent: LucideIcon; gradient: string[]; bgGradient: string }> = {
  calories: {
    labelKey: 'progressChart.metrics.calories',
    unit: 'kcal',
    IconComponent: Flame,
    gradient: ['#10B981', '#059669'],
    bgGradient: 'from-emerald-500/10 to-emerald-500/5',
  },
  protein: {
    labelKey: 'progressChart.metrics.protein',
    unit: 'g',
    IconComponent: Dumbbell,
    gradient: ['#06B6D4', '#0891B2'],
    bgGradient: 'from-cyan-500/10 to-cyan-500/5',
  },
  weight: {
    labelKey: 'progressChart.metrics.weight',
    unit: 'kg',
    IconComponent: Scale,
    gradient: ['#8B5CF6', '#7C3AED'],
    bgGradient: 'from-violet-500/10 to-violet-500/5',
  },
  activity_minutes: {
    labelKey: 'progressChart.metrics.activity',
    unit: 'min',
    IconComponent: Activity,
    gradient: ['#F97316', '#EA580C'],
    bgGradient: 'from-orange-500/10 to-orange-500/5',
  },
}

export function ProgressChart({
  data,
  metric,
  color,
  height = 220,
  showTrend = true,
}: ProgressChartProps) {
  const { t, i18n } = useTranslation('tracking')
  const [hoveredPoint, setHoveredPoint] = useState<TooltipData | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const config = METRIC_CONFIG[metric]
  const primaryColor = color || config.gradient[0]

  const chartData = useMemo(() => {
    const values = data[metric] as (number | null)[]
    const filteredValues = values.filter((v): v is number => v !== null && v > 0)

    if (filteredValues.length === 0) return null

    const max = Math.max(...filteredValues)
    const min = Math.min(...filteredValues)
    const range = max - min || max * 0.1 || 1
    const avg = filteredValues.reduce((a, b) => a + b, 0) / filteredValues.length

    // Calcul de la tendance
    let trend = 0
    if (filteredValues.length >= 2) {
      const recentHalf = filteredValues.slice(-Math.ceil(filteredValues.length / 2))
      const olderHalf = filteredValues.slice(0, Math.ceil(filteredValues.length / 2))
      const recentAvg = recentHalf.reduce((a, b) => a + b, 0) / recentHalf.length
      const olderAvg = olderHalf.reduce((a, b) => a + b, 0) / olderHalf.length
      trend = ((recentAvg - olderAvg) / olderAvg) * 100
    }

    return {
      values,
      max: max + range * 0.1, // Add padding
      min: Math.max(0, min - range * 0.1),
      range: range * 1.2,
      avg,
      trend,
      latest: filteredValues[filteredValues.length - 1],
      first: filteredValues[0],
    }
  }, [data, metric])

  if (!chartData) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl"
        style={{ height }}
      >
        <div className="w-12 h-12 bg-neutral-200 rounded-xl flex items-center justify-center mb-3">
          <config.IconComponent className="w-6 h-6 text-neutral-400" />
        </div>
        <p className="text-neutral-500 text-sm font-medium">{t('progressChart.noData')}</p>
        <p className="text-neutral-400 text-xs mt-1">{t('progressChart.startTracking')}</p>
      </div>
    )
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 50 }
  const chartWidth = 100
  const chartHeight = height - padding.top - padding.bottom

  const getY = (value: number | null) => {
    if (value === null) return null
    return chartHeight - ((value - chartData.min) / chartData.range) * chartHeight + padding.top
  }

  const getX = (index: number) => {
    return padding.left + (index / (chartData.values.length - 1)) * (chartWidth - padding.left - padding.right)
  }

  // Générer le path SVG pour une courbe lisse (Bezier)
  const generateSmoothPath = () => {
    const points = chartData.values
      .map((value, index) => {
        const y = getY(value)
        if (y === null) return null
        return { x: getX(index), y }
      })
      .filter((p): p is { x: number; y: number } => p !== null)

    if (points.length < 2) return ''

    let path = `M ${points[0].x},${points[0].y}`

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cpx = (prev.x + curr.x) / 2
      path += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`
    }

    return path
  }

  // Générer le path pour l'aire sous la courbe
  const generateAreaPath = () => {
    const points = chartData.values
      .map((value, index) => {
        const y = getY(value)
        if (y === null) return null
        return { x: getX(index), y }
      })
      .filter((p): p is { x: number; y: number } => p !== null)

    if (points.length < 2) return ''

    const firstPoint = points[0]
    const lastPoint = points[points.length - 1]

    let path = `M ${firstPoint.x},${chartHeight + padding.top}`
    path += ` L ${firstPoint.x},${firstPoint.y}`

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cpx = (prev.x + curr.x) / 2
      path += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`
    }

    path += ` L ${lastPoint.x},${chartHeight + padding.top} Z`

    return path
  }

  const pathD = generateSmoothPath()
  const areaD = generateAreaPath()

  const labels = useMemo(() => {
    const step = Math.ceil(data.dates.length / 6)
    return data.dates
      .filter((_, i) => i % step === 0 || i === data.dates.length - 1)
      .map((date, index) => {
        const d = new Date(date)
        return {
          label: d.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' }),
          index: index * step,
        }
      })
  }, [data.dates, i18n.language])

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const svgWidth = rect.width
    const relativeX = e.clientX - rect.left
    const percentX = relativeX / svgWidth

    const dataIndex = Math.round(percentX * (chartData.values.length - 1))
    const clampedIndex = Math.max(0, Math.min(chartData.values.length - 1, dataIndex))

    const value = chartData.values[clampedIndex]
    if (value === null || value === 0) {
      setHoveredPoint(null)
      setActiveIndex(null)
      return
    }

    const y = getY(value)
    if (y === null) {
      setHoveredPoint(null)
      setActiveIndex(null)
      return
    }

    setActiveIndex(clampedIndex)
    setHoveredPoint({
      x: getX(clampedIndex),
      y,
      value,
      date: data.dates[clampedIndex],
      index: clampedIndex,
    })
  }

  const formatValue = (value: number) => {
    if (metric === 'weight') return value.toFixed(1)
    return Math.round(value).toLocaleString()
  }

  const yAxisLabels = [chartData.max, chartData.max * 0.75, chartData.max * 0.5, chartData.max * 0.25, chartData.min]

  return (
    <div className="relative" style={{ height }} ref={containerRef}>
      {/* Stats en haut */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-2 z-10">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <config.IconComponent className="w-5 h-5" style={{ color: primaryColor }} />
          </div>
          <div>
            <span className="text-lg font-bold text-neutral-800">
              {formatValue(chartData.latest)} {config.unit}
            </span>
            {showTrend && chartData.trend !== 0 && (
              <span
                className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                  chartData.trend > 0
                    ? metric === 'weight'
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-emerald-100 text-emerald-600'
                    : metric === 'weight'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-rose-100 text-rose-600'
                }`}
              >
                {chartData.trend > 0 ? '+' : ''}
                {chartData.trend.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <div className="text-xs text-neutral-400">
          {t('progressChart.avg')}: {formatValue(chartData.avg)} {config.unit}
        </div>
      </div>

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHoveredPoint(null)
          setActiveIndex(null)
        }}
      >
        <defs>
          {/* Gradient pour l'aire */}
          <linearGradient id={`areaGradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.02" />
          </linearGradient>
          {/* Gradient pour la ligne */}
          <linearGradient id={`lineGradient-${metric}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={config.gradient[0]} />
            <stop offset="100%" stopColor={config.gradient[1]} />
          </linearGradient>
          {/* Filtre pour l'ombre */}
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Grille horizontale */}
        {yAxisLabels.map((value, i) => {
          const y = padding.top + (i / (yAxisLabels.length - 1)) * chartHeight
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="0.3"
                strokeDasharray="2,2"
              />
              <text
                x={padding.left - 3}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-[3px] fill-neutral-400"
              >
                {Math.round(value)}
              </text>
            </g>
          )
        })}

        {/* Aire sous la courbe */}
        <path d={areaD} fill={`url(#areaGradient-${metric})`} />

        {/* Ligne principale */}
        <path
          d={pathD}
          fill="none"
          stroke={`url(#lineGradient-${metric})`}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#dropShadow)"
        />

        {/* Points interactifs */}
        {chartData.values.map((value, index) => {
          const y = getY(value)
          if (y === null) return null
          const x = getX(index)
          const isActive = activeIndex === index

          return (
            <g key={index}>
              {/* Point de base */}
              <circle
                cx={x}
                cy={y}
                r={isActive ? '2.5' : '1.2'}
                fill={isActive ? primaryColor : 'white'}
                stroke={primaryColor}
                strokeWidth={isActive ? '1' : '0.8'}
                className="transition-all duration-150"
              />
              {/* Halo sur point actif */}
              {isActive && (
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={primaryColor}
                  fillOpacity="0.2"
                  className="animate-pulse"
                />
              )}
            </g>
          )
        })}

        {/* Ligne verticale pour le tooltip */}
        {hoveredPoint && (
          <line
            x1={hoveredPoint.x}
            y1={padding.top}
            x2={hoveredPoint.x}
            y2={chartHeight + padding.top}
            stroke={primaryColor}
            strokeWidth="0.5"
            strokeDasharray="2,2"
            opacity="0.5"
          />
        )}
      </svg>

      {/* Labels dates */}
      <div className="absolute bottom-0 left-12 right-5 flex justify-between text-[10px] text-neutral-400">
        {labels.map((item, i) => (
          <span key={i} className={activeIndex === item.index ? 'text-neutral-700 font-medium' : ''}>
            {item.label}
          </span>
        ))}
      </div>

      {/* Tooltip flottant */}
      {hoveredPoint && (
        <div
          className="absolute pointer-events-none z-20 transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(hoveredPoint.x / chartWidth) * 100}%`,
            top: `${((hoveredPoint.y - 10) / height) * 100}%`,
          }}
        >
          <div className="bg-neutral-900 text-white px-3 py-2 rounded-xl shadow-lg text-sm">
            <div className="font-semibold">
              {formatValue(hoveredPoint.value)} {config.unit}
            </div>
            <div className="text-neutral-400 text-xs">
              {new Date(hoveredPoint.date).toLocaleDateString(i18n.language, {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </div>
            {/* Triangle */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #171717',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
