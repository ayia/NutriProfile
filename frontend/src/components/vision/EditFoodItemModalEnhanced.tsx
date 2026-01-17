import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loader2, X, Database, Sparkles, Edit3, Check } from '@/lib/icons'
import { searchNutrition, type NutritionSearchResponse } from '@/services/nutritionApi'
import type { FoodItem, FoodItemUpdate } from './EditFoodItemModal'

interface EditFoodItemModalEnhancedProps {
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

export function EditFoodItemModalEnhanced({
  item,
  onClose,
  onSave,
  isLoading,
}: EditFoodItemModalEnhancedProps) {
  const { t, i18n } = useTranslation('vision')

  // Form state
  const [formData, setFormData] = useState<FoodItemUpdate>({
    name: '',
    quantity: '',
    unit: 'g',
  })

  // Auto-search state
  const [searchResult, setSearchResult] = useState<NutritionSearchResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [manualMode, setManualMode] = useState(false)

  // Manual nutrition values (when manual mode is ON)
  const [manualNutrition, setManualNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  })

  // Initialize form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      })

      // Si l'item a déjà des valeurs nutritionnelles, les précharger
      if (item.calories) {
        setManualNutrition({
          calories: item.calories,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fat: item.fat || 0,
          fiber: item.fiber || 0,
        })
      }
    }
  }, [item])

  // Debounced auto-search quand le nom change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name && formData.name.length >= 2 && formData.quantity && !manualMode) {
        performSearch()
      }
    }, 800) // 800ms debounce

    return () => clearTimeout(timer)
  }, [formData.name, formData.quantity, manualMode])

  const performSearch = async () => {
    if (!formData.name || !formData.quantity) return

    const quantity = parseFloat(formData.quantity)
    if (isNaN(quantity) || quantity <= 0) return

    setIsSearching(true)

    try {
      const result = await searchNutrition({
        food_name: formData.name,
        quantity_g: quantity,
        language: i18n.language, // Envoyer la langue de l'utilisateur pour traduction automatique
      })

      setSearchResult(result)

      // Si not_found, activer automatiquement le mode manuel
      if (!result.found) {
        setManualMode(true)
      }
    } catch {
      setManualMode(true) // Fallback vers manuel en cas d'erreur
    } finally {
      setIsSearching(false)
    }
  }

  // Handle save
  const handleSave = async () => {
    if (!formData.name || !formData.quantity) return

    const updateData: FoodItemUpdate = {
      name: formData.name,
      quantity: formData.quantity,
      unit: formData.unit,
    }

    // Utiliser les valeurs manuelles OU les valeurs de la recherche
    if (manualMode) {
      updateData.calories = manualNutrition.calories
      updateData.protein = manualNutrition.protein
      updateData.carbs = manualNutrition.carbs
      updateData.fat = manualNutrition.fat
      updateData.fiber = manualNutrition.fiber
    } else if (searchResult && searchResult.found) {
      updateData.calories = searchResult.calories
      updateData.protein = searchResult.protein
      updateData.carbs = searchResult.carbs
      updateData.fat = searchResult.fat
      updateData.fiber = searchResult.fiber
    }

    await onSave(updateData)
  }

  // Validation
  const isValid =
    formData.name &&
    formData.quantity &&
    !isNaN(parseFloat(formData.quantity)) &&
    parseFloat(formData.quantity) > 0 &&
    (manualMode ? manualNutrition.calories > 0 : searchResult?.found || false)

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

  // Déterminer les valeurs nutritionnelles à afficher
  const displayedNutrition = manualMode
    ? manualNutrition
    : searchResult?.found
    ? {
        calories: searchResult.calories,
        protein: searchResult.protein,
        carbs: searchResult.carbs,
        fat: searchResult.fat,
        fiber: searchResult.fiber,
      }
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[550px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
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
          {/* Food Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('foodName')}
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('foodNamePlaceholder')}
              disabled={isLoading}
              className="w-full"
            />
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

          {/* Loading State */}
          {isSearching && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('edit.searchingNutrition')}</span>
            </div>
          )}

          {/* Search Result Badge */}
          {searchResult && searchResult.found && !manualMode && (
            <div className="flex items-center gap-2">
              {searchResult.source === 'usda' ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                  <Database className="h-3 w-3" />
                  {t('edit.source.local')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium rounded-full">
                  <Sparkles className="h-3 w-3" />
                  {t('edit.source.ai')}
                </span>
              )}
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {t('result.confidence')}: {Math.round(searchResult.confidence * 100)}%
              </span>
            </div>
          )}

          {/* Manual Mode Toggle */}
          {searchResult && searchResult.found && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  {t('edit.manualEntry')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setManualMode(!manualMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  manualMode
                    ? 'bg-primary-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    manualMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Nutrition Values */}
          {displayedNutrition && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
                {manualMode ? (
                  <>
                    <Edit3 className="h-4 w-4" />
                    {t('edit.nutritionEditable')}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    {t('edit.nutritionAuto')}
                  </>
                )}
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {/* Calories */}
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t('edit.calories')}
                  </label>
                  {manualMode ? (
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={manualNutrition.calories}
                      onChange={e =>
                        setManualNutrition(prev => ({
                          ...prev,
                          calories: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full"
                    />
                  ) : (
                    <span className="block font-medium text-gray-900 dark:text-gray-100">
                      {displayedNutrition.calories} kcal
                    </span>
                  )}
                </div>

                {/* Protein */}
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t('edit.protein')}
                  </label>
                  {manualMode ? (
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={manualNutrition.protein}
                      onChange={e =>
                        setManualNutrition(prev => ({
                          ...prev,
                          protein: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full"
                    />
                  ) : (
                    <span className="block font-medium text-gray-900 dark:text-gray-100">
                      {displayedNutrition.protein}g
                    </span>
                  )}
                </div>

                {/* Carbs */}
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t('edit.carbs')}
                  </label>
                  {manualMode ? (
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={manualNutrition.carbs}
                      onChange={e =>
                        setManualNutrition(prev => ({
                          ...prev,
                          carbs: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full"
                    />
                  ) : (
                    <span className="block font-medium text-gray-900 dark:text-gray-100">
                      {displayedNutrition.carbs}g
                    </span>
                  )}
                </div>

                {/* Fat */}
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t('edit.fat')}
                  </label>
                  {manualMode ? (
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={manualNutrition.fat}
                      onChange={e =>
                        setManualNutrition(prev => ({
                          ...prev,
                          fat: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full"
                    />
                  ) : (
                    <span className="block font-medium text-gray-900 dark:text-gray-100">
                      {displayedNutrition.fat}g
                    </span>
                  )}
                </div>

                {/* Fiber */}
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t('edit.fiber')}
                  </label>
                  {manualMode ? (
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={manualNutrition.fiber}
                      onChange={e =>
                        setManualNutrition(prev => ({
                          ...prev,
                          fiber: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full"
                    />
                  ) : (
                    <span className="block font-medium text-gray-900 dark:text-gray-100">
                      {displayedNutrition.fiber}g
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Not Found Message */}
          {searchResult && !searchResult.found && !isSearching && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                {t('edit.foodNotFound')}
              </p>
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
