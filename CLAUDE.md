# NutriProfile

Application web de profilage nutritionnel avec architecture multi-agents LLM.

## État du Projet (Janvier 2026)

**Phase actuelle**: Monétisation - Système de paiement actif
**Statut**: Application fonctionnelle avec système freemium + trial

### Fonctionnalités Implémentées
- Authentification JWT complète
- Profil nutritionnel (BMR/TDEE Mifflin-St Jeor)
- Analyse photo repas (BLIP-2, LLaVA)
- **Édition aliments détectés par IA** (nouveau)
  - Autocomplete intelligent avec 30+ aliments
  - Calcul nutrition automatique en temps réel
  - Édition pré/post-sauvegarde avec synchronisation cache
  - Suppression individuelle d'aliments
- Génération recettes IA (Mistral, Llama, Mixtral)
- Suivi activité + poids
- Coach IA personnalisé
- Gamification (badges, streaks, niveaux 1-50)
- Dashboard statistiques
- Multi-langue (7 langues: FR/EN/DE/ES/PT/ZH/AR)
- Système de paiement Lemon Squeezy
- Limites par tier (gratuit/premium/pro)
- Trial 14 jours Premium à l'inscription
- **Tests automatisés** (nouveau)
  - Configuration Vitest avec 80%+ coverage
  - 51 tests unitaires et d'intégration
  - Mocks i18n, React Query, sonner

### À Implémenter
- Export PDF (Pro)
- Plans alimentaires IA (Pro)
- Intégration objets connectés

## Stack Technique

- Backend : Python 3.11+, FastAPI, SQLAlchemy 2.0 async, Alembic
- Frontend : React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Base de données : PostgreSQL (Fly Postgres)
- IA : Hugging Face Inference API, multi-agents avec consensus
- Déploiement : Fly.io
- Paiements : Lemon Squeezy (Maroc supporté)

## Règles Critiques

- TOUJOURS utiliser Pydantic pour les schémas avant de coder
- TOUJOURS créer les tests unitaires avec chaque fonctionnalité
- JAMAIS de code sans type hints Python
- JAMAIS déployer sans health check endpoint
- Chaque agent LLM doit avoir un fallback et un score de confiance
- Les limites freemium doivent être vérifiées côté backend
- TOUJOURS vérifier le trial avant de vérifier les limites

## Système de Monétisation

### Modèle Freemium + Trial

```
FLOW UTILISATEUR:
1. Inscription → 14 jours Premium GRATUIT automatique
2. Pendant trial → Accès complet aux features Premium
3. Après 14 jours → Retombe sur tier Free (limites appliquées)
4. L'utilisateur peut upgrade à tout moment via Lemon Squeezy
```

### Tiers et Limites

| Feature | Free | Premium (5€/mois) | Pro (10€/mois) |
|---------|------|-------------------|----------------|
| Analyses photo/jour | 3 | Illimité | Illimité |
| Recettes/semaine | 2 | 10 | Illimité |
| Coach IA/jour | 1 | 5 | Illimité |
| Historique | 7 jours | 90 jours | Illimité |
| Stats avancées | ❌ | ✅ | ✅ |
| Export PDF | ❌ | ❌ | ✅ |
| Plans repas IA | ❌ | ❌ | ✅ |

### Règles Backend Trial

```python
# Ordre de vérification du tier dans get_effective_tier():
1. Vérifier si trial actif (trial_ends_at > now) → return "premium"
2. Vérifier si subscription payée active → return subscription.tier
3. Sinon → return "free"

# À l'inscription (auth.py):
- Créer User avec subscription_tier="free"
- Définir trial_ends_at = now + 14 jours
- L'utilisateur bénéficie des limites Premium pendant 14 jours
```

### Champs Base de Données

```sql
-- Table users
trial_ends_at TIMESTAMP WITH TIME ZONE  -- Fin du trial (14 jours après inscription)

-- Table subscriptions (pour abonnements payés)
tier VARCHAR(20)           -- free/premium/pro
status VARCHAR(20)         -- active/cancelled/expired
current_period_end TIMESTAMP
ls_subscription_id VARCHAR  -- ID Lemon Squeezy
```

### Règles Frontend Trial

- Afficher bannière countdown quand trial actif
- Montrer jours restants dans le header/settings
- Après expiration, afficher modal upgrade
- Ne JAMAIS afficher "trial" si l'utilisateur a un abonnement payé

## Règles d'Internationalisation (i18n)

**IMPORTANT**: Toute chaîne de texte visible par l'utilisateur DOIT être internationalisée.

