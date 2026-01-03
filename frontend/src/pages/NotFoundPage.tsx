import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, ArrowLeft, Search } from 'lucide-react'

export function NotFoundPage() {
  const { t } = useTranslation('common')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-[150px] font-bold text-gray-200 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Search className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('notFound.title')}
        </h1>
        <p className="text-gray-600 mb-8">
          {t('notFound.description')}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all"
          >
            <Home className="w-5 h-5" />
            {t('notFound.goHome')}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('notFound.goBack')}
          </button>
        </div>

        {/* Helpful links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            {t('notFound.helpfulLinks')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 hover:underline">
              {t('nav.dashboard')}
            </Link>
            <Link to="/recipes" className="text-primary-600 hover:text-primary-700 hover:underline">
              {t('nav.recipes')}
            </Link>
            <Link to="/tracking" className="text-primary-600 hover:text-primary-700 hover:underline">
              {t('nav.tracking')}
            </Link>
            <Link to="/settings" className="text-primary-600 hover:text-primary-700 hover:underline">
              {t('nav.settings')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
