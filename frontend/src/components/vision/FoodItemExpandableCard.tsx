/**
 * FoodItemExpandableCard - Inline Expandable Card for Food Editing
 *
 * Pattern: Expandable Card (no modal/overlay)
 * - Expands inline to show edit fields
 * - 100% responsive (375px - 1920px+)
 * - Smooth animation
 * - Autocomplete + nutrition calculation
 */

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Plus,
  Minus,
  Loader2,
  Flame,
  Search,
} from '@/lib/icons'
import {
  searchFoodsExtended,
  getNutrition,
  getPortionPresets,
  EXTENDED_NUTRITION_REFERENCE,
} from '@/data/nutritionReferenceExtended'
import type { DetectedItem, FoodItemUpdate } from '@/types/foodLog'

interface FoodItemExpandableCardProps {
  item: DetectedItem
  index: number
  isExpanded: boolean
  onToggleExpand: (index: number | null) => void
  onSave: (index: number, update: FoodItemUpdate) => void
  getConfidenceLabel: (confidence: number) => string
}

const UNITS = [
  { value: 'g', labelKey: 'g' },
  { value: 'ml', labelKey: 'ml' },
  { value: 'portion', labelKey: 'portion' },
  { value: 'piece', labelKey: 'piece' },
]

const QUICK_AMOUNTS = [10, 25, 50, 100]

