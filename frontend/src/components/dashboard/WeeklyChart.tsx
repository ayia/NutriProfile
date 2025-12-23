import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { trackingApi } from '@/services/trackingApi'
import type { WeeklyChartDay } from '@/types/tracking'

interface WeeklyChartProps {
  title?: string
}

export function WeeklyChart({ title = 'Cette semaine' }: WeeklyChartProps) {
  const { data: chartData, isLoading, isError } = useQuery({
    queryKey: ['weeklyChart'],
    queryFn: trackingApi.getWeeklyChartData,
    refetchInterval: 60000,
  })

  const data: WeeklyChartDay[] = chartData?.days || []
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  // État de chargement
  if (isLoading) {
    return (
      <div className="card-elevated overflow-hidden">
        <div className="bg-gradient-to-r from-neutral-50 to-white px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-200 rounded-xl animate-pulse" />
            <div>
              <div className="h-5 w-32 bg-neutral-200 rounded animate-pulse" />
              <div className="h-3 w-48 bg-neutral-100 rounded mt-1 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-52 flex items-end justify-around gap-2 pl-12">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full max-w-[36px] bg-neutral-200 rounded-xl animate-pulse" style={{ height: `${30 + Math.random() * 50}%` }} />
                <div className="h-4 w-6 bg-neutral-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // État d'erreur
  if (isError) {
    return (
      <div className="card-elevated overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-neutral-600 text-sm">Impossible de charger les données</p>
        </div>
      </div>
    )
  }

  // Si pas de données
  if (data.length === 0) {
    return (
      <div className="card-elevated overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-neutral-600 text-sm">Aucune donnée disponible</p>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.calories, d.target)), 100) * 1.1
  const today = new Date().getDay()
  const todayIndex = today === 0 ? 6 : today - 1

  const getBarGradient = (calories: number, target: number, isHovered: boolean) => {
    const ratio = calories / target
    if (ratio > 1.1) {
      return isHovered
        ? 'bg-gradient-to-t from-rose-500 to-rose-400'
        : 'bg-gradient-to-t from-rose-400 to-rose-300'
    }
    if (ratio >= 0.9) {
      return isHovered
        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
        : 'bg-gradient-to-t from-emerald-500 to-emerald-300'
    }
    if (ratio >= 0.7) {
      return isHovered
        ? 'bg-gradient-to-t from-amber-500 to-amber-400'
        : 'bg-gradient-to-t from-amber-400 to-amber-300'
    }
    return isHovered
      ? 'bg-gradient-to-t from-sky-500 to-sky-400'
      : 'bg-gradient-to-t from-sky-400 to-sky-300'
  }

  const getStatusIcon = (calories: number, target: number) => {
    const ratio = calories / target
    if (calories === 0) return null
    if (ratio > 1.1) return '!'
    if (ratio >= 0.9) return null
    return null
  }

  const daysWithCalories = data.filter(d => d.calories > 0)
  const average = daysWithCalories.length > 0
    ? Math.round(daysWithCalories.reduce((acc, d) => acc + d.calories, 0) / daysWithCalories.length)
    : 0
  const targetAverage = data[0]?.target || 2000
  const totalCalories = data.reduce((acc, d) => acc + d.calories, 0)
  const weeklyTarget = targetAverage * 7

  const activeDay = selectedDay !== null ? data[selectedDay] : (hoveredIndex !== null ? data[hoveredIndex] : null)

  return (
    <div className="card-elevated overflow-hidden">
      {/* En-tête avec gradient subtil */}
      <div className="bg-gradient-to-r from-neutral-50 to-white px-6 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="heading-4">{title}</h3>
              <p className="text-xs text-neutral-500">Suivi de tes calories quotidiennes</p>
            </div>
          </div>

          {/* Légende compacte */}
          <div className="hidden md:flex items-center gap-3">
            {[
              { color: 'bg-emerald-400', label: 'Objectif atteint' },
              { color: 'bg-amber-400', label: 'En dessous' },
              { color: 'bg-rose-400', label: 'Dépassé' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 ${item.color} rounded-full`} />
                <span className="text-xs text-neutral-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Détails du jour sélectionné/survolé */}
        <div className={`mb-4 p-4 rounded-2xl transition-all duration-300 ${
          activeDay ? 'bg-gradient-to-r from-primary-50 to-secondary-50 opacity-100' : 'bg-neutral-50 opacity-60'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">
                {activeDay ? activeDay.day : 'Survole un jour pour voir les détails'}
              </p>
              <p className="text-2xl font-bold text-neutral-800">
                {activeDay ? `${activeDay.calories.toLocaleString()} kcal` : '---'}
              </p>
            </div>
            {activeDay && activeDay.calories > 0 && (
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-secondary-600">{activeDay.protein || 0}g</div>
                  <div className="text-xs text-neutral-500">Protéines</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-amber-600">{activeDay.carbs || 0}g</div>
                  <div className="text-xs text-neutral-500">Glucides</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-rose-600">{activeDay.fat || 0}g</div>
                  <div className="text-xs text-neutral-500">Lipides</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Graphique principal */}
        <div className="relative">
          {/* Lignes de grille avec labels */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[1, 0.75, 0.5, 0.25, 0].map((ratio, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 w-10 text-right">
                  {Math.round(maxValue * ratio)}
                </span>
                <div className="flex-1 border-t border-dashed border-neutral-200" />
              </div>
            ))}
          </div>

          {/* Barres */}
          <div className="flex items-end justify-around gap-2 h-52 pl-12 relative">
            {data.map((day, index) => {
              const height = day.calories > 0 ? (day.calories / maxValue) * 100 : 0
              const targetHeight = (day.target / maxValue) * 100
              const isToday = index === todayIndex
              const isHovered = hoveredIndex === index
              const isSelected = selectedDay === index
              const statusIcon = getStatusIcon(day.calories, day.target)

              return (
                <div
                  key={day.day}
                  className="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                >
                  <div className="relative w-full h-44 flex items-end justify-center">
                    {/* Indicateur de target */}
                    <div
                      className="absolute w-full border-t-2 border-primary-300 opacity-50"
                      style={{ bottom: `${targetHeight}%` }}
                    >
                      {index === data.length - 1 && (
                        <span className="absolute -right-1 -top-4 text-[9px] text-primary-500 font-medium">
                          Objectif
                        </span>
                      )}
                    </div>

                    {/* Barre de fond (zone de clic) */}
                    <div className="absolute inset-0 bg-transparent" />

                    {/* Barre de calories */}
                    <div
                      className={`relative w-full max-w-[36px] rounded-xl transition-all duration-300 ease-out ${
                        getBarGradient(day.calories, day.target, isHovered || isSelected)
                      } ${isToday ? 'ring-2 ring-primary-500 ring-offset-2' : ''} ${
                        isHovered || isSelected ? 'shadow-lg scale-105' : 'shadow-sm'
                      }`}
                      style={{
                        height: `${height}%`,
                        minHeight: day.calories > 0 ? '8px' : '0'
                      }}
                    >
                      {/* Valeur au-dessus de la barre */}
                      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 transition-opacity duration-200 ${
                        isHovered || isSelected ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <span className="text-xs font-semibold text-neutral-700 whitespace-nowrap">
                          {day.calories > 0 ? day.calories : '-'}
                        </span>
                      </div>

                      {/* Icône de statut */}
                      {statusIcon && (
                        <div className="absolute -top-2 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                          {statusIcon}
                        </div>
                      )}

                      {/* Effet de brillance */}
                      <div className="absolute inset-0 rounded-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0" />
                      </div>
                    </div>
                  </div>

                  {/* Label jour */}
                  <div className={`flex flex-col items-center transition-all duration-200 ${
                    isHovered || isSelected ? 'scale-110' : ''
                  }`}>
                    <span className={`text-xs font-medium ${
                      isToday
                        ? 'text-primary-600'
                        : isHovered || isSelected
                          ? 'text-neutral-700'
                          : 'text-neutral-400'
                    }`}>
                      {day.shortDay}
                    </span>
                    {isToday && (
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats résumé avec design amélioré */}
        <div className="grid grid-cols-4 gap-3 mt-6 pt-5 border-t border-neutral-100">
          {[
            {
              label: 'Moyenne/jour',
              value: average,
              unit: 'kcal',
              color: average <= targetAverage ? 'text-emerald-600' : 'text-rose-600',
              bg: average <= targetAverage ? 'bg-emerald-50' : 'bg-rose-50'
            },
            {
              label: 'Objectif',
              value: targetAverage,
              unit: 'kcal',
              color: 'text-primary-600',
              bg: 'bg-primary-50'
            },
            {
              label: 'Total semaine',
              value: totalCalories,
              unit: 'kcal',
              color: 'text-secondary-600',
              bg: 'bg-secondary-50'
            },
            {
              label: 'vs Objectif',
              value: `${totalCalories <= weeklyTarget ? '' : '+'}${totalCalories - weeklyTarget}`,
              unit: '',
              color: totalCalories <= weeklyTarget ? 'text-emerald-600' : 'text-rose-600',
              bg: totalCalories <= weeklyTarget ? 'bg-emerald-50' : 'bg-rose-50',
              isComparison: true
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-xl p-3 text-center transition-transform hover:scale-105`}
            >
              <div className={`text-lg font-bold ${stat.color}`}>
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                {stat.unit && <span className="text-xs font-normal ml-0.5">{stat.unit}</span>}
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
