import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Download, Share } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export function PWAInstallPrompt() {
  const { t } = useTranslation('common')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Vérifier si déjà installé en mode standalone
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setIsStandalone(isInStandaloneMode)

    // Détecter iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
    setIsIOS(isIOSDevice)

    // Vérifier si déjà refusé récemment (24h)
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10)
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60)
      if (hoursSinceDismissed < 24) {
        return
      }
    }

    // Écouter l'événement beforeinstallprompt (Android/Chrome)
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Afficher après un délai pour ne pas interrompre l'utilisateur
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Pour iOS, afficher le prompt après un délai si pas en standalone
    if (isIOSDevice && !isInStandaloneMode) {
      setTimeout(() => setShowPrompt(true), 5000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  // Ne rien afficher si déjà installé ou si pas de prompt
  if (isStandalone || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up md:left-auto md:right-4 md:w-96">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-white font-semibold">{t('pwa.title', 'Installer NutriProfile')}</span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label={t('common.close', 'Fermer')}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-4">
          <p className="text-gray-600 text-sm mb-4">
            {t('pwa.description', 'Installez NutriProfile sur votre appareil pour un accès rapide et une meilleure expérience.')}
          </p>

          {isIOS ? (
            // Instructions pour iOS
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                {t('pwa.iosInstructions', 'Pour installer sur iOS :')}
              </p>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <Share className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">
                  {t('pwa.iosStep1', '1. Appuyez sur le bouton Partager')}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-full">
                  <Download className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm text-gray-600">
                  {t('pwa.iosStep2', '2. Sélectionnez "Sur l\'écran d\'accueil"')}
                </span>
              </div>
              <button
                onClick={handleDismiss}
                className="w-full mt-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                {t('pwa.understood', 'Compris')}
              </button>
            </div>
          ) : (
            // Bouton d'installation pour Android/Chrome
            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                {t('pwa.later', 'Plus tard')}
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t('pwa.install', 'Installer')}
              </button>
            </div>
          )}
        </div>

        {/* Footer avec avantages */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
              {t('pwa.benefit1', 'Accès hors-ligne')}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
              {t('pwa.benefit2', 'Plus rapide')}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
              {t('pwa.benefit3', 'Notifications')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
