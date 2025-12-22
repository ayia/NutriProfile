import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { recipeApi } from '@/services/recipeApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { RecipeCard } from './RecipeCard'
import type { RecipeGenerateRequest, RecipeGenerateResponse } from '@/types/recipe'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '@/types/recipe'

export function RecipeGenerator() {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [newIngredient, setNewIngredient] = useState('')
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeGenerateResponse | null>(null)

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
        <h2 className="text-xl font-semibold">Générer une recette</h2>

        {/* Type de repas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de repas
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
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
                <span className="text-sm mt-1">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ingrédients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingrédients disponibles (optionnel)
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Ajouter un ingrédient..."
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
              Ajouter
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
            Laissez vide pour une recette aléatoire adaptée à votre profil
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temps max (min)
            </label>
            <select
              className="block w-full rounded-lg border border-gray-300 px-3 py-2"
              {...register('max_prep_time', { valueAsNumber: true })}
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1 heure</option>
              <option value={90}>1h30</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Portions
            </label>
            <select
              className="block w-full rounded-lg border border-gray-300 px-3 py-2"
              {...register('servings', { valueAsNumber: true })}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'portion' : 'portions'}
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
          {generateMutation.isPending ? 'Génération en cours...' : 'Générer une recette'}
        </Button>

        {generateMutation.error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            Erreur lors de la génération. Veuillez réessayer.
          </div>
        )}
      </form>

      {/* Résultat */}
      {generatedRecipe && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Votre recette</h3>
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
              Confiance: {Math.round(generatedRecipe.confidence * 100)}%
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
