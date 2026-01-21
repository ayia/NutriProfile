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
 * - Quick quantity adjustments
 * - Portion size presets
 * - Visual portion guides
 * - Full i18n support (7 languages)
 *
 * IMPORTANT (January 2026):
 * - Nutrition values come EXCLUSIVELY from USDA API
 * - Local database is ONLY used for autocomplete suggestions (UX)
 * - Auto-search triggered when food name and quantity are filled
 * - Cache LRU via nutritionApi for performance
 *
 * NOTE: This component is LIGHT MODE ONLY.
 * All dark: classes have been removed to ensure consistent white/light backgrounds.
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
  Edit3,
  Check,
  Plus,
  Minus,
  Star,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
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
  getPortionPresets,
  getVisualGuide,
  VISUAL_GUIDES,
  EXTENDED_NUTRITION_REFERENCE,
  type PortionPreset,
} from '@/data/nutritionReferenceExtended'
import { visionApi } from '@/services/visionApi'
import type { FoodItem, FoodItemUpdate } from './EditFoodItemModal'

interface EditFoodItemModalV2Props {
  item: FoodItem | null
  isOpen: boolean // Explicit open state to handle add mode (item=null, isOpen=true)
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
  isOpen,
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
    enabled: isOpen,
  })
  const recentFoods = recentFoodsData?.items?.map(f => f.name) ?? []

  // Fetch favorites from API
  const { data: favoritesData } = useQuery({
    queryKey: ['favoriteFoods'],
    queryFn: () => visionApi.getFavorites(),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
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

  // Search state - USDA API ONLY (no local database for nutrition values)
  const [searchResult, setSearchResult] = useState<NutritionSearchResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [manualMode, setManualMode] = useState(false)

  // Manual nutrition values
  const [manualNutrition, setManualNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  })

  // Original AI nutrition values (from item) - used for comparison
  const [originalNutrition, setOriginalNutrition] = useState<{
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  } | null>(null)

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

  // Determine if we're in add mode (item is null but modal is open)
  const isAddMode = isOpen && item === null

  // Initialize form when modal opens or item changes
  useEffect(() => {
    if (!isOpen) return

    if (item) {
      // Edit mode: populate with existing item data
      setFormData({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      })

      if (item.calories) {
        const originalValues = {
          calories: item.calories,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fat: item.fat || 0,
          fiber: item.fiber || 0,
        }
        setManualNutrition(originalValues)
        // Store original AI values for comparison with USDA
        setOriginalNutrition(originalValues)
      } else {
        setOriginalNutrition(null)
      }

      // Reset search state
      setSearchResult(null)
      setManualMode(false)
    } else {
      // Add mode: initialize with empty values
      setFormData({
        name: '',
        quantity: '100',
        unit: 'g',
      })
      setManualNutrition({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      })
      setOriginalNutrition(null)
      setSearchResult(null)
      setManualMode(false)
    }
  }, [isOpen, item])

  // NOTE: Auto-search removed in favor of manual "Rechercher" button
  // The user now clicks the search button to trigger USDA API search
  // This matches the UX of FoodItemExpandableCard for consistency

  // USDA API search - the ONLY source for nutrition values
  const performSearch = async () => {
    if (!formData.name || !formData.quantity) return

    const quantity = parseFloat(formData.quantity)
    if (isNaN(quantity) || quantity <= 0) return

    setIsSearching(true)

    try {
      // Uses LRU cache internally (0ms for repeated lookups)
      const result = await searchNutrition({
        food_name: formData.name,
        quantity_g: quantity,
        language: i18n.language,
      })

      setSearchResult(result)

      if (!result.found) {
        // NOT FOUND in USDA: Auto-enable manual mode for better UX
        setManualMode(true)
        // Copy current values or provide defaults
        setManualNutrition({
          calories: manualNutrition.calories || 100,
          protein: manualNutrition.protein || 5,
          carbs: manualNutrition.carbs || 15,
          fat: manualNutrition.fat || 3,
          fiber: manualNutrition.fiber || 2,
        })
        // Show helpful toast only once
        toast.info(t('edit.foodNotFound'), { duration: 4000 })
      }
    } catch (error) {
      console.error('USDA API search error:', error)
      // On API error, enable manual mode silently
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

  // Handle save - USDA values only (no local database)
  const handleSave = async () => {
    if (!formData.name || !formData.quantity) return

    const updateData: FoodItemUpdate = {
      name: formData.name,
      quantity: formData.quantity,
      unit: formData.unit,
    }

    // Priority: Manual mode > USDA API search result
    if (manualMode) {
      updateData.calories = manualNutrition.calories
      updateData.protein = manualNutrition.protein
      updateData.carbs = manualNutrition.carbs
      updateData.fat = manualNutrition.fat
      updateData.fiber = manualNutrition.fiber
    } else if (searchResult && searchResult.found) {
      // USDA API result
      updateData.calories = searchResult.calories
      updateData.protein = searchResult.protein
      updateData.carbs = searchResult.carbs
      updateData.fat = searchResult.fat
      updateData.fiber = searchResult.fiber
    }

    await onSave(updateData)
  }

  // Validation - requires USDA result or manual mode
  const isValid =
    formData.name &&
    formData.quantity &&
    !isNaN(parseFloat(formData.quantity)) &&
    parseFloat(formData.quantity) > 0 &&
    (manualMode ? manualNutrition.calories > 0 : (searchResult?.found ?? false))

  // Focus management and keyboard handling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
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
  }, [isOpen, onClose])

  // Don't render if modal is not open
  if (!isOpen) return null

  // Determine displayed nutrition - USDA only (no local database)
  const displayedNutrition = manualMode
    ? manualNutrition
    : (searchResult?.found ? {
        calories: searchResult.calories,
        protein: searchResult.protein,
        carbs: searchResult.carbs,
        fat: searchResult.fat,
        fiber: searchResult.fiber,
      } : null)

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
          "bg-white",
          "rounded-2xl",
          "shadow-2xl",
          "overflow-hidden"
        )}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-500 text-white">
              {isAddMode ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            </div>
            <h2
              id="modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              {isAddMode ? t('addFood') : t('editFood')}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            {formData.name && (
              <button
                onClick={() => handleToggleFavorite(formData.name || '')}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                  isFavorite
                    ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100"
                    : "text-gray-400 hover:bg-gray-100"
                )}
                title={isFavorite ? t('favorites.remove') : t('favorites.add')}
                aria-label={isFavorite ? t('favorites.remove') : t('favorites.add')}
              >
                <Star className={cn("w-5 h-5", isFavorite && "fill-current")} />
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:bg-gray-100 transition-all"
              aria-label={t('result.edit.cancel')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-white">
          <div className="p-4 sm:p-6 space-y-5">

            {/* Recent Foods Quick Access */}
            {recentFoods.length > 0 && (
              <section className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Clock className="w-4 h-4" />
                  {t('recentFoods.title')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {recentFoods.slice(0, 6).map(food => (
                    <button
                      key={food}
                      onClick={() => selectFood(food)}
                      className="px-3 py-2 text-sm rounded-xl bg-gray-100 border border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50 transition-all min-h-[44px]"
                    >
                      {food}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Food Name with Autocomplete and Search Button */}
            <section className="space-y-2 relative">
              <label
                htmlFor="food-name"
                className="block text-sm font-medium text-gray-700"
              >
                {t('foodName')}
              </label>

              {/* Food Name Input + Search Button (same layout as FoodItemExpandableCard) */}
              <div className="flex gap-2">
                <div className="relative flex-1">
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
                      // Reset search when name changes
                      setSearchResult(null)
                    }}
                    onFocus={() => setShowAutocomplete(true)}
                    placeholder={t('foodNamePlaceholder')}
                    disabled={isLoading}
                    className={cn(
                      "w-full h-12 rounded-xl bg-white",
                      isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
                    )}
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-controls="food-autocomplete"
                    aria-expanded={showAutocomplete && autocompleteResults.length > 0}
                  />
                </div>

                {/* Search Button - Same design as FoodItemExpandableCard */}
                <button
                  onClick={() => {
                    setShowAutocomplete(false)
                    performSearch()
                  }}
                  disabled={isSearching || !formData.name || formData.name.length < 2 || !formData.quantity}
                  className={cn(
                    "flex items-center justify-center h-12 px-4 rounded-xl font-medium transition-all",
                    "bg-gradient-to-r from-primary-500 to-emerald-500 text-white",
                    "hover:from-primary-600 hover:to-emerald-600",
                    "shadow-lg hover:shadow-xl",
                    "active:scale-95",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  )}
                  aria-label={t('edit.searchNutrition')}
                >
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5 sm:mr-2" />
                      <span className="hidden sm:inline">{t('edit.search')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {showAutocomplete && autocompleteResults.length > 0 && (
                <div
                  id="food-autocomplete"
                  role="listbox"
                  className={cn(
                    "absolute z-20 w-full mt-1",
                    "bg-white",
                    "border border-gray-200",
                    "rounded-xl shadow-lg",
                    "max-h-56 overflow-y-auto"
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
                          "w-full px-4 py-3 text-left min-h-[48px] bg-white",
                          "flex items-center justify-between gap-2",
                          "hover:bg-primary-50",
                          "transition-colors duration-150",
                          index === 0 && "rounded-t-xl",
                          index === autocompleteResults.length - 1 && "rounded-b-xl"
                        )}
                      >
                        <span className="capitalize text-gray-800 font-medium">
                          {food}
                        </span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {entry?.nutrition.calories} kcal/100g
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Search Result Status - Found */}
              {searchResult?.found && !isSearching && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                  <Check className="w-4 h-4" />
                  <span>{t('edit.foundInUSDA')}</span>
                </div>
              )}

              {/* Search Result Status - Not Found */}
              {searchResult && !searchResult.found && !isSearching && !manualMode && (
                <div className="flex items-center gap-2 mt-2 text-sm text-amber-600">
                  <Info className="w-4 h-4" />
                  <span>{t('edit.notFoundInUSDA')}</span>
                </div>
              )}

              {/* Hint text for minimum characters */}
              {formData.name && formData.name.length < 2 && !manualMode && (
                <p className="text-xs text-gray-500 mt-2">
                  {t('edit.enterFoodName')}
                </p>
              )}
            </section>

            {/* Quantity Section */}
            <section className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
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
                    "border-2 border-gray-200",
                    "bg-white",
                    "text-gray-700",
                    "hover:border-primary-300",
                    "hover:bg-primary-50",
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
                    className="w-full h-12 text-center text-lg font-semibold rounded-xl bg-white"
                    aria-label={t('quantity')}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => adjustQuantity(10)}
                  disabled={isLoading}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl",
                    "border-2 border-gray-200",
                    "bg-white",
                    "text-gray-700",
                    "hover:border-primary-300",
                    "hover:bg-primary-50",
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
                    "border-2 border-gray-200",
                    "bg-white",
                    "text-gray-800",
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
                      "text-primary-700",
                      "border border-primary-200",
                      "hover:from-primary-100 hover:to-emerald-100",
                      "hover:shadow-md active:scale-95",
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
                    "text-sm font-medium text-gray-700",
                    "hover:text-primary-600",
                    "transition-colors duration-200"
                  )}
                  aria-expanded={showPortionPresets}
                >
                  {showPortionPresets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {t('edit.portionPresets')}
                </button>

                {showPortionPresets && (
                  <div className="grid grid-cols-3 gap-2">
                    {portionPresets.map(preset => {
                      const isSelected = formData.quantity === preset.grams.toString() && formData.unit === 'g'
                      return (
                        <button
                          key={preset.size}
                          onClick={() => selectPortionPreset(preset)}
                          disabled={isLoading}
                          className={cn(
                            "p-3 rounded-xl text-left min-h-[80px]",
                            "border-2 transition-all duration-200 active:scale-95",
                            isSelected
                              ? "border-primary-500 bg-primary-50 ring-2 ring-primary-500/20"
                              : "border-gray-200 bg-white hover:border-primary-300 hover:shadow-md"
                          )}
                        >
                          <div className={cn(
                            "font-semibold capitalize",
                            isSelected ? "text-primary-700" : "text-gray-800"
                          )}>
                            {t(`edit.portion.${preset.size}`)}
                          </div>
                          <div className={cn(
                            "text-sm",
                            isSelected ? "text-primary-600" : "text-gray-500"
                          )}>
                            {preset.grams}g
                          </div>
                          <div className="text-xs text-gray-400 mt-1 line-clamp-1">
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
                "border border-blue-200"
              )}>
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  {visualGuide}
                </p>
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                <span className="text-sm text-gray-600">
                  {t('edit.searchingNutrition')}
                </span>
              </div>
            )}

            {/* Source Badge with Original AI Values Comparison */}
            {displayedNutrition && !manualMode && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5",
                    "bg-blue-100",
                    "text-blue-700",
                    "text-xs font-medium rounded-full"
                  )}>
                    <Database className="w-3.5 h-3.5" />
                    USDA
                  </span>
                </div>

                {/* Show original AI values if they differ significantly from USDA */}
                {originalNutrition && searchResult?.found && Math.abs(originalNutrition.calories - displayedNutrition.calories) >= 10 && (
                  <div className={cn(
                    "p-3 rounded-xl",
                    "bg-amber-50",
                    "border border-amber-200"
                  )}>
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <p className="text-xs text-amber-800">
                          {t('edit.valuesUpdated', { original: Math.round(originalNutrition.calories), usda: Math.round(displayedNutrition.calories) })}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setManualNutrition(originalNutrition)
                            setManualMode(true)
                          }}
                          className={cn(
                            "text-xs font-medium px-2 py-1 rounded-lg",
                            "text-amber-700 bg-amber-100 hover:bg-amber-200",
                            "transition-colors duration-200"
                          )}
                        >
                          {t('edit.keepOriginal')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manual Mode Toggle */}
            {(displayedNutrition || searchResult) && (
              <div className={cn(
                "flex items-center justify-between p-4 rounded-2xl",
                "bg-gray-50",
                "border border-gray-200"
              )}>
                <div className="flex items-center gap-3">
                  <Edit3 className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
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
                      : "bg-gray-300"
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
                "border border-gray-200"
              )}>
                {/* Section Header */}
                <div className={cn(
                  "flex items-center gap-2 px-4 py-3",
                  "border-b border-gray-200",
                  "bg-white"
                )}>
                  {manualMode ? (
                    <>
                      <Edit3 className="w-4 h-4 text-primary-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {t('edit.nutritionEditable')}
                      </span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {t('edit.nutritionAuto')}
                      </span>
                    </>
                  )}
                </div>

                {/* Nutrition Grid */}
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50">
                  {/* Calories - Full width on mobile */}
                  <div className={cn(
                    "col-span-2 sm:col-span-1 p-4 rounded-xl",
                    "bg-gradient-to-br from-orange-50 to-yellow-50",
                    "border border-orange-200"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <label className="text-xs font-medium text-orange-700">
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
                        className="w-full h-10 text-lg font-bold bg-white"
                      />
                    ) : (
                      <span className="block text-2xl font-bold text-orange-600">
                        {displayedNutrition.calories}
                        <span className="text-sm font-normal ml-1">kcal</span>
                      </span>
                    )}
                  </div>

                  {/* Protein */}
                  <div className={cn(
                    "p-3 rounded-xl",
                    "bg-blue-50",
                    "border border-blue-200"
                  )}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Beef className="w-3.5 h-3.5 text-blue-500" />
                      <label className="text-xs font-medium text-blue-700">
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
                        className="w-full h-9 text-base bg-white"
                      />
                    ) : (
                      <span className="block text-lg font-semibold text-blue-600">
                        {displayedNutrition.protein}g
                      </span>
                    )}
                  </div>

                  {/* Carbs */}
                  <div className={cn(
                    "p-3 rounded-xl",
                    "bg-yellow-50",
                    "border border-yellow-200"
                  )}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Wheat className="w-3.5 h-3.5 text-yellow-500" />
                      <label className="text-xs font-medium text-yellow-700">
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
                        className="w-full h-9 text-base bg-white"
                      />
                    ) : (
                      <span className="block text-lg font-semibold text-yellow-600">
                        {displayedNutrition.carbs}g
                      </span>
                    )}
                  </div>

                  {/* Fat */}
                  <div className={cn(
                    "p-3 rounded-xl",
                    "bg-red-50",
                    "border border-red-200"
                  )}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Droplets className="w-3.5 h-3.5 text-red-500" />
                      <label className="text-xs font-medium text-red-700">
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
                        className="w-full h-9 text-base bg-white"
                      />
                    ) : (
                      <span className="block text-lg font-semibold text-red-600">
                        {displayedNutrition.fat}g
                      </span>
                    )}
                  </div>

                  {/* Fiber */}
                  <div className={cn(
                    "p-3 rounded-xl",
                    "bg-green-50",
                    "border border-green-200"
                  )}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-green-500 text-sm">F</span>
                      <label className="text-xs font-medium text-green-700">
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
                        className="w-full h-9 text-base bg-white"
                      />
                    ) : (
                      <span className="block text-lg font-semibold text-green-600">
                        {displayedNutrition.fiber}g
                      </span>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Not Found in USDA Message */}
            {searchResult && !searchResult.found && !isSearching && !manualMode && (
              <div className={cn(
                "flex items-start gap-3 p-4 rounded-2xl",
                "bg-yellow-50",
                "border border-yellow-200"
              )}>
                <Info className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  {t('edit.foodNotFound')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Sticky */}
        <footer className={cn(
          "flex items-center gap-3 px-4 sm:px-6 py-4",
          "border-t border-gray-100",
          "bg-white"
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
              "shadow-lg hover:shadow-xl",
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
