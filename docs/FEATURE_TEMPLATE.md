# Template de Feature NutriProfile

## Instructions d'Utilisation

1. Copier ce template
2. Remplir les sections pour votre nouvelle feature
3. Décomposer selon les contraintes (≤2000 mots, ≤5 fichiers par tâche)
4. Soumettre à Claude Code en mode `/plan` si complexe

---

## Feature: [NOM DE LA FEATURE]

### Contexte

**Problème à résoudre**: [Décrire le problème utilisateur]

**Objectif**: [Ce que la feature doit accomplir]

**Bénéfices utilisateur**:
- [Bénéfice 1]
- [Bénéfice 2]
- [Bénéfice 3]

---

## Analyse de Complexité

**Nombre estimé de fichiers à créer/modifier**: [X fichiers]

**Nombre estimé de lignes de code**: [~X lignes]

**Dépendances externes**: [Lister packages npm/pip si nécessaires]

**Impact sur l'architecture**: [Aucun / Mineur / Majeur]

**Complexité globale**: [Simple / Moyenne / Complexe]

```
Si Complexe (>5 fichiers OU >2000 lignes):
  → Utiliser décomposition en tâches ci-dessous
Sinon:
  → Implémenter directement sans décomposition
```

---

## Décomposition en Tâches (Si Complexe)

### Tâche 1: [NOM] (Standalone)

**Mots**: [≤2000] | **Fichiers**: [≤5] | **Dépendances**: Aucune

**Objectif**: [Description courte]

**Fichiers à créer**:
- `[chemin/fichier1]`
- `[chemin/fichier2]`

**Fichiers à modifier**:
- `[chemin/fichier3]`

**Implémentation**:

```[langage]
// Pseudo-code ou description détaillée
```

**Critères de succès**:
- [ ] [Critère 1]
- [ ] [Critère 2]
- [ ] Tests passent
- [ ] TypeScript/types stricts

**Estimation**: [X heures]

---

### Tâche 2: [NOM] (Dépend de Tâche 1)

**Mots**: [≤2000] | **Fichiers**: [≤5] | **Dépendances**: Tâche 1

**Objectif**: [Description courte]

**Fichiers à créer**:
- `[chemin/fichier1]`

**Fichiers à modifier**:
- `[chemin/fichier2]`

**Implémentation**:

```[langage]
// Pseudo-code ou description détaillée
```

**Critères de succès**:
- [ ] [Critère 1]
- [ ] [Critère 2]
- [ ] Intégration sans régression
- [ ] UI cohérente avec design system

**Estimation**: [X heures]

---

### Tâche 3: Traductions i18n (Parallèle)

**Mots**: ≤500 | **Fichiers**: 7 | **Dépendances**: Peut s'exécuter en parallèle

**Objectif**: Ajouter traductions pour toutes les langues

**Fichiers à modifier**:
- `frontend/src/i18n/locales/en/[namespace].json`
- `frontend/src/i18n/locales/fr/[namespace].json`
- `frontend/src/i18n/locales/de/[namespace].json`
- `frontend/src/i18n/locales/es/[namespace].json`
- `frontend/src/i18n/locales/pt/[namespace].json`
- `frontend/src/i18n/locales/zh/[namespace].json`
- `frontend/src/i18n/locales/ar/[namespace].json`

**Clés de traduction à ajouter**:

```json
{
  "key1": "Traduction EN",
  "key2": "Traduction EN",
  "nested": {
    "key3": "Traduction EN"
  }
}
```

**Critères de succès**:
- [ ] Toutes les 7 langues complètes
- [ ] Clés identiques dans toutes les langues
- [ ] Aucune clé manquante

**Estimation**: 1 heure

---

### Tâche 4: Tests (Dépend de Tâches 1-2)

**Mots**: ≤1800 | **Fichiers**: 4-5 | **Dépendances**: Tâches précédentes

