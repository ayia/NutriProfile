import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { trackingApi } from '@/services/trackingApi'
import type { Goal } from '@/types/tracking'
import { GOAL_TYPES } from '@/types/tracking'

interface GoalCardProps {
  goal: Goal
  showActions?: boolean
}

export function GoalCard({ goal, showActions = true }: GoalCardProps) {
  const { t } = useTranslation('tracking')
  const queryClient = useQueryClient()
  const goalInfo = GOAL_TYPES[goal.goal_type] || { name: goal.goal_type, icon: '🎯', unit: '' }

  const updateMutation = useMutation({
    mutationFn: ({ goalId, data }: { goalId: number; data: Partial<Goal> }) =>
      trackingApi.updateGoal(goalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: trackingApi.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })

  const progress = goal.progress_percent || (goal.current_value / goal.target_value * 100) || 0
  const isComplete = progress >= 100

  // Couleurs de gradient selon le type d'objectif
  const getGradientColors = () => {
    switch (goal.goal_type) {
      case 'weight':
        return { bg: 'from-indigo-50 to-purple-50', border: 'border-indigo-200', icon: 'from-indigo-500 to-purple-500', progress: 'from-indigo-500 to-purple-500' }
      case 'calories':
        return { bg: 'from-orange-50 to-amber-50', border: 'border-orange-200', icon: 'from-orange-500 to-amber-500', progress: 'from-orange-500 to-amber-500' }
      case 'steps':
        return { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', icon: 'from-blue-500 to-cyan-500', progress: 'from-blue-500 to-cyan-500' }
      case 'activity':
        return { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', icon: 'from-green-500 to-emerald-500', progress: 'from-green-500 to-emerald-500' }
      case 'water':
        return { bg: 'from-cyan-50 to-sky-50', border: 'border-cyan-200', icon: 'from-cyan-500 to-sky-500', progress: 'from-cyan-500 to-sky-500' }
      default:
        return { bg: 'from-gray-50 to-slate-50', border: 'border-gray-200', icon: 'from-gray-500 to-slate-500', progress: 'from-gray-500 to-slate-500' }
    }
  }

  const colors = getGradientColors()

  const getProgressColor = () => {
    if (isComplete) return `bg-gradient-to-r ${colors.progress}`
    if (progress >= 75) return `bg-gradient-to-r ${colors.progress}`
    if (progress >= 50) return 'bg-gradient-to-r from-yellow-400 to-amber-500'
    if (progress >= 25) return 'bg-gradient-to-r from-orange-400 to-red-500'
    return 'bg-gradient-to-r from-red-400 to-rose-500'
  }

  const formatValue = (value: number) => {
    if (goal.goal_type === 'weight') return value.toFixed(1)
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
    return Math.round(value).toString()
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
        isComplete ? 'ring-2 ring-green-500/30' : ''
      }`}
    >
      {/* Badge complété */}
      {isComplete && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-green-500/30">
            <span>✓</span>
            <span>{t('goalCard.completed', 'Atteint!')}</span>
          </div>
        </div>
      )}

      {/* Header avec icône */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.icon} flex items-center justify-center shadow-lg`}>
          <span className="text-2xl filter drop-shadow-sm">{goalInfo.icon}</span>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900">{t(`goalCard.types.${goal.goal_type}`)}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${colors.icon} text-white`}>
              {t(`goalCard.periods.${goal.period}`)}
            </span>
          </div>
        </div>
      </div>

      {/* Valeurs avec grand affichage */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gray-900 tracking-tight">
            {formatValue(goal.current_value)}
          </span>
          <span className="text-lg text-gray-400 font-medium">
            / {formatValue(goal.target_value)} {goal.unit}
          </span>
        </div>
        {goal.goal_type === 'weight' && goal.current_value > 0 && (
          <div className={`text-sm mt-1 font-medium ${
            goal.current_value <= goal.target_value ? 'text-green-600' : 'text-orange-600'
          }`}>
            {goal.current_value <= goal.target_value
              ? `🎉 ${t('goalCard.onTrack', 'Objectif atteint!')}`
              : `${(goal.current_value - goal.target_value).toFixed(1)} kg ${t('goalCard.remaining', 'restants')}`
            }
          </div>
        )}
      </div>

      {/* Barre de progression améliorée */}
      <div className="relative mb-4">
        <div className="h-3 bg-white/60 backdrop-blur rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full ${getProgressColor()} rounded-full transition-all duration-700 ease-out relative`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" style={{ animationDuration: '2s' }} />
          </div>
        </div>
        {/* Indicateur de pourcentage au-dessus de la barre */}
        <div
          className="absolute -top-6 transition-all duration-500"
          style={{ left: `calc(${Math.min(progress, 100)}% - 20px)` }}
        >
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            isComplete ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
          } shadow-lg`}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-200/50">
          <div className="flex gap-2">
            {!isComplete && (
              <>
                <button
                  onClick={() => {
                    const increment = goal.target_value * 0.1
                    updateMutation.mutate({
                      goalId: goal.id,
                      data: { current_value: Math.min(goal.current_value + increment, goal.target_value * 1.5) },
                    })
                  }}
                  disabled={updateMutation.isPending}
                  className="px-3 py-1.5 bg-white/80 hover:bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:text-gray-900 transition-all hover:shadow-md disabled:opacity-50"
                >
                  +10%
                </button>
                <button
                  onClick={() => {
                    const increment = goal.target_value * 0.25
                    updateMutation.mutate({
                      goalId: goal.id,
                      data: { current_value: Math.min(goal.current_value + increment, goal.target_value * 1.5) },
                    })
                  }}
                  disabled={updateMutation.isPending}
                  className="px-3 py-1.5 bg-white/80 hover:bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:text-gray-900 transition-all hover:shadow-md disabled:opacity-50"
                >
                  +25%
                </button>
              </>
            )}
          </div>
          <button
            onClick={() => {
              if (confirm(t('goalCard.deleteConfirm'))) {
                deleteMutation.mutate(goal.id)
              }
            }}
            disabled={deleteMutation.isPending}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
