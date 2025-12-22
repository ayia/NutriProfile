# Tests

Lancer les tests pour NutriProfile.

## Tests Backend (Python/pytest)

```bash
cd backend

# Tous les tests
pytest

# Avec couverture
pytest --cov=app --cov-report=html

# Tests spécifiques
pytest tests/test_users.py
pytest tests/test_users.py::test_create_user

# Mode verbose
pytest -v -s

# Tests marqués
pytest -m "unit"
pytest -m "integration"
pytest -m "agents"
```

## Tests Frontend (React/Vitest)

```bash
cd frontend

# Tous les tests
npm run test

# Mode watch
npm run test:watch

# Couverture
npm run test:coverage

# Tests E2E (Playwright)
npm run test:e2e
```

## Tests Agents LLM

```bash
# Tests unitaires agents
pytest tests/agents/

# Tests d'intégration multi-agents
pytest tests/agents/test_consensus.py

# Tests de fallback
pytest tests/agents/test_fallback.py
```

## Structure des Tests

```
tests/
├── unit/           # Tests unitaires isolés
├── integration/    # Tests d'intégration
├── agents/         # Tests spécifiques agents
├── e2e/            # Tests end-to-end
└── fixtures/       # Données de test
```

## Bonnes Pratiques

1. **Nommage**: `test_<fonction>_<scenario>_<resultat_attendu>`
2. **Isolation**: Chaque test est indépendant
3. **Arrange-Act-Assert**: Structure AAA
4. **Mocks**: Mocker les dépendances externes
5. **Fixtures**: Réutiliser les données de test

## Checklist Tests

- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Couverture > 80%
- [ ] Pas de tests flaky
- [ ] Agents testés avec mocks