**Objectif**: Garantir 80%+ coverage

**Fichiers à créer**:
- `[chemin]/__tests__/[fichier1].test.ts`
- `[chemin]/__tests__/[fichier2].test.tsx`
- `[chemin]/__tests__/[fichier3]Integration.test.tsx`

**Fichiers à modifier** (si première fois):
- `vitest.config.ts` (si pas encore créé)
- `src/test/setup.ts` (si pas encore créé)

**Tests à implémenter**:

**Tests unitaires**:
- [ ] Test fonction 1: [Description]
- [ ] Test fonction 2: [Description]
- [ ] Test edge cases

**Tests composants**:
- [ ] Rendu initial
- [ ] Interactions utilisateur
- [ ] Validation formulaires
- [ ] États loading/error

**Tests intégration**:
- [ ] Flux complet avec API mockée
- [ ] Cache invalidation
- [ ] Gestion erreurs

**Critères de succès**:
- [ ] Tous les tests passent (npm test)
- [ ] Coverage ≥ 80% statements/functions/lines
- [ ] Coverage ≥ 75% branches
- [ ] Aucune erreur TypeScript

**Estimation**: [X heures]

---

## Spécifications Techniques

### Backend (si applicable)

**Modèles Pydantic**:
```python
# schemas/[nom].py
from pydantic import BaseModel

class [Nom]Create(BaseModel):
    field1: str
    field2: int

class [Nom]Response(BaseModel):
    id: int
    field1: str
    field2: int
```

**Modèles SQLAlchemy**:
```python
# models/[nom].py
from sqlalchemy import Column, Integer, String
from app.database import Base

class [Nom](Base):
    __tablename__ = "[table_name]"

    id = Column(Integer, primary_key=True)
    field1 = Column(String)
    field2 = Column(Integer)
```

**Endpoints API**:
```python
# api/v1/[module].py
@router.post("/[route]")
async def create_[nom](data: [Nom]Create, db: AsyncSession = Depends(get_db)):
    # Implementation
    return result
```

**Limites Freemium** (si applicable):
```python
# Vérification tier dans l'endpoint
user_tier = await subscription_service.get_effective_tier(user_id)
if user_tier == "free" and usage_count >= LIMITS["free"]["[feature]"]:
    raise HTTPException(status_code=403, detail="Limit reached")
```

---

### Frontend

**Types TypeScript**:
```typescript
// types/[nom].ts
export interface [Nom] {
  id: number
  field1: string
  field2: number
}

export interface [Nom]Update {
  field1?: string
  field2?: number
}
```

**Composants React**:
```tsx
// components/[module]/[Composant].tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

export interface [Composant]Props {
  data: [Nom]
  onAction: () => void
  isLoading?: boolean
}

export function [Composant]({ data, onAction, isLoading = false }: [Composant]Props) {
  const { t } = useTranslation('[namespace]')

  return (
    <div className="p-4 bg-white rounded-lg">
      <h2 className="text-xl font-bold">{t('title')}</h2>
      <Button onClick={onAction} disabled={isLoading}>
        {t('actions.submit')}
      </Button>
    </div>
  )
}
```

**React Query / Mutations**:
```typescript
// hooks/use[Nom].ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidationGroups } from '@/lib/queryKeys'

export function use[Action]() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: [Nom]Update) => {
      return await api.[action](data)
    },
    onSuccess: () => {
      invalidationGroups.[group].forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
      toast.success(t('[action]Success'))
    },
    onError: (error) => {
      console.error('[Action] error:', error)
      toast.error(t('[action]Error'))
    },
  })
}
```

---

## Design UI/UX

### Wireframes

