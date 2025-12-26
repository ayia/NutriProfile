import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { recipeApi } from '@/services/recipeApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { RecipeCard } from './RecipeCard'
import type { RecipeGenerateRequest, RecipeGenerateResponse } from '@/types/recipe'
import { MEAL_TYPE_ICONS } from '@/types/recipe'

interface RecipeGeneratorProps {
  initialTags?: string[]
  onTagsCleared?: () => void
}

export function RecipeGenerator({ initialTags = [], onTagsCleared }: RecipeGeneratorProps) {
  const { t } = useTranslation('recipes')
  const [ingredients, setIngredients] = useState<string[]>([])
  const [newIngredient, setNewIngredient] = useState('')
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeGenerateResponse | null>(null)
  const [activeTags, setActiveTags] = useState<string[]>([])

  // Apply initial tags when they change
  useEffect(() => {
    if (initialTags.length > 0) {
      setActiveTags(initialTags)
    }
  }, [initialTags])

  const clearTags = () => {
    setActiveTags([])
    onTagsCleared?.()
  }

  const { register, handleSubmit, watch } = useForm<Omit<RecipeGenerateRequest, 'ingredients'>>({
    defaultValues: {
      meal_type: 'lunch',
      max_prep_time: 30,
      servings: 2,
    },
  })

  const generateMutation = useMutation({
    mutationFn: (data: RecipeGenerateRequest) => recipeApi.generate(data),
    onSuccess: (data) => {
      setGeneratedRecipe(data)
    },
  })

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()])
      setNewIngredient('')
    }
  }

  const removeIngredient = (ing: string) => {
    setIngredients(ingredients.filter((i) => i !== ing))
  }

  const onSubmit = (data: Omit<RecipeGenerateRequest, 'ingredients'>) => {
    generateMutation.mutate({
      ...data,
      ingredients,
    })
  }

  const selectedMealType = watch('meal_type')

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold">{t('generate.title')}</h2>

        {/* Active tags from quick suggestions */}
        {activeTags.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <span className="text-sm text-primary-700">{t('generator.activeFilters')}:</span>
            <div className="flex flex-wrap gap-1">
              {activeTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={clearTags}
              className="ml-auto text-primary-600 hover:text-primary-800 text-sm"
            >
              {t('filters.clear')}
            </button>
          </div>
        )}

        {/* Type de repas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('generator.mealType')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Object.keys(MEAL_TYPE_ICONS).map((value) => (
              <label
                key={value}
                className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMealType === value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value={value}
                  className="sr-only"
                  {...register('meal_type')}
                />
                <span className="text-2xl">{MEAL_TYPE_ICONS[value]}</span>
                <span className="text-sm mt-1">{t(`categories.${value}`)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ingrédients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('generator.ingredients')}
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder={t('generator.ingredientPlaceholder')}
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addIngredient()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addIngredient}>
              {t('generator.add')}
            </Button>
          </div>
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ing) => (
                <span
                  key={ing}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {ing}
                  <button
                    type="button"
                    onClick={() => removeIngredient(ing)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {t('generator.ingredientsHint')}
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('generator.maxTime')}
            </label>
            <select
              className="block w-full rounded-lg border border-gray-300 px-3 py-2"
              {...register('max_prep_time', { valueAsNumber: true })}
            >
              <option value={15}>{t('generator.time15')}</option>
              <option value={30}>{t('generator.time30')}</option>
              <option value={45}>{t('generator.time45')}</option>
              <option value={60}>{t('generator.time60')}</option>
              <option value={90}>{t('generator.time90')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('generator.servings')}
            </label>
            <select
              className="block w-full rounded-lg border border-gray-300 px-3 py-2"
              {...register('servings', { valueAsNumber: true })}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {t('generator.servingsCount', { count: n })}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={generateMutation.isPending}
        >
          {generateMutation.isPending ? t('generate.generating') : t('generate.generate')}
        </Button>

        {generateMutation.error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {t('errors.generateFailed')}
          </div>
        )}
      </form>

      {/* Résultat */}
      {generatedRecipe && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('generate.result')}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span
                className={`w-2 h-2 rounded-full ${
                  generatedRecipe.confidence >= 0.8
                    ? 'bg-green-500'
                    : generatedRecipe.confidence >= 0.6
                    ? 'bg-yellow-500'
                    : 'bg-orange-500'
                }`}
              />
              {t('generator.confidence')}: {Math.round(generatedRecipe.confidence * 100)}%
              {generatedRecipe.used_fallback && (
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">fallback</span>
              )}
            </div>
          </div>
          <RecipeCard recipe={generatedRecipe.recipe} />
        </div>
      )}
    </div>
  )
}
