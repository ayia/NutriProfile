import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { profileApi } from '@/services/profileApi'
import { Button } from '@/components/ui/Button'
import { GOAL_LABELS } from '@/types/profile'
import {
  Salad, Camera, ChefHat, BarChart3, Rocket, Target,
  CheckCircle, ArrowRight, Sparkles, Trophy, Zap, Heart
} from '@/lib/icons'

export function DashboardPage() {
  const { t } = useTranslation('dashboard')
  const { user } = useAuth()

  const { data: summary, isLoading } = useQuery({
    queryKey: ['profile-summary'],
    queryFn: profileApi.getSummary,
  })

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  // Pas de profil - afficher dashboard simplifié pour nouveaux utilisateurs
  if (!summary?.has_profile) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl p-8 mb-8 text-white">
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="text-primary-100 text-sm font-medium">{t('newUser.welcomeBadge')}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {t('newUser.welcomeTitle')}, {user?.name}!
            </h1>
            <p className="text-primary-100 text-lg mb-6 max-w-xl">
              {t('newUser.welcomeSubtitle')}
            </p>

            <Link to="/onboarding">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-primary-50 shadow-lg hover:shadow-xl transition-all group"
              >
                <Rocket className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                {t('newUser.startCta')}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Getting Started Steps */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-500" />
            {t('newUser.stepsTitle')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 - Create Profile */}
            <div className="group relative bg-white rounded-xl shadow-sm border-2 border-primary-200 p-6 hover:border-primary-400 hover:shadow-md transition-all cursor-pointer">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                1
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Salad className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('newUser.step1Title')}</h3>
              <p className="text-gray-500 text-sm mb-4">{t('newUser.step1Desc')}</p>
              <Link to="/onboarding" className="inline-flex items-center text-primary-600 text-sm font-medium group-hover:underline">
                {t('newUser.step1Cta')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Step 2 - Scan Meal */}
            <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 opacity-60">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-600 mb-2">{t('newUser.step2Title')}</h3>
              <p className="text-gray-400 text-sm mb-4">{t('newUser.step2Desc')}</p>
              <span className="inline-flex items-center text-gray-400 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                {t('newUser.stepLocked')}
              </span>
            </div>

            {/* Step 3 - Track Progress */}
            <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 opacity-60">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-600 mb-2">{t('newUser.step3Title')}</h3>
              <p className="text-gray-400 text-sm mb-4">{t('newUser.step3Desc')}</p>
              <span className="inline-flex items-center text-gray-400 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                {t('newUser.stepLocked')}
              </span>
            </div>
          </div>
        </div>

        {/* Benefits Preview */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            {t('newUser.benefitsTitle')}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">{t('newUser.benefit1')}</span>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Camera className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">{t('newUser.benefit2')}</span>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                <ChefHat className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">{t('newUser.benefit3')}</span>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">{t('newUser.benefit4')}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bienvenue */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-2">{t('greeting.morning')}, {user?.name}</h2>
          <p className="text-gray-600 mb-4">
            {t('objective')}: <strong>{summary.goal ? GOAL_LABELS[summary.goal] : '-'}</strong>
          </p>
          <Link to="/onboarding">
            <Button variant="outline" size="sm">{t('profileStatus.editProfile')}</Button>
          </Link>
        </div>

        {/* Calories */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-2">{t('stats.caloriesTarget')}</h3>
          <p className="text-3xl font-bold text-primary-600">
            {summary.daily_calories || '--'}
          </p>
          <p className="text-gray-500 text-sm">{t('stats.kcalPerDay')}</p>
        </div>

        {/* Statut */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-2">{t('profileStatus.title')}</h3>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${summary.is_complete ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            <span className={summary.is_complete ? 'text-green-600' : 'text-yellow-600'}>
              {summary.is_complete ? t('profileStatus.complete') : t('profileStatus.incomplete')}
            </span>
          </div>
        </div>
      </div>

      {/* Prochaines étapes */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">{t('upcomingFeatures.title')}</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Camera className="w-5 h-5 text-primary-500" />
            <span>{t('upcomingFeatures.analyzeMeals')}</span>
            <span className="ml-auto text-xs text-gray-400">{t('upcomingFeatures.comingSoon')}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <ChefHat className="w-5 h-5 text-amber-500" />
            <span>{t('upcomingFeatures.generateRecipes')}</span>
            <span className="ml-auto text-xs text-gray-400">{t('upcomingFeatures.comingSoon')}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span>{t('upcomingFeatures.trackProgress')}</span>
            <span className="ml-auto text-xs text-gray-400">{t('upcomingFeatures.comingSoon')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
