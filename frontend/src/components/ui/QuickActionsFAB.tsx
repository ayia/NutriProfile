import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface QuickAction {
  id: string
  label: string
  icon: string
  path?: string
  action?: () => void
  color: string
}

export function QuickActionsFAB() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const fabRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  // Ne pas afficher sur certaines pages
  const hiddenPaths = ['/', '/login', '/register', '/onboarding']
  if (hiddenPaths.includes(location.pathname) || !isAuthenticated) {
    return null
  }

  const actions: QuickAction[] = [
    {
      id: 'scan',
      label: 'Scanner un repas',
      icon: '📸',
      path: '/vision',
      color: 'bg-green-500',
    },
    {
      id: 'water',
      label: 'Ajouter eau',
      icon: '💧',
      path: '/tracking',
      color: 'bg-blue-500',
    },
    {
      id: 'weight',
      label: 'Nouveau poids',
      icon: '⚖️',
      path: '/tracking',
      color: 'bg-purple-500',
    },
    {
      id: 'recipes',
      label: 'Chercher recette',
      icon: '🍳',
      path: '/recipes',
      color: 'bg-orange-500',
    },
  ]

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = () => {
    setIsAnimating(true)
    setIsOpen(!isOpen)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const handleAction = (action: QuickAction) => {
    if (action.path) {
      navigate(action.path)
    } else if (action.action) {
      action.action()
    }
    setIsOpen(false)
  }

  return (
    <div
      ref={fabRef}
      className="fixed bottom-20 right-4 md:bottom-6 z-40"
    >
      {/* Menu d'actions */}
      <div
        className={`absolute bottom-16 right-0 flex flex-col-reverse gap-3 transition-all duration-300 ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
            }}
            className={`flex items-center gap-3 pl-4 pr-3 py-2 rounded-full shadow-lg transform transition-all duration-300 ${
              action.color
            } text-white hover:scale-105 active:scale-95 ${
              isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
            }`}
          >
            <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
            <span className="text-xl">{action.icon}</span>
          </button>
        ))}
      </div>

      {/* Bouton FAB principal */}
      <button
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 ${
          isAnimating ? 'animate-pulse' : ''
        }`}
      >
        <span
          className={`text-2xl transition-transform duration-300 ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>

      {/* Overlay sombre quand ouvert */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
