import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
import { toast } from 'sonner'
import { visionApi } from '@/services/visionApi'
import { Button } from '@/components/ui/Button'
import { invalidationGroups } from '@/lib/queryKeys'
import type { FoodLog, FoodItemCreate, FoodItemUpdate } from '@/types/foodLog'
import { getMealTypeIcon, MEAL_TYPE_COLORS, Trash2, Edit, Plus } from '@/lib/icons'
import { EditFoodItemModalV2 } from './EditFoodItemModalV2'

// Type for modal item (can be existing item or new item template)
interface ModalFoodItem {
  id?: number
  name: string
  quantity: string
  unit: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
  source?: 'ai' | 'manual' | 'database'
  confidence?: number
}

interface FoodLogCardProps {
  log: FoodLog
  onEdit?: () => void
}

export function FoodLogCard({ log, onEdit }: FoodLogCardProps) {
  const { t } = useTranslation('vision')
  const [showDetails, setShowDetails] = useState(false)
  const [editingItem, setEditingItem] = useState<ModalFoodItem | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false) // Track if we're adding a new item
  const queryClient = useQueryClient()

  // Delete entire log
  const deleteMutation = useMutation({
    mutationFn: () => visionApi.deleteLog(log.id),
    onSuccess: () => {
      // Invalidate all related queries for immediate sync
      invalidationGroups.mealAnalysis.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key, refetchType: 'all' })
      })
      toast.success(t('foodLog.deleted'))
    },
    onError: () => {
      toast.error(t('foodLog.deleteError'))
    },
  })

  // Update individual food item
  const updateItemMutation = useMutation({
    mutationFn: async (data: FoodItemUpdate) => {
      if (!editingItem?.id) throw new Error('No item ID')
      return await visionApi.updateItem(editingItem.id, data)
    },
    onSuccess: () => {
      // Invalidate all related queries to refresh data
      invalidationGroups.mealAnalysis.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
      setEditingItem(null)
      setIsAddingNew(false)
      toast.success(t('itemUpdated'))
    },
    onError: () => {
      toast.error(t('updateError'))
    },
  })

  // Add new food item to existing log
  const addItemMutation = useMutation({
    mutationFn: async (data: FoodItemCreate) => {
      return await visionApi.addItem(log.id, data)
    },
    onSuccess: () => {
      // Invalidate all related queries to refresh data
      invalidationGroups.mealAnalysis.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
      setEditingItem(null)
      setIsAddingNew(false)
      toast.success(t('itemAdded'))
    },
    onError: () => {
      toast.error(t('addError'))
    },
  })

  // Delete individual food item
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await visionApi.deleteItem(itemId)
    },
    onSuccess: () => {
      // Invalidate all related queries
      invalidationGroups.mealAnalysis.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
      toast.success(t('itemDeleted'))
    },
    onError: () => {
      toast.error(t('deleteError'))
    },
  })

  // Open edit modal for an existing item
  const handleEditItem = (item: FoodLog['items'][0]) => {
    setIsAddingNew(false)
    setEditingItem({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      calories: item.calories ?? undefined,
      protein: item.protein ?? undefined,
      carbs: item.carbs ?? undefined,
      fat: item.fat ?? undefined,
      fiber: item.fiber ?? undefined,
      source: item.source,
      confidence: item.confidence ?? undefined,
    })
  }

  // Open modal for adding a new item
  const handleAddItem = () => {
    setIsAddingNew(true)
    setEditingItem({
      name: '',
      quantity: '100',
      unit: 'g',
      calories: undefined,
      protein: undefined,
      carbs: undefined,
      fat: undefined,
      fiber: undefined,
      source: 'manual',
    })
  }

  // Save item (either edit or add new)
  const handleSaveEdit = async (update: FoodItemUpdate) => {
    if (isAddingNew) {
      // Add new item
      const createData: FoodItemCreate = {
        name: update.name || '',
        quantity: update.quantity || '100',
        unit: update.unit || 'g',
        calories: update.calories,
        protein: update.protein,
        carbs: update.carbs,
        fat: update.fat,
        fiber: update.fiber,
      }
      await addItemMutation.mutateAsync(createData)
    } else {
      // Update existing item
      await updateItemMutation.mutateAsync(update)
    }
  }

  // Close modal
  const handleCloseModal = () => {
    setEditingItem(null)
    setIsAddingNew(false)
  }

  // Delete item with confirmation
  const handleDeleteItem = (itemId: number) => {
    if (confirm(t('confirmDeleteItem'))) {
      deleteItemMutation.mutate(itemId)
    }
  }

  // Map i18n language codes to locale codes for date formatting
  const getLocale = () => {
    const langMap: Record<string, string> = {
      fr: 'fr-FR',
      en: 'en-US',
      de: 'de-DE',
      es: 'es-ES',
      pt: 'pt-PT',
      zh: 'zh-CN',
      ar: 'ar-SA',
    }
    return langMap[i18n.language] || 'en-US'
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString(getLocale(), {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const MealIcon = getMealTypeIcon(log.meal_type)
  const mealColorClass = MEAL_TYPE_COLORS[log.meal_type] || 'text-gray-500'

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <MealIcon className={`w-5 h-5 ${mealColorClass}`} />
          </div>
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
          <div className="text-xs text-gray-500">{t('result.macros.protein')}</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-semibold text-yellow-600">
            {log.total_carbs?.toFixed(1) || 0}g
          </div>
          <div className="text-xs text-gray-500">{t('result.macros.carbs')}</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-semibold text-orange-600">
            {log.total_fat?.toFixed(1) || 0}g
          </div>
          <div className="text-xs text-gray-500">{t('result.macros.fat')}</div>
        </div>
      </div>

      {/* Details (collapsible) */}
      {showDetails && (
        <div className="border-t p-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">{t('foodLog.foods')}</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAddItem}
              className="h-7 px-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50"
            >
              <Plus className="w-4 h-4 mr-1" />
              {t('foodLog.addFood')}
            </Button>
          </div>
          {log.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-2 flex-1">
                {item.source === 'manual' && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {t('userCorrected')}
                  </span>
                )}
                <span className="font-medium capitalize">{item.name}</span>
                <span className="text-gray-500">
                  {item.quantity} {item.unit}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">{item.calories} kcal</span>
                <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditItem(item)}
                    className="h-7 w-7 p-0"
                  >
                    <Edit className="w-3 h-3 text-gray-500 hover:text-primary-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={deleteItemMutation.isPending}
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-500" />
                  </Button>
                </div>
              </div>
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
            <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
          </Button>
        </div>
      </div>

      {/* Edit Food Item Modal */}
      <EditFoodItemModalV2
        item={editingItem}
        onClose={handleCloseModal}
        onSave={handleSaveEdit}
        isLoading={isAddingNew ? addItemMutation.isPending : updateItemMutation.isPending}
      />
    </div>
  )
}
