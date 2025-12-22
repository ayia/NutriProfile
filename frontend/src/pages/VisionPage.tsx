import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { visionApi } from '@/services/visionApi'
import { ImageUploader } from '@/components/vision/ImageUploader'
import { AnalysisResult } from '@/components/vision/AnalysisResult'
import { FoodLogCard } from '@/components/vision/FoodLogCard'
import { Button } from '@/components/ui/Button'
import type { ImageAnalyzeResponse } from '@/types/foodLog'

type Tab = 'scan' | 'today' | 'history'

export function VisionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('scan')
  const [analysisResult, setAnalysisResult] = useState<ImageAnalyzeResponse | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  const todayQuery = useQuery({
    queryKey: ['dailyMeals', selectedDate],
    queryFn: () => visionApi.getDailyMeals(selectedDate),
    enabled: activeTab === 'today',
  })

  const historyQuery = useQuery({
    queryKey: ['foodLogs', 'history'],
    queryFn: () => visionApi.getLogs(undefined, undefined, 50),
    enabled: activeTab === 'history',
  })

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'scan', label: 'Scanner', icon: '📸' },
    { id: 'today', label: "Aujourd'hui", icon: '📊' },
    { id: 'history', label: 'Historique', icon: '📜' },
  ]

  const handleAnalysisComplete = (result: ImageAnalyzeResponse) => {
    setAnalysisResult(result)
  }

  const resetAnalysis = () => {
    setAnalysisResult(null)
  }

  // Calcul des progressions pour aujourd'hui
  const nutrition = todayQuery.data?.nutrition
  const getProgressColor = (percent: number | null) => {
    if (!percent) return 'bg-gray-200'
    if (percent > 100) return 'bg-red-500'
    if (percent >= 80) return 'bg-green-500'
    if (percent >= 50) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analyse Vision</h1>
        <p className="text-gray-600 mt-2">
          Prenez en photo vos repas pour un suivi nutritionnel automatique
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2"
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'scan' && (
        <div className="space-y-6">
          {!analysisResult ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Analyser un repas</h2>
              <ImageUploader onAnalysisComplete={handleAnalysisComplete} />
            </div>
          ) : (
            <AnalysisResult result={analysisResult} onClose={resetAnalysis} />
          )}
        </div>
      )}

      {activeTab === 'today' && (
        <div className="space-y-6">
          {/* Date selector */}
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
            <Button
              variant="ghost"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            >
              Aujourd'hui
            </Button>
          </div>

          {/* Résumé journalier */}
          {nutrition && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Résumé nutritionnel</h3>

              <div className="space-y-4">
                {/* Calories */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Calories</span>
                    <span>
                      {nutrition.total_calories} / {nutrition.target_calories || '?'} kcal
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(nutrition.calories_percent)} transition-all`}
                      style={{ width: `${Math.min(nutrition.calories_percent || 0, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-600">Protéines</span>
                      <span>{nutrition.total_protein}g</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(nutrition.protein_percent)}`}
                        style={{ width: `${Math.min(nutrition.protein_percent || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-yellow-600">Glucides</span>
                      <span>{nutrition.total_carbs}g</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(nutrition.carbs_percent)}`}
                        style={{ width: `${Math.min(nutrition.carbs_percent || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-orange-600">Lipides</span>
                      <span>{nutrition.total_fat}g</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(nutrition.fat_percent)}`}
                        style={{ width: `${Math.min(nutrition.fat_percent || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Eau */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💧</span>
                    <span>Eau: {nutrition.water_ml}ml</span>
                  </div>
                  <div className="flex gap-1">
                    {[250, 500].map((amount) => (
                      <Button
                        key={amount}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          visionApi.addWater(selectedDate, amount)
                        }}
                      >
                        +{amount}ml
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Repas du jour */}
          <div className="space-y-4">
            <h3 className="font-semibold">
              Repas ({todayQuery.data?.meals.length || 0})
            </h3>

            {todayQuery.isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            )}

            {todayQuery.data?.meals.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <span className="text-4xl">🍽️</span>
                <p className="text-gray-600 mt-4">Aucun repas enregistré</p>
                <Button className="mt-4" onClick={() => setActiveTab('scan')}>
                  Scanner un repas
                </Button>
              </div>
            )}

            {todayQuery.data?.meals.map((log) => (
              <FoodLogCard key={log.id} log={log} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {historyQuery.isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          )}

          {historyQuery.data?.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <span className="text-4xl">📜</span>
              <p className="text-gray-600 mt-4">Aucun historique</p>
            </div>
          )}

          {historyQuery.data?.map((log) => {
            const date = new Date(log.meal_date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })

            return (
              <div key={log.id}>
                <div className="text-sm text-gray-500 mb-2">{date}</div>
                <FoodLogCard log={log} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
