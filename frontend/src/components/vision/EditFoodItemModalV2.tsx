/**
 * EditFoodItemModalV2 - Enhanced Food Item Editor
 *
 * Features:
 * - Quick quantity +/- buttons
 * - Portion size presets (S/M/L)
 * - Extended nutrition database (200+ foods)
 * - Recent foods suggestions
 * - Favorite foods with star toggle
 * - Visual portion guide
 * - Autocomplete with categories
 * - Faster debounce (400ms)
 * - Full i18n support (7 languages)
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Loader2,
  X,
  Database,
  Sparkles,
  Edit3,
  Check,
  Plus,
  Minus,
  Star,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
  Scan,
} from '@/lib/icons'
import { toast } from 'sonner'
import { searchNutrition, type NutritionSearchResponse } from '@/services/nutritionApi'
import {
  searchFoodsExtended,
  getNutrition,
  getPortionPresets,
  getVisualGuide,
  VISUAL_GUIDES,
  EXTENDED_NUTRITION_REFERENCE,
  type PortionPreset,
  type NutritionValues,
} from '@/data/nutritionReferenceExtended'
import { visionApi } from '@/services/visionApi'
import type { FoodItem, FoodItemUpdate } from './EditFoodItemModal'

interface EditFoodItemModalV2Props {
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

const QUICK_AMOUNTS = [10, 25, 50, 100]

export function EditFoodItemModalV2({
  item,
  onClose,
  onSave,
  isLoading,
}: EditFoodItemModalV2Props) {
  const { t, i18n } = useTranslation('vision')
  const queryClient = useQueryClient()

  // Fetch recent foods from API
  const { data: recentFoodsData } = useQuery({
    queryKey: ['recentFoods'],
    queryFn: () => visionApi.getRecentFoods(10),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!item,
  })
  const recentFoods = recentFoodsData?.items?.map(f => f.name) ?? []

  // Fetch favorites from API
  const { data: favoritesData } = useQuery({
    queryKey: ['favoriteFoods'],
    queryFn: () => visionApi.getFavorites(),
    staleTime: 5 * 60 * 1000,
    enabled: !!item,
  })
  const favoriteFoods = favoritesData?.items?.map(f => f.name.toLowerCase()) ?? []

  // Add to favorites mutation
  const addFavoriteMutation = useMutation({
    mutationFn: visionApi.addFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteFoods'] })
      queryClient.invalidateQueries({ queryKey: ['checkFavorite'] })
      toast.success(t('favorites.added'))
    },
    onError: () => {
      toast.error(t('updateError'))
    },
  })

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: visionApi.removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteFoods'] })
      queryClient.invalidateQueries({ queryKey: ['checkFavorite'] })
      toast.success(t('favorites.removed'))
    },
    onError: () => {
      toast.error(t('updateError'))
    },
  })

  // Toggle favorite handler
  const handleToggleFavorite = useCallback((foodName: string) => {
    const normalizedName = foodName.toLowerCase()
    if (favoriteFoods.includes(normalizedName)) {
      removeFavoriteMutation.mutate(foodName)
    } else {
      addFavoriteMutation.mutate({
        name: normalizedName,
        display_name: foodName,
      })
    }
  }, [favoriteFoods, addFavoriteMutation, removeFavoriteMutation])

  // Form state
  const [formData, setFormData] = useState<FoodItemUpdate>({
    name: '',
    quantity: '',
    unit: 'g',
  })

  // UI state
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [showPortionPresets, setShowPortionPresets] = useState(true)
  const [showBarcodeInput, setShowBarcodeInput] = useState(false)
  const [barcodeValue, setBarcodeValue] = useState('')
  const [isScanningBarcode, setIsScanningBarcode] = useState(false)

  // Search state
  const [searchResult, setSearchResult] = useState<NutritionSearchResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [localNutrition, setLocalNutrition] = useState<NutritionValues | null>(null)

  // Manual nutrition values
  const [manualNutrition, setManualNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  })

  // Autocomplete suggestions
  const autocompleteResults = useMemo(() => {
    if (!formData.name || formData.name.length < 1) return []
    return searchFoodsExtended(formData.name, 8)
  }, [formData.name])

  // Portion presets for current food
  const portionPresets = useMemo(() => {
    return getPortionPresets(formData.name || '')
  }, [formData.name])

  // Visual guide for current food
  const visualGuide = useMemo(() => {
    const guide = getVisualGuide(formData.name || '')
    if (!guide) return null
    return VISUAL_GUIDES[guide]?.[i18n.language] || VISUAL_GUIDES[guide]?.['en']
  }, [formData.name, i18n.language])

  // Check if food is favorite
  const isFavorite = useMemo(() => {
    return favoriteFoods.includes((formData.name || '').toLowerCase())
  }, [favoriteFoods, formData.name])

  // Initialize form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      })

      if (item.calories) {
        setManualNutrition({
          calories: item.calories,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fat: item.fat || 0,
          fiber: item.fiber || 0,
        })
      }

      // Try to get local nutrition immediately
      const nutrition = getNutrition(item.name, parseFloat(item.quantity) || 100, item.unit)
      if (nutrition) {
        setLocalNutrition(nutrition)
      }
    }
  }, [item])

  // Local nutrition calculation (instant, no debounce)
  useEffect(() => {
    if (formData.name && formData.quantity) {
      const quantity = parseFloat(formData.quantity)
      if (!isNaN(quantity) && quantity > 0) {
        const nutrition = getNutrition(formData.name, quantity, formData.unit)
        setLocalNutrition(nutrition)
      }
    }
  }, [formData.name, formData.quantity, formData.unit])

  // Debounced API search (400ms - faster than before)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name && formData.name.length >= 2 && formData.quantity && !manualMode) {
        // Only call API if not found in local database
        if (!localNutrition) {
          performSearch()
        }
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [formData.name, formData.quantity, manualMode, localNutrition])

  const performSearch = async () => {
    if (!formData.name || !formData.quantity) return

    const quantity = parseFloat(formData.quantity)
    if (isNaN(quantity) || quantity <= 0) return

    setIsSearching(true)

    try {
      const result = await searchNutrition({
        food_name: formData.name,
        quantity_g: quantity,
        language: i18n.language,
      })

      setSearchResult(result)

      if (!result.found) {
        setManualMode(true)
      }
    } catch {
      setManualMode(true)
    } finally {
      setIsSearching(false)
    }
  }

  // Quantity adjustment handlers
  const adjustQuantity = useCallback((delta: number) => {
    setFormData(prev => {
      const current = parseFloat(prev.quantity || '0') || 0
      const newValue = Math.max(0, current + delta)
      return { ...prev, quantity: newValue.toString() }
    })
  }, [])

  // Handle portion preset selection
  const selectPortionPreset = useCallback((preset: PortionPreset) => {
    setFormData(prev => ({
      ...prev,
      quantity: preset.grams.toString(),
      unit: 'g',
    }))
  }, [])

  // Handle autocomplete selection
  const selectFood = useCallback((foodName: string) => {
    setFormData(prev => ({ ...prev, name: foodName }))
    setShowAutocomplete(false)
    setManualMode(false)
    setSearchResult(null)
  }, [])

  // Handle barcode search
  const handleBarcodeSearch = async () => {
    if (!barcodeValue || barcodeValue.length < 8) {
      toast.error(t('barcode.invalidCode'))
      return
    }

    setIsScanningBarcode(true)
    try {
      const result = await visionApi.searchBarcode(barcodeValue)

      if (result.found && result.product_name) {
        // Apply barcode result to form
        setFormData(prev => ({
          ...prev,
          name: result.product_name || '',
          quantity: result.serving_size ? result.serving_size.replace(/[^\d.]/g, '') || '100' : '100',
          unit: 'g',
        }))

        // Set manual nutrition from barcode data
        setManualNutrition({
          calories: result.calories || 0,
          protein: result.protein || 0,
          carbs: result.carbs || 0,
          fat: result.fat || 0,
          fiber: result.fiber || 0,
        })
        setManualMode(true)

        toast.success(t('barcode.found'))
        setShowBarcodeInput(false)
        setBarcodeValue('')
      } else {
        toast.error(t('barcode.notFound'))
      }
    } catch {
      toast.error(t('barcode.notFound'))
    } finally {
      setIsScanningBarcode(false)
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

    // Priority: Manual > Local DB > API Search
    if (manualMode) {
      updateData.calories = manualNutrition.calories
      updateData.protein = manualNutrition.protein
      updateData.carbs = manualNutrition.carbs
      updateData.fat = manualNutrition.fat
      updateData.fiber = manualNutrition.fiber
    } else if (localNutrition) {
      updateData.calories = localNutrition.calories
      updateData.protein = localNutrition.protein
      updateData.carbs = localNutrition.carbs
      updateData.fat = localNutrition.fat
      updateData.fiber = localNutrition.fiber
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
    (manualMode ? manualNutrition.calories > 0 : localNutrition || searchResult?.found || false)

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

  // Determine displayed nutrition
  const displayedNutrition = manualMode
    ? manualNutrition
    : localNutrition || (searchResult?.found ? {
        calories: searchResult.calories,
        protein: searchResult.protein,
        carbs: searchResult.carbs,
        fat: searchResult.fat,
        fiber: searchResult.fiber,
      } : null)

  const nutritionSource = manualMode
    ? 'manual'
    : localNutrition
    ? 'local'
    : searchResult?.source || 'unknown'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[calc(100vw-24px)] sm:max-w-[600px] max-h-[90vh] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('editFood')}
          </h2>
          <div className="flex items-center gap-2">
            {formData.name && (
              <button
                onClick={() => handleToggleFavorite(formData.name || '')}
                className={`p-2 rounded-xl transition-all ${
                  isFavorite
                    ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={isFavorite ? t('favorites.remove') : t('favorites.add')}
                aria-label={isFavorite ? t('favorites.remove') : t('favorites.add')}
              >
                <Star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Recent Foods */}
          {recentFoods.length > 0 && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <Clock className="h-4 w-4" />
                {t('recentFoods.title')}
              </label>
              <div className="flex flex-wrap gap-2">
                {recentFoods.slice(0, 6).map(food => (
                  <button
                    key={food}
                    onClick={() => selectFood(food)}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full transition-all hover:shadow-sm"
                  >
                    {food}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Barcode Scanner Input */}
          {showBarcodeInput && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('barcode.scan')}
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={barcodeValue}
                  onChange={e => setBarcodeValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="3017620422003"
                  disabled={isScanningBarcode}
                  className="flex-1"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleBarcodeSearch()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleBarcodeSearch}
                  disabled={isScanningBarcode || barcodeValue.length < 8}
                  className="shrink-0"
                >
                  {isScanningBarcode ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('barcode.scanning').replace('...', '')
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowBarcodeInput(false)
                    setBarcodeValue('')
                  }}
                  className="shrink-0 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('barcode.permission')}
              </p>
            </div>
          )}

          {/* Food Name with Autocomplete */}
          <div className="space-y-2 relative">
            <div className="flex items-center justify-between">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('foodName')}
              </label>
              {!showBarcodeInput && (
                <button
                  type="button"
                  onClick={() => setShowBarcodeInput(true)}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  <Scan className="h-3.5 w-3.5" />
                  {t('barcode.scan')}
                </button>
              )}
            </div>
            <Input
              id="name"
              value={formData.name}
              onChange={e => {
                setFormData(prev => ({ ...prev, name: e.target.value }))
                setShowAutocomplete(true)
              }}
              onFocus={() => setShowAutocomplete(true)}
              placeholder={t('foodNamePlaceholder')}
              disabled={isLoading}
              className="w-full"
              autoComplete="off"
            />

            {/* Autocomplete Dropdown */}
            {showAutocomplete && autocompleteResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {autocompleteResults.map(food => {
                  const entry = EXTENDED_NUTRITION_REFERENCE[food]
                  return (
                    <button
                      key={food}
                      onClick={() => selectFood(food)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
                    >
                      <span className="capitalize text-gray-900 dark:text-gray-100">{food}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {entry?.nutrition.calories} kcal/100g
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quantity Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('quantity')}
            </label>

            {/* Quick +/- Buttons and Input */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => adjustQuantity(-10)}
                disabled={isLoading}
                className="p-2 h-10 w-10"
                aria-label={t('edit.decreaseQuantity')}
              >
                <Minus className="h-5 w-5" />
              </Button>

              <Input
                type="number"
                step="0.1"
                min="0"
                value={formData.quantity}
                onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                disabled={isLoading}
                className="flex-1 text-center text-lg font-medium"
              />

              <Button
                variant="secondary"
                size="sm"
                onClick={() => adjustQuantity(10)}
                disabled={isLoading}
                className="p-2 h-10 w-10"
                aria-label={t('edit.increaseQuantity')}
              >
                <Plus className="h-5 w-5" />
              </Button>

              <select
                value={formData.unit}
                onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                disabled={isLoading}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {UNITS.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {t(unit.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map(amount => (
                <button
                  key={amount}
                  onClick={() => adjustQuantity(amount)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-sm bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                >
                  +{amount}g
                </button>
              ))}
            </div>
          </div>

          {/* Portion Presets */}
          {portionPresets && portionPresets.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={() => setShowPortionPresets(!showPortionPresets)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {showPortionPresets ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {t('edit.portionPresets')}
              </button>

              {showPortionPresets && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {portionPresets.map(preset => (
                    <button
                      key={preset.size}
                      onClick={() => selectPortionPreset(preset)}
                      disabled={isLoading}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.quantity === preset.grams.toString() && formData.unit === 'g'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 ring-2 ring-primary-200 dark:ring-primary-700'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white capitalize">
                        {t(`edit.portion.${preset.size}`)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {preset.grams}g
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Visual Guide */}
          {visualGuide && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {visualGuide}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('edit.searchingNutrition')}</span>
            </div>
          )}

          {/* Source Badge */}
          {displayedNutrition && !manualMode && (
            <div className="flex items-center gap-2">
              {nutritionSource === 'local' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-lg">
                  <Database className="h-3 w-3" />
                  {t('edit.source.local')}
                </span>
              ) : nutritionSource === 'usda' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-lg">
                  <Database className="h-3 w-3" />
                  USDA
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium rounded-lg">
                  <Sparkles className="h-3 w-3" />
                  {t('edit.source.ai')}
                </span>
              )}
            </div>
          )}

          {/* Manual Mode Toggle */}
          {(displayedNutrition || searchResult) && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  {t('edit.manualEntry')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!manualMode && displayedNutrition) {
                    // Copy current values to manual
                    setManualNutrition({
                      calories: displayedNutrition.calories,
                      protein: displayedNutrition.protein,
                      carbs: displayedNutrition.carbs,
                      fat: displayedNutrition.fat,
                      fiber: displayedNutrition.fiber,
                    })
                  }
                  setManualMode(!manualMode)
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  manualMode ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
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
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
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

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Calories */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t('edit.calories')}
                  </label>
                  {manualMode ? (
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={manualNutrition.calories}
                      onChange={e =>
                        setManualNutrition(prev => ({
                          ...prev,
                          calories: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full"
                    />
                  ) : (
                    <span className="block font-semibold text-lg text-primary-600 dark:text-primary-400">
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
                    <span className="block font-medium text-blue-600 dark:text-blue-400">
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
                    <span className="block font-medium text-yellow-600 dark:text-yellow-400">
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
                    <span className="block font-medium text-orange-600 dark:text-orange-400">
                      {displayedNutrition.fat}g
                    </span>
                  )}
                </div>

                {/* Fiber */}
                <div>
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
                    <span className="block font-medium text-green-600 dark:text-green-400">
                      {displayedNutrition.fiber}g
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Not Found Message */}
          {!localNutrition && searchResult && !searchResult.found && !isSearching && !manualMode && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                {t('edit.foodNotFound')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
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
