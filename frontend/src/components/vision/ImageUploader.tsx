import { useState, useRef, useCallback, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { visionApi, compressImage } from '@/services/visionApi'
import { Button } from '@/components/ui/Button'
import type { MealType, ImageAnalyzeResponse } from '@/types/foodLog'
import { getMealTypeIcon, MEAL_TYPE_COLORS, Camera, Image, Lightbulb, Check, X, Download, Search, Calculator, Heart, type LucideIcon } from '@/lib/icons'
import { USAGE_QUERY_KEY } from '@/components/subscription/UsageBanner'

export interface AnalysisData {
  result: ImageAnalyzeResponse
  imageBase64: string
  mealType: MealType
}

interface ImageUploaderProps {
  onAnalysisComplete: (data: AnalysisData) => void
}

// Analysis step icons and durations (labels come from translations)
const ANALYSIS_STEP_CONFIG: { id: number; key: string; IconComponent: LucideIcon; duration: number }[] = [
  { id: 1, key: 'step1', IconComponent: Download, duration: 800 },
  { id: 2, key: 'step2', IconComponent: Search, duration: 1500 },
  { id: 3, key: 'step3', IconComponent: Calculator, duration: 1200 },
  { id: 4, key: 'step4', IconComponent: Heart, duration: 1000 },
]

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export function ImageUploader({ onAnalysisComplete }: ImageUploaderProps) {
  const { t } = useTranslation('vision')
  const queryClient = useQueryClient()
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch')
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [lastImageBase64, setLastImageBase64] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const analyzeMutation = useMutation({
    mutationFn: visionApi.analyzeImage,
    onSuccess: (data) => {
      setCurrentStep(ANALYSIS_STEP_CONFIG.length) // Mark as complete
      // Invalider le cache d'usage pour mettre à jour le compteur
      queryClient.invalidateQueries({ queryKey: USAGE_QUERY_KEY })
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

    ANALYSIS_STEP_CONFIG.forEach((_, index) => {
      if (index > 0) {
        const timeout = setTimeout(() => {
          stepIndex = index + 1
          setCurrentStep(stepIndex)
        }, ANALYSIS_STEP_CONFIG.slice(0, index).reduce((acc, s) => acc + s.duration, 0))
        intervals.push(timeout)
      }
    })

    return () => intervals.forEach(clearTimeout)
  }, [analyzeMutation.isPending])

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(t('uploader.invalidFile'))
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
    } catch {
      // Image compression failed silently
    }
  }, [selectedMealType, analyzeMutation, t])

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
      {/* Meal type selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('uploader.mealTypeLabel')}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {MEAL_TYPES.map((type) => {
            const MealIcon = getMealTypeIcon(type)
            const colorClass = MEAL_TYPE_COLORS[type] || 'text-gray-500'
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedMealType(type)}
                className={`flex flex-col items-center p-3 border rounded-xl transition-all ${
                  selectedMealType === type
                    ? 'border-primary-500 bg-primary-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedMealType === type ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  <MealIcon className={`w-5 h-5 ${selectedMealType === type ? 'text-primary-600' : colorClass}`} />
                </div>
                <span className="text-xs mt-1 font-medium">{t(`mealTypes.${type}`)}</span>
              </button>
            )
          })}
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
          {/* Camera icon animation */}
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center animate-bounce">
              <Camera className="w-8 h-8 text-primary-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full" />
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {t('uploader.scanTitle')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('uploader.scanDescription')}
          </p>

          {/* Tips for good photo */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 mb-4 text-left">
            <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              {t('uploader.tipsTitle')}
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-green-500" />
                {t('uploader.tip1')}
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-green-500" />
                {t('uploader.tip2')}
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-green-500" />
                {t('uploader.tip3')}
              </li>
            </ul>
          </div>

          <div className="flex justify-center gap-3">
            <Button
              type="button"
              onClick={openCamera}
              className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Camera className="w-4 h-4" />
              {t('uploader.takePhoto')}
            </Button>
            <Button type="button" variant="outline" onClick={openGallery} className="gap-2">
              <Image className="w-4 h-4" />
              {t('uploader.gallery')}
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
                      strokeDasharray={`${(currentStep / ANALYSIS_STEP_CONFIG.length) * 226} 226`}
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
                    {(() => {
                      const StepIcon = ANALYSIS_STEP_CONFIG[currentStep - 1]?.IconComponent || Camera
                      return <StepIcon className="w-8 h-8 text-white animate-pulse" />
                    })()}
                  </div>
                </div>

                {/* Progress steps */}
                <div className="space-y-3">
                  {ANALYSIS_STEP_CONFIG.map((step, index) => {
                    const StepIcon = step.IconComponent
                    return (
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
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            index + 1 < currentStep
                              ? 'bg-green-500'
                              : index + 1 === currentStep
                              ? 'bg-white/20 ring-2 ring-white animate-pulse'
                              : 'bg-white/10'
                          }`}
                        >
                          {index + 1 < currentStep ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : (
                            <StepIcon className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium">{t(`analysisSteps.${step.key}`)}</span>
                      </div>
                    )
                  })}
                </div>

                <p className="text-xs text-white/60 mt-4">
                  {t('uploader.aiWorking')}
                </p>
              </div>
            </div>
          )}
          {!analyzeMutation.isPending && (
            <button
              onClick={resetUploader}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-2"
            >
              <X className="w-4 h-4 text-gray-600" />
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

      {/* Error */}
      {analyzeMutation.error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {t('uploader.error')}
        </div>
      )}
    </div>
  )
}
