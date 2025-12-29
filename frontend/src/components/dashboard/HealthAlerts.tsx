import { useTranslation } from 'react-i18next'
import type { HealthAlert } from '@/types/dashboard'

interface HealthAlertsProps {
  alerts: HealthAlert[]
}

const SEVERITY_STYLES = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  critical: 'bg-red-50 border-red-200 text-red-800',
}

const SEVERITY_ICON_BG = {
  info: 'bg-blue-100',
  warning: 'bg-amber-100',
  critical: 'bg-red-100',
}

export function HealthAlerts({ alerts }: HealthAlertsProps) {
  const { t } = useTranslation('dashboard')

  if (!alerts || alerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <div
          key={`${alert.type}-${index}`}
          className={`p-4 rounded-xl border ${SEVERITY_STYLES[alert.severity]} flex items-start gap-3`}
        >
          <div className={`w-10 h-10 rounded-full ${SEVERITY_ICON_BG[alert.severity]} flex items-center justify-center flex-shrink-0`}>
            <span className="text-xl">{alert.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">{alert.title}</h4>
            <p className="text-sm mt-1 opacity-90">{alert.message}</p>
            {alert.action && (
              <p className="text-xs mt-2 font-medium opacity-75">
                {t('personalization.suggestedAction')}: {alert.action}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
