import { useTranslation } from 'react-i18next'
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

const sections = [
  { id: 'acceptance', titleKey: 'sections.acceptance.title' },
  { id: 'description', titleKey: 'sections.description.title' },
  { id: 'subscriptions', titleKey: 'sections.subscriptions.title' },
  { id: 'billing', titleKey: 'sections.billing.title' },
  { id: 'refund', titleKey: 'sections.refund.title' },
  { id: 'user-responsibilities', titleKey: 'sections.userResponsibilities.title' },
  { id: 'health-disclaimer', titleKey: 'sections.healthDisclaimer.title' },
  { id: 'liability', titleKey: 'sections.liability.title' },
  { id: 'modifications', titleKey: 'sections.modifications.title' },
  { id: 'contact', titleKey: 'sections.contact.title' },
]

export function TermsPage() {
  const { t } = useTranslation('terms')

  return (
    <LegalPageLayout namespace="terms" sections={sections}>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        <strong>{t('lastUpdated')}:</strong> December 27, 2024
      </p>

      {/* Section 1: Acceptance */}
      <section id="acceptance" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.acceptance.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.acceptance.content')}
        </p>
      </section>

      {/* Section 2: Description */}
      <section id="description" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.description.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.description.content')}
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4 space-y-1">
          <li>{t('sections.description.features.vision')}</li>
          <li>{t('sections.description.features.recipes')}</li>
          <li>{t('sections.description.features.coaching')}</li>
          <li>{t('sections.description.features.tracking')}</li>
        </ul>
      </section>

      {/* Section 3: Subscriptions */}
      <section id="subscriptions" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.subscriptions.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.subscriptions.content')}
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4 space-y-1">
          <li>{t('sections.subscriptions.free')}</li>
          <li>{t('sections.subscriptions.premium')}</li>
          <li>{t('sections.subscriptions.pro')}</li>
        </ul>
      </section>

      {/* Section 4: Billing */}
      <section id="billing" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.billing.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.billing.content')}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.billing.renewal')}
        </p>
      </section>

      {/* Section 5: Refund */}
      <section id="refund" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.refund.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.refund.content')}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.refund.afterPeriod')}
        </p>
      </section>

      {/* Section 6: User Responsibilities */}
      <section id="user-responsibilities" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.userResponsibilities.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.userResponsibilities.content')}
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4 space-y-1">
          <li>{t('sections.userResponsibilities.items.accurate')}</li>
          <li>{t('sections.userResponsibilities.items.security')}</li>
          <li>{t('sections.userResponsibilities.items.personal')}</li>
          <li>{t('sections.userResponsibilities.items.noReverse')}</li>
        </ul>
      </section>

      {/* Section 7: Health Disclaimer */}
      <section id="health-disclaimer" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.healthDisclaimer.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.healthDisclaimer.content')}
        </p>
      </section>

      {/* Section 8: Liability */}
      <section id="liability" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.liability.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.liability.content')}
        </p>
      </section>

      {/* Section 9: Modifications */}
      <section id="modifications" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.modifications.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.modifications.content')}
        </p>
      </section>

      {/* Section 10: Contact */}
      <section id="contact" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.contact.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.contact.content')}
          <br />
          <a href="mailto:support@nutriprofile.app" className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
            support@nutriprofile.app
          </a>
        </p>
      </section>

      {/* Footer with company info */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t('footer.operator')} <strong>{t('footer.companyName')}</strong>
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          {t('footer.paddle')}
        </p>
      </div>
    </LegalPageLayout>
  )
}

export default TermsPage
