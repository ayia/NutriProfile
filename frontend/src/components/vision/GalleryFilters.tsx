import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { MealType } from '@/types/foodLog'

export interface GalleryFiltersProps {
  onFilterChange: (filters: GalleryFilters) => void
}

export interface GalleryFilters {
  startDate?: string
  endDate?: string
  mealType?: MealType | 'all'
}

type QuickFilter = 'all' | 'thisWeek' | 'thisMonth' | 'custom'

export function GalleryFilters({ onFilterChange }: GalleryFiltersProps) {
  const { t } = useTranslation('vision')
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')
  const [mealType, setMealType] = useState<MealType | 'all'>('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const getDateRange = (filter: QuickFilter): { start?: string; end?: string } => {
    const today = new Date()
    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    switch (filter) {
      case 'thisWeek': {
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        return { start: formatDate(weekAgo), end: formatDate(today) }
      }
      case 'thisMonth': {
        const monthAgo = new Date(today)
        monthAgo.setMonth(today.getMonth() - 1)
        return { start: formatDate(monthAgo), end: formatDate(today) }
      }
      case 'custom':
        return { start: customStartDate || undefined, end: customEndDate || undefined }
      default:
        return {}
    }
  }

  const handleQuickFilterChange = (filter: QuickFilter) => {
    setQuickFilter(filter)
    const dateRange = getDateRange(filter)
    onFilterChange({
      startDate: dateRange.start,
      endDate: dateRange.end,
      mealType: mealType === 'all' ? undefined : mealType,
    })
  }

  const handleMealTypeChange = (type: MealType | 'all') => {
    setMealType(type)
    const dateRange = getDateRange(quickFilter)
    onFilterChange({
      startDate: dateRange.start,
      endDate: dateRange.end,
      mealType: type === 'all' ? undefined : type,
    })
  }

  const handleCustomDateChange = () => {
    onFilterChange({
      startDate: customStartDate || undefined,
      endDate: customEndDate || undefined,
      mealType: mealType === 'all' ? undefined : mealType,
    })
  }

  const handleReset = () => {
    setQuickFilter('all')
    setMealType('all')
    setCustomStartDate('')
    setCustomEndDate('')
    onFilterChange({})
  }

  const hasActiveFilters =
    quickFilter !== 'all' || mealType !== 'all' || customStartDate || customEndDate

  const mealTypes: Array<MealType | 'all'> = ['all', 'breakfast', 'lunch', 'dinner', 'snack']

  return (
    <div className="glass-card p-4 space-y-4">
      {/* Quick date filters */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {t('gallery.filters.period', { defaultValue: 'Period' })}
        </label>
        <div className="flex flex-wrap gap-2">
          {(['all', 'thisWeek', 'thisMonth', 'custom'] as QuickFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => handleQuickFilterChange(filter)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                quickFilter === filter
                  ? 'bg-gradient-to-r from-secondary-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-secondary-300 hover:bg-secondary-50'
              }`}
            >
              {t(`gallery.filters.${filter}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date range */}
      {quickFilter === 'custom' && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-600 mb-1 block">
              {t('gallery.filters.startDate', { defaultValue: 'Start date' })}
            </label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => {
                setCustomStartDate(e.target.value)
                if (e.target.value && customEndDate) {
                  handleCustomDateChange()
                }
              }}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-600 mb-1 block">
              {t('gallery.filters.endDate', { defaultValue: 'End date' })}
            </label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => {
                setCustomEndDate(e.target.value)
                if (customStartDate && e.target.value) {
                  handleCustomDateChange()
                }
              }}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 text-sm"
            />
          </div>
        </div>
      )}

      {/* Meal type filters */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {t('gallery.filters.mealType', { defaultValue: 'Meal type' })}
        </label>
        <div className="flex flex-wrap gap-2">
          {mealTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleMealTypeChange(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mealType === type
                  ? 'bg-gradient-to-r from-primary-500 to-emerald-500 text-white shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              {type === 'all' ? t('gallery.filters.all') : t(`mealTypes.${type}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Reset button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={handleReset}
          className="w-full gap-2 !bg-gray-100 hover:!bg-gray-200"
        >
          <X className="w-4 h-4" />
          {t('gallery.filters.reset')}
        </Button>
      )}
    </div>
  )
}
