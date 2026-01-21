# Fix Bug

Corrige un bug dans NutriProfile.

## Processus de Debug

### Phase 1: Investigation
1. Reproduire le bug
2. Identifier le message d'erreur
3. Trouver les fichiers affectés
4. Analyser la cause racine

### Phase 2: Fix
1. Implémenter la correction
2. Ajouter un test de régression
3. Vérifier pas d'effets de bord

### Phase 3: Validation
1. Exécuter tous les tests
2. Vérifier le fix en local
3. Documenter si bug critique

## Zones Communes de Bugs

### Frontend
- Mutation de props (état pas mis à jour)
- Cache React Query non invalidé
- i18n clé manquante
- Responsive overflow

### Backend
- Validation Pydantic
- Requête SQL incorrecte
- Permission/ownership non vérifié
- Limite freemium non respectée

### API
- CORS
- JWT expiré
- Rate limiting

## Bug à Fixer

$ARGUMENTS
