# Guide de Développement NutriProfile

## Vue d'Ensemble

Ce guide documente la méthodologie complète pour implémenter des features dans NutriProfile, basée sur les meilleures pratiques établies lors du développement du projet.

---

## Table des Matières

1. [Workflow Général](#workflow-général)
2. [Décomposition de Features Complexes](#décomposition-de-features-complexes)
3. [Standards de Code](#standards-de-code)
4. [Tests et Qualité](#tests-et-qualité)
5. [Internationalisation (i18n)](#internationalisation-i18n)
6. [Responsive Design](#responsive-design)
7. [Exemples Pratiques](#exemples-pratiques)

---

## Workflow Général

### Pour le Backend (FastAPI)

```
1. Schéma Pydantic
   └─> Définir les types de données

2. Modèle SQLAlchemy
   └─> Créer/modifier tables avec Alembic

3. Endpoint API
   └─> Implémenter la logique métier

4. Tests
   └─> pytest avec fixtures

5. Documentation
   └─> Mettre à jour docs/API.md
```

### Pour le Frontend (React)

```
1. Composants React
   └─> TypeScript strict + interfaces exportées

2. Intégrations
   └─> Hooks, React Query, Zustand

3. Traductions i18n
   └─> 7 langues obligatoires

4. Tests
   └─> Vitest + React Testing Library

5. Responsive
   └─> Mobile-first (Tailwind breakpoints)
```

---

## Décomposition de Features Complexes

### Problème: Boucle Infinie Auto Claude

Symptômes:
- Cycle "Révision humaine" → "En cours" → "Révision humaine"
- Features trop complexes pour Auto Claude
- Trop de fichiers/étapes dans un seul prompt

### Solution: Décomposition Stratégique

#### Contraintes par Tâche

| Critère | Limite | Raison |
|---------|--------|--------|
| **Mots de description** | ≤ 2,000 | Auto Claude digère mieux |
| **Phases** | 1-2 max | Simplifie l'exécution |
| **Fichiers modifiés** | ≤ 5 | Réduit la complexité |
| **Dépendances** | Claires | Ordre d'exécution déterministe |
| **Critères de succès** | Mesurables | Tests passent, coverage atteint |

#### Template de Décomposition

```markdown
## Feature: [Nom de la Feature]

### Tâche 1: [Nom] (Standalone)
**Mots**: 800 | **Fichiers**: 1 | **Dépendances**: Aucune

**Objectif**: Créer la couche de données de base

**Fichiers**:
- `src/data/[nom].ts`

**Critères de succès**:
- [ ] Fichier créé avec types TypeScript
- [ ] Fonctions exportées testables
- [ ] Aucune erreur de compilation

---

### Tâche 2: [Nom] (Dépend de Tâche 1)
**Mots**: 1,200 | **Fichiers**: 1 | **Dépendances**: Tâche 1

**Objectif**: Créer le composant principal

**Fichiers**:
- `src/components/[module]/[Composant].tsx`

**Critères de succès**:
- [ ] Composant fonctionnel
- [ ] Props typées et exportées
- [ ] Utilise les fonctions de Tâche 1

---

### Tâche 3: [Nom] (Dépend de Tâche 2)
**Mots**: 900 | **Fichiers**: 1 | **Dépendances**: Tâche 2

**Objectif**: Intégrer dans le flux existant

**Fichiers**:
- `src/[module]/[Page].tsx`

**Critères de succès**:
- [ ] Intégration sans régression
- [ ] UI cohérente avec design system
- [ ] Gestion d'état appropriée

---

### Tâche 4: Traductions (Parallèle)
**Mots**: 500 | **Fichiers**: 7 | **Dépendances**: Aucune (peut s'exécuter en parallèle)

**Objectif**: Ajouter traductions pour toutes les langues

**Fichiers**:
- `src/i18n/locales/en/[namespace].json`
- `src/i18n/locales/fr/[namespace].json`
- `src/i18n/locales/de/[namespace].json`
- `src/i18n/locales/es/[namespace].json`
- `src/i18n/locales/pt/[namespace].json`
- `src/i18n/locales/zh/[namespace].json`
- `src/i18n/locales/ar/[namespace].json`

**Critères de succès**:
- [ ] Toutes les 7 langues complètes
- [ ] Clés cohérentes entre langues
- [ ] Aucune clé manquante

---

### Tâche 5: Tests (Dépend de Tâches 1-3)
**Mots**: 1,800 | **Fichiers**: 4-5 | **Dépendances**: Tâches 1, 2, 3

**Objectif**: Garantir 80%+ coverage

**Fichiers**:
- `vitest.config.ts` (si première fois)
- `src/test/setup.ts` (si première fois)
- `src/data/__tests__/[nom].test.ts`
- `src/components/__tests__/[Composant].test.tsx`
- `src/components/__tests__/[Composant]Integration.test.tsx`

**Critères de succès**:
- [ ] Tous les tests passent (npm test)
- [ ] Coverage ≥ 80% statements/functions/lines
- [ ] Coverage ≥ 75% branches
- [ ] Tests d'intégration couvrent les flux critiques
```

---

## Standards de Code

### TypeScript Strict

```typescript
// ✅ BON: Types explicites et exportés
export interface UserProfile {
  id: number
  name: string
  email: string
  preferences: {
    language: string
    theme: 'light' | 'dark'
  }
}

export function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  // Implementation
}

// ❌ MAUVAIS: any, types manquants
function updateProfile(data: any) {
  // Implementation
}
```

### Composants React

```tsx
// ✅ BON: Interface exportée, types stricts, i18n
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

export interface ProfileCardProps {
  user: UserProfile
  onEdit: () => void
  isLoading?: boolean
}

export function ProfileCard({ user, onEdit, isLoading = false }: ProfileCardProps) {
  const { t } = useTranslation('profile')

  return (
    <div className="p-4 bg-white rounded-lg">
      <h2 className="text-xl font-bold">{t('title')}</h2>
      <p>{user.name}</p>
      <Button onClick={onEdit} disabled={isLoading}>
        {t('actions.edit')}
      </Button>
    </div>
  )
}

// ❌ MAUVAIS: Pas de types, texte codé en dur
function ProfileCard({ user, onEdit }) {
  return (
    <div className="p-4 bg-white rounded-lg">
      <h2 className="text-xl font-bold">Profile</h2>
      <p>{user.name}</p>
      <button onClick={onEdit}>Edit</button>
    </div>
  )
}
```

### React Query / Mutations

```typescript
// ✅ BON: Mutation typée avec invalidation cache
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidationGroups } from '@/lib/queryKeys'

const updateMutation = useMutation({
  mutationFn: async (data: FoodItemUpdate) => {
    if (!itemId) throw new Error('No item ID')
    return await visionApi.updateItem(itemId, data)
  },
  onSuccess: () => {
    // Invalider toutes les queries liées
    invalidationGroups.mealAnalysis.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key })
    })
    toast.success(t('itemUpdated'))
  },
  onError: (error) => {
    console.error('Update error:', error)
    toast.error(t('updateError'))
  },
})

// ❌ MAUVAIS: Pas de types, pas d'invalidation
const updateMutation = useMutation({
  mutationFn: (data) => visionApi.updateItem(itemId, data),
  onSuccess: () => {
    alert('Success')
  },
})
```

### Patterns UI

#### Modal Natif (Pattern du Projet)

```tsx
// ✅ BON: Pattern natif consistant avec le reste du projet
import { useEffect } from 'react'
import { X } from '@/lib/icons'

export function MyModal({ isOpen, onClose, children }) {
  // Fermeture avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )
}

// ❌ MAUVAIS: Utiliser shadcn Dialog (n'existe pas dans le projet)
import { Dialog, DialogContent } from '@/components/ui/dialog' // ❌ N'existe pas !
```

---

## Tests et Qualité

### Configuration Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Setup Mocks

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params) {
        let result = key
        Object.entries(params).forEach(([param, value]) => {
          result = result.replace(`{{${param}}}`, String(value))
        })
        return result
      }
      return key
    },
  }),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock window APIs
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

### Tests Unitaires

```typescript
// src/data/__tests__/nutritionReference.test.ts
import { describe, it, expect } from 'vitest'
import { calculateNutrition, searchFoods } from '../nutritionReference'

describe('calculateNutrition', () => {
  it('calcule correctement pour un aliment connu', () => {
    const result = calculateNutrition('riz', 100, 'g')

    expect(result.calories).toBe(130)
    expect(result.protein).toBe(2.7)
    expect(result.carbs).toBe(28)
    expect(result.fat).toBe(0.3)
  })

  it('calcule correctement avec une portion', () => {
    const result = calculateNutrition('pâtes', 200, 'g')

    expect(result.calories).toBe(262)
    expect(result.protein).toBe(10)
    expect(result.carbs).toBe(50)
    expect(result.fat).toBe(2.2)
  })

  it('retourne des valeurs par défaut pour aliment inconnu', () => {
    const result = calculateNutrition('aliment_inexistant', 100, 'g')

    expect(result.calories).toBe(100)
    expect(result.protein).toBe(5)
  })
})

describe('searchFoods', () => {
  it('trouve les aliments correspondants', () => {
    const results = searchFoods('pa', 5)

    expect(results).toContain('pâtes')
    expect(results).toContain('pain')
    expect(results.length).toBeLessThanOrEqual(5)
  })

  it('est case-insensitive', () => {
    const resultsLower = searchFoods('riz')
    const resultsUpper = searchFoods('RIZ')

    expect(resultsLower).toEqual(resultsUpper)
  })
})
```

### Tests Composants

```typescript
// src/components/__tests__/EditFoodItemModal.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditFoodItemModal } from '../EditFoodItemModal'

describe('EditFoodItemModal', () => {
  it('affiche le modal quand item est fourni', () => {
    const onClose = vi.fn()
    const onSave = vi.fn()

    render(
      <EditFoodItemModal
        item={{ name: 'riz', quantity: '200', unit: 'g' }}
        onClose={onClose}
        onSave={onSave}
        isLoading={false}
      />
    )

    expect(screen.getByText('editFood')).toBeInTheDocument()
    expect(screen.getByDisplayValue('riz')).toBeInTheDocument()
  })

  it('appelle onSave avec les données modifiées', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSave = vi.fn()

    render(
      <EditFoodItemModal
        item={{ name: 'riz', quantity: '200', unit: 'g' }}
        onClose={onClose}
        onSave={onSave}
        isLoading={false}
      />
    )

    // Modifier le nom
    const nameInput = screen.getByDisplayValue('riz')
    await user.clear(nameInput)
    await user.type(nameInput, 'pâtes')

    // Soumettre
    const saveButton = screen.getByText('result.edit.save')
    await user.click(saveButton)

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'pâtes',
          quantity: '200',
        })
      )
    })
  })

  it('valide que le nom n\'est pas vide', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <EditFoodItemModal
        item={{ name: 'riz', quantity: '200', unit: 'g' }}
        onClose={() => {}}
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
})
```

### Tests d'Intégration

```typescript
// src/components/__tests__/EditFoodItemIntegration.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FoodLogCard } from '../FoodLogCard'
import { visionApi } from '@/services/visionApi'

// Mock l'API
vi.mock('@/services/visionApi', () => ({
  visionApi: {
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
  },
}))

describe('EditFoodItemIntegration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.clearAllMocks()
  })

  it('met à jour un aliment via l\'API', async () => {
    const user = userEvent.setup()

    // Mock la réponse API
    vi.mocked(visionApi.updateItem).mockResolvedValue({
      id: 1,
      name: 'pâtes',
      quantity: '150',
      unit: 'g',
      calories: 195,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <FoodLogCard
          log={{
            id: 1,
            meal_type: 'lunch',
            items: [{ id: 1, name: 'riz', quantity: '200', unit: 'g', calories: 260 }],
          }}
        />
      </QueryClientProvider>
    )

    // Ouvrir les détails
    const showButton = screen.getByText(/Show/)
    await user.click(showButton)

    // Cliquer sur éditer
    const editButton = screen.getByRole('button', { name: /Edit/ })
    await user.click(editButton)

    // Modifier dans le modal
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
  })
})
```

---

## Internationalisation (i18n)

### Règle d'Or

**TOUT texte visible par l'utilisateur DOIT être internationalisé. Aucune exception.**

### Namespaces Disponibles

```typescript
// Liste complète des namespaces
const namespaces = [
  'common',      // Actions, navigation, unités, erreurs génériques
  'auth',        // Authentification (login, register, forgot password)
  'dashboard',   // Tableau de bord
  'tracking',    // Suivi activité/poids
  'vision',      // Analyse photo IA
  'recipes',     // Génération de recettes
  'onboarding',  // Onboarding utilisateur
  'settings',    // Paramètres
  'home',        // Page d'accueil publique
  'pricing',     // Tarification
  'terms',       // Conditions d'utilisation
  'privacy',     // Politique de confidentialité
  'refund',      // Politique de remboursement
  'pro',         // Fonctionnalités Pro
]
```

### Structure des Fichiers

```
frontend/src/i18n/locales/
├── en/
│   ├── common.json
│   ├── vision.json
│   └── ...
├── fr/
├── de/
├── es/
├── pt/
├── zh/
└── ar/
```

### Exemple Complet

```json
// frontend/src/i18n/locales/en/vision.json
{
  "editFood": "Edit food",
  "foodName": "Food name",
  "foodNamePlaceholder": "E.g. Pasta, Chicken, Broccoli...",
  "quantity": "Quantity",
  "unit": "Unit",
  "g": "g",
  "ml": "ml",
  "portion": "Portion",
  "piece": "Piece",
  "cup": "Cup",
  "tablespoon": "Tablespoon",
  "nutritionPreview": "Nutrition preview",
  "itemUpdated": "Food updated successfully",
  "updateError": "Error updating. Please try again.",
  "result": {
    "edit": {
      "cancel": "Cancel",
      "save": "Save"
    }
  }
}
```

```json
// frontend/src/i18n/locales/fr/vision.json
{
  "editFood": "Modifier l'aliment",
  "foodName": "Nom de l'aliment",
  "foodNamePlaceholder": "Ex: Pâtes, Poulet, Brocoli...",
  "quantity": "Quantité",
  "unit": "Unité",
  "g": "g",
  "ml": "ml",
  "portion": "Portion",
  "piece": "Pièce",
  "cup": "Tasse",
  "tablespoon": "Cuillère à soupe",
  "nutritionPreview": "Aperçu nutritionnel",
  "itemUpdated": "Aliment mis à jour avec succès",
  "updateError": "Erreur lors de la mise à jour. Veuillez réessayer.",
  "result": {
    "edit": {
      "cancel": "Annuler",
      "save": "Enregistrer"
    }
  }
}
```

### Utilisation dans les Composants

```tsx
import { useTranslation } from 'react-i18next'

export function EditFoodModal() {
  const { t } = useTranslation('vision')

  return (
    <div>
      <h2>{t('editFood')}</h2>
      <input placeholder={t('foodNamePlaceholder')} />
      <button>{t('result.edit.save')}</button>
    </div>
  )
}
```

### Checklist i18n

Avant de commit:
- [ ] Aucun texte codé en dur dans les composants
- [ ] Toutes les 7 langues complètes (FR, EN, DE, ES, PT, ZH, AR)
- [ ] Clés cohérentes entre langues
- [ ] Namespace approprié utilisé
- [ ] Tests utilisent les mêmes clés i18n

---

## Responsive Design

### Approche Mobile-First

```tsx
// ✅ BON: Classes responsive progressive
<div className="
  text-sm sm:text-base md:text-lg lg:text-xl
  p-2 sm:p-4 md:p-6
  grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
">
  {content}
</div>

// ❌ MAUVAIS: Tailles fixes
<div className="text-xl p-6 grid grid-cols-4">
  {content}
</div>
```

### Breakpoints Tailwind

| Préfixe | Largeur min | Usage |
|---------|-------------|-------|
| (base) | 0px | Mobile (iPhone SE, 375px) |
| `sm:` | 640px | Grands mobiles, petites tablettes |
| `md:` | 768px | Tablettes |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |

### Modals Responsives

```tsx
// ✅ BON: Modal qui ne dépasse jamais l'écran
<div className="
  relative w-full
  max-w-[calc(100vw-24px)] sm:max-w-md
  bg-white rounded-xl
">
  {content}
</div>

// ❌ MAUVAIS: Modal dépasse sur petit écran
<div className="relative w-full max-w-md bg-white rounded-xl">
  {content}
</div>
```

### Éléments Décoratifs

```tsx
// ✅ BON: Tailles adaptatives
<div className="
  w-[200px] h-[200px]
  sm:w-[350px] sm:h-[350px]
  md:w-[500px] md:h-[500px]
  bg-gradient-to-r from-primary-500 to-emerald-500
  rounded-full blur-3xl opacity-20
">
  {/* Blob décoratif */}
</div>

// ❌ MAUVAIS: Taille fixe cause overflow mobile
<div className="w-[500px] h-[500px] ...">
  {/* Blob décoratif */}
</div>
```

### Checklist Responsive

- [ ] Testé sur 375px (iPhone SE)
- [ ] Testé sur 768px (iPad)
- [ ] Testé sur 1024px+ (Desktop)
- [ ] Aucun overflow horizontal (`overflow-x-hidden` sur conteneurs)
- [ ] Textes lisibles sur tous écrans
- [ ] Boutons/liens zone tactile ≥ 44px sur mobile
- [ ] Modals ne dépassent pas l'écran
- [ ] Navigation mobile fonctionnelle (BottomNav)

---

## Exemples Pratiques

### Exemple 1: Vision Food Editing (Janvier 2026)

**Contexte**: Permettre aux utilisateurs de corriger les aliments détectés par l'IA avec calcul nutrition automatique.

#### Décomposition

**Prompt initial**: 15,000 mots → Boucle infinie Auto Claude

**Solution**: Décomposition en 5 tâches

```
Tâche 1: nutritionReference.ts (800 mots, 1 fichier)
  └─> Base de données avec 30+ aliments

Tâche 2: EditFoodItemModal.tsx (1,200 mots, 1 fichier)
  └─> Modal avec autocomplete + calcul temps réel

Tâche 3A: AnalysisResult.tsx (900 mots, 1 fichier)
  └─> Intégration pré-sauvegarde (state local)

Tâche 3B: FoodLogCard.tsx (1,000 mots, 1 fichier)
  └─> Intégration post-sauvegarde (API + cache)

Tâche 4: Traductions (500 mots, 7 fichiers)
  └─> en/fr/de/es/pt/zh/ar avec 17 clés

Tâche 5: Tests (1,800 mots, 5 fichiers)
  └─> vitest.config + setup + 3 fichiers tests
```

#### Résultats

- **51 tests passés** (100%)
- **Coverage**: nutritionReference.ts (100%), EditFoodItemModal.tsx (98.49%)
- **Aucune erreur TypeScript**
- **Feature complète en < 1 jour**

#### Leçons Apprises

1. **Décomposition critique**: Sans elle, feature bloquée indéfiniment
2. **Tests dès le début**: Détecte erreurs immédiatement
3. **i18n en parallèle**: Pas besoin d'attendre l'implémentation
4. **Pattern modal natif**: Évite dépendances inutiles

---

## Checklist Finale Pré-Commit

### Code

- [ ] Aucune erreur TypeScript (`tsc --noEmit`)
- [ ] Aucune erreur ESLint
- [ ] Pas de `console.log`, `debugger`, `TODO` orphelins
- [ ] Types stricts, interfaces exportées
- [ ] Props components documentées

### Tests

- [ ] Tous les tests passent (`npm test`)
- [ ] Coverage ≥ 80% statements/functions/lines
- [ ] Coverage ≥ 75% branches
- [ ] Tests unitaires + intégration

### i18n

- [ ] Aucun texte codé en dur
- [ ] 7 langues complètes (FR, EN, DE, ES, PT, ZH, AR)
- [ ] Clés cohérentes
- [ ] Namespace approprié

### Responsive

- [ ] Testé 375px / 768px / 1024px+
- [ ] Aucun overflow
- [ ] Touch targets ≥ 44px mobile
- [ ] Modals responsive

### Documentation

- [ ] CLAUDE.md mis à jour (section Fonctionnalités)
- [ ] ARCHITECTURE.md si changements structurels
- [ ] API.md si nouveaux endpoints
- [ ] Code commenté où logique complexe

---

## Ressources

### Commandes Utiles

```bash
# Frontend
cd frontend
npm test                    # Lancer les tests
npm run test:watch          # Tests en mode watch
npm run test:ui             # Interface UI Vitest
npm run test:coverage       # Rapport coverage
npm run build               # Build production
npm run lint                # Linter

# Backend
cd backend
pytest                      # Tests backend
pytest --cov                # Coverage
alembic upgrade head        # Appliquer migrations
uvicorn app.main:app --reload  # Dev server
```

### Documentation Complémentaire

- [CLAUDE.md](../CLAUDE.md) - Vue d'ensemble projet
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture technique
- [API.md](./API.md) - Documentation API
- [AGENTS.md](./AGENTS.md) - Système multi-agents IA

---

**Dernière mise à jour**: Janvier 2026
**Auteur**: Documentation générée lors de l'implémentation Vision Food Editing
