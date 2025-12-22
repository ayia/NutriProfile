import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trackingApi } from '@/services/trackingApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { WeightLogCreate } from '@/types/tracking'

interface WeightFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  currentWeight?: number
}

export function WeightForm({ onSuccess, onCancel, currentWeight }: WeightFormProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<WeightLogCreate>({
    weight_kg: currentWeight || 70,
  })

  const createMutation = useMutation({
    mutationFn: trackingApi.createWeightLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] })
      queryClient.invalidateQueries({ queryKey: ['weight'] })
      onSuccess?.()
    },
    onError: (error) => {
      console.error('Weight creation error:', error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('WeightForm: Submitting data:', formData)
    createMutation.mutate(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Poids */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Poids (kg)
        </label>
        <Input
          type="number"
          step="0.1"
          min="20"
          max="500"
          value={formData.weight_kg}
          onChange={(e) =>
            setFormData({ ...formData, weight_kg: parseFloat(e.target.value) || 0 })
          }
        />
      </div>

      {/* Pourcentage de graisse */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Masse grasse (%)
        </label>
        <Input
          type="number"
          step="0.1"
          min="1"
          max="70"
          value={formData.body_fat_percent || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              body_fat_percent: parseFloat(e.target.value) || undefined,
            })
          }
          placeholder="Optionnel"
        />
      </div>

      {/* Masse musculaire */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Masse musculaire (kg)
        </label>
        <Input
          type="number"
          step="0.1"
          min="10"
          max="200"
          value={formData.muscle_mass_kg || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              muscle_mass_kg: parseFloat(e.target.value) || undefined,
            })
          }
          placeholder="Optionnel"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          rows={2}
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value || undefined })}
          placeholder="Notes optionnelles..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1"
          isLoading={createMutation.isPending}
        >
          Enregistrer
        </Button>
      </div>

      {createMutation.error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          Erreur lors de l'enregistrement
        </div>
      )}
    </form>
  )
}
