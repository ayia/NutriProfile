import { useTranslation } from 'react-i18next'

export function RefundPage() {
  const { t } = useTranslation('refund')

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>{t('lastUpdated')}:</strong> December 27, 2024
            </p>

            <p className="text-gray-600 mb-6">
              {t('intro')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.guarantee.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.guarantee.content')}
            </p>
            <p className="text-gray-600 mb-4 italic">
              {t('sections.guarantee.conditions')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.eligibility.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.eligibility.content')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>{t('sections.eligibility.items.timeframe')}</li>
              <li>{t('sections.eligibility.items.firstPurchase')}</li>
              <li>{t('sections.eligibility.items.noAbuse')}</li>
              <li>{t('sections.eligibility.items.validAccount')}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.process.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.process.content')}
            </p>
            <ol className="list-decimal pl-6 text-gray-600 mb-4">
              <li>{t('sections.process.steps.contact')}</li>
              <li>{t('sections.process.steps.provide')}</li>
              <li>{t('sections.process.steps.review')}</li>
              <li>{t('sections.process.steps.refund')}</li>
            </ol>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.method.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.method.content')}
            </p>
            <p className="text-gray-600 mb-4 italic">
              {t('sections.method.note')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.exceptions.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.exceptions.content')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>{t('sections.exceptions.items.afterPeriod')}</li>
              <li>{t('sections.exceptions.items.renewals')}</li>
              <li>{t('sections.exceptions.items.abuse')}</li>
              <li>{t('sections.exceptions.items.violation')}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.cancellation.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.cancellation.content')}
            </p>
            <p className="text-gray-600 mb-4 italic">
              {t('sections.cancellation.note')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.prorated.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.prorated.content')}
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

            {/* Footer with company info */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                {t('footer.operator')} <strong>{t('footer.companyName')}</strong>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {t('footer.paddle')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RefundPage
