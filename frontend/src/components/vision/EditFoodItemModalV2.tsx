/**
 * EditFoodItemModalV2 - Redesigned Food Item Editor
 *
 * Design aligned with NutriProfile design system (January 2026)
 *
 * Features:
 * - Mobile-first bottom sheet pattern
 * - Touch-friendly controls (44px+ touch targets)
 * - Glassmorphism and micro-interactions
 * - Full accessibility support (ARIA, focus management)
 * - RTL support for Arabic
 * - Extended nutrition database (200+ foods)
 * - Quick quantity adjustments
 * - Portion size presets
 * - Visual portion guides
 * - Full i18n support (7 languages)
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
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
  Search,
  Flame,
  Beef,
  Wheat,
  Droplets,
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
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLInputElement>(null)
  const isRTL = i18n.language === 'ar'

  // Fetch recent foods from API
  const { data: recentFoodsData } = useQuery({
    queryKey: ['recentFoods'],
    queryFn: () => visionApi.getRecentFoods(10),
    staleTime: 5 * 60 * 1000,
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
        setFormData(prev => ({
          ...prev,
          name: result.product_name || '',
          quantity: result.serving_size ? result.serving_size.replace(/[^\d.]/g, '') || '100' : '100',
          unit: 'g',
        }))

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

  // Focus management and keyboard handling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (item) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      // Focus first input after animation
      setTimeout(() => {
        firstFocusableRef.current?.focus()
      }, 100)
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className={cn(
          "relative w-full flex flex-col",
          "max-h-[90vh]",
          "max-w-[calc(100vw-32px)] sm:max-w-[520px]",
          "bg-white dark:bg-gray-800",
          "rounded-2xl",
          "shadow-2xl",
          "overflow-hidden"
        )}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-500 text-white">
              <Edit3 className="w-5 h-5" />
            </div>
            <h2
              id="modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {t('editFood')}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            {formData.name && (
              <button
                onClick={() => handleToggleFavorite(formData.name || '')}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                  isFavorite
                    ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100"
                    : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                title={isFavorite ? t('favorites.remove') : t('favorites.add')}
                aria-label={isFavorite ? t('favorites.remove') : t('favorites.add')}
              >
                <Star className={cn("w-5 h-5", isFavorite && "fill-current")} />
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              aria-label={t('result.edit.cancel')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 sm:p-6 space-y-5">

            {/* Recent Foods Quick Access */}
            {recentFoods.length > 0 && (
              <section className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4" />
                  {t('recentFoods.title')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {recentFoods.slice(0, 6).map(food => (
                    <button
                      key={food}
                      onClick={() => selectFood(food)}
                      className="px-3 py-2 text-sm rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all min-h-[44px]"
                    >
                      {food}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Barcode Scanner Input */}
            {showBarcodeInput && (
              <section className="p-4 rounded-xl space-y-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  <Scan className="inline w-4 h-4 mr-2" />
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
                      if (e.key === 'Enter') handleBarcodeSearch()
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleBarcodeSearch}
                    disabled={isScanningBarcode || barcodeValue.length < 8}
                    className="shrink-0"
                  >
                    {isScanningBarcode ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
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
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('barcode.permission')}
                </p>
              </section>
            )}

            {/* Food Name with Autocomplete */}
            <section className="space-y-2 relative">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="food-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  {t('foodName')}
                </label>
                {!showBarcodeInput && (
                  <button
                    type="button"
                    onClick={() => setShowBarcodeInput(true)}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-lg",
                      "text-primary-600 dark:text-primary-400",
                      "hover:bg-primary-50 dark:hover:bg-primary-900/20",
                      "transition-colors duration-200"
                    )}
                  >
                    <Scan className="w-3.5 h-3.5" />
                    {t('barcode.scan')}
                  </button>
                )}
              </div>
              <div className="relative">
                <Search className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none",
                  isRTL ? "right-3" : "left-3"
                )} />
                <Input
                  ref={firstFocusableRef}
                  id="food-name"
                  value={formData.name}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                    setShowAutocomplete(true)
                  }}
                  onFocus={() => setShowAutocomplete(true)}
                  placeholder={t('foodNamePlaceholder')}
                  disabled={isLoading}
                  className={cn(
                    "w-full h-12 rounded-xl",
                    isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
                  )}
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-controls="food-autocomplete"
                  aria-expanded={showAutocomplete && autocompleteResults.length > 0}
                />
              </div>

              {/* Autocomplete Dropdown */}
              {showAutocomplete && autocompleteResults.length > 0 && (
                <div
                  id="food-autocomplete"
                  role="listbox"
                  className={cn(
                    "absolute z-20 w-full mt-1",
                    "bg-white dark:bg-gray-800",
                    "border border-gray-200 dark:border-gray-700",
                    "rounded-xl shadow-elevated",
                    "max-h-56 overflow-y-auto",
                    "animate-fade-in"
                  )}
                >
                  {autocompleteResults.map((food, index) => {
                    const entry = EXTENDED_NUTRITION_REFERENCE[food]
                    return (
                      <button
                        key={food}
                        role="option"
                        aria-selected={false}
                        onClick={() => selectFood(food)}
                        className={cn(
                          "w-full px-4 py-3 text-left min-h-[48px]",
                          "flex items-center justify-between gap-2",
                          "hover:bg-primary-50 dark:hover:bg-primary-900/20",
                          "transition-colors duration-150",
                          index === 0 && "rounded-t-xl",
                          index === autocompleteResults.length - 1 && "rounded-b-xl"
                        )}
                      >
                        <span className="capitalize text-gray-800 dark:text-gray-100 font-medium">
                          {food}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {entry?.nutrition.calories} kcal/100g
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Quantity Section */}
            <section className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('quantity')}
              </label>

              {/* Quick +/- Buttons and Input */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustQuantity(-10)}
                  disabled={isLoading}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl",
                    "border-2 border-gray-200 dark:border-gray-700",
                    "bg-white dark:bg-gray-800",
                    "text-gray-700 dark:text-gray-200",
                    "hover:border-primary-300 dark:hover:border-primary-600",
                    "hover:bg-primary-50 dark:hover:bg-primary-900/20",
                    "active:scale-95 transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  aria-label={t('edit.decreaseQuantity')}
                >
                  <Minus className="w-5 h-5" />
                </button>

                <div className="relative flex-1">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.quantity}
                    onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    disabled={isLoading}
                    className="w-full h-12 text-center text-lg font-semibold rounded-xl"
                    aria-label={t('quantity')}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => adjustQuantity(10)}
                  disabled={isLoading}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl",
                    "border-2 border-gray-200 dark:border-gray-700",
                    "bg-white dark:bg-gray-800",
                    "text-gray-700 dark:text-gray-200",
                    "hover:border-primary-300 dark:hover:border-primary-600",
                    "hover:bg-primary-50 dark:hover:bg-primary-900/20",
                    "active:scale-95 transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  aria-label={t('edit.increaseQuantity')}
                >
                  <Plus className="w-5 h-5" />
                </button>

                <select
                  value={formData.unit}
                  onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  disabled={isLoading}
                  className={cn(
                    "h-12 px-3 rounded-xl",
                    "border-2 border-gray-200 dark:border-gray-700",
                    "bg-white dark:bg-gray-800",
                    "text-gray-800 dark:text-gray-100",
                    "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
                    "focus:outline-none transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "min-w-[80px]"
                  )}
                  aria-label={t('unit')}
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
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-full min-h-[40px]",
                      "bg-gradient-to-r from-primary-50 to-emerald-50",
                      "dark:from-primary-900/30 dark:to-emerald-900/30",
                      "text-primary-700 dark:text-primary-300",
                      "border border-primary-200 dark:border-primary-700",
                      "hover:from-primary-100 hover:to-emerald-100",
                      "dark:hover:from-primary-900/40 dark:hover:to-emerald-900/40",
                      "hover:shadow-soft active:scale-95",
                      "transition-all duration-200",
                      "disabled:opacity-50"
                    )}
                  >
                    +{amount}g
                  </button>
                ))}
              </div>
            </section>

            {/* Portion Presets */}
            {portionPresets && portionPresets.length > 0 && (
              <section className="space-y-2">
                <button
                  onClick={() => setShowPortionPresets(!showPortionPresets)}
                  className={cn(
                    "flex items-center gap-2 w-full py-2",
                    "text-sm font-medium text-gray-700 dark:text-gray-200",
                    "hover:text-primary-600 dark:hover:text-primary-400",
                    "transition-colors duration-200"
                  )}
                  aria-expanded={showPortionPresets}
                >
                  {showPortionPresets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {t('edit.portionPresets')}
                </button>

                {showPortionPresets && (
                  <div className="grid grid-cols-3 gap-2 animate-fade-in">
                    {portionPresets.map(preset => {
                      const isSelected = formData.quantity === preset.grams.toString() && formData.unit === 'g'
                      return (
                        <button
                          key={preset.size}
                          onClick={() => selectPortionPreset(preset)}
                          disabled={isLoading}
                          className={cn(
                            "p-3 rounded-xl text-left min-h-[80px]",
                            "border-2 transition-all duration-200 active:scale-98",
                            isSelected
                              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 ring-2 ring-primary-500/20"
                              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-soft"
                          )}
                        >
                          <div className={cn(
                            "font-semibold capitalize",
                            isSelected ? "text-primary-700 dark:text-primary-300" : "text-gray-800 dark:text-white"
                          )}>
                            {t(`edit.portion.${preset.size}`)}
                          </div>
                          <div className={cn(
                            "text-sm",
                            isSelected ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"
                          )}>
                            {preset.grams}g
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">
                            {preset.description}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Visual Guide */}
            {visualGuide && (
              <div className={cn(
                "flex items-start gap-3 p-4 rounded-2xl",
                "bg-gradient-to-br from-blue-50 to-primary-50",
                "dark:from-blue-900/20 dark:to-primary-900/20",
                "border border-blue-200 dark:border-blue-800"
              )}>
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {visualGuide}
                </p>
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('edit.searchingNutrition')}
                </span>
              </div>
            )}

            {/* Source Badge */}
            {displayedNutrition && !manualMode && (
              <div className="flex items-center gap-2">
                {nutritionSource === 'local' ? (
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5",
                    "bg-success-100 dark:bg-success-900/30",
                    "text-success-700 dark:text-success-300",
                    "text-xs font-medium rounded-full"
                  )}>
                    <Database className="w-3.5 h-3.5" />
                    {t('edit.source.local')}
                  </span>
                ) : nutritionSource === 'usda' ? (
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5",
                    "bg-blue-100 dark:bg-blue-900/30",
                    "text-blue-700 dark:text-blue-300",
                    "text-xs font-medium rounded-full"
                  )}>
                    <Database className="w-3.5 h-3.5" />
                    USDA
                  </span>
                ) : (
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5",
                    "bg-accent-100 dark:bg-accent-900/30",
                    "text-accent-700 dark:text-accent-300",
                    "text-xs font-medium rounded-full"
                  )}>
                    <Sparkles className="w-3.5 h-3.5" />
                    {t('edit.source.ai')}
                  </span>
                )}
              </div>
            )}

            {/* Manual Mode Toggle */}
            {(displayedNutrition || searchResult) && (
              <div className={cn(
                "flex items-center justify-between p-4 rounded-2xl",
                "bg-gray-50 dark:bg-gray-800/50",
                "border border-gray-200 dark:border-gray-700"
              )}>
                <div className="flex items-center gap-3">
                  <Edit3 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {t('edit.manualEntry')}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={manualMode}
                  onClick={() => {
                    if (!manualMode && displayedNutrition) {
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
                  className={cn(
                    "relative inline-flex h-7 w-12 items-center rounded-full",
                    "transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                    manualMode
                      ? "bg-primary-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-5 w-5 transform rounded-full bg-white shadow-md",
                      "transition-transform duration-300",
                      manualMode
                        ? (isRTL ? "translate-x-1" : "translate-x-6")
                        : (isRTL ? "translate-x-6" : "translate-x-1")
                    )}
                  />
                </button>
              </div>
            )}

            {/* Nutrition Values */}
            {displayedNutrition && (
              <section className={cn(
                "rounded-2xl overflow-hidden",
                "bg-gradient-to-br from-gray-50 to-white",
                "dark:from-gray-800 dark:to-gray-900",
                "border border-gray-200 dark:border-gray-700"
              )}>
                {/* Section Header */}
                <div className={cn(
                  "flex items-center gap-2 px-4 py-3",
                  "border-b border-gray-200 dark:border-gray-700",
                  "bg-white dark:bg-gray-800"
                )}>
                  {manualMode ? (
                    <>
                      <Edit3 className="w-4 h-4 text-primary-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {t('edit.nutritionEditable')}
                      </span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-success-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {t('edit.nutritionAuto')}
                      </span>
                    </>
                  )}
                </div>

                {/* Nutrition Grid */}
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Calories - Full width on mobile */}
                  <div className={cn(
                    "col-span-2 sm:col-span-1 p-4 rounded-xl",
                    "bg-gradient-to-br from-accent-50 to-yellow-50",
                    "dark:from-accent-900/20 dark:to-yellow-900/20",
                    "border border-accent-200 dark:border-accent-800"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-4 h-4 text-accent-500" />
                      <label className="text-xs font-medium text-accent-700 dark:text-accent-300">
                        {t('edit.calories')}
                      </label>
                    </div>
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
                        className="w-full h-10 text-lg font-bold"
                      />
                    ) : (
                      <span className="block text-2xl font-bold text-accent-600 dark:text-accent-400">
                        {displayedNutrition.calories}
                        <span className="text-sm font-normal ml-1">kcal</span>
                      </span>
                    )}
                  </div>

                  {/* Protein */}
                  <div className={cn(
                    "p-3 rounded-xl",
                    "bg-blue-50 dark:bg-blue-900/20",
                    "border border-blue-200 dark:border-blue-800"
                  )}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Beef className="w-3.5 h-3.5 text-blue-500" />
                      <label className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        {t('edit.protein')}
                      </label>
                    </div>
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
                        className="w-full h-9 text-base"
                      />
                    ) : (
                      <span className="block text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {displayedNutrition.protein}g
                      </span>
                    )}
                  </div>

                  {/* Carbs */}
                  <div className={cn(
                    "p-3 rounded-xl",
                    "bg-yellow-50 dark:bg-yellow-900/20",
                    "border border-yellow-200 dark:border-yellow-800"
                  )}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Wheat className="w-3.5 h-3.5 text-yellow-500" />
                      <label className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                        {t('edit.carbs')}
                      </label>
                    </div>
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
                        className="w-full h-9 text-base"
                      />
                    ) : (
                      <span className="block text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                        {displayedNutrition.carbs}g
                      </span>
                    )}
                  </div>

                  {/* Fat */}
                  <div className={cn(
                    "p-3 rounded-xl",
                    "bg-error-50 dark:bg-error-900/20",
                    "border border-error-200 dark:border-error-800"
                  )}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Droplets className="w-3.5 h-3.5 text-error-500" />
                      <label className="text-xs font-medium text-error-700 dark:text-error-300">
                        {t('edit.fat')}
                      </label>
                    </div>
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
                        className="w-full h-9 text-base"
                      />
                    ) : (
                      <span className="block text-lg font-semibold text-error-600 dark:text-error-400">
                        {displayedNutrition.fat}g
                      </span>
                    )}
                  </div>

                  {/* Fiber */}
                  <div className={cn(
                    "p-3 rounded-xl",
                    "bg-success-50 dark:bg-success-900/20",
                    "border border-success-200 dark:border-success-800"
                  )}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-success-500 text-sm">F</span>
                      <label className="text-xs font-medium text-success-700 dark:text-success-300">
                        {t('edit.fiber')}
                      </label>
                    </div>
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
                        className="w-full h-9 text-base"
                      />
                    ) : (
                      <span className="block text-lg font-semibold text-success-600 dark:text-success-400">
                        {displayedNutrition.fiber}g
                      </span>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Not Found Message */}
            {!localNutrition && searchResult && !searchResult.found && !isSearching && !manualMode && (
              <div className={cn(
                "flex items-start gap-3 p-4 rounded-2xl",
                "bg-yellow-50 dark:bg-yellow-900/20",
                "border border-yellow-200 dark:border-yellow-800"
              )}>
                <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {t('edit.foodNotFound')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Sticky */}
        <footer className={cn(
          "flex items-center gap-3 px-4 sm:px-6 py-4",
          "border-t border-gray-100 dark:border-gray-800",
          "bg-white dark:bg-gray-900",
          "safe-area-bottom"
        )}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl font-medium"
          >
            {t('result.edit.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isValid || isLoading}
            className={cn(
              "flex-1 h-12 rounded-xl font-medium",
              "bg-gradient-to-r from-primary-500 to-emerald-500",
              "hover:from-primary-600 hover:to-emerald-600",
              "shadow-glow hover:shadow-glow-lg",
              "transition-all duration-300"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t('result.actions.saving')}
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {t('result.edit.save')}
              </>
            )}
          </Button>
        </footer>
      </div>
    </div>
  )
}
