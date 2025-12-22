import { useState, useRef, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { visionApi, compressImage } from '@/services/visionApi'
import { Button } from '@/components/ui/Button'
import type { MealType, ImageAnalyzeResponse } from '@/types/foodLog'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '@/types/foodLog'

interface ImageUploaderProps {
  onAnalysisComplete: (result: ImageAnalyzeResponse) => void
}

export function ImageUploader({ onAnalysisComplete }: ImageUploaderProps) {
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch')
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const analyzeMutation = useMutation({
    mutationFn: visionApi.analyzeImage,
    onSuccess: (data) => {
      onAnalysisComplete(data)
    },
  })

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
      analyzeMutation.mutate({
        image_base64: base64,
        meal_type: selectedMealType,
        save_to_log: true,
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
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="text-5xl mb-4">📸</div>
          <p className="text-gray-600 mb-4">
            Glissez une photo de votre repas ici
          </p>
          <p className="text-sm text-gray-500 mb-4">ou</p>
          <div className="flex justify-center gap-3">
            <Button type="button" onClick={openCamera}>
              Prendre une photo
            </Button>
            <Button type="button" variant="outline" onClick={openGallery}>
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
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Analyse en cours...</p>
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
