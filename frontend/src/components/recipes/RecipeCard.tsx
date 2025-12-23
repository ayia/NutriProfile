import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recipeApi } from '@/services/recipeApi'
import { Button } from '@/components/ui/Button'
import type { Recipe } from '@/types/recipe'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '@/types/recipe'

interface RecipeCardProps {
  recipe: Recipe
  initialFavorite?: boolean
  onViewDetails?: () => void
}

export function RecipeCard({ recipe, initialFavorite = false, onViewDetails: _onViewDetails }: RecipeCardProps) {
  void _onViewDetails
  const [showDetails, setShowDetails] = useState(false)
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const queryClient = useQueryClient()

  const addFavorite = useMutation({
    mutationFn: () => recipeApi.addFavorite(recipe.id),
    onSuccess: () => {
      setIsFavorite(true)
      queryClient.invalidateQueries({ queryKey: ['recipes', 'favorites'] })
    },
  })

  const removeFavorite = useMutation({
    mutationFn: () => recipeApi.removeFavorite(recipe.id),
    onSuccess: () => {
      setIsFavorite(false)
      queryClient.invalidateQueries({ queryKey: ['recipes', 'favorites'] })
    },
  })

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavorite.mutate()
    } else {
      addFavorite.mutate()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-sm text-gray-500">
              {MEAL_TYPE_ICONS[recipe.meal_type]} {MEAL_TYPE_LABELS[recipe.meal_type]}
            </span>
            <h3 className="font-semibold text-lg mt-1">{recipe.title}</h3>
          </div>
          <button
            onClick={toggleFavorite}
            className={`text-2xl transition-transform hover:scale-110 ${
              isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
            }`}
            disabled={addFavorite.isPending || removeFavorite.isPending}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
        {recipe.description && (
          <p className="text-gray-600 text-sm mt-2">{recipe.description}</p>
        )}
      </div>

      {/* Infos rapides */}
      <div className="grid grid-cols-3 divide-x border-b">
        <div className="p-3 text-center">
          <div className="text-lg font-semibold">{recipe.total_time}</div>
          <div className="text-xs text-gray-500">min</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-semibold">{recipe.servings}</div>
          <div className="text-xs text-gray-500">portions</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-semibold">{recipe.calories || '--'}</div>
          <div className="text-xs text-gray-500">kcal</div>
        </div>
      </div>

      {/* Macros */}
      {recipe.calories && (
        <div className="flex justify-around p-3 bg-gray-50 text-sm">
          <div className="text-center">
            <span className="font-medium text-blue-600">{recipe.protein_g}g</span>
            <span className="text-gray-500 ml-1">prot</span>
          </div>
          <div className="text-center">
            <span className="font-medium text-yellow-600">{recipe.carbs_g}g</span>
            <span className="text-gray-500 ml-1">gluc</span>
          </div>
          <div className="text-center">
            <span className="font-medium text-orange-600">{recipe.fat_g}g</span>
            <span className="text-gray-500 ml-1">lip</span>
          </div>
        </div>
      )}

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="px-4 py-2 flex flex-wrap gap-1">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Détails (collapsible) */}
      {showDetails && (
        <div className="p-4 border-t space-y-4">
          {/* Ingrédients */}
          <div>
            <h4 className="font-medium mb-2">Ingrédients</h4>
            <ul className="space-y-1">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  <span className="font-medium">{ing.quantity}</span>
                  <span className="text-gray-600">{ing.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="font-medium mb-2">Instructions</h4>
            <ol className="space-y-2">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium">
                    {i + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Score de confiance */}
          {recipe.confidence_score && (
            <div className="text-xs text-gray-500 text-right">
              Score IA: {Math.round(recipe.confidence_score * 100)}%
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Masquer' : 'Voir la recette'}
        </Button>
      </div>
    </div>
  )
}
