import { useState, useRef, useCallback, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { visionApi, compressImage } from '@/services/visionApi'
import { Button } from '@/components/ui/Button'
import type { MealType, ImageAnalyzeResponse } from '@/types/foodLog'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '@/types/foodLog'

export interface AnalysisData {
  result: ImageAnalyzeResponse
  imageBase64: string
  mealType: MealType
}

interface ImageUploaderProps {
  onAnalysisComplete: (data: AnalysisData) => void
}

// Étapes d'analyse pour le skeleton loader
const ANALYSIS_STEPS = [
  { id: 1, label: 'Réception de l\'image', icon: '📥', duration: 800 },
  { id: 2, label: 'Détection des aliments', icon: '🔍', duration: 1500 },
  { id: 3, label: 'Calcul nutritionnel', icon: '🧮', duration: 1200 },
  { id: 4, label: 'Analyse santé personnalisée', icon: '💚', duration: 1000 },
]

export function ImageUploader({ onAnalysisComplete }: ImageUploaderProps) {
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch')
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [lastImageBase64, setLastImageBase64] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const analyzeMutation = useMutation({
    mutationFn: visionApi.analyzeImage,
    onSuccess: (data) => {
      setCurrentStep(ANALYSIS_STEPS.length) // Marquer comme terminé
      setTimeout(() => onAnalysisComplete({
        result: data,
        imageBase64: lastImageBase64,
        mealType: selectedMealType,
      }), 300) // Petit délai pour l'animation
    },
    onError: () => {
      setCurrentStep(0)
    },
  })

  // Animation des étapes pendant l'analyse
  useEffect(() => {
    if (!analyzeMutation.isPending) {
      setCurrentStep(0)
      return
    }

    setCurrentStep(1)
    let stepIndex = 1
    const intervals: NodeJS.Timeout[] = []

    ANALYSIS_STEPS.forEach((_, index) => {
      if (index > 0) {
        const timeout = setTimeout(() => {
          stepIndex = index + 1
          setCurrentStep(stepIndex)
        }, ANALYSIS_STEPS.slice(0, index).reduce((acc, s) => acc + s.duration, 0))
        intervals.push(timeout)
      }
    })

    return () => intervals.forEach(clearTimeout)
  }, [analyzeMutation.isPending])

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    // Afficher la preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Compresser et analyser
    try {
      const base64 = await compressImage(file)
      setLastImageBase64(base64)
      analyzeMutation.mutate({
        image_base64: base64,
        meal_type: selectedMealType,
        save_to_log: false,
      })
    } catch (error) {
      console.error('Error compressing image:', error)
    }
  }, [selectedMealType, analyzeMutation])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [handleFile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment')
      fileInputRef.current.click()
    }
  }

  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture')
      fileInputRef.current.click()
    }
  }

  const resetUploader = () => {
    setPreview(null)
    analyzeMutation.reset()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Sélection du type de repas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de repas
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedMealType(type)}
              className={`flex flex-col items-center p-3 border rounded-lg transition-colors ${
                selectedMealType === type
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{MEAL_TYPE_ICONS[type]}</span>
              <span className="text-xs mt-1">{MEAL_TYPE_LABELS[type]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zone de drop / Preview */}
      {!preview ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            dragActive
              ? 'border-primary-500 bg-primary-50 scale-[1.02]'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          {/* Animation de l'icône caméra */}
          <div className="relative inline-block mb-4">
            <div className="text-5xl animate-bounce">📸</div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full" />
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Scannez votre repas
          </h3>
          <p className="text-gray-600 mb-4">
            Glissez une photo ici ou utilisez votre appareil
          </p>

          {/* Tips pour une bonne photo */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 mb-4 text-left">
            <p className="text-xs font-medium text-gray-700 mb-2">
              💡 Conseils pour une meilleure analyse :
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Photo bien éclairée, vue de dessus
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Tous les aliments visibles dans le cadre
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Évitez les reflets et les ombres fortes
              </li>
            </ul>
          </div>

          <div className="flex justify-center gap-3">
            <Button
              type="button"
              onClick={openCamera}
              className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <span>📷</span>
              Prendre une photo
            </Button>
            <Button type="button" variant="outline" onClick={openGallery} className="gap-2">
              <span>🖼️</span>
              Galerie
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full rounded-xl max-h-96 object-cover"
          />
          {analyzeMutation.isPending && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <div className="text-center text-white w-full max-w-xs px-4">
                {/* Indicateur de progression circulaire */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="url(#gradient)"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(currentStep / ANALYSIS_STEPS.length) * 226} 226`}
                      className="transition-all duration-500 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#34D399" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl animate-pulse">
                      {ANALYSIS_STEPS[currentStep - 1]?.icon || '📸'}
                    </span>
                  </div>
                </div>

                {/* Étapes de progression */}
                <div className="space-y-3">
                  {ANALYSIS_STEPS.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 transition-all duration-300 ${
                        index + 1 < currentStep
                          ? 'opacity-50'
                          : index + 1 === currentStep
                          ? 'opacity-100 scale-105'
                          : 'opacity-30'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                          index + 1 < currentStep
                            ? 'bg-green-500'
                            : index + 1 === currentStep
                            ? 'bg-white/20 ring-2 ring-white animate-pulse'
                            : 'bg-white/10'
                        }`}
                      >
                        {index + 1 < currentStep ? '✓' : step.icon}
                      </div>
                      <span className="text-sm font-medium">{step.label}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-white/60 mt-4">
                  IA en action... patience !
                </p>
              </div>
            </div>
          )}
          {!analyzeMutation.isPending && (
            <button
              onClick={resetUploader}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-2"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Erreur */}
      {analyzeMutation.error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          Erreur lors de l'analyse. Veuillez réessayer.
        </div>
      )}
    </div>
  )
}
