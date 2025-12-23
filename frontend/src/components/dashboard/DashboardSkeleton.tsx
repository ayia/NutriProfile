import { SkeletonLoader } from '@/components/ui/SkeletonLoader'

export function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonLoader className="h-8 w-48" />
          <SkeletonLoader className="h-4 w-32" />
        </div>
        <SkeletonLoader variant="circular" className="w-10 h-10" />
      </div>

      {/* Niveau et XP */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4">
          <SkeletonLoader variant="circular" className="w-16 h-16" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader className="h-4 w-24" />
            <SkeletonLoader className="h-6 w-full" />
            <SkeletonLoader className="h-3 w-32" />
          </div>
        </div>
      </div>

      {/* Stats du jour - 4 anneaux */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <SkeletonLoader className="h-6 w-28 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <SkeletonLoader variant="circular" className="w-24 h-24" />
              <SkeletonLoader className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Graphique semaine */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <SkeletonLoader className="h-6 w-32 mb-6" />
        <div className="flex items-end justify-between gap-2 h-48">
          {[60, 80, 45, 90, 70, 55, 75].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex-1" style={{ maxHeight: `${height}%` }}>
                <SkeletonLoader className="w-full h-full" />
              </div>
              <SkeletonLoader className="h-4 w-6" />
            </div>
          ))}
        </div>
      </div>

      {/* Coach */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          <SkeletonLoader variant="circular" className="w-12 h-12 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader className="h-5 w-24" />
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-3/4" />
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col items-center gap-2">
              <SkeletonLoader variant="circular" className="w-10 h-10" />
              <SkeletonLoader className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Streaks et Achievements */}
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6">
            <SkeletonLoader className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <SkeletonLoader variant="circular" className="w-10 h-10" />
                  <div className="flex-1 space-y-1">
                    <SkeletonLoader className="h-4 w-24" />
                    <SkeletonLoader className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
