import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Step } from 'react-joyride'
import { ProductTour } from './ProductTour'

export function DashboardTour() {
  const { t } = useTranslation('common')

  const steps: Step[] = useMemo(
    () => [
      {
        target: 'body',
        content: t('tour.dashboard.welcome'),
        title: t('tour.dashboard.welcomeTitle'),
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: '[data-tour="nav-dashboard"]',
        content: t('tour.dashboard.navDashboard'),
        title: t('tour.dashboard.navDashboardTitle'),
        placement: 'top',
      },
      {
        target: '[data-tour="nav-vision"]',
        content: t('tour.dashboard.navVision'),
        title: t('tour.dashboard.navVisionTitle'),
        placement: 'top',
      },
      {
        target: '[data-tour="nav-tracking"]',
        content: t('tour.dashboard.navTracking'),
        title: t('tour.dashboard.navTrackingTitle'),
        placement: 'top',
      },
      {
        target: '[data-tour="nav-recipes"]',
        content: t('tour.dashboard.navRecipes'),
        title: t('tour.dashboard.navRecipesTitle'),
        placement: 'top',
      },
      {
        target: '[data-tour="quick-actions"]',
        content: t('tour.dashboard.quickActions'),
        title: t('tour.dashboard.quickActionsTitle'),
        placement: 'top-start',
      },
    ],
    [t]
  )

  return <ProductTour tourName="dashboard" steps={steps} />
}
