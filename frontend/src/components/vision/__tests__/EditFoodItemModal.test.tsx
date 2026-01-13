import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditFoodItemModal, type FoodItem } from '../EditFoodItemModal'

const mockItem: FoodItem = {
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
}

describe('EditFoodItemModal', () => {
  it('affiche le modal quand item est fourni', () => {
    const onClose = vi.fn()
    const onSave = vi.fn()

    render(
      <EditFoodItemModal
        item={mockItem}
        onClose={onClose}
        onSave={onSave}
        isLoading={false}
      />
    )

    expect(screen.getByText('editFood')).toBeInTheDocument()
    expect(screen.getByDisplayValue('riz')).toBeInTheDocument()
    expect(screen.getByDisplayValue('200')).toBeInTheDocument()
  })

  it('ne rend rien quand item est null', () => {
    const onClose = vi.fn()
    const onSave = vi.fn()

    const { container } = render(
      <EditFoodItemModal
        item={null}
        onClose={onClose}
        onSave={onSave}
        isLoading={false}
      />
    )

    // Le Dialog de shadcn/ui rend un portal, donc on vérifie qu'il n'y a pas de contenu visible
    expect(screen.queryByText('editFood')).not.toBeInTheDocument()
  })

  it('pré-remplit les champs avec les données de l\'item', () => {
    const onClose = vi.fn()
    const onSave = vi.fn()

    render(
      <EditFoodItemModal
        item={mockItem}
        onClose={onClose}
        onSave={onSave}
        isLoading={false}
      />
    )

    const nameInput = screen.getByPlaceholderText('foodNamePlaceholder')
    const quantityInput = screen.getByLabelText('quantity')

    expect(nameInput).toHaveValue('riz')
    expect(quantityInput).toHaveValue(200)
  })

  it('appelle onSave avec les données modifiées', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSave = vi.fn().mockResolvedValue(undefined)

    render(
      <EditFoodItemModal
        item={mockItem}
        onClose={onClose}
        onSave={onSave}
        isLoading={false}
      />
    )

    // Modifier le nom
    const nameInput = screen.getByDisplayValue('riz')
    await user.clear(nameInput)
    await user.type(nameInput, 'pâtes')

    // Modifier la quantité
    const quantityInput = screen.getByDisplayValue('200')
    await user.clear(quantityInput)
    await user.type(quantityInput, '150')

    // Soumettre
    const saveButton = screen.getByText('result.edit.save')
    await user.click(saveButton)

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'pâtes',
          quantity: '150',
        })
      )
    })
  })

  it('recalcule la nutrition en temps réel lors du changement de nom', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSave = vi.fn()

    render(
      <EditFoodItemModal
        item={mockItem}
        onClose={onClose}
        onSave={onSave}
        isLoading={false}
      />
    )

    // Modifier le nom pour "pâtes"
    const nameInput = screen.getByDisplayValue('riz')
    await user.clear(nameInput)
    await user.type(nameInput, 'pâtes')

    // Vérifier que la nutrition est recalculée
    // Pâtes 200g = 262 cal (131*2)
    await waitFor(() => {
      expect(screen.getByText(/262/)).toBeInTheDocument()
    })
  })

  it('recalcule la nutrition lors du changement de quantité', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSave = vi.fn()

    render(
      <EditFoodItemModal
        item={mockItem}
        onClose={onClose}
        onSave={onSave}
        isLoading={false}
      />
    )

    // Modifier la quantité
    const quantityInput = screen.getByDisplayValue('200')
    await user.clear(quantityInput)
    await user.type(quantityInput, '100')

    // Vérifier que la nutrition est recalculée
    // Riz 100g = 130 cal
    await waitFor(() => {
      expect(screen.getByText(/130/)).toBeInTheDocument()
    })
  })

  it('appelle onClose au clic sur Annuler', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSave = vi.fn()

    render(
      <EditFoodItemModal
        item={mockItem}
        onClose={onClose}
        onSave={onSave}
        isLoading={false}
      />
    )

    const cancelButton = screen.getByText('result.edit.cancel')
    await user.click(cancelButton)

    expect(onClose).toHaveBeenCalled()
  })

  it('désactive les boutons pendant le chargement', () => {
    const onClose = vi.fn()
    const onSave = vi.fn()

    render(
      <EditFoodItemModal
        item={mockItem}
        onClose={onClose}
        onSave={onSave}
        isLoading={true}
      />
    )

    const saveButton = screen.getByText('result.edit.save')
    const cancelButton = screen.getByText('result.edit.cancel')

    expect(saveButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('affiche un spinner pendant le chargement', () => {
    const onClose = vi.fn()
    const onSave = vi.fn()

    render(
      <EditFoodItemModal
        item={mockItem}
        onClose={onClose}
        onSave={onSave}
        isLoading={true}
      />
    )

    // Le spinner Loader2 devrait être présent
    const saveButton = screen.getByText('result.edit.save')
    const spinner = saveButton.querySelector('svg')
    expect(spinner).toBeInTheDocument()
  })

  it('valide que le nom n\'est pas vide', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSave = vi.fn()

    render(
      <EditFoodItemModal
        item={mockItem}
        onClose={onClose}
        onSave={onSave}
        isLoading={false}
      />
    )

    // Vider le nom
    const nameInput = screen.getByDisplayValue('riz')
    await user.clear(nameInput)

    // Le bouton save devrait être désactivé
    const saveButton = screen.getByText('result.edit.save')
    expect(saveButton).toBeDisabled()
  })

  it('valide que la quantité est positive', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSave = vi.fn()

    render(
      <EditFoodItemModal
        item={mockItem}
        onClose={onClose}
        onSave={onSave}
        isLoading={false}
      />
    )

    // Mettre une quantité invalide
    const quantityInput = screen.getByDisplayValue('200')
    await user.clear(quantityInput)
    await user.type(quantityInput, '0')

    // Le bouton save devrait être désactivé
    const saveButton = screen.getByText('result.edit.save')
    expect(saveButton).toBeDisabled()
  })

  it('affiche l\'aperçu nutritionnel', async () => {
    const onClose = vi.fn()
    const onSave = vi.fn()

    render(
      <EditFoodItemModal
        item={mockItem}
        onClose={onClose}
        onSave={onSave}
        isLoading={false}
      />
    )

    // L'aperçu devrait être visible
    expect(screen.getByText('nutritionPreview')).toBeInTheDocument()
    expect(screen.getByText(/kcal/)).toBeInTheDocument()
  })

  it('affiche les suggestions d\'autocomplete', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSave = vi.fn()

    render(
      <EditFoodItemModal
        item={mockItem}
        onClose={onClose}
        onSave={onSave}
        isLoading={false}
      />
    )

    const nameInput = screen.getByDisplayValue('riz')
    await user.clear(nameInput)
    await user.type(nameInput, 'pa')

    // Les suggestions devraient apparaître
    await waitFor(() => {
      // Devrait trouver "pâtes", "pain", etc.
      const suggestions = screen.queryAllByRole('button')
      expect(suggestions.length).toBeGreaterThan(2) // Au moins cancel et save + suggestions
    })
  })

  it('sélectionne une suggestion d\'autocomplete', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSave = vi.fn()

    render(
      <EditFoodItemModal
        item={mockItem}
        onClose={onClose}
        onSave={onSave}
        isLoading={false}
      />
    )

    const nameInput = screen.getByDisplayValue('riz')
    await user.clear(nameInput)
    await user.type(nameInput, 'pou')

    // Attendre les suggestions
    await waitFor(() => {
      expect(screen.getByText('poulet')).toBeInTheDocument()
    })

    // Cliquer sur la suggestion
    await user.click(screen.getByText('poulet'))

    // Vérifier que le nom est mis à jour
    expect(nameInput).toHaveValue('poulet')
  })

  it('gère tous les types d\'unités', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSave = vi.fn()

    render(
      <EditFoodItemModal
        item={mockItem}
        onClose={onClose}
        onSave={onSave}
        isLoading={false}
      />
    )

    // Les options d'unité devraient être disponibles
    const unitOptions = ['g', 'ml', 'portion', 'piece', 'cup', 'tablespoon']

    for (const unit of unitOptions) {
      expect(screen.getByText(unit)).toBeInTheDocument()
    }
  })

  it('inclut les valeurs nutritionnelles calculées dans onSave', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSave = vi.fn().mockResolvedValue(undefined)

    render(
      <EditFoodItemModal
        item={mockItem}
        onClose={onClose}
        onSave={onSave}
        isLoading={false}
      />
    )

    const saveButton = screen.getByText('result.edit.save')
    await user.click(saveButton)

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          calories: expect.any(Number),
          protein: expect.any(Number),
          carbs: expect.any(Number),
          fat: expect.any(Number),
          fiber: expect.any(Number),
        })
      )
    })
  })
})
