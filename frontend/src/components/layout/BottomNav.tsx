import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Camera,
  TrendingUp,
  ChefHat,
  User,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface NavItem {
  path: string
  label: string
  icon: LucideIcon
  tourId: string
}

export function BottomNav() {
  const { t } = useTranslation('common')
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const navItems: NavItem[] = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, tourId: 'nav-dashboard' },
    { path: '/vision', label: t('nav.vision'), icon: Camera, tourId: 'nav-vision' },
    { path: '/tracking', label: t('nav.tracking'), icon: TrendingUp, tourId: 'nav-tracking' },
    { path: '/recipes', label: t('nav.recipes'), icon: ChefHat, tourId: 'nav-recipes' },
    { path: '/settings', label: t('nav.profile'), icon: User, tourId: 'nav-settings' },
  ]

  // Ne pas afficher sur certaines pages
  const hiddenPaths = ['/', '/login', '/register', '/onboarding']
  if (hiddenPaths.includes(location.pathname) || !isAuthenticated) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 md:hidden z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              data-tour={item.tourId}
              className={cn(
                'relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-200',
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {/* Fond actif avec gradient subtil */}
              {isActive && (
                <div className="absolute inset-x-2 inset-y-1 bg-gradient-to-b from-primary-50 to-primary-100/50 rounded-xl -z-10" />
              )}

              {/* Icône avec animation */}
              <div
                className={cn(
                  'relative transition-all duration-200 ease-out',
                  isActive && 'scale-110 -translate-y-0.5'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-all duration-200',
                    isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'
                  )}
                />
                {/* Effet de brillance sur l'icône active */}
                {isActive && (
                  <div className="absolute -inset-1 bg-primary-400/20 rounded-full blur-md -z-10" />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] sm:text-xs truncate max-w-[48px] sm:max-w-none mt-0.5 transition-all duration-200',
                  isActive ? 'font-semibold' : 'font-medium'
                )}
              >
                {item.label}
              </span>

              {/* Indicateur actif - point animé */}
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full shadow-sm shadow-primary-500/50" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
