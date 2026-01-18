/**
 * FoodItemExpandableCard - Inline Expandable Card for Food Editing
 * Build: 2026-01-18T16:00:00Z - Added explicit search button
 *
 * Pattern: Expandable Card (no modal/overlay)
 * - Expands inline to show edit fields
 * - 100% responsive (375px - 1920px+)
 * - Smooth animation
 * - Autocomplete + nutrition calculation
 * - Modern UI with gradients and micro-interactions
 * - Manual nutrition entry mode
 * - API backend integration for nutrition search with LRU cache
 * - Source badge (Local/USDA/AI)
 * - EXPLICIT SEARCH BUTTON (January 2026)
 *
 * Phase 2 Update:
 * - Removed automatic debounce search
 * - Added explicit search button next to food name
 * - User clicks button or presses Enter to search
 * - Search status message shows found/not found
 *
 * NOTE: This component is LIGHT MODE ONLY.
 * All dark: classes have been removed to ensure consistent white/light backgrounds.
 */

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import {
  ChevronUp,
  Check,
  X,
  Plus,
  Minus,
  Loader2,
  Flame,
  Search,
  Scale,
  Edit3,
  Beef,
  Wheat,
  Droplet,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Database,
  Sparkles,
  Info,
} from '@/lib/icons'
import {
  searchFoodsExtended,
  getNutrition,
  getPortionPresets,
  EXTENDED_NUTRITION_REFERENCE,
} from '@/data/nutritionReferenceExtended'
import { searchNutrition } from '@/services/nutritionApi'
import type { DetectedItem, FoodItemUpdate } from '@/types/foodLog'

// REMOVED: Automatic debounce - Now using explicit search button
// const API_DEBOUNCE_MS = 300

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

// Portion size icons (using simple visual representations)
const PORTION_ICONS = {
  small: '1/4',
  medium: '1/2',
  large: '1',
} as const

