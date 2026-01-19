import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { EditFoodItemModal, type FoodItem, type FoodItemUpdate } from '@/components/vision/EditFoodItemModal'
import { visionApi } from '@/services/visionApi'
import type { MealType, FoodItemCreate, ManualLogCreate } from '@/types/foodLog'
import {
  X,
  Plus,
  Utensils,
  Save,
  Trash2,
  Edit3,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
} from 'lucide-react'

interface ManualMealBuilderProps {
  onClose: () => void
  onSuccess?: () => void
}

export function ManualMealBuilder({ onClose, onSuccess }: ManualMealBuilderProps) {
  const { t } = useTranslation('vision')
  const queryClient = useQueryClient()

  // State
  const [mealType, setMealType] = useState<MealType>('lunch')
  const [items, setItems] = useState<FoodItemCreate[]>([])
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // Mutation pour créer le repas manuel
  const createMutation = useMutation({
    mutationFn: async (data: ManualLogCreate) => {
      return await visionApi.createManualLog(data)
    },
    onSuccess: () => {
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['dailyMeals'] })
      queryClient.invalidateQueries({ queryKey: ['foodLogs'] })
      toast.success(t('manualEntry.mealSaved'))
      onSuccess?.()
      onClose()
    },
    onError: (error) => {
      console.error('Error creating manual log:', error)
      toast.error(t('result.saveError'))
    },
  })

  // Calculer les totaux
  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  // Ajouter un aliment
  const handleAddItem = () => {
    const emptyItem: FoodItem = {
      id: Date.now(), // Temporary ID for UI
      name: '',
      quantity: '100',
      unit: 'g',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      source: 'manual',
      confidence: 1.0,
    }
    setEditingItem(emptyItem)
    setEditingIndex(items.length) // Index for new item
  }

  // Éditer un aliment existant
  const handleEditItem = (index: number) => {
    const item = items[index]
    const editItem: FoodItem = {
      id: index,
      ...item,
      calories: item.calories ?? 0,
      protein: item.protein ?? 0,
      carbs: item.carbs ?? 0,
      fat: item.fat ?? 0,
      fiber: item.fiber ?? 0,
      source: 'manual',
      confidence: 1.0,
    }
    setEditingItem(editItem)
    setEditingIndex(index)
  }

  // Sauvegarder l'aliment édité
  const handleSaveItem = async (updatedItem: FoodItemUpdate) => {
    if (editingIndex !== null) {
      const newItem: FoodItemCreate = {
        name: updatedItem.name || '',
        quantity: updatedItem.quantity || '100',
        unit: updatedItem.unit || 'g',
        calories: updatedItem.calories,
        protein: updatedItem.protein,
        carbs: updatedItem.carbs,
        fat: updatedItem.fat,
        fiber: updatedItem.fiber,
      }

      if (editingIndex < items.length) {
        // Mise à jour d'un item existant
        const newItems = [...items]
        newItems[editingIndex] = newItem
        setItems(newItems)
      } else {
        // Ajout d'un nouvel item
        setItems([...items, newItem])
      }
    }

    setEditingItem(null)
    setEditingIndex(null)
  }

  // Supprimer un aliment
  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
    toast.success(t('itemDeleted'))
  }

  // Sauvegarder le repas
  const handleSaveMeal = () => {
    if (items.length === 0) {
      toast.error(t('manualEntry.emptyState'))
      return
    }

    createMutation.mutate({
      meal_type: mealType,
      items,
    })
  }

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {t('manualEntry.title')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Meal Type Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('manualEntry.selectMealType')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {mealTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`p-3 rounded-xl border-2 transition-all text-sm sm:text-base ${
                      mealType === type
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-semibold'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {t(`mealTypes.${type}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Foods List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {t('manualEntry.foodsAdded', { count: items.length })}
                </h3>
                <Button
                  onClick={handleAddItem}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden xs:inline">{t('manualEntry.addFood')}</span>
                  <span className="xs:hidden">{t('foodLog.addFood')}</span>
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <Utensils className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    {t('manualEntry.emptyState')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">
                          {item.name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {item.quantity} {t(item.unit)} • {item.calories || 0} kcal
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => handleEditItem(index)}
                          className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
                          aria-label="Edit"
                        >
                          <Edit3 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(index)}
                          className="p-2 hover:bg-error-100 dark:hover:bg-error-900/20 rounded-lg transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-error-600 dark:text-error-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nutrition Totals */}
            {items.length > 0 && (
              <div className="bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-900/20 dark:to-emerald-900/20 rounded-xl p-4 sm:p-6 space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                  {t('today.nutritionSummary')}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center">
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-orange-500" />
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(totals.calories)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t('today.calories')}
                    </div>
                  </div>
                  <div className="text-center">
                    <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(totals.protein * 10) / 10}g
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t('today.protein')}
                    </div>
                  </div>
                  <div className="text-center">
                    <Wheat className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-amber-500" />
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(totals.carbs * 10) / 10}g
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t('today.carbs')}
                    </div>
                  </div>
                  <div className="text-center">
                    <Droplet className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-purple-500" />
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(totals.fat * 10) / 10}g
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t('today.fat')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              {t('result.edit.cancel')}
            </Button>
            <Button
              onClick={handleSaveMeal}
              disabled={items.length === 0 || createMutation.isPending}
              className="gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('result.actions.saving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t('manualEntry.saveMeal')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Food Item Modal */}
      {editingItem && (
        <EditFoodItemModal
          item={editingItem}
          onClose={() => {
            setEditingItem(null)
            setEditingIndex(null)
          }}
          onSave={handleSaveItem}
          isLoading={false}
        />
      )}
    </>
  )
}
