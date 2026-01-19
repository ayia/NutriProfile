import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Camera, ChevronDown, Image as ImageIcon } from 'lucide-react'
import { visionApi } from '@/services/visionApi'
import { GalleryFilters, type GalleryFilters as FilterValues } from './GalleryFilters'
import { GalleryPhotoCard } from './GalleryPhotoCard'
import { FoodLogCard } from './FoodLogCard'
import { Button } from '@/components/ui/Button'
import type { FoodLog } from '@/types/foodLog'

export interface PhotoGalleryProps {
  onScanClick?: () => void
}

export function PhotoGallery({ onScanClick }: PhotoGalleryProps) {
  const { t } = useTranslation('vision')
  const [filters, setFilters] = useState<FilterValues>({})
  const [selectedLog, setSelectedLog] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [offset, setOffset] = useState(0)
  const limit = 20

  // Fetch gallery
  const { data, isLoading, error } = useQuery({
    queryKey: ['gallery', filters, offset],
    queryFn: () =>
      visionApi.getGallery(
        filters.startDate,
        filters.endDate,
        filters.mealType === 'all' ? undefined : filters.mealType,
        limit,
        offset
      ),
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 30 * 60 * 1000, // 30 min
  })

  // Fetch selected log details
  const { data: logDetails } = useQuery({
    queryKey: ['foodLog', selectedLog],
    queryFn: () => visionApi.getLog(selectedLog!),
    enabled: selectedLog !== null,
  })

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters)
    setOffset(0) // Reset pagination
  }

  const handleLoadMore = () => {
    setOffset((prev) => prev + limit)
  }

  const handlePhotoClick = (logId: number) => {
    setSelectedLog(logId)
  }

  const handleCloseDetail = () => {
    setSelectedLog(null)
  }

  return (
    <div className="space-y-6">
      {/* Filters toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-secondary-500" />
          {t('gallery.title')}
          {data && (
            <span className="text-sm font-normal text-gray-500">
              ({data.total} {t('gallery.photosCount', { count: data.total })})
            </span>
          )}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          {t('gallery.filters.title', { defaultValue: 'Filters' })}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && <GalleryFilters onFilterChange={handleFilterChange} />}

      {/* Loading state */}
      {isLoading && offset === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4 animate-pulse">{t('gallery.loading')}</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-error-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {t('common.error', { defaultValue: 'Error' })}
          </h4>
          <p className="text-gray-600">
            {t('gallery.loadError', { defaultValue: 'Could not load photos. Please try again.' })}
          </p>
        </div>
      )}

      {/* Empty state */}
      {data && data.items.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera className="w-10 h-10 text-gray-400" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">{t('gallery.empty')}</h4>
          <p className="text-gray-500 mb-6">{t('gallery.emptyDescription')}</p>
          {onScanClick && (
            <Button onClick={onScanClick} className="gap-2">
              <Camera className="w-4 h-4" />
              {t('history.startScanning', { defaultValue: 'Start scanning' })}
            </Button>
          )}
        </div>
      )}

      {/* Grid of photos */}
      {data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {data.items.map((item, index) => (
              <div
                key={item.id}
                className="reveal"
                style={{ animationDelay: `${0.05 * (index % 20)}s` }}
              >
                <GalleryPhotoCard item={item} onClick={() => handlePhotoClick(item.id)} />
              </div>
            ))}
          </div>

          {/* Load more button */}
          {data.has_more && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    {t('gallery.loadMore', { defaultValue: 'Load more' })}
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Detail modal */}
      {selectedLog && logDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleCloseDetail}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={handleCloseDetail}
                className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100"
              >
                <span className="text-gray-600">×</span>
              </button>
              <FoodLogCard log={logDetails as FoodLog} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
