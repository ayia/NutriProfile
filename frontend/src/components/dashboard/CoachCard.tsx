import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CoachResponse } from '@/types/dashboard'
import { HeartPulse, AlertCircle, AlertTriangle, CheckCircle, Sparkles, MessageCircle, ArrowRight } from 'lucide-react'

interface CoachCardProps {
  advice: CoachResponse
}

export function CoachCard({ advice }: CoachCardProps) {
  const { t } = useTranslation('common')

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      default:
        return 'border-l-green-500 bg-green-50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">{advice.greeting}</h3>
            <p className="text-primary-100 text-sm mt-1">{advice.summary}</p>
          </div>
        </div>
      </div>

      {/* Conseils */}
      <div className="p-4 space-y-3">
        {advice.advices.map((item, index) => (
          <div
            key={index}
            className={`border-l-4 rounded-r-lg p-3 ${getPriorityColor(item.priority)}`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                {getPriorityIcon(item.priority)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{item.message}</p>
                {item.action && (
                  <button className="text-xs text-primary-600 hover:text-primary-700 mt-1 font-medium">
                    → {item.action}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Citation motivation */}
      {advice.motivation_quote && (
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-r from-primary-50 to-emerald-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary-500" />
            </div>
            <p className="text-sm text-gray-600 italic">"{advice.motivation_quote}"</p>
          </div>
        </div>
      )}

      {/* CTA to full coaching page */}
      <div className="px-4 pb-4">
        <Link
          to="/coaching"
          className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all group"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{t('coach.openChat')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