export function FoodItemExpandableCard({
  item,
  index,
  isExpanded,
  onToggleExpand,
  onSave,
  getConfidenceLabel,
}: FoodItemExpandableCardProps) {
  const { t } = useTranslation('vision')
  const cardRef = useRef<HTMLDivElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: item.name,
    quantity: item.quantity?.toString() || '100',
    unit: item.unit || 'g',
    calories: item.calories || 0,
    protein: item.protein || 0,
    carbs: item.carbs || 0,
    fat: item.fat || 0,
    fiber: item.fiber || 0,
  })

  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompleteResults, setAutocompleteResults] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Scroll to card when expanded
  useEffect(() => {
    if (isExpanded && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [isExpanded])

  // Reset form when item changes
  useEffect(() => {
    setFormData({
      name: item.name,
      quantity: item.quantity?.toString() || '100',
      unit: item.unit || 'g',
      calories: item.calories || 0,
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      fiber: item.fiber || 0,
    })
  }, [item])

  // Search foods for autocomplete
  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }))

    if (value.length >= 2) {
      const results = searchFoodsExtended(value, 5)
      setAutocompleteResults(results)
      setShowAutocomplete(results.length > 0)
    } else {
      setShowAutocomplete(false)
    }
  }

  // Select autocomplete suggestion
  const selectFood = (foodName: string) => {
    const nutrition = getNutrition(foodName, parseFloat(formData.quantity) || 100, formData.unit)
    if (nutrition) {
      setFormData(prev => ({
        ...prev,
        name: foodName,
        calories: Math.round(nutrition.calories),
        protein: Math.round(nutrition.protein * 10) / 10,
        carbs: Math.round(nutrition.carbs * 10) / 10,
        fat: Math.round(nutrition.fat * 10) / 10,
        fiber: Math.round((nutrition.fiber || 0) * 10) / 10,
      }))
    } else {
      // Just update the name if no nutrition data found
      setFormData(prev => ({ ...prev, name: foodName }))
    }
    setShowAutocomplete(false)
  }

  // Update nutrition when quantity changes
  const updateQuantity = (newQuantity: string) => {
    const qty = parseFloat(newQuantity) || 0
    setFormData(prev => {
      const nutrition = getNutrition(prev.name, qty, prev.unit)
      if (nutrition) {
        return {
          ...prev,
          quantity: newQuantity,
          calories: Math.round(nutrition.calories),
          protein: Math.round(nutrition.protein * 10) / 10,
          carbs: Math.round(nutrition.carbs * 10) / 10,
          fat: Math.round(nutrition.fat * 10) / 10,
          fiber: Math.round((nutrition.fiber || 0) * 10) / 10,
        }
      }
      // Keep current values if nutrition data not found
      return { ...prev, quantity: newQuantity }
    })
  }

  // Adjust quantity by delta
  const adjustQuantity = (delta: number) => {
    const current = parseFloat(formData.quantity) || 0
    const newQty = Math.max(0, current + delta)
    updateQuantity(newQty.toString())
  }

  // Save changes
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(index, {
        name: formData.name,
        quantity: formData.quantity,
        unit: formData.unit,
        calories: formData.calories,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
        fiber: formData.fiber,
      })
      onToggleExpand(null)
    } finally {
      setIsSaving(false)
    }
  }

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      name: item.name,
      quantity: item.quantity?.toString() || '100',
      unit: item.unit || 'g',
      calories: item.calories || 0,
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      fiber: item.fiber || 0,
    })
    onToggleExpand(null)
  }

  // Get portion presets for current food
  const portionPresets = getPortionPresets(formData.name)

  return (
    <div
      ref={cardRef}
      className={cn(
        "border rounded-xl overflow-hidden transition-all duration-300",
        isExpanded
          ? "border-primary-400 shadow-lg bg-white dark:bg-gray-800"
          : "border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-sm bg-white dark:bg-gray-800"
      )}
    >
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={() => onToggleExpand(isExpanded ? null : index)}
        className="w-full p-3 sm:p-4 flex items-center justify-between text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 dark:text-white capitalize truncate">
              {item.name}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              {item.quantity} {item.unit}
            </span>
            {item.source === 'manual' && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                {t('userCorrected')}
              </span>
            )}
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                item.confidence >= 0.8
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                  : item.confidence >= 0.6
                  ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                  : 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
              )}
            >
              {getConfidenceLabel(item.confidence)}
            </span>
          </div>
          <div className="flex gap-2 sm:gap-3 mt-2 text-xs sm:text-sm flex-wrap">
            <span className="text-gray-700 dark:text-gray-300 font-medium">{item.calories} kcal</span>
            <span className="text-blue-600 dark:text-blue-400">{item.protein}g P</span>
            <span className="text-yellow-600 dark:text-yellow-400">{item.carbs}g C</span>
            <span className="text-orange-600 dark:text-orange-400">{item.fat}g L</span>
          </div>
        </div>
        <div className={cn(
          "p-2 rounded-lg transition-colors ml-2",
          isExpanded
            ? "bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400"
            : "text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
        )}>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Expanded Edit Section */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
          {/* Food Name with Autocomplete */}
          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('foodName')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={() => formData.name.length >= 2 && setShowAutocomplete(autocompleteResults.length > 0)}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                placeholder={t('foodNamePlaceholder')}
                className="pl-10 h-12"
              />

              {/* Autocomplete dropdown */}
              {showAutocomplete && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {autocompleteResults.map((food) => {
                    const entry = EXTENDED_NUTRITION_REFERENCE[food]
                    return (
                      <button
                        key={food}
                        type="button"
                        onClick={() => selectFood(food)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                      >
                        <span className="font-medium capitalize text-gray-900 dark:text-white">{food}</span>
                        {entry && entry.nutrition && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {entry.nutrition.calories} kcal/100g
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quantity Controls */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('quantity')}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustQuantity(-10)}
                className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label={t('edit.decreaseQuantity')}
              >
                <Minus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => updateQuantity(e.target.value)}
                className="flex-1 h-12 text-center text-lg font-medium"
                min="0"
              />
              <button
                type="button"
                onClick={() => adjustQuantity(10)}
                className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label={t('edit.increaseQuantity')}
              >
                <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="h-12 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {t(unit.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick quantity buttons */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => adjustQuantity(amount)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors text-gray-700 dark:text-gray-300"
                >
                  +{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Portion Presets */}
          {portionPresets && portionPresets.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('edit.portionPresets')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {portionPresets.map((preset) => {
                  const isSelected = formData.quantity === preset.grams.toString() && formData.unit === 'g'
                  return (
                    <button
                      key={preset.size}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, quantity: preset.grams.toString(), unit: 'g' }))
                        updateQuantity(preset.grams.toString())
                      }}
                      className={cn(
                        "p-2 sm:p-3 rounded-xl text-left border-2 transition-all",
                        isSelected
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                          : "border-gray-200 dark:border-gray-600 hover:border-primary-300"
                      )}
                    >
                      <div className={cn(
                        "font-medium text-sm capitalize",
                        isSelected ? "text-primary-700 dark:text-primary-300" : "text-gray-800 dark:text-white"
                      )}>
                        {t(`edit.portion.${preset.size}`)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {preset.grams}g
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Nutrition Preview */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('nutritionPreview')}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{formData.calories}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('edit.calories')}</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{formData.protein}g</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('edit.protein')}</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{formData.carbs}g</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('edit.carbs')}</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{formData.fat}g</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('edit.fat')}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 h-12"
            >
              <X className="w-4 h-4 mr-2" />
              {t('result.edit.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !formData.name.trim()}
              className={cn(
                "flex-1 h-12",
                "bg-gradient-to-r from-primary-500 to-emerald-500",
                "hover:from-primary-600 hover:to-emerald-600"
              )}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {t('result.edit.save')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