### Règles obligatoires
- JAMAIS de texte codé en dur dans les composants React
- TOUJOURS utiliser `useTranslation()` avec le namespace approprié
- TOUJOURS ajouter les traductions dans TOUTES les 7 langues: fr, en, de, es, pt, zh, ar
- TOUJOURS vérifier les fichiers i18n existants avant de créer de nouvelles clés

### Langues supportées
| Code | Langue | Direction |
|------|--------|-----------|
| fr | Français | LTR |
| en | Anglais | LTR |
| de | Allemand | LTR |
| es | Espagnol | LTR |
| pt | Portugais | LTR |
| zh | Chinois | LTR |
| ar | Arabe | RTL |

### Namespaces i18n
- `common` - Actions, navigation, unités, erreurs génériques
- `auth` - Authentification (login, register, forgot password)
- `dashboard` - Tableau de bord
- `tracking` - Suivi activité/poids
- `vision` - Analyse photo IA
- `recipes` - Génération de recettes
- `onboarding` - Onboarding utilisateur
- `settings` - Paramètres
- `home` - Page d'accueil publique
- `pricing` - Tarification
- `terms` - Conditions d'utilisation
- `privacy` - Politique de confidentialité
- `refund` - Politique de remboursement
- `pro` - Fonctionnalités Pro

### Exemple d'utilisation
```tsx
// Bon exemple
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation('recipes')
  return <h1>{t('title')}</h1>
}

// Mauvais exemple - NE JAMAIS FAIRE
function BadComponent() {
  return <h1>Recettes</h1> // Texte codé en dur!
}
```

### Checklist avant commit
- [ ] Aucune chaîne de texte codée en dur
- [ ] Traductions ajoutées pour les 7 langues
- [ ] Namespace approprié utilisé
- [ ] Clés de traduction cohérentes avec les fichiers existants

## Règles Responsive Design & UI/UX

**IMPORTANT**: L'application doit être 100% responsive et optimisée pour tous les écrans (375px à 1920px+).

### Approche Mobile-First

- TOUJOURS coder d'abord pour mobile, puis ajouter les breakpoints pour écrans plus grands
- Utiliser les breakpoints Tailwind CSS dans cet ordre : `base` → `sm:` → `md:` → `lg:` → `xl:`

### Breakpoints Tailwind CSS

| Préfixe | Largeur min | Usage |
|---------|-------------|-------|
| (base) | 0px | Mobile (iPhone SE, 375px) |
| `sm:` | 640px | Grands mobiles, petites tablettes |
| `md:` | 768px | Tablettes |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |

### Règles obligatoires

#### 1. Éléments décoratifs (blobs, backgrounds)
```tsx
// BON - Tailles responsives pour éviter overflow
className="w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] md:w-[500px] md:h-[500px]"

// MAUVAIS - Taille fixe cause overflow sur mobile
className="w-[500px] h-[500px]"
```

#### 2. Grilles CSS
```tsx
// BON - Colonnes adaptatives
className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"

// MAUVAIS - Trop de colonnes sur mobile
className="grid grid-cols-5"
```

#### 3. Modals et Dialogs
```tsx
// BON - Largeur calculée pour petits écrans
className="max-w-[calc(100vw-24px)] sm:max-w-md"

// MAUVAIS - Modal dépasse l'écran sur 375px
className="max-w-md"
```

#### 4. Typographie responsive
```tsx
// BON - Tailles adaptatives
className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"

// Navigation mobile
className="text-[10px] sm:text-xs"

// MAUVAIS - Texte trop grand sur mobile
className="text-5xl"
```

#### 5. Espacements (padding, gap, margin)
```tsx
// BON - Espacements réduits sur mobile
className="p-3 sm:p-4 md:p-6"
className="gap-2 sm:gap-4"
className="py-12 sm:py-24"

// MAUVAIS - Espacements fixes trop grands
className="p-6 gap-8"
```

#### 6. Boutons et éléments interactifs
```tsx
// BON - Zone tactile minimum 44px, padding adaptatif
className="px-3 sm:px-5 py-2 sm:py-3 min-h-[44px]"

// Boutons d'action
className="w-full sm:w-auto"
```

#### 7. Texte tronqué pour navigation
```tsx
// BON - Troncature avec max-width responsive
className="truncate max-w-[48px] sm:max-w-none"
```

### Patterns UI/UX à respecter

