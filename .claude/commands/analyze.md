# Analyse de Code

Analyse en profondeur un composant, module ou feature de NutriProfile.

## Workflow d'Analyse

### 1. Exploration Structure
- Identifier tous les fichiers liés
- Mapper les dépendances
- Comprendre le flux de données

### 2. Analyse Technique
- Architecture du code
- Patterns utilisés
- State management
- API calls

### 3. Qualité
- TypeScript types
- Tests existants
- Coverage
- Performance

### 4. Documentation
- README/comments
- API docs
- i18n coverage

## Points d'Analyse

### Frontend Components
```
Questions:
- Props interface bien définie?
- State local vs props?
- React Query utilisé correctement?
- i18n complet?
- Responsive?
```

### Backend Endpoints
```
Questions:
- Pydantic schemas?
- Auth/permissions?
- Validation inputs?
- Tests?
- Limites freemium?
```

### Database Models
```
Questions:
- Relations correctes?
- Indexes?
- Migrations à jour?
- Queries optimisées?
```

## Output Attendu

1. **Résumé**: Vue d'ensemble du code
2. **Architecture**: Diagramme/structure
3. **Issues**: Problèmes identifiés
4. **Recommandations**: Améliorations suggérées

## Cible de l'Analyse

$ARGUMENTS
