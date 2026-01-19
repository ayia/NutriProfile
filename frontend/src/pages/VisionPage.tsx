import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { visionApi } from '@/services/visionApi'
import { ImageUploader, type AnalysisData } from '@/components/vision/ImageUploader'
import { AnalysisResult } from '@/components/vision/AnalysisResult'
import { FoodLogCard } from '@/components/vision/FoodLogCard'
import { PhotoTips } from '@/components/vision/PhotoTips'
import { ManualMealBuilder } from '@/components/vision/ManualMealBuilder'
import { BarcodeScanner } from '@/components/vision/BarcodeScanner'
import { PhotoGallery } from '@/components/vision/PhotoGallery'
import { Button } from '@/components/ui/Button'
import { UsageBanner } from '@/components/subscription/UsageBanner'
import {
  Camera,
  BarChart3,
  History,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Droplets,
  Utensils,
  Calendar,
  Edit3,
  Barcode,
  Image as ImageIcon,
  type LucideIcon,
} from 'lucide-react'
import type { BarcodeProduct } from '@/types/foodLog'

type Tab = 'scan' | 'today' | 'history' | 'gallery'

export function VisionPage() {
  const { t, i18n } = useTranslation('vision')
  const tCommon = useTranslation('common').t
  const [activeTab, setActiveTab] = useState<Tab>('scan')
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [showManualBuilder, setShowManualBuilder] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const queryClient = useQueryClient()
  // Helper to get UTC date string (YYYY-MM-DD)
  const getUTCDateString = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const [selectedDate, setSelectedDate] = useState(() => {
    // Use UTC date to match server-side storage
    return getUTCDateString(new Date())
  })
  const observerRef = useRef<IntersectionObserver | null>(null)

  const todayQuery = useQuery({
    queryKey: ['dailyMeals', selectedDate],
    queryFn: () => visionApi.getDailyMeals(selectedDate),
    enabled: activeTab === 'today',
    staleTime: 5 * 60 * 1000,      // 5 min before considered stale
    gcTime: 30 * 60 * 1000,        // 30 min cache
    refetchOnWindowFocus: false,
  })

  const historyQuery = useQuery({
    queryKey: ['foodLogs', 'history'],
    queryFn: () => visionApi.getLogs(undefined, undefined, 50),
    enabled: activeTab === 'history',
    staleTime: 10 * 60 * 1000,     // 10 min (history changes rarely)
    gcTime: 60 * 60 * 1000,        // 1h cache
    refetchOnWindowFocus: false,
  })

  // Mutation for adding water with feedback
  const addWaterMutation = useMutation({
    mutationFn: (amount: number) => visionApi.addWater(selectedDate, amount),
    onSuccess: (_, amount) => {
      // Refresh today's data
      queryClient.invalidateQueries({ queryKey: ['dailyMeals', selectedDate] })
      toast.success(tCommon('waterAdded', { amount }))
    },
    onError: () => {
      toast.error(tCommon('error'))
    },
  })

  // Scroll reveal animation
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.reveal').forEach((el) => {
      observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [activeTab, todayQuery.data, historyQuery.data])

  const tabs: { id: Tab; label: string; IconComponent: LucideIcon }[] = [
    { id: 'scan', label: t('tabs.scan'), IconComponent: Camera },
    { id: 'today', label: t('tabs.today'), IconComponent: BarChart3 },
    { id: 'history', label: t('tabs.history'), IconComponent: History },
    { id: 'gallery', label: t('tabs.gallery'), IconComponent: ImageIcon },
  ]

  const handleAnalysisComplete = (data: AnalysisData) => {
    setAnalysisData(data)
  }

  const resetAnalysis = () => {
    setAnalysisData(null)
  }

  const handleBarcodeProductFound = (product: BarcodeProduct) => {
    // Ouvrir le ManualMealBuilder avec le produit pré-rempli
    // Le produit OpenFoodFacts donne des valeurs par 100g
    // On suggère 100g par défaut que l'utilisateur peut ajuster
    setShowBarcodeScanner(false)
    setShowManualBuilder(true)

    // TODO: Passer le produit au ManualMealBuilder pour pré-remplir
    // Pour l'instant, on affiche juste un toast
    toast.success(t('barcode.found') + ': ' + product.name)
  }

  // Calcul des progressions pour aujourd'hui
  const nutrition = todayQuery.data?.nutrition
  const getProgressColor = (percent: number | null) => {
    if (!percent) return 'from-gray-300 to-gray-400'
    if (percent > 100) return 'from-error-500 to-rose-500'
    if (percent >= 80) return 'from-primary-500 to-emerald-500'
    if (percent >= 50) return 'from-warning-500 to-amber-500'
    return 'from-secondary-500 to-cyan-500'
  }

  const getProgressBg = (percent: number | null) => {
    if (!percent) return 'bg-gray-100'
    if (percent > 100) return 'bg-error-100'
    if (percent >= 80) return 'bg-primary-100'
    if (percent >= 50) return 'bg-warning-100'
    return 'bg-secondary-100'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background decorations - Responsive */}
      <div className="absolute top-20 right-0 w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] md:w-[500px] md:h-[500px] bg-gradient-to-br from-secondary-100/40 to-cyan-100/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[150px] h-[150px] sm:w-[280px] sm:h-[280px] md:w-[400px] md:h-[400px] bg-gradient-to-br from-primary-100/40 to-emerald-100/40 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header - Enhanced & Responsive */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 glass-card text-secondary-700 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Camera className="w-4 h-4 animate-pulse" />
            {t('subtitle')}
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            {t('title')}
          </h1>
        </div>

        {/* Tabs - Glassmorphism style - Responsive */}
        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 animate-fade-in-up scrollbar-hide" style={{ animationDelay: '0.1s' }}>
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-secondary-500 to-cyan-500 text-white shadow-lg shadow-secondary-500/30 scale-105'
                  : 'glass-card text-gray-600 hover:text-gray-900 hover:shadow-md hover:-translate-y-0.5'
              }`}
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <tab.IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === tab.id ? 'animate-bounce-soft' : ''}`} />
              <span className="text-[10px] xs:text-xs sm:text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'scan' && (
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Usage Banner - Affichage proactif des limites freemium */}
            <UsageBanner action="vision_analyses" proactive />

            {/* Photo Tips - Conseils pour de meilleures photos */}
            <PhotoTips compact />

            {!analysisData ? (
              <>
                <div className="glass-card p-8 hover-lift">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('scan.title')}</h2>
                  </div>
                  <ImageUploader onAnalysisComplete={handleAnalysisComplete} />
                </div>

                {/* Manual Entry Option */}
                <div className="glass-card p-6 hover-lift">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Edit3 className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="font-semibold text-gray-900">{t('manualEntry.title')}</h3>
                        <p className="text-sm text-gray-600">{t('manualEntry.noPhoto')}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowManualBuilder(true)}
                      variant="outline"
                      className="gap-2 w-full sm:w-auto"
                    >
                      <Edit3 className="w-4 h-4" />
                      {t('manualEntry.button')}
                    </Button>
                  </div>
                </div>

                {/* Barcode Scanner Option */}
                <div className="glass-card p-6 hover-lift">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Barcode className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="font-semibold text-gray-900">{t('barcode.scan')}</h3>
                        <p className="text-sm text-gray-600">{t('barcode.permission')}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowBarcodeScanner(true)}
                      variant="outline"
                      className="gap-2 w-full sm:w-auto"
                    >
                      <Barcode className="w-4 h-4" />
                      {t('barcode.scan')}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <AnalysisResult
                result={analysisData.result}
                imageBase64={analysisData.imageBase64}
                mealType={analysisData.mealType}
                onClose={resetAnalysis}
              />
            )}
          </div>
        )}

        {activeTab === 'today' && (
          <div className="space-y-6">
            {/* Date selector - Enhanced */}
            <div className="glass-card p-4 animate-fade-in-up reveal" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all"
                  />
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedDate(getUTCDateString(new Date()))}
                  className="!bg-white/60 hover:!bg-white/80 !border-gray-200"
                >
                  {t('today.button')}
                </Button>
              </div>
            </div>

            {/* Résumé journalier - Premium design */}
            {nutrition && (
              <div className="glass-card p-6 reveal" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{t('today.nutritionSummary')}</h3>
                </div>

                <div className="space-y-6">
                  {/* Calories - Main progress */}
                  <div className="relative p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <Flame className="w-6 h-6 text-orange-500" />
                        <span className="font-semibold text-gray-900">{t('today.calories')}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {nutrition.total_calories} / {nutrition.target_calories || '?'} <span className="text-sm font-normal text-gray-500">kcal</span>
                      </span>
                    </div>
                    <div className={`h-4 ${getProgressBg(nutrition.calories_percent)} rounded-full overflow-hidden shadow-inner`}>
                      <div
                        className={`h-full bg-gradient-to-r ${getProgressColor(nutrition.calories_percent)} rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${Math.min(nutrition.calories_percent || 0, 100)}%` }}
                      />
                    </div>
                    <div className="mt-2 text-right">
                      <span className={`text-sm font-medium ${
                        (nutrition.calories_percent || 0) > 100 ? 'text-error-600' : 'text-gray-500'
                      }`}>
                        {Math.round(nutrition.calories_percent || 0)}%
                      </span>
                    </div>
                  </div>

                  {/* Macros - Grid - Responsive */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[
                      { key: 'protein', IconComponent: Dumbbell, label: t('today.protein'), value: nutrition.total_protein, percent: nutrition.protein_percent, color: 'secondary', iconColor: 'text-blue-500' },
                      { key: 'carbs', IconComponent: Wheat, label: t('today.carbs'), value: nutrition.total_carbs, percent: nutrition.carbs_percent, color: 'warning', iconColor: 'text-amber-500' },
                      { key: 'fat', IconComponent: Droplet, label: t('today.fat'), value: nutrition.total_fat, percent: nutrition.fat_percent, color: 'accent', iconColor: 'text-purple-500' },
                    ].map((macro) => (
                      <div key={macro.key} className="glass-card p-4 text-center hover-lift">
                        <macro.IconComponent className={`w-6 h-6 mx-auto mb-2 ${macro.iconColor}`} />
                        <div className={`text-2xl font-bold text-${macro.color}-600`}>
                          {Math.round(macro.value * 10) / 10}g
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{macro.label}</div>
                        <div className={`h-1.5 bg-${macro.color}-100 rounded-full overflow-hidden mt-3`}>
                          <div
                            className={`h-full bg-gradient-to-r from-${macro.color}-500 to-${macro.color}-400 rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(macro.percent || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Eau - Interactive */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse-soft">
                        <Droplets className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{t('today.water')}</div>
                        <div className="text-2xl font-bold text-blue-600">{nutrition.water_ml}ml</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {[250, 500].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => addWaterMutation.mutate(amount)}
                          disabled={addWaterMutation.isPending}
                          className="px-4 py-2 bg-white/80 hover:bg-white border border-blue-200 rounded-xl text-blue-600 font-medium transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-wait"
                        >
                          {addWaterMutation.isPending ? '...' : `+${amount}ml`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Repas du jour */}
            <div className="space-y-4 reveal" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t('today.meals')} ({todayQuery.data?.meals.length || 0})
                </h3>
              </div>

              {todayQuery.isLoading && (
                <div className="glass-card p-12 text-center">
                  <div className="w-16 h-16 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-500 mt-4 animate-pulse">{t('today.loading')}</p>
                </div>
              )}

              {todayQuery.data?.meals.length === 0 && (
                <div className="glass-card p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Utensils className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{t('today.noMeals')}</h4>
                  <p className="text-gray-500 mb-6">{t('today.noMealsDescription')}</p>
                  <Button onClick={() => setActiveTab('scan')} className="gap-2">
                    <Camera className="w-4 h-4" />
                    {t('today.scanFirst')}
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {todayQuery.data?.meals.map((log, index) => (
                  <div
                    key={log.id}
                    className="reveal"
                    style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                  >
                    <FoodLogCard log={log} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {historyQuery.isLoading && (
              <div className="glass-card p-12 text-center animate-fade-in">
                <div className="w-16 h-16 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 mt-4 animate-pulse">{t('history.loading')}</p>
              </div>
            )}

            {historyQuery.data?.length === 0 && (
              <div className="glass-card p-12 text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <History className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{t('history.noHistory')}</h4>
                <p className="text-gray-500 mb-6">{t('history.noHistoryDescription')}</p>
                <Button onClick={() => setActiveTab('scan')} className="gap-2">
                  <Camera className="w-4 h-4" />
                  {t('history.startScanning')}
                </Button>
              </div>
            )}

            {historyQuery.data?.map((log, index) => {
              // Map i18n language to locale for date formatting
              const langMap: Record<string, string> = {
                fr: 'fr-FR',
                en: 'en-US',
                de: 'de-DE',
                es: 'es-ES',
                pt: 'pt-PT',
                zh: 'zh-CN',
                ar: 'ar-SA',
              }
              const locale = langMap[i18n.language] || 'en-US'
              const date = new Date(log.meal_date).toLocaleDateString(locale, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })

              return (
                <div
                  key={log.id}
                  className="reveal"
                  style={{ animationDelay: `${0.05 * (index + 1)}s` }}
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 ml-1">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{date}</span>
                  </div>
                  <FoodLogCard log={log} />
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <PhotoGallery onScanClick={() => setActiveTab('scan')} />
          </div>
        )}
      </div>

      {/* Manual Meal Builder Modal */}
      {showManualBuilder && (
        <ManualMealBuilder
          onClose={() => setShowManualBuilder(false)}
          onSuccess={() => {
            // Rafraîchir les données et basculer sur l'onglet "Aujourd'hui"
            setActiveTab('today')
          }}
        />
      )}

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onProductFound={handleBarcodeProductFound}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}
    </div>
  )
}
