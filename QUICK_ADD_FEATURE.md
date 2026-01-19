# Quick Add FAB - Feature Documentation

## Vue d'ensemble

Implementation d'un **Floating Action Button (FAB)** avec modal "Quick Add" permettant d'ajouter rapidement un aliment à n'importe quel repas depuis n'importe quelle page de l'application.

## Fichiers créés

### Frontend (React/TypeScript)

1. **`frontend/src/components/common/QuickAddModal.tsx`** (320 lignes)
   - Modal compact pour ajout rapide d'aliment
   - Sélection du type de repas (Breakfast/Lunch/Dinner/Snack) avec icônes
   - Recherche d'aliment avec autocomplete (nutritionReference.ts)
   - Input quantité + unité (g, ml, portion, piece, cup, tablespoon)
   - Preview nutritionnel en temps réel
   - Animation slide-up native
   - Support dark mode
   - Responsive mobile-first

## Fichiers modifiés

### Frontend

1. **`frontend/src/components/ui/QuickActionsFAB.tsx`**
   - Ajout de l'action "Quick Add Food" en première position du FAB
   - Import du composant QuickAddModal
   - State `showQuickAddModal` pour contrôler l'affichage
   - Icône: Utensils

### Traductions (i18n) - 7 langues

2-8. **dashboard.json** (FR, EN, DE, ES, PT, ZH, AR)
   - Ajout clé `fab.quickAddFood`

9-15. **vision.json** (FR, EN, DE, ES, PT, ZH, AR)
   - Section `quickAdd`:
     - `title`: "Quick add food"
     - `selectMeal`: "Select meal"
     - `searchFood`: "Search food..."
     - `preview`: "{{calories}} kcal"
     - `add`: "Add to {{meal}}"
     - `added`: "{{food}} added to {{meal}}"
     - `nameRequired`: "Please enter a food name"

## Architecture technique

### Flow utilisateur

```
1. User clique sur FAB "+" (n'importe quelle page)
2. Menu FAB s'ouvre avec 5 actions:
   - Quick Add Food (nouveau) ← icône Utensils, couleur primary-500
   - Scan a meal
   - Add water
   - New weight
   - Search recipe
3. User clique "Quick Add Food"
4. Modal QuickAddModal apparaît (animation slide-up)
5. User sélectionne type de repas (ex: Déjeuner, icône soleil)
6. User tape "pou" dans la recherche
7. Autocomplete affiche "poulet, pomme, pomme de terre..."
8. User sélectionne "poulet"
9. Quantité: 150g (pré-remplie à 100g)
10. Preview: "248 kcal" + macros (Protéines: 46.5g, Glucides: 0g, Lipides: 5.4g)
11. User clique "Ajouter au Déjeuner"
12. POST /vision/manual-log avec meal_type="lunch", items=[{...}]
13. Toast: "Poulet 150g ajouté au Déjeuner"
14. Modal se ferme, cache React Query invalidé
```

### Intégration avec le backend

**API utilisée:** `POST /api/v1/vision/manual-log`

```typescript
// Request
{
  "meal_type": "lunch",
  "items": [
    {
      "name": "poulet",
      "quantity": "150",
      "unit": "g",
      "calories": 248,
      "protein": 46.5,
      "carbs": 0,
      "fat": 5.4,
      "fiber": 0
    }
  ]
}

// Response: FoodLog
{
  "id": 123,
  "meal_type": "lunch",
  "items": [...],
  "total_calories": 248,
  ...
}
```

### Données nutritionnelles

Utilise **`frontend/src/data/nutritionReference.ts`**:
- 30+ aliments avec valeurs nutritionnelles par 100g
- Fonction `searchFoods(query, maxResults)` pour autocomplete
- Fonction `calculateNutrition(foodName, quantity, unit)` pour calcul temps réel
- Conversion automatique des unités (g, ml, portion, cup, tbsp...)

### Invalidation du cache React Query

