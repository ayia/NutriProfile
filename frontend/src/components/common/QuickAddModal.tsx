import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { visionApi } from '@/services/visionApi'
import { calculateNutrition, searchFoods } from '@/data/nutritionReference'
import type { MealType, FoodItemCreate, ManualLogCreate, FoodUnit } from '@/types/foodLog'
import { X, Sunrise, Sun, Moon, Apple, Search, Plus } from '@/lib/icons'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

const MEAL_ICONS = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Moon,
  snack: Apple,
}

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const { t } = useTranslation('vision')
  const queryClient = useQueryClient()

  // State
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch')
  const [foodName, setFoodName] = useState('')
  const [quantity, setQuantity] = useState('100')
  const [unit, setUnit] = useState<FoodUnit>('g')
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Calculate nutrition preview
  const nutrition = foodName
    ? calculateNutrition(foodName, parseFloat(quantity) || 0, unit)
    : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }

  // Search foods when typing
  useEffect(() => {
    if (foodName.length >= 2) {
      const results = searchFoods(foodName, 8)
      setSearchResults(results)
      setShowSuggestions(true)
    } else {
      setSearchResults([])
      setShowSuggestions(false)
    }
  }, [foodName])

  // Mutation to add food
  const addFoodMutation = useMutation({
    mutationFn: async () => {
      const item: FoodItemCreate = {
        name: foodName,
        quantity,
        unit,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
      }

      const data: ManualLogCreate = {
        meal_type: selectedMealType,
        items: [item],
      }

      return await visionApi.createManualLog(data)
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['dailyMeals'] })
      queryClient.invalidateQueries({ queryKey: ['foodLogs'] })

      toast.success(
        t('quickAdd.added', {
          food: foodName,
          meal: t(`mealTypes.${selectedMealType}`),
        })
      )

      // Reset form
      setFoodName('')
      setQuantity('100')
      setUnit('g')
      setSelectedMealType('lunch')
      onClose()
    },
    onError: (error) => {
      console.error('Error adding food:', error)
      toast.error(t('addError'))
    },
  })

  const handleSubmit = () => {
    if (!foodName.trim()) {
      toast.error(t('quickAdd.nameRequired'))
      return
    }

    addFoodMutation.mutate()
  }

  const handleSelectFood = (food: string) => {
    setFoodName(food)
    setShowSuggestions(false)
  }

  // Close with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[calc(100vw-24px)] sm:max-w-md bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('quickAdd.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Meal Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('quickAdd.selectMeal')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MEAL_TYPES.map((type) => {
                const Icon = MEAL_ICONS[type]
                const isSelected = selectedMealType === type

                return (
                  <button
                    key={type}
                    onClick={() => setSelectedMealType(type)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-primary-500 text-white shadow-md scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-[10px] sm:text-xs font-medium truncate max-w-full">
                      {t(`mealTypes.${type}`)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Food Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('quickAdd.searchFood')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                onFocus={() => setShowSuggestions(searchResults.length > 0)}
                placeholder={t('foodNamePlaceholder')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />

              {/* Autocomplete Suggestions */}
              {showSuggestions && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                  {searchResults.map((food) => (
                    <button
                      key={food}
                      onClick={() => handleSelectFood(food)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 transition-colors"
                    >
                      {food}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('quantity')}
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="0"
                step="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('unit')}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as FoodUnit)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="g">{t('g')}</option>
                <option value="ml">{t('ml')}</option>
                <option value="portion">{t('portion')}</option>
                <option value="piece">{t('piece')}</option>
                <option value="cup">{t('cup')}</option>
                <option value="tablespoon">{t('tablespoon')}</option>
              </select>
            </div>
          </div>

          {/* Nutrition Preview */}
          {foodName && (
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
              <p className="text-sm font-medium text-primary-900 dark:text-primary-100 mb-2">
                {t('quickAdd.preview', { calories: nutrition.calories })}
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-gray-600 dark:text-gray-400">{t('result.macros.protein')}</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{nutrition.protein}g</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 dark:text-gray-400">{t('result.macros.carbs')}</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{nutrition.carbs}g</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 dark:text-gray-400">{t('result.macros.fat')}</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{nutrition.fat}g</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {t('result.edit.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!foodName.trim() || addFoodMutation.isPending}
            className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {addFoodMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('result.actions.saving')}</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>{t('quickAdd.add', { meal: t(`mealTypes.${selectedMealType}`) })}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
