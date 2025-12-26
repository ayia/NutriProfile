import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { trackingApi } from '@/services/trackingApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ACTIVITY_TYPES } from '@/types/tracking'
import type { ActivityLogCreate } from '@/types/tracking'

interface ActivityFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ActivityForm({ onSuccess, onCancel }: ActivityFormProps) {
  const { t } = useTranslation('tracking')
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<ActivityLogCreate>({
    activity_type: 'walking',
    duration_minutes: 30,
    intensity: 'moderate',
  })

  const createMutation = useMutation({
    mutationFn: trackingApi.createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      console.error('Activity creation error:', error)
      console.error('Error response:', error?.response?.data)
      console.error('Error status:', error?.response?.status)
      if (error?.response?.status === 401) {
        console.error('Token expiré ou invalide - veuillez vous reconnecter')
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('ActivityForm handleSubmit called', formData)
    console.log('Mutation state:', { isPending: createMutation.isPending, isError: createMutation.isError })
    createMutation.reset() // Reset previous error state
    createMutation.mutate(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type d'activité */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('activityForm.type')}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(ACTIVITY_TYPES).map(([type, { icon }]) => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData({ ...formData, activity_type: type })}
              className={`flex flex-col items-center p-2 border rounded-lg transition-colors ${
                formData.activity_type === type
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-xs mt-1">{t(`activityForm.types.${type}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Durée */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('activityForm.duration')}
        </label>
        <Input
          type="number"
          min="1"
          max="600"
          value={formData.duration_minutes}
          onChange={(e) =>
            setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })
          }
        />
      </div>

      {/* Intensité */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('activityForm.intensity')}
        </label>
        <div className="flex gap-2">
          {(['light', 'moderate', 'intense'] as const).map((intensity) => (
            <button
              key={intensity}
              type="button"
              onClick={() => setFormData({ ...formData, intensity })}
              className={`flex-1 py-2 px-3 border rounded-lg transition-colors ${
                formData.intensity === intensity
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {t(`activityForm.intensities.${intensity}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Champs optionnels */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('activityForm.distance')}
          </label>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={formData.distance_km || ''}
            onChange={(e) =>
              setFormData({ ...formData, distance_km: parseFloat(e.target.value) || undefined })
            }
            placeholder={t('activityForm.optional')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('activityForm.steps')}
          </label>
          <Input
            type="number"
            min="0"
            value={formData.steps || ''}
            onChange={(e) =>
              setFormData({ ...formData, steps: parseInt(e.target.value) || undefined })
            }
            placeholder={t('activityForm.optional')}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('activityForm.notes')}
        </label>
        <textarea
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          rows={2}
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value || undefined })}
          placeholder={t('activityForm.notesPlaceholder')}
        />
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
          {t('activityForm.submit')}
        </Button>
      </div>

      {createMutation.error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {(createMutation.error as any)?.response?.status === 401
            ? t('errors.sessionExpired')
            : t('errors.activityFailed')}
        </div>
      )}
    </form>
  )
}