```
┌─────────────────────────────────────┐
│          [Composant Principal]       │
│                                     │
│  [Élément 1]  [Élément 2]           │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     [Section Interactive]     │  │
│  │                               │  │
│  │  [Action Button]              │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Responsive Breakpoints

**Mobile (375px - 639px)**:
- [Description layout mobile]

**Tablet (640px - 1023px)**:
- [Description layout tablet]

**Desktop (1024px+)**:
- [Description layout desktop]

---

## Traductions i18n

### Namespace: `[namespace]`

**Anglais (EN)**:
```json
{
  "title": "Title in English",
  "description": "Description in English",
  "actions": {
    "submit": "Submit",
    "cancel": "Cancel"
  }
}
```

**Français (FR)**:
```json
{
  "title": "Titre en français",
  "description": "Description en français",
  "actions": {
    "submit": "Soumettre",
    "cancel": "Annuler"
  }
}
```

*[Répéter pour DE, ES, PT, ZH, AR]*

---

## Tests

### Tests Unitaires

```typescript
describe('[Nom]', () => {
  it('[test case 1]', () => {
    // Arrange
    const input = [...]

    // Act
    const result = functionToTest(input)

    // Assert
    expect(result).toBe([expected])
  })

  it('[test case 2]', () => {
    // Test implementation
  })
})
```

### Tests Composants

```typescript
describe('[Composant]', () => {
  it('affiche correctement avec les props', () => {
    render(<[Composant] data={mockData} onAction={mockFn} />)

    expect(screen.getByText('expected text')).toBeInTheDocument()
  })

  it('appelle onAction au clic', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()

    render(<[Composant] data={mockData} onAction={onAction} />)

    await user.click(screen.getByRole('button'))

    expect(onAction).toHaveBeenCalled()
  })
})
```

### Tests d'Intégration

```typescript
describe('[Nom] Integration', () => {
  it('exécute le flux complet', async () => {
    // Mock API
    vi.mocked(api.[method]).mockResolvedValue(mockResponse)

    render(
      <QueryClientProvider client={queryClient}>
        <[Composant] />
      </QueryClientProvider>
    )

    // Interactions utilisateur
    // ...

    // Vérifications
    await waitFor(() => {
      expect(api.[method]).toHaveBeenCalledWith([expected])
    })
  })
})
```

---

## Checklist Finale

### Avant de Commencer
- [ ] Feature bien définie et scope clair
- [ ] Décomposition en tâches si complexe (>5 fichiers)
- [ ] Documentation lue (DEVELOPMENT_GUIDE.md, ARCHITECTURE.md)
- [ ] Environnement dev fonctionnel

### Pendant l'Implémentation
- [ ] Tâches exécutées dans l'ordre des dépendances
- [ ] Tests au fur et à mesure
- [ ] Traductions en parallèle
- [ ] Commits réguliers avec messages clairs

### Avant de Commit
- [ ] Tous les tests passent (npm test)
- [ ] Coverage ≥ 80% sur nouveaux fichiers
- [ ] Aucun texte codé en dur (i18n complet)
- [ ] 7 langues complètes (FR, EN, DE, ES, PT, ZH, AR)
- [ ] Responsive testé (375px, 768px, 1024px+)
- [ ] Aucune erreur TypeScript/ESLint
- [ ] Pas de console.log/debugger
- [ ] Documentation mise à jour (CLAUDE.md)

### Après Implémentation
- [ ] Feature testée manuellement dans le navigateur
- [ ] Aucune régression sur features existantes
- [ ] Performance acceptable
- [ ] Accessibilité vérifiée
- [ ] Documentation utilisateur si nécessaire

---

## Estimation Globale

**Complexité**: [Simple / Moyenne / Complexe]

**Temps estimé total**: [X heures/jours]

**Prérequis**:
- [Prérequis 1]
- [Prérequis 2]

**Risques identifiés**:
- [Risque 1 + mitigation]
- [Risque 2 + mitigation]

---

## Notes Additionnelles

[Toute information supplémentaire pertinente pour l'implémentation]

---

**Date de création**: [Date]
**Auteur**: [Nom]
**Statut**: [Draft / En cours / Complété]