export function FoodItemExpandableCard({
  item,
  index,
  isExpanded,
  onToggleExpand,
  onSave,
  getConfidenceLabel,
}: FoodItemExpandableCardProps) {
  const { t, i18n } = useTranslation('vision')
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

  // Manual mode state
  const [manualMode, setManualMode] = useState(false)
  const [manualNutrition, setManualNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  })

  // API search state
  const [isSearching, setIsSearching] = useState(false)
  const [nutritionSource, setNutritionSource] = useState<'local' | 'usda' | 'llm' | 'manual'>('local')
  const [hasSearched, setHasSearched] = useState(false)
  const [searchResultFound, setSearchResultFound] = useState<boolean | null>(null)

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
    setManualNutrition({
      calories: item.calories || 0,
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      fiber: item.fiber || 0,
    })
    setManualMode(false)
    setNutritionSource('local')
  }, [item])

  // Manual search function - triggered by button click or Enter key
  const handleSearchClick = async () => {
    // Validation
    if (!formData.name || formData.name.length < 2) {
      toast.error(t('edit.enterFoodName'))
      return
    }

    // Check local database first
    const localNutrition = getNutrition(formData.name, parseFloat(formData.quantity) || 100, formData.unit)
    if (localNutrition) {
      setFormData(prev => ({
        ...prev,
        calories: Math.round(localNutrition.calories),
        protein: Math.round(localNutrition.protein * 10) / 10,
        carbs: Math.round(localNutrition.carbs * 10) / 10,
        fat: Math.round(localNutrition.fat * 10) / 10,
        fiber: Math.round(localNutrition.fiber * 10) / 10,
      }))
      setNutritionSource('local')
      setHasSearched(true)
      setSearchResultFound(true)
      return
    }

    // Search API backend (uses LRU cache internally for 0ms repeated lookups)
    setIsSearching(true)
    setHasSearched(true)
    try {
      const result = await searchNutrition({
        food_name: formData.name,
        quantity_g: parseFloat(formData.quantity) || 100,
        language: i18n.language,
      })

      if (result.found) {
        // Success: update nutrition values
        setFormData(prev => ({
          ...prev,
          calories: Math.round(result.calories),
          protein: Math.round(result.protein * 10) / 10,
          carbs: Math.round(result.carbs * 10) / 10,
          fat: Math.round(result.fat * 10) / 10,
          fiber: Math.round(result.fiber * 10) / 10,
        }))
        setNutritionSource(result.source === 'llm' ? 'llm' : 'usda')
        setSearchResultFound(true)
      } else {
        // NOT FOUND: Auto-enable manual mode for better UX
        setManualMode(true)
        setManualNutrition({
          calories: formData.calories || 100,
          protein: formData.protein || 5,
          carbs: formData.carbs || 15,
          fat: formData.fat || 3,
          fiber: formData.fiber || 2,
        })
        setNutritionSource('manual')
        setSearchResultFound(false)
        // Show helpful toast
        toast.info(t('edit.foodNotFound'), {
          duration: 4000,
          icon: <Info className="w-4 h-4" />,
        })
      }
    } catch (error) {
      console.error('Nutrition search error:', error)
      // On API error, don't block the user - enable manual mode
      setManualMode(true)
      setNutritionSource('manual')
      setSearchResultFound(false)
    } finally {
      setIsSearching(false)
    }
  }

  // Reset search state when food name changes
  useEffect(() => {
    setHasSearched(false)
    setSearchResultFound(null)
  }, [formData.name])

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
    // 1. Try local database first (instant)
    const localNutrition = getNutrition(foodName, parseFloat(formData.quantity) || 100, formData.unit)

    if (localNutrition) {
      setFormData(prev => ({
        ...prev,
        name: foodName,
        calories: Math.round(localNutrition.calories),
        protein: Math.round(localNutrition.protein * 10) / 10,
        carbs: Math.round(localNutrition.carbs * 10) / 10,
        fat: Math.round(localNutrition.fat * 10) / 10,
        fiber: Math.round((localNutrition.fiber || 0) * 10) / 10,
      }))
      setNutritionSource('local')
    } else {
      // Just update the name, let debounce effect call API
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
        setNutritionSource('local')
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
        // Use manual nutrition if manual mode is active
        calories: manualMode ? manualNutrition.calories : formData.calories,
        protein: manualMode ? manualNutrition.protein : formData.protein,
        carbs: manualMode ? manualNutrition.carbs : formData.carbs,
        fat: manualMode ? manualNutrition.fat : formData.fat,
        fiber: manualMode ? manualNutrition.fiber : formData.fiber,
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
    setManualMode(false)
    onToggleExpand(null)
  }

  // Toggle manual mode
  const handleToggleManualMode = () => {
    if (!manualMode) {
      // Copy current values to manual
      setManualNutrition({
        calories: formData.calories,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
        fiber: formData.fiber,
      })
      setNutritionSource('manual')
    }
    setManualMode(!manualMode)
  }

  // Get portion presets for current food
  const portionPresets = getPortionPresets(formData.name)

  // Confidence badge configuration
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return {
        icon: CheckCircle,
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
        border: 'border-green-200',
        text: 'text-green-700',
        iconColor: 'text-green-500',
      }
    } else if (confidence >= 0.6) {
      return {
        icon: AlertCircle,
        bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        iconColor: 'text-yellow-500',
      }
    }
    return {
      icon: AlertTriangle,
      bg: 'bg-gradient-to-r from-orange-50 to-red-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      iconColor: 'text-orange-500',
    }
  }

  const confidenceBadge = getConfidenceBadge(item.confidence)
  const ConfidenceIcon = confidenceBadge.icon

  // Displayed nutrition values (manual or auto)
  const displayedNutrition = manualMode ? manualNutrition : formData

  return (
    <div
      ref={cardRef}
      className={cn(
        "border rounded-2xl overflow-hidden transition-all duration-300 bg-white",
        isExpanded
          ? "border-primary-400 shadow-xl ring-2 ring-primary-500/20"
          : "border-gray-200 hover:border-primary-300 hover:shadow-lg"
      )}
    >
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={() => onToggleExpand(isExpanded ? null : index)}
        className={cn(
          "w-full p-4 sm:p-5 flex items-center justify-between text-left",
          "bg-gradient-to-r from-white to-gray-50/50",
          "hover:from-gray-50 hover:to-white",
          "transition-all duration-200"
        )}
      >
        <div className="flex-1 min-w-0">
          {/* Food name and badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="font-semibold text-gray-900 capitalize text-base sm:text-lg">
              {item.name}
            </span>
            <span className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full",
              "bg-gray-100 text-gray-600 border border-gray-200"
            )}>
              {item.quantity} {item.unit}
            </span>
            {item.source === 'manual' && (
              <span className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full",
                "bg-gradient-to-r from-blue-50 to-indigo-50",
                "text-blue-700 border border-blue-200"
              )}>
                {t('userCorrected')}
              </span>
            )}
            {/* Confidence Badge */}
            <span className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
              confidenceBadge.bg,
              confidenceBadge.border,
              confidenceBadge.text,
              "border"
            )}>
              <ConfidenceIcon className={cn("w-3.5 h-3.5", confidenceBadge.iconColor)} />
              {getConfidenceLabel(item.confidence)}
            </span>
          </div>

          {/* Nutrition summary with icons */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-gray-800">{item.calories} kcal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Beef className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-600">{item.protein}g</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wheat className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-600">{item.carbs}g</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-purple-600">{item.fat}g</span>
            </div>
          </div>
        </div>

        {/* Expand/Collapse button */}
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl ml-3",
          "transition-all duration-300",
          isExpanded
            ? "bg-gradient-to-br from-primary-500 to-emerald-500 text-white shadow-lg"
            : "bg-gray-100 text-gray-500 hover:bg-primary-100 hover:text-primary-600"
        )}>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <Edit3 className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Expanded Edit Section */}
      {isExpanded && (
        <div className="px-4 sm:px-5 pb-5 border-t border-gray-100 space-y-5 bg-gradient-to-b from-gray-50/50 to-white">
          {/* Food Name with Autocomplete and Search Button */}
          <div className="pt-5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2.5">
              <Search className="w-4 h-4 text-primary-500" />
              {t('foodName')}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onFocus={() => formData.name.length >= 2 && setShowAutocomplete(autocompleteResults.length > 0)}
                  onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      setShowAutocomplete(false)
                      handleSearchClick()
                    }
                  }}
                  placeholder={t('foodNamePlaceholder')}
                  className={cn(
                    "pl-11 h-12 bg-white rounded-xl",
                    "border-2 border-gray-200",
                    "focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20",
                    "transition-all duration-200"
                  )}
                />

                {/* Autocomplete dropdown */}
                {showAutocomplete && (
                  <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                    {autocompleteResults.map((food, idx) => {
                      const entry = EXTENDED_NUTRITION_REFERENCE[food]
                      return (
                        <button
                          key={food}
                          type="button"
                          onClick={() => selectFood(food)}
                          className={cn(
                            "w-full px-4 py-3.5 text-left flex items-center justify-between bg-white",
                            "hover:bg-gradient-to-r hover:from-primary-50 hover:to-emerald-50",
                            "transition-all duration-150",
                            idx === 0 && "rounded-t-xl",
                            idx === autocompleteResults.length - 1 && "rounded-b-xl"
                          )}
                        >
                          <span className="font-medium capitalize text-gray-900">{food}</span>
                          {entry && entry.nutrition && (
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {entry.nutrition.calories} kcal
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button
                type="button"
                onClick={() => {
                  setShowAutocomplete(false)
                  handleSearchClick()
                }}
                disabled={isSearching || !formData.name || formData.name.length < 2}
                className={cn(
                  "flex items-center justify-center h-12 px-4 rounded-xl font-medium transition-all",
                  "bg-gradient-to-r from-primary-500 to-emerald-500 text-white",
                  "hover:from-primary-600 hover:to-emerald-600 shadow-lg",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
                  "active:scale-95"
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

            {/* Search Status Message */}
            {hasSearched && !isSearching && searchResultFound !== null && (
              <div className={cn(
                "flex items-center gap-3 p-3 rounded-xl mt-3",
                searchResultFound
                  ? "bg-green-50 text-green-700"
                  : "bg-orange-50 text-orange-700"
              )}>
                {searchResultFound ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">
                      {t('edit.foundFrom')} {nutritionSource === 'usda' ? 'USDA' : nutritionSource === 'local' ? t('edit.source.local') : t('edit.source.ai')}
                    </span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    <span className="text-sm">{t('edit.foodNotFound')}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quantity Controls */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2.5">
              <Scale className="w-4 h-4 text-primary-500" />
              {t('quantity')}
            </label>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Minus button */}
              <button
                type="button"
                onClick={() => adjustQuantity(-10)}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl",
                  "bg-gradient-to-br from-gray-50 to-white",
                  "border-2 border-gray-200",
                  "text-gray-700",
                  "hover:border-primary-300 hover:from-primary-50 hover:to-emerald-50",
                  "hover:text-primary-600",
                  "active:scale-95 transition-all duration-200",
                  "shadow-sm hover:shadow-md"
                )}
                aria-label={t('edit.decreaseQuantity')}
              >
                <Minus className="w-5 h-5" />
              </button>

              {/* Quantity input */}
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => updateQuantity(e.target.value)}
                className={cn(
                  "flex-1 h-12 text-center text-lg font-bold rounded-xl bg-white",
                  "border-2 border-gray-200",
                  "focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                )}
                min="0"
              />

              {/* Plus button */}
              <button
                type="button"
                onClick={() => adjustQuantity(10)}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl",
                  "bg-gradient-to-br from-primary-50 to-emerald-50",
                  "border-2 border-primary-200",
                  "text-primary-600",
                  "hover:from-primary-100 hover:to-emerald-100",
                  "hover:border-primary-300",
                  "active:scale-95 transition-all duration-200",
                  "shadow-sm hover:shadow-md"
                )}
                aria-label={t('edit.increaseQuantity')}
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Unit selector */}
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className={cn(
                  "h-12 px-3 rounded-xl min-w-[85px]",
                  "border-2 border-gray-200 bg-white",
                  "text-gray-800 font-medium",
                  "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
                  "focus:outline-none transition-all duration-200",
                  "cursor-pointer hover:border-gray-300"
                )}
              >
                {UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {t(unit.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick quantity buttons */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => adjustQuantity(amount)}
                  className={cn(
                    "px-4 py-2.5 text-sm font-semibold rounded-full min-h-[44px]",
                    "bg-gradient-to-r from-primary-50 to-emerald-50",
                    "text-primary-700",
                    "border-2 border-primary-200",
                    "hover:from-primary-100 hover:to-emerald-100",
                    "hover:border-primary-300",
                    "hover:shadow-lg active:scale-95",
                    "transition-all duration-200"
                  )}
                >
                  +{amount}g
                </button>
              ))}
            </div>
          </div>

          {/* Portion Presets */}
          {portionPresets && portionPresets.length > 0 && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <span className="w-4 h-4 flex items-center justify-center text-primary-500 text-xs font-bold">S/M/L</span>
                {t('edit.portionPresets')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {portionPresets.map((preset) => {
                  const isSelected = formData.quantity === preset.grams.toString() && formData.unit === 'g'
                  const portionIcon = PORTION_ICONS[preset.size as keyof typeof PORTION_ICONS] || ''
                  return (
                    <button
                      key={preset.size}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, quantity: preset.grams.toString(), unit: 'g' }))
                        updateQuantity(preset.grams.toString())
                      }}
                      className={cn(
                        "p-4 rounded-2xl text-center min-h-[90px]",
                        "border-2 transition-all duration-200 active:scale-95",
                        isSelected
                          ? "border-primary-500 bg-gradient-to-br from-primary-50 to-emerald-50 ring-2 ring-primary-500/30 shadow-lg"
                          : "border-gray-200 bg-white hover:border-primary-300 hover:shadow-lg hover:bg-gradient-to-br hover:from-gray-50 hover:to-white"
                      )}
                    >
                      {/* Visual portion indicator */}
                      <div className={cn(
                        "w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center text-sm font-bold",
                        isSelected
                          ? "bg-gradient-to-br from-primary-500 to-emerald-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600"
                      )}>
                        {portionIcon}
                      </div>
                      <div className={cn(
                        "font-semibold capitalize text-sm",
                        isSelected ? "text-primary-700" : "text-gray-800"
                      )}>
                        {t(`edit.portion.${preset.size}`)}
                      </div>
                      <div className={cn(
                        "text-xs mt-1 font-medium",
                        isSelected ? "text-primary-600" : "text-gray-500"
                      )}>
                        {preset.grams}g
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Loading indicator during API search */}
          {isSearching && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
              <span className="text-sm text-gray-600">{t('edit.searchingNutrition')}</span>
            </div>
          )}

          {/* Source Badge */}
          {!manualMode && nutritionSource && (
            <div className="flex items-center gap-2">
              {nutritionSource === 'local' && (
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5",
                  "bg-green-100 text-green-700",
                  "text-xs font-medium rounded-full"
                )}>
                  <Database className="w-3.5 h-3.5" />
                  {t('edit.source.local')}
                </span>
              )}
              {nutritionSource === 'usda' && (
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5",
                  "bg-blue-100 text-blue-700",
                  "text-xs font-medium rounded-full"
                )}>
                  <Database className="w-3.5 h-3.5" />
                  USDA
                </span>
              )}
              {nutritionSource === 'llm' && (
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5",
                  "bg-orange-100 text-orange-700",
                  "text-xs font-medium rounded-full"
                )}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('edit.source.ai')}
                </span>
              )}
            </div>
          )}

          {/* Manual Mode Toggle */}
          <div className={cn(
            "flex items-center justify-between p-4 rounded-2xl",
            "bg-gray-50 border border-gray-200"
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
              onClick={handleToggleManualMode}
              className={cn(
                "relative inline-flex h-7 w-12 items-center rounded-full",
                "transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                manualMode ? "bg-primary-500" : "bg-gray-300"
              )}
            >
              <span className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow-md",
                "transition-transform duration-300",
                manualMode ? "translate-x-6" : "translate-x-1"
              )} />
            </button>
          </div>

          {/* Nutrition Preview */}
          <div className={cn(
            "rounded-2xl overflow-hidden",
            "bg-white",
            "border-2 border-gray-200",
            "shadow-sm"
          )}>
            {/* Section Header */}
            <div className={cn(
              "flex items-center gap-2 px-4 py-3",
              "bg-gradient-to-r from-gray-50 to-white",
              "border-b border-gray-100"
            )}>
              {manualMode ? (
                <>
                  <Edit3 className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    {t('edit.nutritionEditable')}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {t('nutritionPreview')}
                  </span>
                </>
              )}
            </div>

            {/* Nutrition Grid */}
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Calories - Highlighted */}
              <div className={cn(
                "col-span-2 sm:col-span-1 p-4 rounded-xl text-center",
                "bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50",
                "border-2 border-orange-200",
                "relative overflow-hidden"
              )}>
                {/* Decorative gradient circle */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-orange-200/30 to-yellow-200/30 rounded-full blur-xl" />
                <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                {manualMode ? (
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={manualNutrition.calories}
                    onChange={(e) => setManualNutrition(prev => ({
                      ...prev,
                      calories: parseInt(e.target.value) || 0,
                    }))}
                    className="w-full h-10 text-xl font-bold text-center bg-white border-2 border-orange-300 rounded-lg"
                  />
                ) : (
                  <div className="text-3xl font-bold text-orange-600 relative">{displayedNutrition.calories}</div>
                )}
                <div className="text-xs font-semibold text-orange-700 uppercase tracking-wide">{t('edit.calories')}</div>
              </div>

              {/* Protein */}
              <div className={cn(
                "p-3 rounded-xl text-center",
                "bg-gradient-to-br from-blue-50 to-indigo-50",
                "border-2 border-blue-200"
              )}>
                <Beef className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                {manualMode ? (
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={manualNutrition.protein}
                    onChange={(e) => setManualNutrition(prev => ({
                      ...prev,
                      protein: parseFloat(e.target.value) || 0,
                    }))}
                    className="w-full h-9 text-base font-bold text-center bg-white border-2 border-blue-300 rounded-lg"
                  />
                ) : (
                  <div className="text-xl font-bold text-blue-600">{displayedNutrition.protein}g</div>
                )}
                <div className="text-xs font-semibold text-blue-700">{t('edit.protein')}</div>
              </div>

              {/* Carbs */}
              <div className={cn(
                "p-3 rounded-xl text-center",
                "bg-gradient-to-br from-amber-50 to-yellow-50",
                "border-2 border-amber-200"
              )}>
                <Wheat className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                {manualMode ? (
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={manualNutrition.carbs}
                    onChange={(e) => setManualNutrition(prev => ({
                      ...prev,
                      carbs: parseFloat(e.target.value) || 0,
                    }))}
                    className="w-full h-9 text-base font-bold text-center bg-white border-2 border-amber-300 rounded-lg"
                  />
                ) : (
                  <div className="text-xl font-bold text-amber-600">{displayedNutrition.carbs}g</div>
                )}
                <div className="text-xs font-semibold text-amber-700">{t('edit.carbs')}</div>
              </div>

              {/* Fat */}
              <div className={cn(
                "p-3 rounded-xl text-center",
                "bg-gradient-to-br from-purple-50 to-pink-50",
                "border-2 border-purple-200"
              )}>
                <Droplet className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                {manualMode ? (
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={manualNutrition.fat}
                    onChange={(e) => setManualNutrition(prev => ({
                      ...prev,
                      fat: parseFloat(e.target.value) || 0,
                    }))}
                    className="w-full h-9 text-base font-bold text-center bg-white border-2 border-purple-300 rounded-lg"
                  />
                ) : (
                  <div className="text-xl font-bold text-purple-600">{displayedNutrition.fat}g</div>
                )}
                <div className="text-xs font-semibold text-purple-700">{t('edit.fat')}</div>
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
              className={cn(
                "flex-1 h-12 rounded-xl font-semibold",
                "border-2 border-gray-300",
                "text-gray-600",
                "hover:bg-gray-100 hover:border-gray-400",
                "transition-all duration-200"
              )}
            >
              <X className="w-4 h-4 mr-2" />
              {t('result.edit.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !formData.name.trim()}
              className={cn(
                "flex-1 h-12 rounded-xl font-semibold",
                "bg-gradient-to-r from-primary-500 to-emerald-500",
                "hover:from-primary-600 hover:to-emerald-600",
                "text-white",
                "shadow-lg hover:shadow-xl",
                "border-0",
                "transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed"
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
