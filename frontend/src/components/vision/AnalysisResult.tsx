import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { visionApi } from '@/services/visionApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { ImageAnalyzeResponse, DetectedItem, FoodItemUpdate } from '@/types/foodLog'

interface AnalysisResultProps {
  result: ImageAnalyzeResponse
  onClose: () => void
}

export function AnalysisResult({ result, onClose }: AnalysisResultProps) {
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<FoodItemUpdate>({})
  const queryClient = useQueryClient()

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: FoodItemUpdate }) =>
      visionApi.updateItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodLogs'] })
      setEditingItem(null)
    },
  })

  const startEditing = (item: DetectedItem, index: number) => {
    setEditingItem(index)
    setEditForm({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    })
  }

  const saveEdit = (index: number) => {
    // Note: Dans une vraie app, on aurait l'ID de l'item depuis le backend
    // Pour l'instant, on simule la mise à jour
    setEditingItem(null)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Haute'
    if (confidence >= 0.6) return 'Moyenne'
    return 'Faible'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">Analyse terminée</h3>
            <p className="text-primary-100 text-sm mt-1">{result.description}</p>
          </div>
          <div className="text-right">
            <div className={`text-sm ${result.confidence >= 0.7 ? 'text-green-200' : 'text-yellow-200'}`}>
              Confiance: {Math.round(result.confidence * 100)}%
            </div>
            <div className="text-xs text-primary-200 mt-1">
              {result.model_used}
            </div>
          </div>
        </div>
      </div>

      {/* Totaux */}
      <div className="grid grid-cols-4 divide-x border-b">
        <div className="p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{result.total_calories}</div>
          <div className="text-xs text-gray-500">kcal</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{result.total_protein}g</div>
          <div className="text-xs text-gray-500">Protéines</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{result.total_carbs}g</div>
          <div className="text-xs text-gray-500">Glucides</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{result.total_fat}g</div>
          <div className="text-xs text-gray-500">Lipides</div>
        </div>
      </div>

      {/* Aliments détectés */}
      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <span>Aliments détectés</span>
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
            {result.items.length}
          </span>
        </h4>

        <div className="space-y-3">
          {result.items.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg p-3 hover:border-primary-300 transition-colors"
            >
              {editingItem === index ? (
                // Mode édition
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Nom"
                    />
                    <Input
                      value={editForm.quantity || ''}
                      onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                      placeholder="Quantité"
                    />
                    <Input
                      value={editForm.unit || ''}
                      onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                      placeholder="Unité"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Input
                      type="number"
                      value={editForm.calories || ''}
                      onChange={(e) => setEditForm({ ...editForm, calories: parseInt(e.target.value) })}
                      placeholder="Calories"
                    />
                    <Input
                      type="number"
                      value={editForm.protein || ''}
                      onChange={(e) => setEditForm({ ...editForm, protein: parseFloat(e.target.value) })}
                      placeholder="Protéines"
                    />
                    <Input
                      type="number"
                      value={editForm.carbs || ''}
                      onChange={(e) => setEditForm({ ...editForm, carbs: parseFloat(e.target.value) })}
                      placeholder="Glucides"
                    />
                    <Input
                      type="number"
                      value={editForm.fat || ''}
                      onChange={(e) => setEditForm({ ...editForm, fat: parseFloat(e.target.value) })}
                      placeholder="Lipides"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingItem(null)}
                    >
                      Annuler
                    </Button>
                    <Button size="sm" onClick={() => saveEdit(index)}>
                      Enregistrer
                    </Button>
                  </div>
                </div>
              ) : (
                // Mode affichage
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-500">
                        {item.quantity} {item.unit}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${getConfidenceColor(item.confidence)} bg-opacity-10`}
                      >
                        {getConfidenceLabel(item.confidence)}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-gray-600">
                      <span>{item.calories} kcal</span>
                      <span className="text-blue-600">{item.protein}g prot</span>
                      <span className="text-yellow-600">{item.carbs}g gluc</span>
                      <span className="text-orange-600">{item.fat}g lip</span>
                    </div>
                  </div>
                  <button
                    onClick={() => startEditing(item, index)}
                    className="text-gray-400 hover:text-primary-500 p-2"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t bg-gray-50 flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Nouvelle analyse
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost">
            Ajouter un aliment
          </Button>
          <Button onClick={onClose}>
            Confirmer
          </Button>
        </div>
      </div>

      {/* Note sur les corrections */}
      {result.confidence < 0.7 && (
        <div className="px-4 pb-4">
          <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>
              La confiance de l'analyse est faible. Nous vous recommandons de vérifier
              et corriger les valeurs si nécessaire.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
