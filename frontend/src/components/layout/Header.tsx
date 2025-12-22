import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { isAuthenticated, logout, user } = useAuth()

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary-600">
          NutriProfile
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-600">Bonjour, {user?.name}</span>
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-primary-600"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-gray-600 hover:text-primary-600"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-primary-600"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
