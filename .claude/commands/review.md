# Code Review

Effectue une revue de code complète pour NutriProfile.

## Checklist de Revue

### Code Quality
- [ ] TypeScript strict (pas de `any`)
- [ ] Props interfaces exportées
- [ ] Pas de `console.log` ou `debugger`
- [ ] Pas de code commenté
- [ ] Noms de variables/fonctions clairs

### React Patterns
- [ ] Pas de mutation de props
- [ ] État local pour données éditables
- [ ] Hooks utilisés correctement
- [ ] React Query avec invalidation cache
- [ ] Gestion loading/error states

### i18n
- [ ] Aucun texte codé en dur
- [ ] Namespace approprié
- [ ] 7 langues complètes

### Responsive
- [ ] Mobile-first (base -> sm -> md -> lg)
- [ ] Testé sur 375px, 768px, 1024px+
- [ ] Touch targets >= 44px
- [ ] Modals responsives

### Sécurité
- [ ] Pas de secrets dans le code
- [ ] Inputs validés
- [ ] Vérification ownership dans API

### Tests
- [ ] Tests unitaires ajoutés
- [ ] Coverage >= 80%
- [ ] Tests passent

## Fichiers à Reviewer

$ARGUMENTS
