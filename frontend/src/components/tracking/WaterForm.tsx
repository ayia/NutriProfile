import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { trackingApi } from '@/services/trackingApi'
import { Button } from '@/components/ui/Button'

interface WaterFormProps {
  onSuccess: () => void
  onCancel: () => void
  currentWater?: number
}

export function WaterForm({ onSuccess, onCancel, currentWater = 0 }: WaterFormProps) {
  const { t } = useTranslation('tracking')
  const [customAmount, setCustomAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const QUICK_AMOUNTS = [
    { label: t('water.glass'), ml: 250, icon: '🥛' },
    { label: t('water.bottle'), ml: 500, icon: '🍶' },
    { label: t('water.largeBottle'), ml: 1000, icon: '🫗' },
    { label: '1.5L', ml: 1500, icon: '💧' },
  ]

  const today = new Date().toISOString().split('T')[0]

  const mutation = useMutation({
    mutationFn: (amountMl: number) => trackingApi.addWater(today, amountMl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      onSuccess()
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    },
  })

  const handleQuickAdd = (ml: number) => {
    setError(null)
    mutation.mutate(ml)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const amount = parseInt(customAmount)
    if (isNaN(amount) || amount <= 0) {
      setError(t('water.errors.invalidAmount'))
      return
    }
    if (amount > 5000) {
      setError(t('water.errors.maxAmount'))
      return
    }

    mutation.mutate(amount)
  }

  return (
    <div className="space-y-6">
      {/* Affichage actuel */}
      <div className="text-center p-4 bg-cyan-50 rounded-lg">
        <div className="text-3xl mb-1">💧</div>
        <div className="text-sm text-gray-600">{t('water.today')}</div>
        <div className="text-2xl font-bold text-cyan-600">{currentWater} ml</div>
        <div className="text-xs text-gray-500">{t('water.goal')}: 2000 ml</div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${Math.min((currentWater / 2000) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Boutons rapides */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">{t('water.quickAdd')}</h4>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_AMOUNTS.map((item) => (
            <button
              key={item.ml}
              type="button"
              onClick={() => handleQuickAdd(item.ml)}
              disabled={mutation.isPending}
              className="flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-cyan-50 rounded-lg border border-gray-200 hover:border-cyan-300 transition-colors disabled:opacity-50"
            >
              <span className="text-xl">{item.icon}</span>
              <div className="text-left">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-gray-500">{item.ml} ml</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quantite personnalisee */}
      <form onSubmit={handleCustomSubmit}>
        <h4 className="text-sm font-medium text-gray-700 mb-3">{t('water.custom')}</h4>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Ex: 330"
              min="1"
              max="5000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <span className="flex items-center text-gray-500">ml</span>
          <Button type="submit" disabled={mutation.isPending || !customAmount}>
            {t('water.add')}
          </Button>
        </div>
      </form>

      {/* Erreur */}
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={mutation.isPending}
        >
          {t('common:close')}
        </Button>
      </div>

      {/* Loading indicator */}
      {mutation.isPending && (
        <div className="text-center text-sm text-gray-500">
          {t('common:loading')}
        </div>
      )}
    </div>
  )
}
