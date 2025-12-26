import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { trackingApi } from '@/services/trackingApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GOAL_TYPES } from '@/types/tracking'
import type { GoalCreate } from '@/types/tracking'

interface GoalFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function GoalForm({ onSuccess, onCancel }: GoalFormProps) {
  const { t } = useTranslation('tracking')
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<GoalCreate>({
    goal_type: 'calories',
    target_value: 2000,
    unit: 'kcal',
    period: 'daily',
  })

  const createMutation = useMutation({
    mutationFn: trackingApi.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      onSuccess?.()
    },
    onError: (error) => {
      console.error('Goal creation error:', error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleGoalTypeChange = (goalType: string) => {
    const goalInfo = GOAL_TYPES[goalType]
    setFormData({
      ...formData,
      goal_type: goalType,
      unit: goalInfo?.unit || '',
      target_value: getDefaultValue(goalType),
    })
  }

  const getDefaultValue = (goalType: string): number => {
    switch (goalType) {
      case 'calories':
        return 2000
      case 'steps':
        return 10000
      case 'activity':
        return 30
      case 'water':
        return 2000
      case 'weight':
        return 70
      default:
        return 100
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type d'objectif */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('goalForm.type')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(GOAL_TYPES).map(([type, { icon }]) => (
            <button
              key={type}
              type="button"
              onClick={() => handleGoalTypeChange(type)}
              className={`flex flex-col items-center p-3 border rounded-lg transition-colors ${
                formData.goal_type === type
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-xs mt-1">{t(`goalForm.types.${type}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Valeur cible */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('goalForm.target', { unit: formData.unit })}
        </label>
        <Input
          type="number"
          min="1"
          value={formData.target_value}
          onChange={(e) =>
            setFormData({ ...formData, target_value: parseFloat(e.target.value) || 0 })
          }
        />
      </div>

      {/* Période */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('goalForm.period')}
        </label>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setFormData({ ...formData, period })}
              className={`flex-1 py-2 px-3 border rounded-lg transition-colors ${
                formData.period === period
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {t(`goalForm.periods.${period}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            {t('common:cancel')}
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1"
          isLoading={createMutation.isPending}
        >
          {t('goalForm.submit')}
        </Button>
      </div>

      {createMutation.error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {t('errors.goalFailed')}
        </div>
      )}
    </form>
  )
}
