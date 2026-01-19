import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { visionApi } from '@/services/visionApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loader2, X, Barcode, Search, Package } from 'lucide-react'
import type { BarcodeProduct } from '@/types/foodLog'

interface BarcodeScannerProps {
  onProductFound: (product: BarcodeProduct) => void
  onClose: () => void
}

export function BarcodeScanner({ onProductFound, onClose }: BarcodeScannerProps) {
  const { t } = useTranslation('vision')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [scannedProduct, setScannedProduct] = useState<BarcodeProduct | null>(null)

  // Mutation pour rechercher le code-barres
  const searchMutation = useMutation({
    mutationFn: (barcode: string) => visionApi.searchBarcode(barcode),
    onSuccess: (data) => {
      if (data.success && data.product) {
        setScannedProduct(data.product)
        toast.success(t('barcode.found'))
      } else {
        toast.error(data.error || t('barcode.notFound'))
        setScannedProduct(null)
      }
    },
    onError: (error: Error) => {
      console.error('Barcode search error:', error)
      toast.error(t('barcode.notFound'))
      setScannedProduct(null)
    },
  })

  const handleSearch = () => {
    const trimmed = barcodeInput.trim()

    // Validation: 8-13 chiffres
    if (!trimmed || !/^\d{8,13}$/.test(trimmed)) {
      toast.error(t('barcode.invalidCode'))
      return
    }

    searchMutation.mutate(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleAddToMeal = () => {
    if (scannedProduct) {
      onProductFound(scannedProduct)
      onClose()
    }
  }

  // Fermeture avec Escape
  const handleEscape = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleEscape}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[calc(100vw-24px)] sm:max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Barcode className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {t('barcode.scan')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Instructions */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('barcode.permission')}
          </p>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={t('barcode.placeholder')}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value.replace(/\D/g, ''))}
              onKeyDown={handleKeyDown}
              disabled={searchMutation.isPending}
              className="flex-1"
              autoFocus
            />
            <Button
              onClick={handleSearch}
              disabled={searchMutation.isPending || !barcodeInput.trim()}
              className="px-4"
            >
              {searchMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Loading */}
          {searchMutation.isPending && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('barcode.scanning')}
                </p>
              </div>
            </div>
          )}

          {/* Product Result */}
          {scannedProduct && !searchMutation.isPending && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-4">
              {/* Product Image */}
              {scannedProduct.image_url && (
                <div className="flex justify-center">
                  <img
                    src={scannedProduct.image_url}
                    alt={scannedProduct.name}
                    className="h-32 w-32 object-contain rounded-lg"
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Package className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {scannedProduct.name}
                    </h3>
                    {scannedProduct.brand && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {scannedProduct.brand}
                      </p>
                    )}
                    {scannedProduct.quantity && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {scannedProduct.quantity}
                      </p>
                    )}
                  </div>
                </div>

                {/* Nutrition Info (per 100g) */}
                {(scannedProduct.calories !== null ||
                  scannedProduct.protein !== null ||
                  scannedProduct.carbs !== null ||
                  scannedProduct.fat !== null) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      {t('nutritionPreview')} (per 100g)
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {scannedProduct.calories !== null && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            {t('edit.calories')}:
                          </span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            {scannedProduct.calories} kcal
                          </span>
                        </div>
                      )}
                      {scannedProduct.protein !== null && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            {t('edit.protein')}:
                          </span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            {scannedProduct.protein}g
                          </span>
                        </div>
                      )}
                      {scannedProduct.carbs !== null && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            {t('edit.carbs')}:
                          </span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            {scannedProduct.carbs}g
                          </span>
                        </div>
                      )}
                      {scannedProduct.fat !== null && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            {t('edit.fat')}:
                          </span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            {scannedProduct.fat}g
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Add Button */}
              <Button
                onClick={handleAddToMeal}
                className="w-full"
              >
                {t('barcode.addToMeal')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
