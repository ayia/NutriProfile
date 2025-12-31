import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ChevronRight, FileText, Shield, RefreshCcw, ArrowUp, Home } from 'lucide-react'

interface Section {
  id: string
  titleKey: string
}

interface LegalPageLayoutProps {
  namespace: 'terms' | 'privacy' | 'refund'
  sections: Section[]
  children: React.ReactNode
}

const pageIcons = {
  terms: FileText,
  privacy: Shield,
  refund: RefreshCcw,
}

const pageTitles = {
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  refund: 'Refund Policy',
}

const relatedPages = {
  terms: [
    { key: 'privacy', path: '/privacy', icon: Shield },
    { key: 'refund', path: '/refund', icon: RefreshCcw },
  ],
  privacy: [
    { key: 'terms', path: '/terms', icon: FileText },
    { key: 'refund', path: '/refund', icon: RefreshCcw },
  ],
  refund: [
    { key: 'terms', path: '/terms', icon: FileText },
    { key: 'privacy', path: '/privacy', icon: Shield },
  ],
}

export function LegalPageLayout({ namespace, sections, children }: LegalPageLayoutProps) {
  const { t } = useTranslation(namespace)
  const { t: tCommon } = useTranslation('common')
  const [activeSection, setActiveSection] = useState<string>('')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const PageIcon = pageIcons[namespace]

  // Set up intersection observer to track active section
  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    })

    sections.forEach(section => {
      const element = document.getElementById(section.id)
      if (element) {
        observerRef.current?.observe(element)
      }
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [sections])

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - offset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const relatedLinks = relatedPages[namespace]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-green-600 dark:hover:text-green-400 flex items-center">
            <Home className="w-4 h-4 mr-1" />
            {tCommon('home')}
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 dark:text-white font-medium">{t('title')}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sticky Sidebar TOC - Hidden on mobile, visible on lg+ */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Page Title with Icon */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <PageIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {t('title')}
                </h2>
              </div>

              {/* Table of Contents */}
              <nav className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  {tCommon('nav.home') === 'Home' ? 'On this page' : 'Sur cette page'}
                </p>
                {sections.map((section) => {
                  const isActive = activeSection === section.id
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200',
                        'hover:bg-gray-100 dark:hover:bg-gray-800',
                        isActive
                          ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium border-l-2 border-green-600'
                          : 'text-gray-600 dark:text-gray-400'
                      )}
                    >
                      {t(section.titleKey)}
                    </button>
                  )
                })}
              </nav>

              {/* Related Pages */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  {tCommon('nav.home') === 'Home' ? 'Related' : 'Voir aussi'}
                </p>
                <div className="space-y-2">
                  {relatedLinks.map(({ key, path, icon: Icon }) => (
                    <Link
                      key={key}
                      to={path}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {pageTitles[key as keyof typeof pageTitles]}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {t('title')}
              </h1>

              <div className="prose prose-gray dark:prose-invert max-w-none">
                {children}
              </div>
            </div>

            {/* Mobile TOC - Shown on small screens */}
            <div className="lg:hidden mt-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  {tCommon('nav.home') === 'Home' ? 'Quick links' : 'Liens rapides'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sections.slice(0, 5).map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="px-3 py-1.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                    >
                      {t(section.titleKey).replace(/^\d+\.\s*/, '')}
                    </button>
                  ))}
                </div>

                {/* Related Pages for Mobile */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    {tCommon('nav.home') === 'Home' ? 'Related pages' : 'Pages associées'}
                  </p>
                  <div className="flex gap-2">
                    {relatedLinks.map(({ key, path, icon: Icon }) => (
                      <Link
                        key={key}
                        to={path}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {pageTitles[key as keyof typeof pageTitles]}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className={cn(
            'fixed bottom-6 right-6 p-3 rounded-full bg-green-600 text-white shadow-lg',
            'hover:bg-green-700 transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
            showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          )}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default LegalPageLayout
