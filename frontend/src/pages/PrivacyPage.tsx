import { useTranslation } from 'react-i18next'

export function PrivacyPage() {
  const { t } = useTranslation('privacy')

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>{t('lastUpdated')}:</strong> December 27, 2024
            </p>

            {/* Section 1: Information We Collect */}
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.collection.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.collection.content')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>{t('sections.collection.items.account')}</li>
              <li>{t('sections.collection.items.profile')}</li>
              <li>{t('sections.collection.items.usage')}</li>
              <li>{t('sections.collection.items.payment')}</li>
            </ul>

            {/* Section 2: How We Use Your Information */}
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.use.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.use.content')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>{t('sections.use.items.service')}</li>
              <li>{t('sections.use.items.recipes')}</li>
              <li>{t('sections.use.items.payment')}</li>
              <li>{t('sections.use.items.communication')}</li>
              <li>{t('sections.use.items.analytics')}</li>
            </ul>

            {/* Section 3: Data Storage and Security */}
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.storage.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.storage.content')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>{t('sections.storage.items.encryption')}</li>
              <li>{t('sections.storage.items.hashing')}</li>
              <li>{t('sections.storage.items.audits')}</li>
              <li>{t('sections.storage.items.access')}</li>
            </ul>

            {/* Section 4: Data Sharing */}
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.sharing.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.sharing.content')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>{t('sections.sharing.items.paddle')}</li>
              <li>{t('sections.sharing.items.huggingface')}</li>
              <li>{t('sections.sharing.items.legal')}</li>
            </ul>

            {/* Section 5: Your Rights */}
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.rights.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.rights.content')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>{t('sections.rights.items.access')}</li>
              <li>{t('sections.rights.items.correct')}</li>
              <li>{t('sections.rights.items.delete')}</li>
              <li>{t('sections.rights.items.export')}</li>
              <li>{t('sections.rights.items.optout')}</li>
            </ul>

            {/* Section 6: Cookies */}
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.cookies.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.cookies.content')}
            </p>

            {/* Section 7: Data Retention */}
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.retention.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.retention.content')}
            </p>

            {/* Section 8: Children's Privacy */}
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.children.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.children.content')}
            </p>

            {/* Section 9: International Transfers */}
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.international.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.international.content')}
            </p>

            {/* Section 10: Changes to This Policy */}
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.changes.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.changes.content')}
            </p>

            {/* Section 11: Contact Us */}
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t('sections.contact.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('sections.contact.content')}
              <br />
              <a href="mailto:privacy@nutriprofile.app" className="text-green-600 hover:text-green-700">
                privacy@nutriprofile.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage
