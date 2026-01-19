/**
 * Hook personnalisé pour Web Speech API (reconnaissance vocale navigateur)
 * Gratuit, natif, pas d'API externe nécessaire
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

// Types pour Web Speech API (pas dans @types/react par défaut)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onend: ((this: SpeechRecognition, ev: Event) => void) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export interface UseSpeechRecognitionResult {
  isListening: boolean
  transcript: string
  error: string | null
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const { i18n } = useTranslation()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Vérifier si Web Speech API est supportée
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // Initialiser la reconnaissance vocale
  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition

    const recognition = new SpeechRecognitionAPI()

    // Configuration
    recognition.continuous = true // Continue même après une pause
    recognition.interimResults = true // Affiche les résultats intermédiaires
    recognition.lang = getLangCode(i18n.language) // Langue de reconnaissance

    // Event handlers
    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ''
      let finalTranscript = ''

      // Parcourir les résultats
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcriptPart = result[0].transcript

        if (result.isFinal) {
          finalTranscript += transcriptPart + ' '
        } else {
          interimTranscript += transcriptPart
        }
      }

      // Mettre à jour le transcript (final prend priorité)
      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript)
      } else if (interimTranscript) {
        // Pour affichage en temps réel, on garde l'intermédiaire
        setTranscript((prev) => {
          // Enlever le dernier mot intermédiaire si présent
          const words = prev.trim().split(' ')
          const lastWord = words[words.length - 1]
          if (lastWord && !lastWord.endsWith('.') && !lastWord.endsWith(',')) {
            words.pop()
          }
          return words.join(' ') + ' ' + interimTranscript
        })
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)

      // Mapper les erreurs en messages utilisateur
      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          setError('permissionDenied')
          break
        case 'no-speech':
          setError('noSpeechDetected')
          break
        case 'network':
          setError('networkError')
          break
        default:
          setError('unknownError')
      }

      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [isSupported, i18n.language])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return

    try {
      setError(null)
      recognitionRef.current.start()
    } catch (err) {
      console.error('Error starting recognition:', err)
      setError('startError')
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return

    try {
      recognitionRef.current.stop()
    } catch (err) {
      console.error('Error stopping recognition:', err)
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  }
}

/**
 * Convertit le code langue i18n en code langue Speech API
 */
function getLangCode(lang: string): string {
  const langMap: Record<string, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    de: 'de-DE',
    es: 'es-ES',
    pt: 'pt-PT',
    zh: 'zh-CN',
    ar: 'ar-SA',
  }
  return langMap[lang] || 'en-US'
}
