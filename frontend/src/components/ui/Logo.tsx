import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
}

export function Logo({ className, size = 'md', showText = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 100 100"
        className={cn(
          sizeClasses[size],
          'drop-shadow-sm transition-transform duration-200 group-hover:scale-105'
        )}
        aria-label="NutriProfile Logo"
      >
        <defs>
          {/* Main gradient for the N letter */}
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Lighter gradient for the leaf */}
          <linearGradient id="leafGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#6EE7B7" />
          </linearGradient>

          {/* Shadow filter */}
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" floodColor="#059669" />
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="url(#logoGradient)"
          filter="url(#logoShadow)"
        />

        {/* Letter N - stylized */}
        <path
          d="M 30 70 L 30 35 L 32 35 L 55 60 L 55 35 L 70 35 L 70 70 L 68 70 L 45 45 L 45 70 Z"
          fill="white"
          opacity="0.95"
        />

        {/* Leaf overlay */}
        <path
          d="M 60 20
             Q 75 25, 80 40
             Q 82 50, 75 55
             Q 70 58, 65 55
             Q 62 52, 60 45
             Q 58 35, 60 20 Z"
          fill="url(#leafGradient)"
          opacity="0.9"
        />

        {/* Leaf vein */}
        <path
          d="M 62 25 Q 70 35, 72 48"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
      </svg>

      {showText && (
        <span
          className={cn(
            textSizeClasses[size],
            'font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight'
          )}
        >
          NutriProfile
        </span>
      )}
    </div>
  )
}

// Alternative simpler version for very small sizes (favicon, etc.)
export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('w-full h-full', className)}
      aria-label="NutriProfile"
    >
      <defs>
        <linearGradient id="logoIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#logoIconGradient)" />

      <path
        d="M 28 72 L 28 32 L 34 32 L 58 60 L 58 32 L 72 32 L 72 72 L 66 72 L 42 44 L 42 72 Z"
        fill="white"
      />
    </svg>
  )
}
