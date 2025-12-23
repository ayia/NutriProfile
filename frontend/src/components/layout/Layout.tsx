import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { QuickActionsFAB } from '@/components/ui/QuickActionsFAB'
import { useAuth } from '@/hooks/useAuth'

export function Layout() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  // Pages où on ajoute un padding-bottom pour le BottomNav
  const needsBottomPadding = isAuthenticated && !['/login', '/register', '/onboarding', '/'].includes(location.pathname)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${needsBottomPadding ? 'pb-24 md:pb-8' : ''}`}>
        <Outlet />
      </main>
      <BottomNav />
      <QuickActionsFAB />
    </div>
  )
}
