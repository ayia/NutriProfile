import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Sparkles, History, Heart, Egg, Salad, Carrot, Apple, Package, Zap, Lightbulb, Search, X, AlertTriangle, Scroll, Calendar, FileText, Star, type LucideIcon } from 'lucide-react'
import { recipeApi } from '@/services/recipeApi'
import { RecipeGenerator } from '@/components/recipes/RecipeGenerator'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { Button } from '@/components/ui/Button'
import { SkeletonRecipeCard } from '@/components/ui/SkeletonLoader'
import { UsageBanner } from '@/components/subscription/UsageBanner'

type Tab = 'generate' | 'history' | 'favorites'

export function RecipesPage() {
  const { t, i18n } = useTranslation('recipes')
  const [activeTab, setActiveTab] = useState<Tab>('generate')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Suggestions de types de recettes rapides
  const quickSuggestions: { label: string; IconComponent: LucideIcon; tags: string[]; color: string; iconColor: string }[] = [
    { label: t('suggestions.proteinBreakfast'), IconComponent: Egg, tags: ['petit-dejeuner', 'protéines'], color: 'from-amber-500 to-orange-500', iconColor: 'text-amber-600' },
    { label: t('suggestions.lightLunch'), IconComponent: Salad, tags: ['dejeuner', 'light'], color: 'from-primary-500 to-emerald-500', iconColor: 'text-emerald-600' },
    { label: t('suggestions.vegetarianDinner'), IconComponent: Carrot, tags: ['diner', 'vegetarien'], color: 'from-green-500 to-teal-500', iconColor: 'text-green-600' },
    { label: t('suggestions.healthySnack'), IconComponent: Apple, tags: ['snack', 'healthy'], color: 'from-rose-500 to-pink-500', iconColor: 'text-rose-600' },
    { label: t('suggestions.mealPrep'), IconComponent: Package, tags: ['meal-prep', 'batch'], color: 'from-secondary-500 to-cyan-500', iconColor: 'text-cyan-600' },
    { label: t('suggestions.express'), IconComponent: Zap, tags: ['rapide', 'facile'], color: 'from-warning-500 to-amber-500', iconColor: 'text-amber-500' },
  ]

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

  // Scroll reveal animation
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.reveal').forEach((el) => {
      observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [activeTab, historyQuery.data, favoritesQuery.data])

  const tabs: { id: Tab; label: string; IconComponent: LucideIcon; count?: number }[] = [
    { id: 'generate', label: t('tabs.generate'), IconComponent: Sparkles },
    { id: 'history', label: t('tabs.history'), IconComponent: History, count: historyQuery.data?.length },
    { id: 'favorites', label: t('tabs.favorites'), IconComponent: Heart, count: favoritesQuery.data?.length },
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background decorations - Responsive */}
      <div className="absolute top-20 right-0 w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] md:w-[500px] md:h-[500px] bg-gradient-to-br from-primary-100/40 to-emerald-100/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[150px] h-[150px] sm:w-[280px] sm:h-[280px] md:w-[400px] md:h-[400px] bg-gradient-to-br from-accent-100/40 to-amber-100/40 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header amélioré - Responsive */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 glass-card text-primary-700 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                <Sparkles className="w-4 h-4 animate-pulse" />
                {t('subtitle')}
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                {t('title')}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 glass-card self-start sm:self-auto">
              <span className="text-primary-600 font-medium text-sm sm:text-base">{t('coachActive')}</span>
              <span className="relative flex h-2.5 sm:h-3 w-2.5 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 sm:h-3 w-2.5 sm:w-3 bg-success-500"></span>
              </span>
              <span className="text-gray-500 text-sm sm:text-base">{t('active')}</span>
            </div>
          </div>
        </div>

        {/* Suggestions rapides - Enhanced & Responsive */}
        <div className="mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3 sm:mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" /> {t('quickSuggestions')}
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {quickSuggestions.map((suggestion, index) => {
              const SuggestionIcon = suggestion.IconComponent
              return (
                <button
                  key={suggestion.label}
                  onClick={() => handleQuickSuggestion(suggestion.tags)}
                  className="group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                  style={{ animationDelay: `${0.05 * (index + 1)}s` }}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${suggestion.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <SuggestionIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${suggestion.iconColor} group-hover:scale-110 transition-transform`} />
                  <span className="relative text-gray-700 group-hover:text-gray-900">{suggestion.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tabs avec compteurs - Enhanced & Responsive */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex gap-1.5 sm:gap-2 mb-6 sm:mb-8 pb-2">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 whitespace-nowrap text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-emerald-500 text-white shadow-lg shadow-primary-500/30 scale-105'
                    : 'glass-card text-gray-600 hover:text-gray-900 hover:shadow-md hover:-translate-y-0.5'
                }`}
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <tab.IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === tab.id ? 'animate-bounce-soft' : ''}`} />
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Barre de recherche pour historique/favoris - Enhanced */}
        {(activeTab === 'history' || activeTab === 'favorites') && (
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative glass-card p-2">
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 pl-12 bg-white/60 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'generate' && (
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {/* Usage Banner */}
            <UsageBanner action="recipe_generations" showAlways />

            <RecipeGenerator initialTags={selectedTags} onTagsCleared={() => setSelectedTags([])} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            {historyQuery.isLoading && (
              <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonRecipeCard key={i} />
                ))}
              </div>
            )}

            {historyQuery.error && (
              <div className="glass-card p-6 border-error-200 animate-fade-in-up">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-error-100 to-rose-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-error-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-error-600">{t('history.loadError')}</p>
                    <p className="text-sm text-gray-500 mt-1">{t('history.errorMessage')}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => historyQuery.refetch()} className="!border-error-200 !text-error-600 hover:!bg-error-50">
                    {t('history.retry')}
                  </Button>
                </div>
              </div>
            )}

            {historyQuery.data && filterRecipes(historyQuery.data).length === 0 && (
              <div className="glass-card p-16 text-center animate-fade-in-up">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Scroll className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchQuery ? t('history.noResults') : t('history.noHistory')}
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  {searchQuery
                    ? `${t('history.noMatchFor')} "${searchQuery}"`
                    : t('history.noHistoryMessage')}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-emerald-500 text-white rounded-2xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    {t('history.generateRecipe')}
                  </button>
                )}
              </div>
            )}

            {historyQuery.data && filterRecipes(historyQuery.data).length > 0 && (
              <div className="space-y-8">
                {filterRecipes(historyQuery.data).map((item, index) => (
                  <div
                    key={item.id}
                    className="space-y-3 reveal"
                    style={{ animationDelay: `${0.05 * (index + 1)}s` }}
                  >
                    <div className="flex items-center gap-3 text-sm text-gray-500 ml-1">
                      <div className="flex items-center gap-2 px-3 py-1.5 glass-card">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                          {new Date(item.created_at).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {item.input_ingredients.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50/80 backdrop-blur-sm rounded-full text-primary-700">
                          <Salad className="w-4 h-4" />
                          <span className="font-medium">
                            {item.input_ingredients.slice(0, 3).join(', ')}
                            {item.input_ingredients.length > 3 && ` +${item.input_ingredients.length - 3}`}
                          </span>
                        </div>
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
          <div className="space-y-6">
            {favoritesQuery.isLoading && (
              <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonRecipeCard key={i} />
                ))}
              </div>
            )}

            {favoritesQuery.error && (
              <div className="glass-card p-6 border-error-200 animate-fade-in-up">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-error-100 to-rose-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-error-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-error-600">{t('favorites.loadError')}</p>
                    <p className="text-sm text-gray-500 mt-1">{t('favorites.errorMessage')}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => favoritesQuery.refetch()} className="!border-error-200 !text-error-600 hover:!bg-error-50">
                    {t('favorites.retry')}
                  </Button>
                </div>
              </div>
            )}

            {favoritesQuery.data && filterRecipes(favoritesQuery.data).length === 0 && (
              <div className="glass-card p-16 text-center bg-gradient-to-br from-rose-50/50 to-pink-50/50 animate-fade-in-up">
                <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Heart className="w-12 h-12 text-rose-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchQuery ? t('favorites.noResults') : t('favorites.noFavorites')}
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  {searchQuery
                    ? `${t('favorites.noMatchFor')} "${searchQuery}"`
                    : t('favorites.noFavoritesMessage')}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-semibold shadow-lg shadow-rose-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    {t('favorites.discoverRecipes')}
                  </button>
                )}
              </div>
            )}

            {favoritesQuery.data && filterRecipes(favoritesQuery.data).length > 0 && (
              <div className="space-y-8">
                {filterRecipes(favoritesQuery.data).map((favorite, index) => (
                  <div
                    key={favorite.id}
                    className="space-y-3 reveal"
                    style={{ animationDelay: `${0.05 * (index + 1)}s` }}
                  >
                    <div className="flex items-center gap-4 ml-1">
                      {favorite.rating && (
                        <div className="flex items-center gap-1 px-3 py-1.5 glass-card">
                          {[1, 2, 3, 4, 5].map((starNum) => (
                            <Star
                              key={starNum}
                              className={`w-5 h-5 transition-all ${
                                starNum <= favorite.rating!
                                  ? 'text-warning-400 fill-warning-400 scale-100'
                                  : 'text-gray-200 scale-90'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      {favorite.notes && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-warning-50/80 backdrop-blur-sm rounded-xl border border-warning-100">
                          <FileText className="w-4 h-4 text-warning-600" />
                          <span className="text-sm text-warning-800 truncate max-w-xs font-medium">{favorite.notes}</span>
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
    </div>
  )
}
