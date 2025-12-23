import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { recipeApi } from '@/services/recipeApi'
import { RecipeGenerator } from '@/components/recipes/RecipeGenerator'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { Button } from '@/components/ui/Button'
import { SkeletonRecipeCard } from '@/components/ui/SkeletonLoader'

type Tab = 'generate' | 'history' | 'favorites'

// Suggestions de types de recettes rapides
const quickSuggestions = [
  { label: 'Petit-déjeuner protéiné', icon: '🥚', tags: ['petit-dejeuner', 'protéines'] },
  { label: 'Déjeuner léger', icon: '🥗', tags: ['dejeuner', 'light'] },
  { label: 'Dîner végétarien', icon: '🥬', tags: ['diner', 'vegetarien'] },
  { label: 'Snack sain', icon: '🍎', tags: ['snack', 'healthy'] },
  { label: 'Meal prep', icon: '📦', tags: ['meal-prep', 'batch'] },
  { label: 'Express < 15min', icon: '⚡', tags: ['rapide', 'facile'] },
]

export function RecipesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('generate')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const historyQuery = useQuery({
    queryKey: ['recipes', 'history'],
    queryFn: () => recipeApi.getHistory(),
    enabled: activeTab === 'history',
  })

  const favoritesQuery = useQuery({
    queryKey: ['recipes', 'favorites'],
    queryFn: () => recipeApi.getFavorites(),
    enabled: activeTab === 'favorites',
  })

  const tabs: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: 'generate', label: 'Générer', icon: '✨' },
    { id: 'history', label: 'Historique', icon: '📜', count: historyQuery.data?.length },
    { id: 'favorites', label: 'Favoris', icon: '❤️', count: favoritesQuery.data?.length },
  ]

  const handleQuickSuggestion = (tags: string[]) => {
    setSelectedTags(tags)
    setActiveTab('generate')
  }

  // Filtrer les résultats par recherche
  const filterRecipes = (items: any[]) => {
    if (!searchQuery) return items
    const query = searchQuery.toLowerCase()
    return items.filter(
      (item) =>
        item.recipe.name.toLowerCase().includes(query) ||
        item.recipe.description?.toLowerCase().includes(query) ||
        item.recipe.ingredients?.some((ing: string) => ing.toLowerCase().includes(query))
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header amélioré */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recettes</h1>
            <p className="text-gray-600 mt-1">
              Générez des recettes personnalisées adaptées à votre profil
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary-600 font-medium">Coach IA</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-gray-500">Actif</span>
          </div>
        </div>
      </div>

      {/* Suggestions rapides */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-600 mb-3">Suggestions rapides</p>
        <div className="flex flex-wrap gap-2">
          {quickSuggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              onClick={() => handleQuickSuggestion(suggestion.tags)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm hover:border-primary-400 hover:bg-primary-50 transition-colors"
            >
              <span>{suggestion.icon}</span>
              <span>{suggestion.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs avec compteurs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Barre de recherche pour historique/favoris */}
      {(activeTab === 'history' || activeTab === 'favorites') && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une recette..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'generate' && (
        <RecipeGenerator initialTags={selectedTags} onTagsCleared={() => setSelectedTags([])} />
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {historyQuery.isLoading && (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonRecipeCard key={i} />
              ))}
            </div>
          )}

          {historyQuery.error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium">Erreur de chargement</p>
                <p className="text-sm">Impossible de charger l'historique des recettes</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => historyQuery.refetch()} className="ml-auto">
                Réessayer
              </Button>
            </div>
          )}

          {historyQuery.data && filterRecipes(historyQuery.data).length === 0 && (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📜</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'Aucun résultat' : 'Aucun historique'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchQuery
                  ? `Aucune recette ne correspond à "${searchQuery}"`
                  : 'Générez votre première recette pour commencer votre collection'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setActiveTab('generate')} className="gap-2">
                  <span>✨</span>
                  Générer une recette
                </Button>
              )}
            </div>
          )}

          {historyQuery.data && filterRecipes(historyQuery.data).length > 0 && (
            <div className="space-y-6">
              {filterRecipes(historyQuery.data).map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-lg">📅</span>
                    <span>
                      {new Date(item.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {item.input_ingredients.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-gray-400">
                          {item.input_ingredients.slice(0, 3).join(', ')}
                          {item.input_ingredients.length > 3 && ` +${item.input_ingredients.length - 3}`}
                        </span>
                      </>
                    )}
                  </div>
                  <RecipeCard recipe={item.recipe} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="space-y-4">
          {favoritesQuery.isLoading && (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonRecipeCard key={i} />
              ))}
            </div>
          )}

          {favoritesQuery.error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium">Erreur de chargement</p>
                <p className="text-sm">Impossible de charger vos favoris</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => favoritesQuery.refetch()} className="ml-auto">
                Réessayer
              </Button>
            </div>
          )}

          {favoritesQuery.data && filterRecipes(favoritesQuery.data).length === 0 && (
            <div className="text-center py-16 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-pink-100">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'Aucun résultat' : 'Aucun favori'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchQuery
                  ? `Aucun favori ne correspond à "${searchQuery}"`
                  : 'Ajoutez des recettes à vos favoris pour les retrouver facilement'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setActiveTab('generate')} className="gap-2">
                  <span>✨</span>
                  Découvrir des recettes
                </Button>
              )}
            </div>
          )}

          {favoritesQuery.data && filterRecipes(favoritesQuery.data).length > 0 && (
            <div className="space-y-6">
              {filterRecipes(favoritesQuery.data).map((favorite) => (
                <div key={favorite.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    {favorite.rating && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-lg ${star <= favorite.rating! ? 'text-yellow-400' : 'text-gray-200'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                    {favorite.notes && (
                      <div className="flex items-center gap-2 text-sm bg-yellow-50 px-3 py-1 rounded-full">
                        <span>📝</span>
                        <span className="text-yellow-800 truncate max-w-xs">{favorite.notes}</span>
                      </div>
                    )}
                  </div>
                  <RecipeCard recipe={favorite.recipe} initialFavorite={true} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
