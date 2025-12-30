import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Camera, ArrowRight } from 'lucide-react'

export function ScannerCard() {
  const { t } = useTranslation('dashboard')

  return (
    <Link
      to="/vision"
      className="block bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 text-white hover:shadow-lg transition-all hover:scale-[1.02] group"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Camera className="w-8 h-8 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{t('scanner.title')}</h3>
          <p className="text-white/80 text-sm">
            {t('scanner.subtitle')}
          </p>
        </div>
        <div className="text-white/60 group-hover:translate-x-1 transition-transform">
          <ArrowRight className="w-6 h-6" />
        </div>
      </div>
    </Link>
  )
}
