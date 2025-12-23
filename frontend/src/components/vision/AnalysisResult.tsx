import { useState, useEffect } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { visionApi } from '@/services/visionApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { ImageAnalyzeResponse, DetectedItem, FoodItemUpdate, MealType } from '@/types/foodLog'

interface AnalysisResultProps {
  result: ImageAnalyzeResponse
  imageBase64: string
  mealType: MealType
  onClose: () => void
}

// Configuration des verdicts
const VERDICT_CONFIG = {
  excellent: {
    emoji: '🌟',
    label: 'Excellent !',
    bgGradient: 'from-green-500 to-emerald-600',
    textColor: 'text-white',
    description: 'Ce repas est parfaitement équilibré',
  },
  good: {
    emoji: '👍',
    label: 'Bon choix',
    bgGradient: 'from-blue-500 to-cyan-600',
    textColor: 'text-white',
    description: 'Un repas équilibré pour vos objectifs',
  },
  moderate: {
    emoji: '😐',
    label: 'Correct',
    bgGradient: 'from-yellow-500 to-orange-500',
    textColor: 'text-white',
    description: 'Quelques ajustements recommandés',
  },
  poor: {
    emoji: '⚠️',
    label: 'À améliorer',
    bgGradient: 'from-red-500 to-rose-600',
    textColor: 'text-white',
    description: 'Ce repas nécessite votre attention',
  },
}

