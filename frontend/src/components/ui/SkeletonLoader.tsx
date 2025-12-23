interface SkeletonLoaderProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  animation?: 'pulse' | 'wave' | 'none'
}

export function SkeletonLoader({
  className = '',
  variant = 'rectangular',
  animation = 'pulse',
}: SkeletonLoaderProps) {
  const baseClasses = 'bg-gray-200'

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
    none: '',
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
    />
  )
}

// Composants Skeleton pré-configurés pour différents usages
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <SkeletonLoader variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader className="h-4 w-3/4" />
          <SkeletonLoader className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonLoader className="h-24" />
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <SkeletonLoader variant="circular" className="w-10 h-10" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonNutritionCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
      <SkeletonLoader className="h-8 w-16 mx-auto mb-2" />
      <SkeletonLoader className="h-3 w-12 mx-auto mb-1" />
      <SkeletonLoader className="h-2 w-10 mx-auto" />
    </div>
  )
}

export function SkeletonRecipeCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <SkeletonLoader className="h-40 rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonLoader className="h-5 w-3/4" />
        <SkeletonLoader className="h-3 w-full" />
        <SkeletonLoader className="h-3 w-2/3" />
        <div className="flex gap-2 pt-2">
          <SkeletonLoader className="h-6 w-16 rounded-full" />
          <SkeletonLoader className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats en haut */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonNutritionCard key={i} />
        ))}
      </div>

      {/* Graphique */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <SkeletonLoader className="h-6 w-48 mb-4" />
        <SkeletonLoader className="h-64" />
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <SkeletonLoader className="h-6 w-32 mb-4" />
        <SkeletonList count={4} />
      </div>
    </div>
  )
}
