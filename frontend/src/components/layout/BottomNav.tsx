import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'

export function BottomNav() {
  const { t } = useTranslation('common')
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: '🏠', activeIcon: '🏡' },
    { path: '/vision', label: t('nav.vision'), icon: '📷', activeIcon: '📸' },
    { path: '/tracking', label: t('nav.tracking'), icon: '📊', activeIcon: '📈' },
    { path: '/recipes', label: t('nav.recipes'), icon: '🍳', activeIcon: '👨‍🍳' },
    { path: '/settings', label: t('nav.profile'), icon: '👤', activeIcon: '👤' },
  ]

  // Ne pas afficher sur certaines pages
  const hiddenPaths = ['/', '/login', '/register', '/onboarding']
  if (hiddenPaths.includes(location.pathname) || !isAuthenticated) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className={`text-xl mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`}>
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span className={`text-[10px] sm:text-xs truncate max-w-[48px] sm:max-w-none ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 bg-primary-600 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
