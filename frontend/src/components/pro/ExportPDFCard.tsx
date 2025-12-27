import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileDown, Loader2, Lock, CheckCircle } from 'lucide-react'
import { exportApi, type ExportPDFRequest } from '@/services/api'

interface ExportPDFCardProps {
  isPro: boolean
  onUpgradeClick?: () => void
}

export function ExportPDFCard({ isPro, onUpgradeClick }: ExportPDFCardProps) {
  const { t } = useTranslation('pro')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly')
  const [options, setOptions] = useState({
    include_meals: true,
    include_activities: true,
    include_weight: true,
    include_recommendations: true,
  })

  const handleExport = async () => {
    if (!isPro) {
      onUpgradeClick?.()
      return
    }

    setLoading(true)
    setSuccess(false)

    try {
      const request: ExportPDFRequest = {
        report_type: reportType,
        ...options,
      }

      const blob = await exportApi.downloadPDF(request)

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nutriprofile_rapport_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-2xl flex items-center justify-center">
            <FileDown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">
              {t('exportPdf.title')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('exportPdf.subtitle')}
            </p>
          </div>
        </div>

        {!isPro && (
          <span className="px-3 py-1 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-xs font-bold rounded-full">
            PRO
          </span>
        )}
      </div>

      {/* Type de rapport */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('exportPdf.reportType')}
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => setReportType('weekly')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
              reportType === 'weekly'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="font-medium">{t('exportPdf.weekly')}</span>
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
              reportType === 'monthly'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="font-medium">{t('exportPdf.monthly')}</span>
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="mb-6 space-y-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('exportPdf.includeOptions')}
        </label>

        {[
          { key: 'include_meals', label: t('exportPdf.meals') },
          { key: 'include_activities', label: t('exportPdf.activities') },
          { key: 'include_weight', label: t('exportPdf.weight') },
          { key: 'include_recommendations', label: t('exportPdf.recommendations') },
        ].map((option) => (
          <label
            key={option.key}
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={options[option.key as keyof typeof options]}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  [option.key]: e.target.checked,
                }))
              }
              className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>

      {/* Bouton export */}
      <button
        onClick={handleExport}
        disabled={loading}
        className={`w-full py-4 px-6 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
          isPro
            ? success
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-primary-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5'
            : 'bg-gray-100 text-gray-500 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t('exportPdf.generating')}
          </>
        ) : success ? (
          <>
            <CheckCircle className="h-5 w-5" />
            {t('exportPdf.downloaded')}
          </>
        ) : !isPro ? (
          <>
            <Lock className="h-5 w-5" />
            {t('exportPdf.upgradeToPro')}
          </>
        ) : (
          <>
            <FileDown className="h-5 w-5" />
            {t('exportPdf.download')}
          </>
        )}
      </button>
    </div>
  )
}
