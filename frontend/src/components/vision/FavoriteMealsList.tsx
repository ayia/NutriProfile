import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Star, Plus, Trash2, Utensils } from 'lucide-react'

import { visionApi } from '@/services/visionApi'
import { Button } from '@/components/ui/Button'
import type { FavoriteMeal, MealType } from '@/types/foodLog'

export function FavoriteMealsList() {
  const { t } = useTranslation('vision')
  const queryClient = useQueryClient()
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch')

  // Fetch favorite meals
  const { data, isLoading } = useQuery({
    queryKey: ['favorite-meals'],
    queryFn: () => visionApi.getFavoriteMeals(),
  })

  // Log favorite meal mutation
  const logMutation = useMutation({
    mutationFn: async (mealId: number) => {
      return await visionApi.logFavoriteMeal(mealId, selectedMealType)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-logs'] })
      queryClient.invalidateQueries({ queryKey: ['daily-meals'] })
      queryClient.invalidateQueries({ queryKey: ['favorite-meals'] }) // Refresh use_count
      toast.success(t('favorites.logged'))
    },
    onError: (error: Error) => {
      console.error('Log favorite error:', error)
      toast.error(t('favorites.logError'))
    },
  })

  // Delete favorite meal mutation
  const deleteMutation = useMutation({
    mutationFn: async (mealId: number) => {
      return await visionApi.removeFavoriteMeal(mealId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-meals'] })
      toast.success(t('favorites.removed'))
    },
    onError: (error: Error) => {
      console.error('Delete favorite error:', error)
      toast.error(t('favorites.removeError'))
    },
  })

  const handleLogMeal = (mealId: number) => {
    logMutation.mutate(mealId)
  }

  const handleDeleteMeal = (mealId: number, mealName: string) => {
    if (confirm(t('favorites.confirmDelete', { name: mealName }))) {
      deleteMutation.mutate(mealId)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-400 mb-2">{t('favorites.empty')}</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          {t('favorites.emptyHint')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Meal Type Selector */}
      <div className="flex flex-wrap gap-2">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedMealType(type)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              selectedMealType === type
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {t(`mealTypes.${type}`)}
          </button>
        ))}
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {data.items.map((meal: FavoriteMeal) => (
          <div
            key={meal.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {meal.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('favorites.usedTimes', { count: meal.use_count })}
                </p>
              </div>
              <button
                onClick={() => handleDeleteMeal(meal.id, meal.name)}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Nutrition Summary */}
            <div className="flex items-center gap-2 mb-3 text-sm">
              <span className="font-medium text-primary-600 dark:text-primary-400">
                {Math.round(meal.total_calories || 0)} kcal
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-400">
                {meal.items.length} {t('common.items')}
              </span>
            </div>

            {/* Items Preview */}
            <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
              {meal.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <Utensils className="h-3 w-3" />
                  <span className="truncate">
                    {item.name} ({item.quantity}{item.unit})
                  </span>
                </div>
              ))}
              {meal.items.length > 3 && (
                <span className="text-gray-500">
                  +{meal.items.length - 3} {t('common.more')}
                </span>
              )}
            </div>

            {/* Quick Add Button */}
            <Button
              onClick={() => handleLogMeal(meal.id)}
              size="sm"
              className="w-full"
              disabled={logMutation.isPending}
              isLoading={logMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('favorites.logFavorite')}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
