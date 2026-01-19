import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Star, X } from 'lucide-react'

import { visionApi } from '@/services/visionApi'
import { Button } from '@/components/ui/Button'
import type { DetectedItem, FavoriteMealItem } from '@/types/foodLog'

export interface SaveAsFavoriteButtonProps {
  items: DetectedItem[]
  className?: string
}

export function SaveAsFavoriteButton({ items, className }: SaveAsFavoriteButtonProps) {
  const { t } = useTranslation('vision')
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mealName, setMealName] = useState('')

  const saveMutation = useMutation({
    mutationFn: async (name: string) => {
      const favoriteMealItems: FavoriteMealItem[] = items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
      }))

      return await visionApi.addFavoriteMeal({
        name,
        items: favoriteMealItems,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-meals'] })
      toast.success(t('favorites.added'))
      setIsModalOpen(false)
      setMealName('')
    },
    onError: (error: Error) => {
      console.error('Save favorite error:', error)
      toast.error(t('favorites.addError'))
    },
  })

  const handleSave = () => {
    if (!mealName.trim()) {
      toast.error(t('favorites.nameRequired'))
      return
    }
    saveMutation.mutate(mealName.trim())
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        size="sm"
        className={className}
      >
        <Star className="h-4 w-4 mr-2" />
        {t('favorites.add')}
      </Button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-[calc(100vw-24px)] sm:max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            {/* Header */}
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('favorites.saveMeal')}
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('favorites.saveMealDescription', { count: items.length })}
            </p>

            {/* Name Input */}
            <div className="mb-6">
              <label
                htmlFor="meal-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('favorites.nameLabel')}
              </label>
              <input
                id="meal-name"
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder={t('favorites.namePlaceholder')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                maxLength={100}
                autoFocus
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                className="flex-1"
                disabled={saveMutation.isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
                disabled={!mealName.trim() || saveMutation.isPending}
                isLoading={saveMutation.isPending}
              >
                <Star className="h-4 w-4 mr-2" />
                {t('common.save')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
