import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { recipeApi } from '@/services/recipeApi'
import { RecipeGenerator } from '@/components/recipes/RecipeGenerator'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { Button } from '@/components/ui/Button'

type Tab = 'generate' | 'history' | 'favorites'

export function RecipesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('generate')

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

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'generate', label: 'Générer', icon: '✨' },
    { id: 'history', label: 'Historique', icon: '📜' },
    { id: 'favorites', label: 'Favoris', icon: '❤️' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recettes</h1>
        <p className="text-gray-600 mt-2">
          Générez des recettes personnalisées adaptées à votre profil nutritionnel
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2"
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'generate' && <RecipeGenerator />}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {historyQuery.isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Chargement de l'historique...</p>
            </div>
          )}

          {historyQuery.error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              Erreur lors du chargement de l'historique
            </div>
          )}

          {historyQuery.data && historyQuery.data.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <span className="text-4xl">📜</span>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Aucun historique</h3>
              <p className="text-gray-500 mt-2">
                Générez votre première recette pour commencer
              </p>
              <Button
                className="mt-4"
                onClick={() => setActiveTab('generate')}
              >
                Générer une recette
              </Button>
            </div>
          )}

          {historyQuery.data && historyQuery.data.length > 0 && (
            <div className="space-y-4">
              {historyQuery.data.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
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
                        <span>Ingrédients: {item.input_ingredients.join(', ')}</span>
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
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Chargement des favoris...</p>
            </div>
          )}

          {favoritesQuery.error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              Erreur lors du chargement des favoris
            </div>
          )}

          {favoritesQuery.data && favoritesQuery.data.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <span className="text-4xl">❤️</span>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Aucun favori</h3>
              <p className="text-gray-500 mt-2">
                Ajoutez des recettes à vos favoris pour les retrouver facilement
              </p>
              <Button
                className="mt-4"
                onClick={() => setActiveTab('generate')}
              >
                Découvrir des recettes
              </Button>
            </div>
          )}

          {favoritesQuery.data && favoritesQuery.data.length > 0 && (
            <div className="space-y-4">
              {favoritesQuery.data.map((favorite) => (
                <div key={favorite.id} className="space-y-2">
                  {favorite.notes && (
                    <div className="flex items-start gap-2 text-sm bg-yellow-50 p-2 rounded-lg">
                      <span>📝</span>
                      <span>{favorite.notes}</span>
                    </div>
                  )}
                  {favorite.rating && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= favorite.rating! ? 'text-yellow-400' : 'text-gray-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}
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