1. **Touch targets** : Minimum 44x44px pour tous les éléments cliquables sur mobile
2. **Safe area** : Utiliser `safe-area-bottom` pour la navigation mobile (iPhone notch)
3. **Overflow** : TOUJOURS `overflow-hidden` sur les conteneurs avec éléments décoratifs
4. **Z-index** : Navigation mobile `z-50`, modals `z-50`, overlays `z-40`
5. **Transitions** : Utiliser `transition-all` ou `transition-colors` pour les interactions

### Checklist Responsive avant commit

- [ ] Testé sur 375px (iPhone SE)
- [ ] Testé sur 768px (tablette)
- [ ] Testé sur 1024px+ (desktop)
- [ ] Aucun overflow horizontal
- [ ] Textes lisibles sur tous les écrans
- [ ] Boutons/liens facilement cliquables sur mobile
- [ ] Modals ne dépassent pas l'écran
- [ ] Navigation mobile fonctionnelle

## Commandes

```bash
# Développement
cd backend && uvicorn app.main:app --reload  # Serveur dev
cd frontend && npm run dev                    # Frontend dev

# Base de données
cd backend && alembic upgrade head           # Migrations DB
cd backend && alembic revision --autogenerate -m "description"

# Déploiement
fly deploy -c backend/fly.toml               # Backend
fly deploy -c frontend/fly.toml              # Frontend

# Tests
cd backend && pytest                         # Tests backend
cd frontend && npm test                      # Tests frontend
```

## Structure Projet

```
nutriprofile/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Endpoints (auth, users, profiles, vision, recipes, tracking, dashboard, coaching)
│   │   ├── models/          # SQLAlchemy (user, profile, food_log, recipe, activity, gamification)
│   │   ├── schemas/         # Pydantic
│   │   ├── agents/          # Multi-agents IA (base, orchestrator, consensus, vision, recipe, coach, profiling)
│   │   └── services/        # Logique métier
│   ├── alembic/             # Migrations
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── pages/           # 11 pages (Home, Login, Register, Onboarding, Dashboard, Vision, Recipes, Tracking, Settings...)
│   │   ├── components/      # UI components
│   │   ├── services/        # API calls
│   │   ├── store/           # Zustand
│   │   └── i18n/            # Traductions
│   └── public/
└── docs/                    # Documentation
```

## Documentation

- @docs/DEVELOPMENT_GUIDE.md - **Guide de développement complet** (nouveau)
  - Méthodologie décomposition features complexes
  - Standards code, tests, i18n, responsive
  - Exemples pratiques avec Vision Food Editing
  - Checklist pré-commit complète
- @docs/ARCHITECTURE.md - Architecture technique détaillée
- @docs/AGENTS.md - Système multi-agents IA
- @docs/API.md - Documentation API
- @docs/MONETIZATION_REPORT.md - Stratégie monétisation (Maroc)
- @docs/MONETIZATION_IMPLEMENTATION.md - Plan technique paiements

## Contexte Business (Maroc)

- **Paiements**: Lemon Squeezy (Maroc supporté, 5% + 0.50$)
- **Statut légal**: Auto-Entrepreneur recommandé (1% impôt)
- **Objectif Y1**: 500-2000€/mois récurrents

## Workflow Développement

### Méthodologie Générale

1. Lire la documentation pertinente avant toute implémentation
2. Pour le backend: Créer schéma Pydantic → modèle SQLAlchemy → endpoint → test
3. Pour le frontend: Créer composants → intégrations → traductions i18n → tests
4. Vérifier les limites freemium dans chaque endpoint concerné
5. Tester localement avant déploiement
6. Mettre à jour la documentation après changements majeurs

### Workflow Features Complexes (Auto Claude)

Pour les features complexes nécessitant plusieurs fichiers et étapes, suivre ce processus pour éviter la boucle infinie "Révision humaine" → "En cours":

#### 1. Analyse et Décomposition

**AVANT** de coder, décomposer la feature en tâches Auto Claude exécutables:

**Contraintes strictes par tâche:**
- Maximum 2,000 mots de description
- 1-2 phases maximum
- Maximum 5 fichiers modifiés
- Dépendances claires entre tâches
- Critères de succès mesurables

**Exemple de décomposition (Vision Food Editing):**
```
Tâche 1: Base de données nutrition (800 mots, 1 fichier, standalone)
  └─> nutritionReference.ts avec 30+ aliments

Tâche 2: Composant modal (1,200 mots, 1 fichier, dépend de Tâche 1)
  └─> EditFoodItemModal.tsx avec autocomplete

Tâche 3A: Intégration pré-save (900 mots, 1 fichier, dépend de Tâche 2)
  └─> AnalysisResult.tsx (state local)

Tâche 3B: Intégration post-save (1,000 mots, 1 fichier, dépend de Tâche 2)
  └─> FoodLogCard.tsx (API + cache)

Tâche 4: Traductions (500 mots, 7 fichiers, parallèle)
  └─> en/fr/de/es/pt/zh/ar/vision.json

Tâche 5: Tests (1,800 mots, 5 fichiers, dépend de Tâches 1-3)
  └─> vitest.config.ts + setup + 3 fichiers tests
```

