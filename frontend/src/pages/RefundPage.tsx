import { useTranslation } from 'react-i18next'
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

const sections = [
  { id: 'guarantee', titleKey: 'sections.guarantee.title' },
  { id: 'eligibility', titleKey: 'sections.eligibility.title' },
  { id: 'process', titleKey: 'sections.process.title' },
  { id: 'method', titleKey: 'sections.method.title' },
  { id: 'exceptions', titleKey: 'sections.exceptions.title' },
  { id: 'cancellation', titleKey: 'sections.cancellation.title' },
  { id: 'prorated', titleKey: 'sections.prorated.title' },
  { id: 'contact', titleKey: 'sections.contact.title' },
]

export function RefundPage() {
  const { t } = useTranslation('refund')

  return (
    <LegalPageLayout namespace="refund" sections={sections}>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        <strong>{t('lastUpdated')}:</strong> December 27, 2024
      </p>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {t('intro')}
      </p>

      {/* Section 1: Money-Back Guarantee */}
      <section id="guarantee" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.guarantee.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.guarantee.content')}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
          {t('sections.guarantee.conditions')}
        </p>
      </section>

      {/* Section 2: Eligibility */}
      <section id="eligibility" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.eligibility.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.eligibility.content')}
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4 space-y-1">
          <li>{t('sections.eligibility.items.timeframe')}</li>
          <li>{t('sections.eligibility.items.firstPurchase')}</li>
          <li>{t('sections.eligibility.items.noAbuse')}</li>
          <li>{t('sections.eligibility.items.validAccount')}</li>
        </ul>
      </section>

      {/* Section 3: Refund Process */}
      <section id="process" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.process.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.process.content')}
        </p>
        <ol className="list-decimal pl-6 text-gray-600 dark:text-gray-300 mb-4 space-y-1">
          <li>{t('sections.process.steps.contact')}</li>
          <li>{t('sections.process.steps.provide')}</li>
          <li>{t('sections.process.steps.review')}</li>
          <li>{t('sections.process.steps.refund')}</li>
        </ol>
      </section>

      {/* Section 4: Refund Method */}
      <section id="method" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.method.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.method.content')}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
          {t('sections.method.note')}
        </p>
      </section>

      {/* Section 5: Exceptions */}
      <section id="exceptions" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.exceptions.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.exceptions.content')}
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4 space-y-1">
          <li>{t('sections.exceptions.items.afterPeriod')}</li>
          <li>{t('sections.exceptions.items.renewals')}</li>
          <li>{t('sections.exceptions.items.abuse')}</li>
          <li>{t('sections.exceptions.items.violation')}</li>
        </ul>
      </section>

      {/* Section 6: Subscription Cancellation */}
      <section id="cancellation" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.cancellation.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.cancellation.content')}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
          {t('sections.cancellation.note')}
        </p>
      </section>

      {/* Section 7: Prorated Refunds */}
      <section id="prorated" className="scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          {t('sections.prorated.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('sections.prorated.content')}
        </p>
      </section>

      {/* Section 8: Contact */}
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

export default RefundPage
