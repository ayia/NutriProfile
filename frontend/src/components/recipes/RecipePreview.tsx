import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Clock,
  Users,
  ChefHat,
  Flame,
  Sparkles,
  Dumbbell,
  Wheat,
  Droplet,
  CheckCircle,
  ArrowRight,
  Lock,
  Zap,
} from 'lucide-react'
import { getMealTypeIcon, MEAL_TYPE_COLORS } from '@/lib/icons'
import { subscriptionApi } from '@/services/api'
import { USAGE_QUERY_KEY } from '@/components/subscription/UsageBanner'

interface RecipePreviewProps {
  mealType: string
  maxPrepTime: number
  servings: number
  ingredients: string[]
  onGenerate: () => void
  isGenerating: boolean
}

export function RecipePreview({
  mealType,
  maxPrepTime,
  servings,
  ingredients,
  onGenerate,
  isGenerating,
}: RecipePreviewProps) {
  const { t } = useTranslation('recipes')
  const { t: tCommon } = useTranslation('common')

  // Check usage limits
  const usageQuery = useQuery({
    queryKey: USAGE_QUERY_KEY,
    queryFn: subscriptionApi.getUsage,
    staleTime: 30 * 1000,
  })

  const recipeLimit = usageQuery.data?.limits.recipe_generations?.limit ?? 2
  const recipeUsed = usageQuery.data?.usage.recipe_generations ?? 0
  const isLimitReached = recipeLimit !== -1 && recipeUsed >= recipeLimit

  const MealIcon = getMealTypeIcon(mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack')
  const mealColor = MEAL_TYPE_COLORS[mealType as keyof typeof MEAL_TYPE_COLORS] || 'text-gray-500'

  // Estimate nutrition based on meal type
  const nutritionEstimates = {
    breakfast: { calories: '300-500', protein: '15-25g', carbs: '40-60g', fat: '10-20g' },
    lunch: { calories: '500-700', protein: '30-40g', carbs: '50-70g', fat: '15-25g' },
    dinner: { calories: '500-800', protein: '35-45g', carbs: '45-65g', fat: '20-30g' },
    snack: { calories: '150-300', protein: '5-15g', carbs: '20-40g', fat: '5-15g' },
  }

  const estimates = nutritionEstimates[mealType as keyof typeof nutritionEstimates] || nutritionEstimates.lunch

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-primary-200 bg-gradient-to-br from-primary-50/50 to-emerald-50/50">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-200/30 to-emerald-200/30 rounded-full blur-2xl -z-10 translate-x-8 -translate-y-8" />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{t('preview.title')}</h3>
            <p className="text-sm text-gray-500">{t('preview.subtitle')}</p>
          </div>
        </div>

        {/* Preview Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm mb-6">
          {/* Meal type indicator */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center`}>
              <MealIcon className={`w-5 h-5 ${mealColor}`} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{t(`categories.${mealType}`)}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {maxPrepTime} {t('recipe.minutes')}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {servings} {t('recipe.servings')}
                </span>
              </div>
            </div>
          </div>

          {/* Ingredients preview */}
          {ingredients.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">{t('preview.usingIngredients')}</p>
              <div className="flex flex-wrap gap-1.5">
                {ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
                  >
                    <CheckCircle className="w-3 h-3" />
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition estimates */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-500 mb-3">{t('preview.estimatedNutrition')}</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-900">{estimates.calories}</p>
                <p className="text-[10px] text-gray-500">kcal</p>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <Dumbbell className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-900">{estimates.protein}</p>
                <p className="text-[10px] text-gray-500">{t('card.protein')}</p>
              </div>
              <div className="text-center p-2 bg-amber-50 rounded-lg">
                <Wheat className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-900">{estimates.carbs}</p>
                <p className="text-[10px] text-gray-500">{t('card.carbs')}</p>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <Droplet className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-900">{estimates.fat}</p>
                <p className="text-[10px] text-gray-500">{t('card.fat')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* What you'll get */}
        <div className="space-y-2 mb-6">
          <p className="text-xs font-medium text-gray-700">{t('preview.whatYouGet')}</p>
          <ul className="space-y-1.5">
            {['personalizedRecipe', 'stepInstructions', 'nutritionInfo', 'aiOptimized'].map((key) => (
              <li key={key} className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                {t(`preview.benefits.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* Limit Reached Message */}
        {isLimitReached && (
          <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-800 font-medium">{tCommon('usage.limitReached')}</p>
                <p className="text-xs text-amber-600 mt-0.5">{tCommon('usage.comeBackTomorrow')}</p>
              </div>
              <Link
                to="/pricing"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all flex-shrink-0"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Premium</span>
              </Link>
            </div>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={onGenerate}
          disabled={isGenerating || isLimitReached}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold shadow-lg transition-all ${
            isLimitReached
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-primary-500 to-emerald-500 text-white shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('generate.generating')}
            </>
          ) : isLimitReached ? (
            <>
              <Lock className="w-5 h-5" />
              {tCommon('usage.limitReached')}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {t('preview.generateNow')}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
