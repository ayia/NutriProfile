import { useTranslation } from 'react-i18next'
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

const sections = [
  { id: 'collection', titleKey: 'sections.collection.title' },
  { id: 'use', titleKey: 'sections.use.title' },
  { id: 'storage', titleKey: 'sections.storage.title' },
  { id: 'sharing', titleKey: 'sections.sharing.title' },
  { id: 'rights', titleKey: 'sections.rights.title' },
  { id: 'cookies', titleKey: 'sections.cookies.title' },
  { id: 'retention', titleKey: 'sections.retention.title' },
  { id: 'children', titleKey: 'sections.children.title' },
  { id: 'international', titleKey: 'sections.international.title' },
  { id: 'changes', titleKey: 'sections.changes.title' },
  { id: 'contact', titleKey: 'sections.contact.title' },
]

export function PrivacyPage() {
  const { t } = useTranslation('privacy')

  return (
    <LegalPageLayout namespace="privacy" sections={sections}>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        <strong>{t('lastUpdated')}:</strong> December 27, 2024
      </p>

      {/* Section 1: Information We Collect */}
      <section id="collection" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.collection.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.collection.content')}
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4 space-y-1">
          <li>{t('sections.collection.items.account')}</li>
          <li>{t('sections.collection.items.profile')}</li>
          <li>{t('sections.collection.items.usage')}</li>
          <li>{t('sections.collection.items.payment')}</li>
        </ul>
      </section>

      {/* Section 2: How We Use Your Information */}
      <section id="use" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.use.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.use.content')}
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4 space-y-1">
          <li>{t('sections.use.items.service')}</li>
          <li>{t('sections.use.items.recipes')}</li>
          <li>{t('sections.use.items.payment')}</li>
          <li>{t('sections.use.items.communication')}</li>
          <li>{t('sections.use.items.analytics')}</li>
        </ul>
      </section>

      {/* Section 3: Data Storage and Security */}
      <section id="storage" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.storage.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.storage.content')}
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4 space-y-1">
          <li>{t('sections.storage.items.encryption')}</li>
          <li>{t('sections.storage.items.hashing')}</li>
          <li>{t('sections.storage.items.audits')}</li>
          <li>{t('sections.storage.items.access')}</li>
        </ul>
      </section>

      {/* Section 4: Data Sharing */}
      <section id="sharing" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.sharing.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.sharing.content')}
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4 space-y-1">
          <li>{t('sections.sharing.items.paddle')}</li>
          <li>{t('sections.sharing.items.huggingface')}</li>
          <li>{t('sections.sharing.items.legal')}</li>
        </ul>
      </section>

      {/* Section 5: Your Rights */}
      <section id="rights" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.rights.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.rights.content')}
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4 space-y-1">
          <li>{t('sections.rights.items.access')}</li>
          <li>{t('sections.rights.items.correct')}</li>
          <li>{t('sections.rights.items.delete')}</li>
          <li>{t('sections.rights.items.export')}</li>
          <li>{t('sections.rights.items.optout')}</li>
        </ul>
      </section>

      {/* Section 6: Cookies */}
      <section id="cookies" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.cookies.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.cookies.content')}
        </p>
      </section>

      {/* Section 7: Data Retention */}
      <section id="retention" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.retention.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.retention.content')}
        </p>
      </section>

      {/* Section 8: Children's Privacy */}
      <section id="children" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.children.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.children.content')}
        </p>
      </section>

      {/* Section 9: International Transfers */}
      <section id="international" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.international.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.international.content')}
        </p>
      </section>

      {/* Section 10: Changes to This Policy */}
      <section id="changes" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.changes.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.changes.content')}
        </p>
      </section>

      {/* Section 11: Contact Us */}
      <section id="contact" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.contact.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.contact.content')}
          <br />
          <a href="mailto:privacy@nutriprofile.app" className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
            privacy@nutriprofile.app
          </a>
        </p>
      </section>
    </LegalPageLayout>
  )
}

export default PrivacyPage
