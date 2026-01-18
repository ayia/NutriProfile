import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loader2, X } from '@/lib/icons'
import {
  calculateNutrition,
  searchFoods,
  type NutritionValues,
} from '@/data/nutritionReference'
import type { NutritionSource } from '@/types/foodLog'

export interface FoodItem {
  id?: number
  name: string
  quantity: string
  unit: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
  source?: NutritionSource
  confidence?: number
  // New fields for SCAN/EDIT harmonization
  needs_verification?: boolean
  usda_food_name?: string | null
  original_name?: string | null
}

export interface FoodItemUpdate {
  name?: string
  quantity?: string
  unit?: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
}

interface EditFoodItemModalProps {
  item: FoodItem | null
  onClose: () => void
  onSave: (updatedItem: FoodItemUpdate) => Promise<void>
  isLoading: boolean
}

const UNITS = [
  { value: 'g', labelKey: 'g' },
  { value: 'ml', labelKey: 'ml' },
  { value: 'portion', labelKey: 'portion' },
  { value: 'piece', labelKey: 'piece' },
  { value: 'cup', labelKey: 'cup' },
  { value: 'tbsp', labelKey: 'tablespoon' },
]

export function EditFoodItemModal({
  item,
  onClose,
  onSave,
  isLoading,
}: EditFoodItemModalProps) {
  const { t } = useTranslation('vision')

  // Form state
  const [formData, setFormData] = useState<FoodItemUpdate>({
    name: '',
    quantity: '',
    unit: 'g',
  })

  // Nutrition preview state
  const [nutrition, setNutrition] = useState<NutritionValues | null>(null)

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Initialize form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      })
    }
  }, [item])

  // Real-time nutrition calculation
  useEffect(() => {
    if (formData.name && formData.quantity) {
      const quantity = parseFloat(formData.quantity)
      if (!isNaN(quantity) && quantity > 0) {
        const calculated = calculateNutrition(
          formData.name,
          quantity,
          formData.unit || 'g'
        )
        setNutrition(calculated)
      } else {
        setNutrition(null)
      }
    } else {
      setNutrition(null)
    }
  }, [formData.name, formData.quantity, formData.unit])

  // Handle food name input with autocomplete
  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }))

    if (value.length >= 2) {
      const results = searchFoods(value, 5)
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Select suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    setFormData(prev => ({ ...prev, name: suggestion }))
    setShowSuggestions(false)
  }

  // Handle save
  const handleSave = async () => {
    if (!formData.name || !formData.quantity) {
      return
    }

    const updateData: FoodItemUpdate = {
      name: formData.name,
      quantity: formData.quantity,
      unit: formData.unit,
      ...(nutrition && {
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
      }),
    }

    await onSave(updateData)
  }

  // Validation
  const isValid =
    formData.name &&
    formData.quantity &&
    !isNaN(parseFloat(formData.quantity)) &&
    parseFloat(formData.quantity) > 0

  // Close with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (item) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [item, onClose])

  if (!item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('editFood')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Food Name with Autocomplete */}
          <div className="space-y-2 relative">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('foodName')}
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => handleNameChange(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true)
                }
              }}
              onBlur={() => {
                // Delay to allow click on suggestion
                setTimeout(() => setShowSuggestions(false), 200)
              }}
              placeholder={t('foodNamePlaceholder')}
              disabled={isLoading}
              className="w-full"
            />

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors capitalize text-gray-900 dark:text-gray-100"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('quantity')}
              </label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                min="0"
                value={formData.quantity}
                onChange={e =>
                  setFormData(prev => ({ ...prev, quantity: e.target.value }))
                }
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('unit')}
              </label>
              <select
                id="unit"
                value={formData.unit}
                onChange={e =>
                  setFormData(prev => ({ ...prev, unit: e.target.value }))
                }
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {UNITS.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {t(unit.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nutrition Preview */}
          {nutrition && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-200">
                {t('nutritionPreview')}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Calories:</span>{' '}
                  <span className="font-medium text-gray-900 dark:text-gray-100">{nutrition.calories} kcal</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Protéines:</span>{' '}
                  <span className="font-medium text-gray-900 dark:text-gray-100">{nutrition.protein}g</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Glucides:</span>{' '}
                  <span className="font-medium text-gray-900 dark:text-gray-100">{nutrition.carbs}g</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Lipides:</span>{' '}
                  <span className="font-medium text-gray-900 dark:text-gray-100">{nutrition.fat}g</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Fibres:</span>{' '}
                  <span className="font-medium text-gray-900 dark:text-gray-100">{nutrition.fiber}g</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {t('result.edit.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isValid || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('result.edit.save')}
          </Button>
        </div>
      </div>
    </div>
  )
}
