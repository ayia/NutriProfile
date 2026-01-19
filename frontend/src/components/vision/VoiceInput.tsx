/**
 * Composant de logging vocal pour NutriProfile
 * Utilise Web Speech API (gratuit, natif navigateur)
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { visionApi, type ParsedFoodItem } from '@/services/visionApi'
import { Button } from '@/components/ui/Button'
import { Mic, MicOff, Loader2, CheckCircle, XCircle, Plus, Edit2 } from 'lucide-react'

export interface VoiceInputProps {
  onFoodsDetected: (foods: ParsedFoodItem[]) => void
  onClose?: () => void
}

export function VoiceInput({ onFoodsDetected, onClose }: VoiceInputProps) {
  const { t, i18n } = useTranslation('vision')
  const [detectedFoods, setDetectedFoods] = useState<ParsedFoodItem[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const {
    isListening,
    transcript,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition()

  // Mutation pour parser le texte vocal
  const parseMutation = useMutation({
    mutationFn: async (text: string) => {
      return await visionApi.parseVoice({
        transcription: text,
        language: i18n.language,
      })
    },
    onSuccess: (data) => {
      setDetectedFoods(data.items)
      if (data.items.length === 0) {
        toast.error(t('voice.noFoodsDetected'))
      } else {
        toast.success(t('voice.detected', { count: data.items.length }))
      }
    },
    onError: (error) => {
      console.error('Voice parsing error:', error)
      toast.error(t('voice.parsingError'))
    },
  })

  // Auto-parse quand l'utilisateur arrête de parler (3s après dernier mot)
  useEffect(() => {
    if (!transcript || isListening) return

    const timer = setTimeout(() => {
      if (transcript.trim().length > 3) {
        parseMutation.mutate(transcript)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [transcript, isListening])

  const handleStartStop = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      setDetectedFoods([])
      startListening()
    }
  }

  const handleAddAll = () => {
    if (detectedFoods.length === 0) return
    onFoodsDetected(detectedFoods)
    toast.success(t('voice.addedToMeal', { count: detectedFoods.length }))
    onClose?.()
  }

  const _handleEditFood = (index: number) => {
    setEditingIndex(index)
  }
  // TODO: Use _handleEditFood when implementing inline food editing
  void _handleEditFood

  const handleUpdateFood = (index: number, field: keyof ParsedFoodItem, value: string) => {
    const updated = [...detectedFoods]
    updated[index] = { ...updated[index], [field]: value }
    setDetectedFoods(updated)
  }

  const handleDeleteFood = (index: number) => {
    setDetectedFoods((prev) => prev.filter((_, i) => i !== index))
    toast.success(t('itemDeleted'))
  }

  if (!isSupported) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('voice.notSupported')}
        </h3>
        <p className="text-gray-600 text-sm">
          {t('voice.notSupportedDescription')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Voice Control */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${
            isListening
              ? 'bg-gradient-to-br from-error-500 to-rose-500 animate-pulse'
              : 'bg-gradient-to-br from-secondary-500 to-cyan-500'
          }`}>
            {isListening ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('voice.title')}</h2>
            <p className="text-sm text-gray-600">{t('voice.subtitle')}</p>
          </div>
        </div>

        {/* Transcription Display */}
        <div className={`min-h-[120px] p-4 rounded-xl border-2 transition-all mb-4 ${
          isListening
            ? 'border-secondary-500 bg-secondary-50'
            : 'border-gray-200 bg-gray-50'
        }`}>
          {transcript ? (
            <p className="text-gray-900">{transcript}</p>
          ) : (
            <p className="text-gray-400 italic">
              {isListening ? t('voice.speakNow') : t('voice.tapToSpeak')}
            </p>
          )}

          {isListening && (
            <div className="flex items-center gap-2 mt-3 text-secondary-600 text-sm">
              <div className="flex gap-1">
                <div className="w-1 h-4 bg-secondary-500 rounded animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-4 bg-secondary-500 rounded animate-pulse" style={{ animationDelay: '100ms' }} />
                <div className="w-1 h-4 bg-secondary-500 rounded animate-pulse" style={{ animationDelay: '200ms' }} />
              </div>
              <span>{t('voice.listening')}</span>
            </div>
          )}

          {parseMutation.isPending && (
            <div className="flex items-center gap-2 mt-3 text-primary-600 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('voice.processing')}</span>
            </div>
          )}
        </div>

        {/* Example */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-800">
            <strong>{t('voice.example')}:</strong> {t('voice.exampleText')}
          </p>
        </div>

        {/* Error Display */}
        {speechError && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-3 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-error-600 flex-shrink-0" />
            <p className="text-sm text-error-800">{t(`voice.${speechError}`)}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          <Button
            onClick={handleStartStop}
            className={`flex-1 gap-2 ${
              isListening
                ? 'bg-gradient-to-r from-error-500 to-rose-500 hover:from-error-600 hover:to-rose-600'
                : 'bg-gradient-to-r from-secondary-500 to-cyan-500 hover:from-secondary-600 hover:to-cyan-600'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5" />
                {t('voice.stopListening')}
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                {t('voice.button')}
              </>
            )}
          </Button>

          {detectedFoods.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                resetTranscript()
                setDetectedFoods([])
              }}
            >
              {t('voice.clear')}
            </Button>
          )}
        </div>
      </div>

      {/* Detected Foods */}
      {detectedFoods.length > 0 && (
        <div className="glass-card p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-bold text-gray-900">
                {t('voice.detected')} ({detectedFoods.length})
              </h3>
            </div>
            <Button onClick={handleAddAll} className="gap-2">
              <Plus className="w-4 h-4" />
              {t('voice.addAll')}
            </Button>
          </div>

          <div className="space-y-3">
            {detectedFoods.map((food, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-all"
              >
                {editingIndex === index ? (
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={food.name}
                      onChange={(e) => handleUpdateFood(index, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                      placeholder={t('foodName')}
                    />
                    <input
                      type="text"
                      value={food.quantity}
                      onChange={(e) => handleUpdateFood(index, 'quantity', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                      placeholder={t('quantity')}
                    />
                    <select
                      value={food.unit}
                      onChange={(e) => handleUpdateFood(index, 'unit', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      <option value="g">{t('g')}</option>
                      <option value="ml">{t('ml')}</option>
                      <option value="portion">{t('portion')}</option>
                      <option value="piece">{t('piece')}</option>
                      <option value="cup">{t('cup')}</option>
                      <option value="tablespoon">{t('tablespoon')}</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{food.name}</p>
                    <p className="text-sm text-gray-600">
                      {food.quantity} {t(food.unit)}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label={t('result.edit.name')}
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteFood(index)}
                    className="p-2 hover:bg-error-100 rounded-lg transition-colors"
                    aria-label={t('confirmDeleteItem')}
                  >
                    <XCircle className="w-4 h-4 text-error-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
