/**
 * Tests pour VisionPage - Flux d'analyse photo repas
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { VisionPage } from '../VisionPage'
import { visionApi } from '@/services/visionApi'
import type { ImageAnalyzeResponse, DailyMeals, FoodLog } from '@/types/foodLog'

// Mock de l'API
vi.mock('@/services/visionApi', () => ({
  visionApi: {
    analyzeImage: vi.fn(),
    saveMeal: vi.fn(),
    getDailyMeals: vi.fn(),
    getLogs: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    addWater: vi.fn(),
  },
  compressImage: vi.fn(),
}))

// Mock des composants lourds
vi.mock('@/components/vision/ImageUploader', () => ({
  ImageUploader: ({ onAnalysisComplete }: { onAnalysisComplete: (data: unknown) => void }) => (
    <div data-testid="image-uploader">
      <button
        onClick={() => {
          // Simuler une analyse complète
          const mockResult: ImageAnalyzeResponse = {
            detected_items: [
              {
                name: 'riz',
                quantity: '200',
                unit: 'g',
                calories: 260,
                protein: 5.4,
                carbs: 56,
                fat: 0.6,
                confidence: 0.9,
              },
              {
                name: 'poulet',
                quantity: '150',
                unit: 'g',
                calories: 248,
                protein: 46.5,
                carbs: 0,
                fat: 5.4,
                confidence: 0.85,
              },
            ],
            total_calories: 508,
            total_protein: 51.9,
            total_carbs: 56,
            total_fat: 6,
            confidence_score: 0.875,
          }
          onAnalysisComplete({
            result: mockResult,
            imageBase64: 'base64_test_image',
            mealType: 'lunch',
          })
        }}
      >
        vision.uploader.takePhoto
      </button>
    </div>
  ),
}))

vi.mock('@/components/vision/AnalysisResult', () => ({
  AnalysisResult: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="analysis-result">
      <h2>vision.result.title</h2>
      <button onClick={onClose}>vision.result.edit.cancel</button>
    </div>
  ),
}))

vi.mock('@/components/vision/FoodLogCard', () => ({
  FoodLogCard: ({ log }: { log: FoodLog }) => (
    <div data-testid="food-log-card">
      <span>{log.meal_type}</span>
    </div>
  ),
}))

vi.mock('@/components/vision/PhotoTips', () => ({
  PhotoTips: () => <div data-testid="photo-tips">vision.tips.title</div>,
}))

vi.mock('@/components/subscription/UsageBanner', () => ({
  UsageBanner: () => <div data-testid="usage-banner">usage banner</div>,
}))

describe('VisionPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const renderVisionPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <VisionPage />
      </QueryClientProvider>
    )
  }

  describe('Onglet Scan', () => {
    it('renders upload zone correctly', () => {
      renderVisionPage()

      expect(screen.getByTestId('image-uploader')).toBeInTheDocument()
      expect(screen.getByTestId('photo-tips')).toBeInTheDocument()
      expect(screen.getByTestId('usage-banner')).toBeInTheDocument()
    })

    it('handles image upload and shows analysis', async () => {
      const user = userEvent.setup()
      renderVisionPage()

      // Simuler l'upload d'une image
      const uploadButton = screen.getByText('vision.uploader.takePhoto')
      await user.click(uploadButton)

      // Vérifier que l'analyse s'affiche
      await waitFor(() => {
        expect(screen.getByTestId('analysis-result')).toBeInTheDocument()
      })
    })

    it('displays detected items after analysis', async () => {
      const user = userEvent.setup()
      renderVisionPage()

      const uploadButton = screen.getByText('vision.uploader.takePhoto')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByText('vision.result.title')).toBeInTheDocument()
      })
    })

    it('allows closing analysis result', async () => {
      const user = userEvent.setup()
      renderVisionPage()

      // Upload et affichage du résultat
      const uploadButton = screen.getByText('vision.uploader.takePhoto')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByTestId('analysis-result')).toBeInTheDocument()
      })

      // Fermer le résultat
      const closeButton = screen.getByText('vision.result.edit.cancel')
      await user.click(closeButton)

      // Retour à l'uploader
      await waitFor(() => {
        expect(screen.queryByTestId('analysis-result')).not.toBeInTheDocument()
        expect(screen.getByTestId('image-uploader')).toBeInTheDocument()
      })
    })
  })

  describe('Onglet Today', () => {
    const mockDailyMeals: DailyMeals = {
      date: '2026-01-17',
      meals: [
        {
          id: 1,
          user_id: 1,
          meal_type: 'breakfast',
          meal_date: '2026-01-17',
          image_url: null,
          total_calories: 450,
          total_protein: 25,
          total_carbs: 40,
          total_fat: 15,
          confidence_score: 0.9,
          items: [
            {
              id: 1,
              name: 'omelette',
              quantity: '200',
              unit: 'g',
              calories: 300,
              protein: 20,
              carbs: 5,
              fat: 12,
              confidence: 0.9,
            },
          ],
          created_at: '2026-01-17T08:00:00Z',
        },
        {
          id: 2,
          user_id: 1,
          meal_type: 'lunch',
          meal_date: '2026-01-17',
          image_url: null,
          total_calories: 650,
          total_protein: 45,
          total_carbs: 60,
          total_fat: 20,
          confidence_score: 0.85,
          items: [],
          created_at: '2026-01-17T12:30:00Z',
        },
      ],
      nutrition: {
        date: '2026-01-17',
        target_calories: 2100,
        total_calories: 1100,
        calories_percent: 52.4,
        target_protein: 160,
        total_protein: 70,
        protein_percent: 43.75,
        target_carbs: 210,
        total_carbs: 100,
        carbs_percent: 47.6,
        target_fat: 70,
        total_fat: 35,
        fat_percent: 50,
        water_ml: 1500,
      },
    }

    it('shows loading state during data fetch', async () => {
      vi.mocked(visionApi.getDailyMeals).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      renderVisionPage()

      const user = userEvent.setup()
      const todayTab = screen.getByText('tabs.today')
      await user.click(todayTab)

      await waitFor(() => {
        expect(screen.getByText('today.loading')).toBeInTheDocument()
      })
    })

    it('displays daily nutrition summary', async () => {
      vi.mocked(visionApi.getDailyMeals).mockResolvedValue(mockDailyMeals)

      renderVisionPage()

      const user = userEvent.setup()
      const todayTab = screen.getByText('tabs.today')
      await user.click(todayTab)

      await waitFor(() => {
        expect(screen.getByText('today.nutritionSummary')).toBeInTheDocument()
        expect(screen.getByText('today.calories')).toBeInTheDocument()
        expect(screen.getByText('today.protein')).toBeInTheDocument()
        expect(screen.getByText('today.carbs')).toBeInTheDocument()
        expect(screen.getByText('today.fat')).toBeInTheDocument()
      })
    })

    it('displays meal cards', async () => {
      vi.mocked(visionApi.getDailyMeals).mockResolvedValue(mockDailyMeals)

      renderVisionPage()

      const user = userEvent.setup()
      const todayTab = screen.getByText('tabs.today')
      await user.click(todayTab)

      await waitFor(() => {
        const foodLogCards = screen.getAllByTestId('food-log-card')
        expect(foodLogCards).toHaveLength(2)
      })
    })

    it('shows empty state when no meals', async () => {
      vi.mocked(visionApi.getDailyMeals).mockResolvedValue({
        date: '2026-01-17',
        meals: [],
        nutrition: {
          date: '2026-01-17',
          target_calories: 2100,
          total_calories: 0,
          calories_percent: 0,
          target_protein: 160,
          total_protein: 0,
          protein_percent: 0,
          target_carbs: 210,
          total_carbs: 0,
          carbs_percent: 0,
          target_fat: 70,
          total_fat: 0,
          fat_percent: 0,
          water_ml: 0,
        },
      })

      renderVisionPage()

      const user = userEvent.setup()
      const todayTab = screen.getByText('tabs.today')
      await user.click(todayTab)

      await waitFor(() => {
        expect(screen.getByText('today.noMeals')).toBeInTheDocument()
        expect(screen.getByText('today.noMealsDescription')).toBeInTheDocument()
      })
    })

    it('allows switching back to scan tab from empty state', async () => {
      vi.mocked(visionApi.getDailyMeals).mockResolvedValue({
        date: '2026-01-17',
        meals: [],
        nutrition: {
          date: '2026-01-17',
          target_calories: 2100,
          total_calories: 0,
          calories_percent: 0,
          target_protein: 160,
          total_protein: 0,
          protein_percent: 0,
          target_carbs: 210,
          total_carbs: 0,
          carbs_percent: 0,
          target_fat: 70,
          total_fat: 0,
          fat_percent: 0,
          water_ml: 0,
        },
      })

      renderVisionPage()

      const user = userEvent.setup()
      const todayTab = screen.getByText('tabs.today')
      await user.click(todayTab)

      await waitFor(() => {
        expect(screen.getByText('today.scanFirst')).toBeInTheDocument()
      })

      const scanButton = screen.getByText('today.scanFirst')
      await user.click(scanButton)

      // Vérifier retour à l'onglet Scan
      await waitFor(() => {
        expect(screen.getByTestId('image-uploader')).toBeInTheDocument()
      })
    })

    it('allows adding water', async () => {
      vi.mocked(visionApi.getDailyMeals).mockResolvedValue(mockDailyMeals)
      vi.mocked(visionApi.addWater).mockResolvedValue({ water_ml: 1750 })

      renderVisionPage()

      const user = userEvent.setup()
      const todayTab = screen.getByText('tabs.today')
      await user.click(todayTab)

      await waitFor(() => {
        expect(screen.getByText('today.water')).toBeInTheDocument()
      })

      // Ajouter 250ml
      const addWaterButton = screen.getByText('+250ml')
      await user.click(addWaterButton)

      await waitFor(() => {
        expect(visionApi.addWater).toHaveBeenCalledWith(expect.any(String), 250)
      })
    })
  })

  describe('Onglet History', () => {
    const mockHistory: FoodLog[] = [
      {
        id: 1,
        user_id: 1,
        meal_type: 'breakfast',
        meal_date: '2026-01-16',
        image_url: null,
        total_calories: 400,
        total_protein: 20,
        total_carbs: 50,
        total_fat: 10,
        confidence_score: 0.9,
        items: [],
        created_at: '2026-01-16T08:00:00Z',
      },
      {
        id: 2,
        user_id: 1,
        meal_type: 'lunch',
        meal_date: '2026-01-15',
        image_url: null,
        total_calories: 600,
        total_protein: 40,
        total_carbs: 60,
        total_fat: 20,
        confidence_score: 0.85,
        items: [],
        created_at: '2026-01-15T12:30:00Z',
      },
    ]

    it('shows loading state during history fetch', async () => {
      vi.mocked(visionApi.getLogs).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      renderVisionPage()

      const user = userEvent.setup()
      const historyTab = screen.getByText('tabs.history')
      await user.click(historyTab)

      await waitFor(() => {
        expect(screen.getByText('history.loading')).toBeInTheDocument()
      })
    })

    it('displays history logs', async () => {
      vi.mocked(visionApi.getLogs).mockResolvedValue(mockHistory)

      renderVisionPage()

      const user = userEvent.setup()
      const historyTab = screen.getByText('tabs.history')
      await user.click(historyTab)

      await waitFor(() => {
        const foodLogCards = screen.getAllByTestId('food-log-card')
        expect(foodLogCards).toHaveLength(2)
      })
    })

    it('shows empty state when no history', async () => {
      vi.mocked(visionApi.getLogs).mockResolvedValue([])

      renderVisionPage()

      const user = userEvent.setup()
      const historyTab = screen.getByText('tabs.history')
      await user.click(historyTab)

      await waitFor(() => {
        expect(screen.getByText('history.noHistory')).toBeInTheDocument()
        expect(screen.getByText('history.noHistoryDescription')).toBeInTheDocument()
      })
    })

    it('allows starting scan from empty history', async () => {
      vi.mocked(visionApi.getLogs).mockResolvedValue([])

      renderVisionPage()

      const user = userEvent.setup()
      const historyTab = screen.getByText('tabs.history')
      await user.click(historyTab)

      await waitFor(() => {
        expect(screen.getByText('history.startScanning')).toBeInTheDocument()
      })

      const startButton = screen.getByText('history.startScanning')
      await user.click(startButton)

      // Retour à l'onglet Scan
      await waitFor(() => {
        expect(screen.getByTestId('image-uploader')).toBeInTheDocument()
      })
    })
  })

  describe('Tab Navigation', () => {
    it('switches between tabs correctly', async () => {
      vi.mocked(visionApi.getDailyMeals).mockResolvedValue({
        date: '2026-01-17',
        meals: [],
        nutrition: {
          date: '2026-01-17',
          target_calories: 2100,
          total_calories: 0,
          calories_percent: 0,
          target_protein: 160,
          total_protein: 0,
          protein_percent: 0,
          target_carbs: 210,
          total_carbs: 0,
          carbs_percent: 0,
          target_fat: 70,
          total_fat: 0,
          fat_percent: 0,
          water_ml: 0,
        },
      })
      vi.mocked(visionApi.getLogs).mockResolvedValue([])

      const user = userEvent.setup()
      renderVisionPage()

      // Default: Scan tab
      expect(screen.getByTestId('image-uploader')).toBeInTheDocument()

      // Switch to Today
      const todayTab = screen.getByText('tabs.today')
      await user.click(todayTab)
      await waitFor(() => {
        expect(screen.queryByTestId('image-uploader')).not.toBeInTheDocument()
      })

      // Switch to History
      const historyTab = screen.getByText('tabs.history')
      await user.click(historyTab)
      await waitFor(() => {
        expect(visionApi.getLogs).toHaveBeenCalled()
      })

      // Switch back to Scan
      const scanTab = screen.getByText('tabs.scan')
      await user.click(scanTab)
      await waitFor(() => {
        expect(screen.getByTestId('image-uploader')).toBeInTheDocument()
      })
    })
  })

  describe('Responsive UI', () => {
    it('renders header correctly', () => {
      renderVisionPage()

      expect(screen.getByText('title')).toBeInTheDocument()
      expect(screen.getByText('subtitle')).toBeInTheDocument()
    })

    it('renders tab icons', () => {
      renderVisionPage()

      // Les 3 onglets doivent être présents
      expect(screen.getByText('tabs.scan')).toBeInTheDocument()
      expect(screen.getByText('tabs.today')).toBeInTheDocument()
      expect(screen.getByText('tabs.history')).toBeInTheDocument()
    })
  })
})
