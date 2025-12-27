import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Loader2, Lock, Clock, ShoppingCart, Sparkles } from 'lucide-react'
import { mealPlansApi, type MealPlanRequest, type MealPlanResponse } from '@/services/api'

interface MealPlanGeneratorProps {
  isPro: boolean
  onUpgradeClick?: () => void
}

export function MealPlanGenerator({ isPro, onUpgradeClick }: MealPlanGeneratorProps) {
  const { t } = useTranslation('pro')
  const [loading, setLoading] = useState(false)
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [config, setConfig] = useState<MealPlanRequest>({
    days: 7,
    meals_per_day: 3,
    include_snacks: true,
    budget_level: 'medium',
    cooking_time_max: 45,
    variety_level: 'medium',
  })

  const handleGenerate = async () => {
    if (!isPro) {
      onUpgradeClick?.()
      return
    }

    setLoading(true)
    setMealPlan(null)

    try {
      const result = await mealPlansApi.generate(config)
      setMealPlan(result)
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const mealTypeIcons: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎',
  }

  const mealTypeLabels: Record<string, string> = {
    breakfast: t('mealPlan.breakfast'),
    lunch: t('mealPlan.lunch'),
    dinner: t('mealPlan.dinner'),
    snack: t('mealPlan.snack'),
  }

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">
                {t('mealPlan.title')}
              </h3>
              <p className="text-sm text-gray-500">
                {t('mealPlan.subtitle')}
              </p>
            </div>
          </div>

          {!isPro && (
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
              PRO
            </span>
          )}
        </div>

        {/* Options de configuration */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Nombre de jours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('mealPlan.daysLabel')}
            </label>
            <select
              value={config.days}
              onChange={(e) => setConfig({ ...config, days: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={3}>3 {t('common.days')}</option>
              <option value={5}>5 {t('common.days')}</option>
              <option value={7}>7 {t('common.days')}</option>
              <option value={14}>14 {t('common.days')}</option>
            </select>
          </div>

          {/* Repas par jour */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('mealPlan.mealsPerDay')}
            </label>
            <select
              value={config.meals_per_day}
              onChange={(e) => setConfig({ ...config, meals_per_day: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={2}>2 {t('common.meals')}</option>
              <option value={3}>3 {t('common.meals')}</option>
              <option value={4}>4 {t('common.meals')}</option>
            </select>
          </div>

          {/* Temps de cuisson max */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              {t('mealPlan.cookingTime')}
            </label>
            <select
              value={config.cooking_time_max}
              onChange={(e) => setConfig({ ...config, cooking_time_max: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1h</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('mealPlan.budget')}
            </label>
            <select
              value={config.budget_level}
              onChange={(e) => setConfig({ ...config, budget_level: e.target.value as 'low' | 'medium' | 'high' })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="low">{t('mealPlan.budgetLow')}</option>
              <option value="medium">{t('mealPlan.budgetMedium')}</option>
              <option value="high">{t('mealPlan.budgetHigh')}</option>
            </select>
          </div>
        </div>

        {/* Collations */}
        <label className="flex items-center gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={config.include_snacks}
            onChange={(e) => setConfig({ ...config, include_snacks: e.target.checked })}
            className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-gray-700">
            {t('mealPlan.includeSnacks')}
          </span>
        </label>

        {/* Bouton génération */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
            isPro
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('mealPlan.generating')}
            </>
          ) : !isPro ? (
            <>
              <Lock className="h-5 w-5" />
              {t('mealPlan.upgradeToPro')}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              {t('mealPlan.generate')}
            </>
          )}
        </button>
      </div>

      {/* Résultat du plan */}
      {mealPlan && (
        <div className="space-y-4">
          {/* Stats du plan */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900">
                {t('mealPlan.yourPlan')}
              </h4>
              <button
                onClick={() => setShowShoppingList(!showShoppingList)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                {t('mealPlan.shoppingList')}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary-600">{mealPlan.avg_daily_calories}</p>
                <p className="text-xs text-gray-500">{t('common.calories')}/j</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{mealPlan.avg_daily_protein}g</p>
                <p className="text-xs text-gray-500">{t('common.protein')}/j</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{mealPlan.avg_daily_carbs}g</p>
                <p className="text-xs text-gray-500">{t('common.carbs')}/j</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-600">{mealPlan.avg_daily_fat}g</p>
                <p className="text-xs text-gray-500">{t('common.fat')}/j</p>
              </div>
            </div>
          </div>

          {/* Liste de courses */}
          {showShoppingList && mealPlan.shopping_list && (
            <div className="glass-card p-4">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {t('mealPlan.shoppingListTitle')}
              </h4>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {mealPlan.shopping_list.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-600">{item.quantity}</span>
                      <span className="ml-2 text-xs text-gray-400">{item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Jours du plan */}
          {mealPlan.days.map((day, dayIndex) => (
            <div key={dayIndex} className="glass-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900">{day.day_name}</h4>
                <span className="text-sm text-gray-500">{day.total_calories} kcal</span>
              </div>

              <div className="space-y-3">
                {day.meals.map((meal, mealIndex) => (
                  <div
                    key={mealIndex}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-2xl">{mealTypeIcons[meal.meal_type]}</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            {mealTypeLabels[meal.meal_type]}
                          </p>
                          <p className="font-medium text-gray-900">{meal.name}</p>
                          <p className="text-sm text-gray-500 mt-1">{meal.description}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium text-primary-600">{meal.calories} kcal</p>
                          <p className="text-gray-400">{meal.prep_time + meal.cook_time} min</p>
                        </div>
                      </div>

                      {/* Macros */}
                      <div className="flex gap-3 mt-2 text-xs">
                        <span className="text-blue-600">P: {meal.protein}g</span>
                        <span className="text-amber-600">G: {meal.carbs}g</span>
                        <span className="text-rose-600">L: {meal.fat}g</span>
                      </div>

                      {/* Tags */}
                      {meal.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {meal.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Méta info */}
          <div className="text-center text-xs text-gray-400">
            {t('mealPlan.generatedIn')} {(mealPlan.generation_time_ms / 1000).toFixed(1)}s •
            {t('mealPlan.confidence')}: {(mealPlan.confidence * 100).toFixed(0)}%
          </div>
        </div>
      )}
    </div>
  )
}
