import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { visionApi } from '@/services/visionApi'
import { Button } from '@/components/ui/Button'
import { invalidationGroups } from '@/lib/queryKeys'
import type { FoodLog } from '@/types/foodLog'
import { MEAL_TYPE_ICONS } from '@/types/foodLog'

interface FoodLogCardProps {
  log: FoodLog
  onEdit?: () => void
}

export function FoodLogCard({ log, onEdit }: FoodLogCardProps) {
  const { t } = useTranslation('vision')
  const [showDetails, setShowDetails] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => visionApi.deleteLog(log.id),
    onSuccess: () => {
      // Invalidate all related queries for immediate sync
      invalidationGroups.mealAnalysis.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key, refetchType: 'all' })
      })
    },
    onError: (error) => {
      console.error('Delete error:', error)
      alert(t('foodLog.deleteError'))
    },
  })

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {MEAL_TYPE_ICONS[log.meal_type as keyof typeof MEAL_TYPE_ICONS]}
          </span>
          <div>
            <div className="font-medium">
              {t(`mealTypes.${log.meal_type}`)}
            </div>
            <div className="text-sm text-gray-500">{formatTime(log.meal_date)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {log.image_analyzed && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                (log.confidence_score || 0) >= 0.7
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              IA {Math.round((log.confidence_score || 0) * 100)}%
            </span>
          )}
          {log.user_corrected && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              {t('result.corrected')}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {log.description && (
        <div className="px-4 py-2 text-sm text-gray-600 bg-gray-50">
          {log.description}
        </div>
      )}

      {/* Totaux */}
      <div className="grid grid-cols-4 divide-x">
        <div className="p-3 text-center">
          <div className="text-lg font-semibold">{log.total_calories || 0}</div>
          <div className="text-xs text-gray-500">kcal</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-semibold text-blue-600">
            {log.total_protein?.toFixed(1) || 0}g
          </div>
          <div className="text-xs text-gray-500">prot</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-semibold text-yellow-600">
            {log.total_carbs?.toFixed(1) || 0}g
          </div>
          <div className="text-xs text-gray-500">gluc</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-semibold text-orange-600">
            {log.total_fat?.toFixed(1) || 0}g
          </div>
          <div className="text-xs text-gray-500">lip</div>
        </div>
      </div>

      {/* Details (collapsible) */}
      {showDetails && log.items.length > 0 && (
        <div className="border-t p-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('foodLog.foods')}</h4>
          {log.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm py-1"
            >
              <div className="flex items-center gap-2">
                {item.source === 'manual' && (
                  <span className="text-xs text-gray-400">✏️</span>
                )}
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-500">
                  {item.quantity} {item.unit}
                </span>
              </div>
              <div className="text-gray-600">{item.calories} kcal</div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="p-3 border-t bg-gray-50 flex justify-between">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? t('foodLog.hideDetails') : `${t('foodLog.showDetails')} (${log.items.length})`}
        </Button>
        <div className="flex gap-2">
          {onEdit && (
            <Button size="sm" variant="outline" onClick={onEdit}>
              {t('foodLog.edit')}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm(t('foodLog.deleteConfirm'))) {
                deleteMutation.mutate()
              }
            }}
            disabled={deleteMutation.isPending}
          >
            🗑️
          </Button>
        </div>
      </div>
    </div>
  )
}
