import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface NavItem {
  path: string
  label: string
  icon: string
  activeIcon: string
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Accueil', icon: '🏠', activeIcon: '🏡' },
  { path: '/vision', label: 'Scanner', icon: '📷', activeIcon: '📸' },
  { path: '/tracking', label: 'Suivi', icon: '📊', activeIcon: '📈' },
  { path: '/recipes', label: 'Recettes', icon: '🍳', activeIcon: '👨‍🍳' },
  { path: '/settings', label: 'Profil', icon: '👤', activeIcon: '👤' },
]

export function BottomNav() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

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
              <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
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
