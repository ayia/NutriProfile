import { useTranslation } from 'react-i18next'
import { Flame } from 'lucide-react'
import type { GalleryItem, MealType } from '@/types/foodLog'

export interface GalleryPhotoCardProps {
  item: GalleryItem
  onClick: () => void
}

const MEAL_TYPE_COLORS: Record<MealType, string> = {
  breakfast: 'bg-gradient-to-r from-amber-500 to-orange-500',
  lunch: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  dinner: 'bg-gradient-to-r from-indigo-500 to-purple-500',
  snack: 'bg-gradient-to-r from-pink-500 to-rose-500',
}

export function GalleryPhotoCard({ item, onClick }: GalleryPhotoCardProps) {
  const { t, i18n } = useTranslation('vision')

  // Format date locale
  const langMap: Record<string, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    de: 'de-DE',
    es: 'es-ES',
    pt: 'pt-PT',
    zh: 'zh-CN',
    ar: 'ar-SA',
  }
  const locale = langMap[i18n.language] || 'en-US'
  const date = new Date(item.meal_date)
  const formattedDate = date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  })
  const formattedTime = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl bg-gray-100 aspect-square transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      {/* Image */}
      <img
        src={item.image_url}
        alt={`${t(`mealTypes.${item.meal_type}`)} - ${formattedDate}`}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Meal type badge - Top right */}
      <div className="absolute top-2 right-2 z-10">
        <div
          className={`px-2 py-1 rounded-lg text-[10px] xs:text-xs font-semibold text-white shadow-lg ${
            MEAL_TYPE_COLORS[item.meal_type]
          }`}
        >
          {t(`mealTypes.${item.meal_type}`)}
        </div>
      </div>

      {/* Info overlay - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-10">
        {/* Calories - Center */}
        {item.total_calories !== null && (
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <div className="w-6 h-6 bg-orange-500/90 rounded-full flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold drop-shadow-lg">
              {item.total_calories}
            </span>
            <span className="text-xs text-white/90">kcal</span>
          </div>
        )}

        {/* Date - Bottom */}
        <div className="text-center text-[10px] xs:text-xs text-white/90 font-medium">
          <div>{formattedDate}</div>
          <div className="text-white/70">{formattedTime}</div>
        </div>
      </div>

      {/* Items count badge - Top left (optional) */}
      {item.items_count > 0 && (
        <div className="absolute top-2 left-2 z-10">
          <div className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-[10px] text-white font-medium">
            {item.items_count} {t('foodLog.foods')}
          </div>
        </div>
      )}
    </button>
  )
}