Après succès:
```typescript
queryClient.invalidateQueries({ queryKey: ['dailyMeals'] })
queryClient.invalidateQueries({ queryKey: ['foodLogs'] })
```

Cela rafraîchit automatiquement:
- Dashboard Today Summary
- VisionPage Today tab
- VisionPage History tab

## Design UI/UX

### Modal

- **Position**: Bottom sheet sur mobile (sm:center sur desktop)
- **Largeur**: `max-w-[calc(100vw-24px)] sm:max-w-md`
- **Animation**: `animate-slide-up` (définie dans index.css)
- **Backdrop**: `bg-black/50 backdrop-blur-sm`
- **Z-index**: `z-50` (au-dessus du FAB qui est z-40)

### Meal Type Selection

```
┌─────────────────────────────────────┐
│  🌅 Breakfast  ☀️ Lunch  🌙 Dinner  🍎 Snack  │
└─────────────────────────────────────┘
```

- Grid 4 colonnes sur desktop, 4 colonnes sur mobile
- Boutons avec icônes + texte
- Active state: `bg-primary-500 text-white scale-105`
- Hover: `bg-gray-200`

### Autocomplete

- Dropdown sous l'input de recherche
- Max height: 192px (12rem) avec scroll
- Affiche jusqu'à 8 résultats
- Hover: `bg-gray-100`
- Se ferme au clic en dehors

### Preview nutritionnel

```
┌─────────────────────────────────────┐
│ 248 kcal                            │
│                                     │
│ Protéines   Glucides   Lipides     │
│   46.5g       0g        5.4g        │
└─────────────────────────────────────┘
```

- Background: `bg-primary-50` (light), `bg-primary-900/20` (dark)
- Border: `border-primary-200`
- Grid 3 colonnes pour les macros

## Responsive Design

### Mobile (375px)

- Boutons meal type: `text-[10px]` avec `truncate`
- Modal: bottom sheet avec `rounded-t-2xl` uniquement
- Padding: `p-3`
- Gap: `gap-2`

### Tablet (768px)

- Boutons meal type: `sm:text-xs`
- Modal: centered avec `sm:rounded-2xl` sur tous les côtés
- Padding: `sm:p-4`
- Gap: `sm:gap-4`

### Desktop (1024px+)

- Modal centered, max-width 448px (md)
- FAB: `md:bottom-6` (au lieu de bottom-20 sur mobile)

## Accessibilité

- Fermeture avec touche `Escape`
- Labels ARIA appropriés
- Bouton close: `aria-label="Close"`
- Focus trap dans le modal
- Contraste WCAG AA respecté (primary-500 sur blanc)
- Zone tactile minimum 44px sur mobile

## État et Gestion d'erreurs

### Loading state

Bouton "Ajouter" pendant mutation:
```tsx
<button disabled={!foodName.trim() || addFoodMutation.isPending}>
  {addFoodMutation.isPending ? (
    <>
      <Spinner />
      <span>{t('result.actions.saving')}</span>
    </>
  ) : (
    <>
      <Plus />
      <span>{t('quickAdd.add', { meal: ... })}</span>
    </>
  )}
</button>
```

### Validation

- Nom d'aliment obligatoire (bouton désactivé si vide)
- Toast erreur si nom vide au submit
- Quantité: input type="number" avec min="0" step="10"

### Erreurs API

```typescript
onError: (error) => {
  console.error('Error adding food:', error)
  toast.error(t('addError'))
}
```

## Tests manuels

### Checklist QA

