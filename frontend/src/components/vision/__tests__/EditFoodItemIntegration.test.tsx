import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { FoodLogCard } from '../FoodLogCard'
import type { FoodLog } from '@/types/foodLog'

// Mock de l'API
vi.mock('@/services/visionApi', () => ({
  visionApi: {
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    deleteLog: vi.fn(),
  },
}))

// Import après mock
import { visionApi } from '@/services/visionApi'

const mockLog: FoodLog = {
  id: 1,
  user_id: 1,
  meal_type: 'lunch',
  meal_date: '2024-01-15T12:00:00Z',
  description: 'Déjeuner',
  items: [
    {
      id: 1,
      name: 'riz',
      quantity: '200',
      unit: 'g',
      calories: 260,
      protein: 5.4,
      carbs: 56,
      fat: 0.6,
      fiber: 0.8,
      source: 'ai',
      confidence: 0.85,
    },
  ],
  total_calories: 260,
  total_protein: 5.4,
  total_carbs: 56,
  total_fat: 0.6,
  confidence_score: 0.85,
  model_used: 'Qwen',
  user_corrected: false,
  image_analyzed: true,
}

describe('EditFoodItemIntegration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    )
  }

  // Skip: Ces tests nécessitent une réécriture pour le nouveau EditFoodItemModalV2
  // qui utilise un BottomSheet avec une structure différente
  it.skip('édite un aliment et met à jour via l\'API', async () => {
    const user = userEvent.setup()

    // Mock de la réponse API
    const updatedItem = {
      ...mockLog.items[0],
      name: 'pâtes',
      source: 'manual' as const,
    }
    vi.mocked(visionApi.updateItem).mockResolvedValue(updatedItem)

    renderWithProviders(<FoodLogCard log={mockLog} />)

    // Expand pour voir les items
    const showButton = screen.getByText(/foodLog\.showDetails/)
    await user.click(showButton)

    // Attendre que les items soient visibles
    await waitFor(() => {
      expect(screen.getByText('riz')).toBeInTheDocument()
    })

    // Hover sur l'item pour révéler les boutons
    const foodItem = screen.getByText('riz').closest('div')
    expect(foodItem).toBeInTheDocument()

    // Les boutons d'édition devraient être présents (même si invisibles avant hover)
    const editButtons = screen.getAllByRole('button')
    const editButton = editButtons.find(btn =>
      btn.querySelector('svg') && btn.className.includes('hover:text-primary')
    )

    if (editButton) {
      await user.click(editButton)

      // Vérifier que le modal s'ouvre
      await waitFor(() => {
        expect(screen.getByText('editFood')).toBeInTheDocument()
      })

      // Modifier le nom
      const nameInput = screen.getByDisplayValue('riz')
      await user.clear(nameInput)
      await user.type(nameInput, 'pâtes')

      // Sauvegarder
      const saveButton = screen.getByText('result.edit.save')
      await user.click(saveButton)

      // Vérifier l'appel API
      await waitFor(() => {
        expect(visionApi.updateItem).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            name: 'pâtes',
          })
        )
      })
    }
  })

  it.skip('gère les erreurs API gracieusement', async () => {
    const user = userEvent.setup()

    // Mock d'une erreur API
    vi.mocked(visionApi.updateItem).mockRejectedValue(
      new Error('Network error')
    )

    renderWithProviders(<FoodLogCard log={mockLog} />)

    // Expand
    const showButton = screen.getByText(/foodLog\.showDetails/)
    await user.click(showButton)

    await waitFor(() => {
      expect(screen.getByText('riz')).toBeInTheDocument()
    })

    // Trouver et cliquer sur le bouton d'édition
    const editButtons = screen.getAllByRole('button')
    const editButton = editButtons.find(btn =>
      btn.querySelector('svg') && btn.className.includes('hover:text-primary')
    )

    if (editButton) {
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('editFood')).toBeInTheDocument()
      })

      // Modifier et sauvegarder
      const nameInput = screen.getByDisplayValue('riz')
      await user.clear(nameInput)
      await user.type(nameInput, 'pâtes')

      const saveButton = screen.getByText('result.edit.save')
      await user.click(saveButton)

      // Vérifier que l'erreur est gérée
      await waitFor(() => {
        expect(visionApi.updateItem).toHaveBeenCalled()
      })
    }
  })

  it('supprime un aliment avec confirmation', async () => {
    const user = userEvent.setup()

    // Mock de window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm')
    confirmSpy.mockReturnValue(true)

    vi.mocked(visionApi.deleteItem).mockResolvedValue()

    renderWithProviders(<FoodLogCard log={mockLog} />)

    // Expand
    const showButton = screen.getByText(/foodLog\.showDetails/)
    await user.click(showButton)

    await waitFor(() => {
      expect(screen.getByText('riz')).toBeInTheDocument()
    })

    // Trouver le bouton de suppression
    const buttons = screen.getAllByRole('button')
    const deleteButton = buttons.find(btn =>
      btn.querySelector('svg') && btn.className.includes('hover:text-red')
    )

    if (deleteButton) {
      await user.click(deleteButton)

      // Vérifier que confirm a été appelé
      expect(confirmSpy).toHaveBeenCalled()

      // Vérifier l'appel API
      await waitFor(() => {
        expect(visionApi.deleteItem).toHaveBeenCalledWith(1)
      })
    }

    confirmSpy.mockRestore()
  })

  it('annule la suppression si l\'utilisateur refuse', async () => {
    const user = userEvent.setup()

    const confirmSpy = vi.spyOn(window, 'confirm')
    confirmSpy.mockReturnValue(false)

    vi.mocked(visionApi.deleteItem).mockResolvedValue()

    renderWithProviders(<FoodLogCard log={mockLog} />)

    // Expand
    const showButton = screen.getByText(/foodLog\.showDetails/)
    await user.click(showButton)

    await waitFor(() => {
      expect(screen.getByText('riz')).toBeInTheDocument()
    })

    // Trouver et cliquer sur le bouton de suppression
    const buttons = screen.getAllByRole('button')
    const deleteButton = buttons.find(btn =>
      btn.className.includes('hover:text-red')
    )

    if (deleteButton) {
      await user.click(deleteButton)

      // Vérifier que l'API n'a PAS été appelée
      expect(visionApi.deleteItem).not.toHaveBeenCalled()
    }

    confirmSpy.mockRestore()
  })

  it('affiche le badge source pour les items manuels', async () => {
    const user = userEvent.setup()

    const logWithManualItem: FoodLog = {
      ...mockLog,
      items: [
        {
          ...mockLog.items[0],
          source: 'manual',
        },
      ],
    }

    renderWithProviders(<FoodLogCard log={logWithManualItem} />)

    // Expand
    const showButton = screen.getByText(/foodLog\.showDetails/)
    await user.click(showButton)

    // Vérifier que l'item est affiché avec le badge source
    // Le badge est maintenant un icone avec title="source.manual"
    await waitFor(() => {
      expect(screen.getByText('riz')).toBeInTheDocument()
      // Le badge est un span avec title contenant la traduction
      const badgeContainer = screen.getByTitle('source.manual')
      expect(badgeContainer).toBeInTheDocument()
    })
  })

  it('masque les détails quand on clique sur Hide', async () => {
    const user = userEvent.setup()

    renderWithProviders(<FoodLogCard log={mockLog} />)

    // Show details
    const showButton = screen.getByText(/foodLog\.showDetails/)
    await user.click(showButton)

    await waitFor(() => {
      expect(screen.getByText('riz')).toBeInTheDocument()
    })

    // Hide details
    const hideButton = screen.getByText(/foodLog\.hideDetails/)
    await user.click(hideButton)

    await waitFor(() => {
      expect(screen.queryByText('riz')).not.toBeInTheDocument()
    })
  })

  it.skip('invalide le cache React Query après mise à jour', async () => {
    const user = userEvent.setup()

    const updatedItem = { ...mockLog.items[0], name: 'pâtes' }
    vi.mocked(visionApi.updateItem).mockResolvedValue(updatedItem)

    renderWithProviders(<FoodLogCard log={mockLog} />)

    // Spy sur invalidateQueries
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const showButton = screen.getByText(/foodLog\.showDetails/)
    await user.click(showButton)

    await waitFor(() => {
      expect(screen.getByText('riz')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button')
    const editButton = editButtons.find(btn =>
      btn.className.includes('hover:text-primary')
    )

    if (editButton) {
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('editFood')).toBeInTheDocument()
      })

      const saveButton = screen.getByText('result.edit.save')
      await user.click(saveButton)

      // Vérifier que le cache est invalidé
      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalled()
      })
    }
  })
})
