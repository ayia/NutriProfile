# NutriProfile

Application web de profilage nutritionnel avec architecture multi-agents LLM.

## État du Projet (Décembre 2025)

**Phase actuelle**: Monétisation - Implémentation système de paiement
**Statut**: Application fonctionnelle, prête pour monétisation

### Fonctionnalités Implémentées
- Authentification JWT complète
- Profil nutritionnel (BMR/TDEE Mifflin-St Jeor)
- Analyse photo repas (BLIP-2, LLaVA)
- Génération recettes IA (Mistral, Llama, Mixtral)
- Suivi activité + poids
- Coach IA personnalisé
- Gamification (badges, streaks, niveaux 1-50)
- Dashboard statistiques
- Multi-langue (FR/EN)

### À Implémenter (Monétisation)
- Système de paiement Lemon Squeezy
- Limites par tier (gratuit/premium/pro)
- Export PDF
- Plans alimentaires IA
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

1. Lire la documentation pertinente avant toute implémentation
2. Créer schéma Pydantic → modèle SQLAlchemy → endpoint → test
3. Vérifier les limites freemium dans chaque endpoint concerné
4. Tester localement avant déploiement
5. Mettre à jour la documentation après changements majeurs
