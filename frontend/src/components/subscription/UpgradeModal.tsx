import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature: 'vision_analyses' | 'recipe_generations' | 'coach_messages'
  used?: number
  limit?: number
}

const featureConfig = {
  vision_analyses: {
    icon: '📸',
    title: 'Analyses photo',
    description: 'Vous avez atteint votre limite d\'analyses photo pour aujourd\'hui.',
    benefits: [
      'Analyses photo illimitées',
      'Détection d\'aliments plus précise',
      'Historique complet',
    ],
  },
  recipe_generations: {
    icon: '🍳',
    title: 'Génération de recettes',
    description: 'Vous avez atteint votre limite de recettes pour cette semaine.',
    benefits: [
      '10+ recettes par semaine',
      'Recettes personnalisées IA',
      'Export des recettes en PDF',
    ],
  },
  coach_messages: {
    icon: '💬',
    title: 'Conseils du coach',
    description: 'Vous avez atteint votre limite de conseils coach pour aujourd\'hui.',
    benefits: [
      'Conseils illimités',
      'Coaching personnalisé',
      'Suivi de progression avancé',
    ],
  },
}

export function UpgradeModal({ isOpen, onClose, feature, used, limit }: UpgradeModalProps) {
  const config = featureConfig[feature]

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-primary-500 to-emerald-500 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{config.icon}</span>
            <div>
              <h2 className="text-xl font-bold">{config.title}</h2>
              {used !== undefined && limit !== undefined && (
                <p className="text-white/80 text-sm">{used}/{limit} utilisées</p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Message */}
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl mb-6">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Limite atteinte</p>
              <p className="text-red-600 text-sm mt-1">{config.description}</p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Passez à Premium pour débloquer :
            </p>
            <ul className="space-y-2">
              {config.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </span>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing teaser */}
          <div className="bg-gradient-to-r from-primary-50 to-emerald-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">À partir de</p>
                <p className="text-2xl font-bold text-gray-900">
                  4,99€<span className="text-sm font-normal text-gray-500">/mois</span>
                </p>
              </div>
              <span className="px-3 py-1 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-xs font-bold rounded-full">
                -33% annuel
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Plus tard
            </button>
            <Link
              to="/pricing"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all text-center"
            >
              Voir les offres
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
