import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Lightbulb,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Camera,
  Sun,
  Target,
  Maximize,
  Eye,
} from 'lucide-react'

interface PhotoExample {
  type: 'good' | 'bad'
  icon: React.ElementType
  titleKey: string
  descKey: string
  emoji: string
}

const PHOTO_EXAMPLES: PhotoExample[] = [
  // Good examples
  {
    type: 'good',
    icon: Sun,
    titleKey: 'goodLighting',
    descKey: 'goodLightingDesc',
    emoji: '☀️',
  },
  {
    type: 'good',
    icon: Target,
    titleKey: 'topDown',
    descKey: 'topDownDesc',
    emoji: '📐',
  },
  {
    type: 'good',
    icon: Maximize,
    titleKey: 'allVisible',
    descKey: 'allVisibleDesc',
    emoji: '👀',
  },
  {
    type: 'good',
    icon: Eye,
    titleKey: 'clearFocus',
    descKey: 'clearFocusDesc',
    emoji: '🎯',
  },
  // Bad examples
  {
    type: 'bad',
    icon: Sun,
    titleKey: 'darkPhoto',
    descKey: 'darkPhotoDesc',
    emoji: '🌑',
  },
  {
    type: 'bad',
    icon: Camera,
    titleKey: 'blurry',
    descKey: 'blurryDesc',
    emoji: '😵',
  },
  {
    type: 'bad',
    icon: Maximize,
    titleKey: 'partialView',
    descKey: 'partialViewDesc',
    emoji: '✂️',
  },
  {
    type: 'bad',
    icon: Eye,
    titleKey: 'cluttered',
    descKey: 'clutteredDesc',
    emoji: '🗑️',
  },
]

interface PhotoTipsProps {
  compact?: boolean
}

export function PhotoTips({ compact = false }: PhotoTipsProps) {
  const { t } = useTranslation('vision')
  const [isExpanded, setIsExpanded] = useState(!compact)

  const goodExamples = PHOTO_EXAMPLES.filter((ex) => ex.type === 'good')
  const badExamples = PHOTO_EXAMPLES.filter((ex) => ex.type === 'bad')

  if (compact && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-all group"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {t('photoTips.showTips')}
          </span>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </button>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-2xl border border-blue-100 overflow-hidden">
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 ${compact ? 'cursor-pointer hover:bg-blue-50/50' : ''}`}
        onClick={compact ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{t('photoTips.title')}</h3>
            <p className="text-xs text-gray-500">{t('photoTips.subtitle')}</p>
          </div>
        </div>
        {compact && (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-4">
        {/* Do's - Good examples */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-green-700">{t('photoTips.doThis')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {goodExamples.map((example) => (
              <div
                key={example.titleKey}
                className="flex items-start gap-2 p-3 bg-green-50/70 rounded-xl border border-green-100"
              >
                <span className="text-lg flex-shrink-0">{example.emoji}</span>
                <div>
                  <p className="text-xs font-medium text-green-800">
                    {t(`photoTips.examples.${example.titleKey}`)}
                  </p>
                  <p className="text-[10px] text-green-600 mt-0.5">
                    {t(`photoTips.examples.${example.descKey}`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Don'ts - Bad examples */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-sm font-semibold text-red-700">{t('photoTips.avoidThis')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {badExamples.map((example) => (
              <div
                key={example.titleKey}
                className="flex items-start gap-2 p-3 bg-red-50/70 rounded-xl border border-red-100"
              >
                <span className="text-lg flex-shrink-0">{example.emoji}</span>
                <div>
                  <p className="text-xs font-medium text-red-800">
                    {t(`photoTips.examples.${example.titleKey}`)}
                  </p>
                  <p className="text-[10px] text-red-600 mt-0.5">
                    {t(`photoTips.examples.${example.descKey}`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro tip */}
        <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-xs font-semibold text-amber-800">{t('photoTips.proTip')}</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              {t('photoTips.proTipDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