#### 2. Implémentation par Tâche

Pour chaque tâche:

**a) Phase Planning (si nécessaire)**
- Utiliser `/plan` mode pour les tâches complexes
- Explorer le codebase
- Clarifier l'approche avec l'utilisateur via AskUserQuestion
- Sortir du plan mode avec ExitPlanMode

**b) Phase Implémentation**
- Créer/modifier les fichiers un par un
- Tester au fur et à mesure
- Corriger les erreurs immédiatement
- Marquer la tâche complète avant de passer à la suivante

**c) Phase Validation**
- Tests unitaires passent (npm test)
- Coverage atteint les seuils (80%+ statements/functions/lines, 75%+ branches)
- Pas d'erreurs TypeScript
- Traductions complètes pour les 7 langues

#### 3. Standards de Code Frontend

**Composants React:**
- Toujours TypeScript avec types stricts
- Props interfaces exportées
- Hooks React Query pour les mutations/queries
- Toast notifications avec sonner
- i18n avec useTranslation (namespace approprié)
- Responsive mobile-first (breakpoints Tailwind)

**Tests:**
- Vitest + React Testing Library
- Mocks dans src/test/setup.ts
- Nommer les tests en français (describe/it)
- Coverage: 80%+ pour les nouveaux fichiers
- Tests d'intégration avec mutations mockées

**Patterns UI:**
- Utiliser composants existants du projet (Button, Input, etc.)
- Pattern modal natif (fixed inset-0, backdrop, Escape key)
- Pas de dépendances externes inutiles (shadcn dialog/select)
- Dark mode support (dark:bg-*, dark:text-*)

#### 4. i18n Obligatoire

**TOUTE** chaîne de texte visible doit être internationalisée:

```tsx
// ❌ MAUVAIS
<h1>Edit food</h1>

// ✅ BON
const { t } = useTranslation('vision')
<h1>{t('editFood')}</h1>
```

**Namespaces disponibles:**
- `common` - Actions, navigation, unités, erreurs
- `vision` - Analyse photo IA
- `recipes` - Génération recettes
- `dashboard` - Tableau de bord
- `tracking` - Suivi activité/poids
- `pricing` - Tarification
- `auth` - Authentification

**Langues obligatoires:** FR, EN, DE, ES, PT, ZH, AR

#### 5. Checklist Pré-Commit

Avant de marquer une feature complète:

- [ ] Tous les tests passent (npm test)
- [ ] Coverage atteint 80%+ sur les nouveaux fichiers
- [ ] Aucun texte codé en dur (i18n complet)
- [ ] Traductions pour les 7 langues
- [ ] Responsive testé (375px, 768px, 1024px+)
- [ ] Pas de console.log/debugger
- [ ] Types TypeScript stricts
- [ ] Documentation mise à jour (CLAUDE.md)

#### 6. Exemple Complet

Voir l'implémentation **Vision Food Editing** (Janvier 2026) comme référence:

**Fichiers créés:**
- `frontend/src/data/nutritionReference.ts` - Base nutrition
- `frontend/src/components/vision/EditFoodItemModal.tsx` - Composant modal
- `frontend/vitest.config.ts` - Config tests
- `frontend/src/test/setup.ts` - Setup mocks
- `frontend/src/data/__tests__/nutritionReference.test.ts` - 28 tests
- `frontend/src/components/vision/__tests__/EditFoodItemModal.test.tsx` - 16 tests
- `frontend/src/components/vision/__tests__/EditFoodItemIntegration.test.tsx` - 7 tests

**Fichiers modifiés:**
- `frontend/src/components/vision/AnalysisResult.tsx` - Intégration pré-save
- `frontend/src/components/vision/FoodLogCard.tsx` - Intégration post-save
- `frontend/src/i18n/locales/{en,fr,de,es,pt,zh,ar}/vision.json` - 17 clés
- `frontend/package.json` - Scripts tests + dépendances

**Résultats:**
- 51 tests passés (100%)
- Coverage: nutritionReference.ts (100%), EditFoodItemModal.tsx (98.49%)
- Aucune erreur TypeScript
- Feature complète et déployable
