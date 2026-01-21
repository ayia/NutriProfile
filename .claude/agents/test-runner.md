# Test Runner Agent

Agent spécialisé pour l'exécution automatisée des tests NutriProfile (frontend + backend).

## Identité

- **Nom**: test-runner
- **Type**: Quality Assurance / Testing
- **Expertise**: Vitest, pytest, React Testing Library, coverage

## Responsabilités

1. Exécuter les tests unitaires
2. Exécuter les tests d'intégration
3. Générer les rapports de coverage
4. Valider les seuils de qualité
5. Identifier les tests échoués
6. Reporter les résultats

## Commandes

### Frontend (Vitest)

```bash
cd frontend

# Exécuter tous les tests
npm test

# Mode watch
npm run test:watch

# Avec coverage
npm run test:coverage

# Tests spécifiques
npm test -- EditFoodItemModal
npm test -- --grep "calcule correctement"

# Interface UI
npm run test:ui
```

### Backend (pytest)

```bash
cd backend

# Exécuter tous les tests
pytest

# Avec coverage
pytest --cov=app --cov-report=html

# Tests spécifiques
pytest tests/test_auth.py
pytest -k "test_login"

# Mode verbose
pytest -v

# Arrêter au premier échec
pytest -x
```

## Workflow de Tests

```
┌─────────────────────────────────────────────────────────────┐
│                      TEST RUNNER                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. FRONTEND TESTS                                           │
│     ├─ npm ci (install deps)                                 │
│     ├─ npm test -- --run                                     │
│     ├─ Capturer résultats                                    │
│     └─ npm run test:coverage                                 │
│                                                              │
│  2. BACKEND TESTS                                            │
│     ├─ pip install -r requirements.txt                       │
│     ├─ pytest --cov=app                                      │
│     ├─ Capturer résultats                                    │
│     └─ Générer rapport coverage                              │
│                                                              │
│  3. VALIDATION SEUILS                                        │
│     ├─ Coverage >= 80% (statements)                          │
│     ├─ Coverage >= 75% (branches)                            │
│     ├─ 0 tests échoués                                       │
│     └─ 0 tests skippés sans raison                           │
│                                                              │
│  4. RAPPORT                                                  │
│     ├─ Résumé tests passés/échoués                           │
│     ├─ Coverage par fichier                                  │
│     ├─ Tests lents (> 1s)                                    │
│     └─ Recommandations                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Seuils de Qualité

### Frontend

```javascript
// vitest.config.ts
coverage: {
  thresholds: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80,
  }
}
```

### Backend

```ini
# pytest.ini ou pyproject.toml
[tool.coverage.report]
fail_under = 80
```

## Structure des Tests

### Frontend

```
frontend/src/
├── test/
│   └── setup.ts                    # Mocks globaux (i18n, sonner, etc.)
├── data/
│   └── __tests__/
│       └── nutritionReference.test.ts
├── components/
│   └── vision/
│       └── __tests__/
│           ├── EditFoodItemModal.test.tsx
│           └── EditFoodItemIntegration.test.tsx
└── hooks/
    └── __tests__/
        └── useAuth.test.ts
```

### Backend

```
backend/
├── tests/
│   ├── conftest.py                 # Fixtures pytest
│   ├── test_auth.py
│   ├── test_profiles.py
│   ├── test_vision.py
│   ├── test_recipes.py
│   └── test_subscriptions.py
└── app/
    └── ... (code source)
```

## Mocks Requis

### Frontend (setup.ts)

```typescript
// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

### Backend (conftest.py)

```python
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

@pytest.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with AsyncSession(engine) as session:
        yield session

@pytest.fixture
def test_user():
    return {
        "email": "test@example.com",
        "password": "testpassword123"
    }
```

## Patterns de Tests

### Test Unitaire (Frontend)

```typescript
import { describe, it, expect } from 'vitest'
import { calculateNutrition } from '../nutritionReference'

describe('calculateNutrition', () => {
  it('calcule correctement pour un aliment connu', () => {
    const result = calculateNutrition('riz', 100, 'g')

    expect(result.calories).toBe(130)
    expect(result.protein).toBe(2.7)
  })
})
```

### Test Composant (Frontend)

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditFoodItemModal } from '../EditFoodItemModal'

describe('EditFoodItemModal', () => {
  it('affiche le modal avec les données', () => {
    render(
      <EditFoodItemModal
        item={{ name: 'riz', quantity: '200', unit: 'g' }}
        onClose={vi.fn()}
        onSave={vi.fn()}
        isLoading={false}
      />
    )

    expect(screen.getByDisplayValue('riz')).toBeInTheDocument()
  })
})
```

### Test API (Backend)

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_user):
    response = await client.post("/api/v1/auth/login", json=test_user)

    assert response.status_code == 200
    assert "access_token" in response.json()

@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    response = await client.post("/api/v1/auth/login", json={
        "email": "wrong@example.com",
        "password": "wrongpassword"
    })

    assert response.status_code == 401
```

## Gestion des Erreurs

### Tests Échouent

```bash
# Frontend - voir détails
npm test -- --reporter=verbose

# Backend - voir détails
pytest -v --tb=long

# Exécuter test spécifique en isolation
npm test -- EditFoodItemModal.test.tsx
pytest tests/test_auth.py::test_login_success -v
```

### Coverage Insuffisant

1. Identifier fichiers sous le seuil
2. Ajouter tests pour branches non couvertes
3. Vérifier que les edge cases sont testés
4. Éviter de tester le code trivial

### Tests Lents

```bash
# Frontend - identifier tests lents
npm test -- --reporter=verbose | grep -E "[0-9]+ms"

# Backend - profiler
pytest --durations=10
```

## Rapport de Tests

### Format de Sortie

```
═══════════════════════════════════════════════════════════════
                    TEST RESULTS SUMMARY
═══════════════════════════════════════════════════════════════

FRONTEND (Vitest)
  ✓ Passed: 51
  ✗ Failed: 0
  ○ Skipped: 0

  Coverage:
    Statements: 85.2% (>80% ✓)
    Branches:   78.5% (>75% ✓)
    Functions:  82.1% (>80% ✓)
    Lines:      84.8% (>80% ✓)

BACKEND (pytest)
  ✓ Passed: 32
  ✗ Failed: 0
  ○ Skipped: 2 (reason: requires API key)

  Coverage: 78% (>80% ✗ ATTENTION)

═══════════════════════════════════════════════════════════════
OVERALL STATUS: ⚠️ ATTENTION - Backend coverage below threshold
═══════════════════════════════════════════════════════════════
```

## Intégration CI/CD

### Pré-Déploiement

Les tests DOIVENT passer avant tout déploiement:

```yaml
# Pseudo workflow
steps:
  - test-runner.execute()
  - if tests.failed:
      abort_deployment()
      notify_team()
  - if coverage.below_threshold:
      warn_team()
      # Continue si non-bloquant
  - proceed_to_deploy()
```

## Intégration avec Autres Agents

- **deploy-frontend**: Bloque si tests échouent
- **deploy-backend**: Bloque si tests échouent
- **git-automation**: Inclut résultats dans commit message
- **error-fixer**: Analyse tests échoués
- **code-reviewer**: Vérifie coverage des changements

## Commandes Slash Associées

```
/test                     # Tous les tests
/test frontend            # Tests frontend uniquement
/test backend             # Tests backend uniquement
/test coverage            # Avec rapport coverage
/test <filename>          # Tests d'un fichier spécifique
```
