import { useTranslation } from 'react-i18next'

export function TermsPage() {
  const { t } = useTranslation('terms')

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>{t('lastUpdated')}:</strong> December 27, 2024
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.acceptance.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.acceptance.content')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.description.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.description.content')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>{t('sections.description.features.vision')}</li>
              <li>{t('sections.description.features.recipes')}</li>
              <li>{t('sections.description.features.coaching')}</li>
              <li>{t('sections.description.features.tracking')}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.subscriptions.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.subscriptions.content')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>{t('sections.subscriptions.free')}</li>
              <li>{t('sections.subscriptions.premium')}</li>
              <li>{t('sections.subscriptions.pro')}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.billing.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.billing.content')}
            </p>
            <p className="text-gray-600 mb-4">
              {t('sections.billing.renewal')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.refund.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.refund.content')}
            </p>
            <p className="text-gray-600 mb-4">
              {t('sections.refund.afterPeriod')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.userResponsibilities.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.userResponsibilities.content')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>{t('sections.userResponsibilities.items.accurate')}</li>
              <li>{t('sections.userResponsibilities.items.security')}</li>
              <li>{t('sections.userResponsibilities.items.personal')}</li>
              <li>{t('sections.userResponsibilities.items.noReverse')}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.healthDisclaimer.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.healthDisclaimer.content')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.liability.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.liability.content')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.modifications.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.modifications.content')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.contact.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.contact.content')}
              <br />
              <a href="mailto:support@nutriprofile.app" className="text-green-600 hover:text-green-700">
                support@nutriprofile.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsPage
