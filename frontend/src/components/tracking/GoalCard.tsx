import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trackingApi } from '@/services/trackingApi'
import { Button } from '@/components/ui/Button'
import type { Goal } from '@/types/tracking'
import { GOAL_TYPES } from '@/types/tracking'

interface GoalCardProps {
  goal: Goal
}

export function GoalCard({ goal }: GoalCardProps) {
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

  const progress = goal.progress_percent || 0
  const isComplete = progress >= 100

  const getProgressColor = () => {
    if (isComplete) return 'bg-green-500'
    if (progress >= 75) return 'bg-green-400'
    if (progress >= 50) return 'bg-yellow-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const formatPeriod = () => {
    switch (goal.period) {
      case 'daily':
        return 'Quotidien'
      case 'weekly':
        return 'Hebdomadaire'
      case 'monthly':
        return 'Mensuel'
      default:
        return goal.period
    }
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${
        isComplete ? 'border-green-500' : 'border-primary-500'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{goalInfo.icon}</span>
          <div>
            <h4 className="font-medium">{goalInfo.name}</h4>
            <span className="text-xs text-gray-500">{formatPeriod()}</span>
          </div>
        </div>
        {isComplete && (
          <span className="text-green-500 text-xl">✓</span>
        )}
      </div>

      {/* Valeurs */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold">
          {Math.round(goal.current_value)}
        </span>
        <span className="text-gray-500">
          / {goal.target_value} {goal.unit}
        </span>
      </div>

      {/* Barre de progression */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full ${getProgressColor()} transition-all`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Pourcentage */}
      <div className="flex items-center justify-between text-sm">
        <span className={`font-medium ${isComplete ? 'text-green-600' : 'text-gray-600'}`}>
          {Math.round(progress)}%
        </span>
        <div className="flex gap-2">
          {!isComplete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const increment = goal.target_value * 0.1
                updateMutation.mutate({
                  goalId: goal.id,
                  data: { current_value: goal.current_value + increment },
                })
              }}
            >
              +10%
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm('Supprimer cet objectif ?')) {
                deleteMutation.mutate(goal.id)
              }
            }}
          >
            🗑️
          </Button>
        </div>
      </div>
    </div>
  )
}