export function AnalysisResult({ result, imageBase64, mealType, onClose }: AnalysisResultProps) {
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<FoodItemUpdate>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [expandedSection, setExpandedSection] = useState<'items' | 'health' | null>('health')
  const [isSaved, setIsSaved] = useState(!!result.food_log_id)
  const queryClient = useQueryClient()

  // Mutation pour sauvegarder le repas
  const saveMutation = useMutation({
    mutationFn: () => visionApi.saveMeal({
      image_base64: imageBase64,
      meal_type: mealType,
      save_to_log: true,
    }),
    onSuccess: (data) => {
      setIsSaved(true)
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['foodLogs'] })
      queryClient.invalidateQueries({ queryKey: ['dailyMeals'] })
      // Mettre à jour le result avec le food_log_id
      result.food_log_id = data.food_log_id
    },
  })

  // Animation de succès au chargement
  useEffect(() => {
    if (result.health_report?.verdict === 'excellent' || result.health_report?.verdict === 'good') {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [result.health_report?.verdict])

  const startEditing = (item: DetectedItem, index: number) => {
    setEditingItem(index)
    setEditForm({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    })
  }

  const saveEdit = () => {
    // TODO: Implémenter la mise à jour via l'API
    // Pour l'instant, on ferme simplement l'éditeur
    queryClient.invalidateQueries({ queryKey: ['foodLogs'] })
    setEditingItem(null)
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Haute'
    if (confidence >= 0.6) return 'Moyenne'
    return 'Faible'
  }

  const healthReport = result.health_report
  const verdictConfig = healthReport ? VERDICT_CONFIG[healthReport.verdict] : null

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      {/* Animation de succès (confetti-like) */}
      {showSuccess && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="absolute top-0 left-1/4 animate-bounce delay-100">
            <span className="text-2xl">🎉</span>
          </div>
          <div className="absolute top-0 right-1/4 animate-bounce delay-200">
            <span className="text-2xl">✨</span>
          </div>
          <div className="absolute top-0 left-1/2 animate-bounce">
            <span className="text-3xl">🌟</span>
          </div>
        </div>
      )}

      {/* Verdict Banner - Le plus important visuellement */}
      {verdictConfig && healthReport && (
        <div className={`p-6 bg-gradient-to-r ${verdictConfig.bgGradient} ${verdictConfig.textColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl animate-pulse">{verdictConfig.emoji}</div>
              <div>
                <h2 className="text-2xl font-bold">{verdictConfig.label}</h2>
                <p className="text-sm opacity-90">{healthReport.verdict_message}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{healthReport.overall_score}</div>
              <div className="text-sm opacity-75">Score santé</div>
            </div>
          </div>
        </div>
      )}

      {/* Header classique si pas de health report */}
      {!verdictConfig && (
        <div className="p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">Analyse terminée</h3>
              <p className="text-primary-100 text-sm mt-1">{result.description}</p>
            </div>
            <div className="text-right">
              <div className={`text-sm ${result.confidence >= 0.7 ? 'text-green-200' : 'text-yellow-200'}`}>
                Confiance: {Math.round(result.confidence * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Macros avec barres de progression circulaires */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-4 gap-4">
          {/* Calories */}
          <div className="text-center">
            <div className="relative inline-block w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#10B981"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="176"
                  strokeDashoffset="44"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-800">{result.total_calories}</span>
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-1 font-medium">Calories</div>
          </div>

          {/* Protéines */}
          <div className="text-center">
            <div className="relative inline-block w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#3B82F6"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="176"
                  strokeDashoffset="88"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">{result.total_protein}g</span>
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-1 font-medium">Protéines</div>
          </div>

          {/* Glucides */}
          <div className="text-center">
            <div className="relative inline-block w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#F59E0B"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="176"
                  strokeDashoffset="66"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-yellow-600">{result.total_carbs}g</span>
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-1 font-medium">Glucides</div>
          </div>

          {/* Lipides */}
          <div className="text-center">
            <div className="relative inline-block w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#F97316"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="176"
                  strokeDashoffset="110"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-orange-600">{result.total_fat}g</span>
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-1 font-medium">Lipides</div>
          </div>
        </div>
      </div>

      {/* Sections accordion: Rapport santé + Aliments */}
      <div className="divide-y">
        {/* Section Rapport de Santé */}
        {healthReport && (
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'health' ? null : 'health')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">💚</span>
                <span className="font-semibold text-gray-800">Rapport de santé personnalisé</span>
              </div>
              <span className={`transform transition-transform ${expandedSection === 'health' ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {expandedSection === 'health' && (
              <div className="px-4 pb-4 space-y-4">
                {/* Analyse calories */}
                {healthReport.calorie_analysis && (
                  <div className={`p-3 rounded-lg ${
                    healthReport.calorie_analysis.status === 'optimal' ? 'bg-green-50' :
                    healthReport.calorie_analysis.status === 'under' ? 'bg-blue-50' : 'bg-orange-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{healthReport.calorie_analysis.status === 'optimal' ? '✅' : healthReport.calorie_analysis.status === 'under' ? 'ℹ️' : '⚠️'}</span>
                      <span className="font-medium text-sm">{healthReport.calorie_analysis.message}</span>
                    </div>
                    {healthReport.calorie_analysis.remaining !== 0 && (
                      <p className="text-xs text-gray-600 ml-6">
                        {healthReport.calorie_analysis.remaining > 0
                          ? `Il vous reste ${healthReport.calorie_analysis.remaining} kcal pour aujourd'hui`
                          : `Vous avez dépassé de ${Math.abs(healthReport.calorie_analysis.remaining)} kcal`
                        }
                      </p>
                    )}
                  </div>
                )}

                {/* Points positifs */}
                {healthReport.positive_points && healthReport.positive_points.length > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h5 className="font-medium text-green-800 text-sm mb-2 flex items-center gap-2">
                      <span>✨</span> Points positifs
                    </h5>
                    <ul className="space-y-1">
                      {healthReport.positive_points.map((point, idx) => (
                        <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Avertissements santé */}
                {healthReport.health_warnings && healthReport.health_warnings.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                    <h5 className="font-medium text-red-800 text-sm mb-2 flex items-center gap-2">
                      <span>⚠️</span> Attention
                    </h5>
                    <ul className="space-y-1">
                      {healthReport.health_warnings.map((warning, idx) => (
                        <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">!</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {healthReport.suggestions && healthReport.suggestions.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h5 className="font-medium text-blue-800 text-sm mb-2 flex items-center gap-2">
                      <span>💡</span> Suggestions
                    </h5>
                    <ul className="space-y-1">
                      {healthReport.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">→</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommandations macros */}
                {healthReport.macro_analysis && healthReport.macro_analysis.recommendations && healthReport.macro_analysis.recommendations.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-800 text-sm mb-2 flex items-center gap-2">
                      <span>📊</span> Équilibre macros
                    </h5>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <div className="text-center p-2 bg-white rounded">
                        <div className="text-blue-600 font-medium">{healthReport.macro_analysis.protein_status}</div>
                        <div className="text-gray-500">Protéines</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded">
                        <div className="text-yellow-600 font-medium">{healthReport.macro_analysis.carbs_status}</div>
                        <div className="text-gray-500">Glucides</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded">
                        <div className="text-orange-600 font-medium">{healthReport.macro_analysis.fat_status}</div>
                        <div className="text-gray-500">Lipides</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Section Aliments détectés */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === 'items' ? null : 'items')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🍽️</span>
              <span className="font-semibold text-gray-800">Aliments détectés</span>
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                {result.items.length}
              </span>
            </div>
            <span className={`transform transition-transform ${expandedSection === 'items' ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {expandedSection === 'items' && (
            <div className="px-4 pb-4 space-y-3">
              {result.items.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 hover:border-primary-300 hover:shadow-sm transition-all"
                >
                  {editingItem === index ? (
                    // Mode édition
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Nom"
                        />
                        <Input
                          value={editForm.quantity || ''}
                          onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                          placeholder="Quantité"
                        />
                        <Input
                          value={editForm.unit || ''}
                          onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                          placeholder="Unité"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <Input
                          type="number"
                          value={editForm.calories || ''}
                          onChange={(e) => setEditForm({ ...editForm, calories: parseInt(e.target.value) })}
                          placeholder="Calories"
                        />
                        <Input
                          type="number"
                          value={editForm.protein || ''}
                          onChange={(e) => setEditForm({ ...editForm, protein: parseFloat(e.target.value) })}
                          placeholder="Protéines"
                        />
                        <Input
                          type="number"
                          value={editForm.carbs || ''}
                          onChange={(e) => setEditForm({ ...editForm, carbs: parseFloat(e.target.value) })}
                          placeholder="Glucides"
                        />
                        <Input
                          type="number"
                          value={editForm.fat || ''}
                          onChange={(e) => setEditForm({ ...editForm, fat: parseFloat(e.target.value) })}
                          placeholder="Lipides"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingItem(null)}
                        >
                          Annuler
                        </Button>
                        <Button size="sm" onClick={() => saveEdit()}>
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Mode affichage amélioré
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900">{item.name}</span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {item.quantity} {item.unit}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              item.confidence >= 0.8
                                ? 'bg-green-100 text-green-700'
                                : item.confidence >= 0.6
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {getConfidenceLabel(item.confidence)}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-2 text-sm">
                          <span className="text-gray-700 font-medium">{item.calories} kcal</span>
                          <span className="text-blue-600">{item.protein}g P</span>
                          <span className="text-yellow-600">{item.carbs}g G</span>
                          <span className="text-orange-600">{item.fat}g L</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(item, index)}
                        className="text-gray-400 hover:text-primary-600"
                      >
                        ✏️ Modifier
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note sur les corrections */}
      {result.confidence < 0.7 && (
        <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-100">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600">⚠️</span>
            <div>
              <p className="text-sm font-medium text-yellow-800">Confiance faible ({Math.round(result.confidence * 100)}%)</p>
              <p className="text-xs text-yellow-700">
                Nous vous recommandons de vérifier et corriger les valeurs dans la section "Aliments détectés".
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions améliorées */}
      <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Bouton principal - Nouvelle analyse */}
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 gap-2 py-3"
          >
            <span>📸</span>
            Nouvelle analyse
          </Button>

          {/* Bouton secondaire - Modifier le repas */}
          <Button
            variant="ghost"
            onClick={() => setExpandedSection('items')}
            className="flex-1 gap-2 py-3 border border-dashed border-gray-300 hover:border-primary-400"
          >
            <span>✏️</span>
            Modifier ce repas
          </Button>

          {/* Bouton principal - Enregistrer ou Fermer */}
          {!isSaved ? (
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex-1 gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
            >
              {saveMutation.isPending ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Enregistrement...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Enregistrer le repas
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={onClose}
              className="flex-1 gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
            >
              <span>✓</span>
              Terminé
            </Button>
          )}
        </div>

        {/* Indication du log */}
        {isSaved && (
          <p className="text-center text-xs text-green-600 mt-3 font-medium">
            ✓ Repas enregistré avec succès
          </p>
        )}
        {saveMutation.isError && (
          <p className="text-center text-xs text-red-600 mt-3">
            Erreur lors de l'enregistrement. Réessayez.
          </p>
        )}
      </div>
    </div>
  )
}
