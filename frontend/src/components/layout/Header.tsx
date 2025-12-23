import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface NavLink {
  path: string
  label: string
  icon: string
}

const mainNavLinks: NavLink[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/vision', label: 'Scanner', icon: '📸' },
  { path: '/tracking', label: 'Suivi', icon: '📈' },
  { path: '/recipes', label: 'Recettes', icon: '🍳' },
]

export function Header() {
  const { isAuthenticated, logout, user } = useAuth()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  // Fermer le menu lors d'un changement de route
  useEffect(() => {
    setShowUserMenu(false)
  }, [location.pathname])

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
          <span className="text-2xl">🥗</span>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent">
            NutriProfile
          </span>
        </Link>

        {/* Navigation principale (desktop) */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1">
            {mainNavLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>
        )}

        {/* Actions à droite */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              {/* Avatar/Menu utilisateur */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <span className="hidden sm:block text-sm text-gray-700 max-w-[100px] truncate">
                  {user?.name}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Menu déroulant */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in">
                  {/* En-tête du menu */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                  </div>

                  {/* Liens du menu */}
                  <div className="py-2">
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>⚙️</span>
                      <span>Paramètres</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>👤</span>
                      <span>Mon profil</span>
                    </Link>
                    <Link
                      to="/tracking"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>📊</span>
                      <span>Mes statistiques</span>
                    </Link>
                  </div>

                  {/* Déconnexion */}
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span>🚪</span>
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:block px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-green-600 text-white rounded-lg hover:shadow-md transition-all font-medium"
              >
                Commencer
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