- [ ] FAB s'affiche sur toutes les pages authentifiées (dashboard, vision, recipes, tracking, settings)
- [ ] FAB ne s'affiche PAS sur: /, /login, /register, /onboarding
- [ ] Clic sur FAB ouvre le menu avec 5 actions
- [ ] Clic sur "Quick Add Food" ouvre le modal
- [ ] Sélection d'un type de repas fonctionne (4 boutons)
- [ ] Recherche d'aliment affiche autocomplete (>= 2 caractères)
- [ ] Sélection d'un aliment depuis autocomplete remplit le champ
- [ ] Modification de la quantité met à jour le preview
- [ ] Modification de l'unité met à jour le preview
- [ ] Preview affiche calories + 3 macros
- [ ] Bouton "Ajouter" désactivé si nom vide
- [ ] Submit ajoute l'aliment et affiche un toast success
- [ ] Modal se ferme après succès
- [ ] Dashboard/Vision se met à jour automatiquement
- [ ] Fermeture avec Escape fonctionne
- [ ] Fermeture en cliquant sur backdrop fonctionne
- [ ] Dark mode fonctionne
- [ ] Responsive mobile 375px OK
- [ ] Responsive tablet 768px OK
- [ ] Responsive desktop 1024px+ OK
- [ ] Traductions fonctionnent (7 langues)

## Performance

### Optimisations

- Autocomplete debounced (useEffect avec cleanup)
- Calcul nutrition mémorisé (re-calcule seulement si foodName/quantity/unit changent)
- Modal monté/démonté conditionnellement (`if (!isOpen) return null`)
- Invalidation ciblée du cache (seulement queries nécessaires)

### Bundle size impact

- QuickAddModal: ~8 KB (gzipped)
- Pas de dépendances externes ajoutées
- Réutilise composants existants (nutritionReference, visionApi, icons)

## Maintenance

### Ajout d'un aliment dans la base

Éditer `frontend/src/data/nutritionReference.ts`:

```typescript
export const NUTRITION_REFERENCE: Record<string, NutritionValues> = {
  // ...
  "nouvel_aliment": {
    calories: 100,
    protein: 5,
    carbs: 15,
    fat: 3,
    fiber: 2
  },
}
```

### Modification des traductions

Éditer les 7 fichiers:
- `frontend/src/i18n/locales/{en,fr,de,es,pt,zh,ar}/vision.json`

Section `quickAdd`.

### Changement de l'API

Si endpoint `/manual-log` change:
1. Mettre à jour `frontend/src/services/visionApi.ts`
2. Mettre à jour types `frontend/src/types/foodLog.ts`
3. Adapter mutation dans `QuickAddModal.tsx`

## Roadmap futures améliorations

### Court terme (P1)

- [ ] Historique des aliments récents (top 5)
- [ ] Aliments favoris (étoile pour sauvegarder)
- [ ] Quantités rapides (50g, 100g, 150g, 200g)

### Moyen terme (P2)

- [ ] Scan barcode dans le modal
- [ ] Entrée vocale ("200g de poulet")
- [ ] Duplication d'un repas précédent
- [ ] Suggestion basée sur l'heure (matin → petit-déjeuner)

### Long terme (P3)

- [ ] IA pour suggestion d'aliments (contexte utilisateur)
- [ ] Détection automatique portions visuelles
- [ ] Synchronisation offline (PWA)

## Ressources

### Documentation

- Nutritional Data Source: USDA FoodData Central, CIQUAL
- Icons: Lucide React
- Animations: Tailwind CSS
- State Management: React Query v5

### Fichiers clés

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── QuickAddModal.tsx          ← NOUVEAU
│   │   └── ui/
│   │       └── QuickActionsFAB.tsx        ← MODIFIÉ
│   ├── data/
│   │   └── nutritionReference.ts
│   ├── services/
│   │   └── visionApi.ts
│   ├── types/
│   │   └── foodLog.ts
│   └── i18n/
│       └── locales/
│           ├── en/
│           │   ├── dashboard.json         ← MODIFIÉ
│           │   └── vision.json            ← MODIFIÉ
│           ├── fr/...                     ← MODIFIÉ
│           ├── de/...                     ← MODIFIÉ
│           ├── es/...                     ← MODIFIÉ
│           ├── pt/...                     ← MODIFIÉ
│           ├── zh/...                     ← MODIFIÉ
│           └── ar/...                     ← MODIFIÉ
```

---

**Date de création**: 2026-01-18
**Auteur**: Claude Code (Anthropic)
**Version**: 1.0
