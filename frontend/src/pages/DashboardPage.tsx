import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { profileApi } from '@/services/profileApi'
import { Button } from '@/components/ui/Button'
import { GOAL_LABELS } from '@/types/profile'
import { Salad, Camera, ChefHat, BarChart3 } from '@/lib/icons'

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

  // Pas de profil - afficher CTA onboarding
  if (!summary?.has_profile) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Salad className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{t('noProfile.title')}, {user?.name} !</h1>
          <p className="text-gray-600 mb-8">
            {t('noProfile.subtitle')}
          </p>
          <Link to="/onboarding">
            <Button size="lg">{t('noProfile.cta')}</Button>
          </Link>
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
