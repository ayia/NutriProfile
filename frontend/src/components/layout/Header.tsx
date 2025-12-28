import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

export function Header() {
  const { t } = useTranslation('common')
  const { isAuthenticated, logout, user } = useAuth()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const mainNavLinks = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: '📊' },
    { path: '/vision', label: t('nav.vision'), icon: '📸' },
    { path: '/tracking', label: t('nav.tracking'), icon: '📈' },
    { path: '/recipes', label: t('nav.recipes'), icon: '🍳' },
  ]

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setShowMobileMenu(false)
      }
    }

    if (showUserMenu || showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu, showMobileMenu])

  // Fermer les menus lors d'un changement de route
  useEffect(() => {
    setShowUserMenu(false)
    setShowMobileMenu(false)
  }, [location.pathname])

  // Bloquer le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showMobileMenu])

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to={isAuthenticated ? '/dashboard' : '/'}
          className="flex items-center gap-2.5 group"
        >
          <div className="relative">
            <img
              src="/logo.png"
              alt="NutriProfile"
              className="h-10 w-10 drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight">
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
          {/* Hamburger menu button (mobile only) */}
          {isAuthenticated && (
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
              aria-expanded={showMobileMenu}
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          )}

          {/* Language Switcher */}
          <LanguageSwitcher variant="compact" />

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
                      <span>{t('nav.settings')}</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>👤</span>
                      <span>{t('nav.profile')}</span>
                    </Link>
                    <Link
                      to="/tracking"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>📊</span>
                      <span>{t('nav.tracking')}</span>
                    </Link>
                  </div>

                  {/* Déconnexion */}
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span>🚪</span>
                      <span>{t('logout')}</span>
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
                {t('login.submit', { ns: 'auth' })}
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-green-600 text-white rounded-lg hover:shadow-md transition-all font-medium"
              >
                {t('register.submit', { ns: 'auth' })}
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isAuthenticated && showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Menu drawer */}
          <div
            ref={mobileMenuRef}
            className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 md:hidden animate-slide-in-right"
          >
            {/* Header du menu */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-lg font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* User info */}
            <div className="p-4 bg-gradient-to-r from-primary-50 to-emerald-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Navigation
              </p>
              <div className="space-y-1">
                {mainNavLinks.map((link) => {
                  const isActive = location.pathname === link.path
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 font-medium shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Settings & Profile */}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-3">
                {t('nav.settings')}
              </p>
              <div className="space-y-1">
                <Link
                  to="/settings"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <span className="text-xl">⚙️</span>
                  <span>{t('nav.settings')}</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <span className="text-xl">👤</span>
                  <span>{t('nav.profile')}</span>
                </Link>
              </div>
            </nav>

            {/* Logout button */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
              <button
                onClick={() => {
                  setShowMobileMenu(false)
                  logout()
                }}
                className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-all font-medium"
              >
                <span className="text-xl">🚪</span>
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
