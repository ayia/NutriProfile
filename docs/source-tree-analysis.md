# Analyse de l'Arborescence du Projet - NutriProfile

**Date de génération** : 2026-01-27
**Type de repository** : Multi-Part (Frontend + Backend)

---

## 🌳 Arborescence Complète

```
NutriProfile/
│
├── 📁 frontend/                          # Application React (Part 1: Web)
│   ├── 📁 src/
│   │   ├── App.tsx                      # Composant racine, routing
│   │   ├── main.tsx                     # Point d'entrée (React.createRoot)
│   │   ├── index.css                    # Styles globaux (Tailwind)
│   │   │
│   │   ├── 📁 pages/                    # Pages/Routes (11 pages)
│   │   │   ├── HomePage.tsx             # Landing page publique
│   │   │   ├── LoginPage.tsx            # Connexion
│   │   │   ├── RegisterPage.tsx         # Inscription + Trial 14j
│   │   │   ├── OnboardingPage.tsx       # Wizard 5 étapes
│   │   │   ├── MainDashboardPage.tsx    # Dashboard principal
│   │   │   ├── VisionPage.tsx           # Analyse photo repas
│   │   │   ├── RecipesPage.tsx          # Génération recettes IA
│   │   │   ├── TrackingPage.tsx         # Activité + poids
│   │   │   ├── SettingsPage.tsx         # Paramètres compte
│   │   │   ├── PricingPage.tsx          # Tarifs (Lemon Squeezy)
│   │   │   └── NotFoundPage.tsx         # 404
│   │   │
│   │   ├── 📁 components/               # Composants React (74 composants)
│   │   │   ├── 📁 auth/                 # Authentication guards
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   └── ProfileRequiredRoute.tsx
│   │   │   ├── 📁 layout/               # Structure app
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── BottomNav.tsx        # Navigation mobile
│   │   │   │   └── Footer.tsx
│   │   │   ├── 📁 dashboard/            # Dashboard widgets (16)
│   │   │   │   ├── HeroCard.tsx
│   │   │   │   ├── StatsRing.tsx
│   │   │   │   └── WeeklyChart.tsx
│   │   │   ├── 📁 vision/               # Analyse photo (15)
│   │   │   │   ├── ImageUploader.tsx
│   │   │   │   ├── AnalysisResult.tsx
│   │   │   │   ├── EditFoodItemModal.tsx # Édition aliments IA
│   │   │   │   └── FoodLogCard.tsx
│   │   │   ├── 📁 recipes/              # Recettes (6)
│   │   │   ├── 📁 tracking/             # Suivi (6)
│   │   │   ├── 📁 onboarding/           # Wizard (5 steps)
│   │   │   ├── 📁 subscription/         # Monétisation (6)
│   │   │   ├── 📁 ui/                   # Design system (15)
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── ...
│   │   │   └── 📁 common/               # Réutilisables (5)
│   │   │
│   │   ├── 📁 services/                 # API clients
│   │   │   ├── api.ts                   # Axios instance configurée
│   │   │   ├── authApi.ts               # Auth endpoints
│   │   │   ├── visionApi.ts             # Vision endpoints
│   │   │   ├── recipeApi.ts             # Recipe endpoints
│   │   │   └── subscriptionApi.ts       # Subscription endpoints
│   │   │
│   │   ├── 📁 store/                    # Zustand stores
│   │   │   ├── authStore.ts             # Auth state global
│   │   │   └── uiStore.ts               # UI state (modals, etc.)
│   │   │
│   │   ├── 📁 hooks/                    # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useProfile.ts
│   │   │   └── useSubscription.ts
│   │   │
│   │   ├── 📁 i18n/                     # Internationalisation (7 langues)
│   │   │   ├── index.ts                 # Config i18next
│   │   │   └── 📁 locales/
│   │   │       ├── 📁 en/               # Anglais
│   │   │       ├── 📁 fr/               # Français
│   │   │       ├── 📁 de/               # Allemand
│   │   │       ├── 📁 es/               # Espagnol
│   │   │       ├── 📁 pt/               # Portugais
│   │   │       ├── 📁 zh/               # Chinois
│   │   │       └── 📁 ar/               # Arabe (RTL)
│   │   │           ├── common.json
│   │   │           ├── auth.json
│   │   │           ├── vision.json
│   │   │           └── ...
│   │   │
│   │   ├── 📁 types/                    # Types TypeScript
│   │   │   ├── user.ts
│   │   │   ├── profile.ts
│   │   │   └── api.ts
│   │   │
│   │   ├── 📁 data/                     # Données statiques
│   │   │   └── nutritionReference.ts    # Base nutrition (30+ aliments)
│   │   │
│   │   ├── 📁 lib/                      # Utilitaires
│   │   │   ├── utils.ts                 # Helpers généraux
│   │   │   └── queryKeys.ts             # React Query keys
│   │   │
│   │   └── 📁 test/                     # Configuration tests
│   │       └── setup.ts                 # Vitest setup (mocks)
│   │
│   ├── 📁 public/                       # Assets statiques
│   │   ├── logo.svg
│   │   └── favicon.ico
│   │
│   ├── 📁 coverage/                     # Rapports coverage tests
│   ├── package.json                     # Dépendances npm
│   ├── vite.config.ts                   # Config Vite
│   ├── vitest.config.ts                 # Config tests
│   ├── tsconfig.json                    # Config TypeScript
│   ├── tailwind.config.js               # Config Tailwind CSS
│   ├── Dockerfile                       # Image Docker
│   └── fly.toml                         # Config Fly.io
│
├── 📁 backend/                          # API FastAPI (Part 2: Backend)
│   ├── 📁 app/
│   │   ├── main.py                      # Point d'entrée FastAPI
│   │   ├── config.py                    # Configuration Pydantic
│   │   ├── database.py                  # SQLAlchemy async setup
│   │   │
│   │   ├── 📁 api/v1/                   # Endpoints API REST (97 endpoints)
│   │   │   ├── __init__.py              # Router aggregation
│   │   │   ├── auth.py                  # Auth (login, register, refresh)
│   │   │   ├── users.py                 # CRUD users
│   │   │   ├── profiles.py              # Profils nutritionnels
│   │   │   ├── vision.py                # Analyse photo (65KB - le plus gros)
│   │   │   ├── recipes.py               # Génération recettes IA
│   │   │   ├── nutrition.py             # Données nutrition
│   │   │   ├── tracking.py              # Activité + poids
│   │   │   ├── dashboard.py             # Stats (30KB)
│   │   │   ├── coaching.py              # Coach IA
│   │   │   ├── subscriptions.py         # Abonnements Lemon Squeezy
│   │   │   ├── meal_plans.py            # Plans alimentaires (Pro)
│   │   │   ├── export.py                # Export PDF (Pro)
│   │   │   ├── barcode.py               # Scan codes-barres
│   │   │   ├── voice.py                 # Logging vocal
│   │   │   ├── webhooks.py              # Webhooks Lemon Squeezy (23KB)
│   │   │   └── health.py                # Health check
│   │   │
│   │   ├── 📁 models/                   # SQLAlchemy models (7 modules)
│   │   │   ├── __init__.py
│   │   │   ├── user.py                  # User + trial
│   │   │   ├── profile.py               # Profile nutritionnel
│   │   │   ├── food_log.py              # FoodLog + FoodItem + DailyNutrition
│   │   │   ├── recipe.py                # Recipe + FavoriteRecipe
│   │   │   ├── activity.py              # ActivityLog + WeightLog + Goal
│   │   │   ├── gamification.py          # Achievement + Streak + UserStats
│   │   │   └── subscription.py          # Subscription (Lemon Squeezy)
│   │   │
│   │   ├── 📁 schemas/                  # Pydantic schemas (DTO)
│   │   │   ├── user.py
│   │   │   ├── profile.py
│   │   │   ├── food_log.py
│   │   │   ├── recipe.py
│   │   │   └── subscription.py
│   │   │
│   │   ├── 📁 services/                 # Logique métier
│   │   │   ├── auth_service.py
│   │   │   ├── profile_service.py
│   │   │   ├── vision_service.py
│   │   │   └── subscription_service.py
│   │   │
│   │   ├── 📁 agents/                   # Multi-agents IA
│   │   │   ├── base.py                  # BaseAgent abstract
│   │   │   ├── orchestrator.py          # Orchestration agents
│   │   │   ├── consensus.py             # Validation consensus
│   │   │   ├── vision.py                # BLIP-2 + LLaVA
│   │   │   ├── recipe.py                # Mistral + Llama + Mixtral
│   │   │   ├── coach.py                 # Coach IA
│   │   │   └── profiling.py             # Calculs BMR/TDEE
│   │   │
│   │   ├── 📁 core/                     # Core utilities
│   │   │   ├── security.py              # JWT, password hashing
│   │   │   └── exceptions.py            # Custom exceptions
│   │   │
│   │   ├── 📁 llm/                      # Clients LLM
│   │   │   └── huggingface.py           # Client Hugging Face
│   │   │
│   │   ├── 📁 i18n/                     # Traductions backend
│   │   │   └── translations.json
│   │   │
│   │   └── 📁 tasks/                    # Background tasks
│   │       └── celery_app.py
│   │
│   ├── 📁 alembic/                      # Migrations DB
│   │   ├── env.py
│   │   ├── versions/                    # Fichiers migrations
│   │   │   ├── 001_initial_schema.py
│   │   │   ├── 002_add_recipes.py
│   │   │   ├── 003_add_gamification.py
│   │   │   └── ...
│   │   └── script.py.mako
│   │
│   ├── 📁 tests/                        # Tests pytest
│   ├── requirements.txt                 # Dépendances Python
│   ├── alembic.ini                      # Config Alembic
│   ├── Dockerfile                       # Image Docker
│   └── fly.toml                         # Config Fly.io
│
├── 📁 docs/                             # Documentation (21+ fichiers)
│   ├── README.md                        # Vue d'ensemble
│   ├── ARCHITECTURE.md                  # Architecture technique
│   ├── API.md                           # Documentation API
│   ├── AGENTS.md                        # Système multi-agents
│   ├── DEVELOPMENT_GUIDE.md             # Guide développement
│   ├── QUICK_START.md                   # Démarrage rapide
│   ├── MONETIZATION_IMPLEMENTATION.md   # Système paiements
│   ├── I18N_PLAN.md                     # Internationalisation
│   ├── project-structure.md             # Structure (ce document)
│   ├── technology-stack.md              # Stack technique
│   ├── api-contracts-backend.md         # Contrats API
│   ├── data-models-backend.md           # Modèles données
│   ├── ui-component-inventory-frontend.md # Inventaire composants
│   ├── existing-documentation-inventory.md # Inventaire docs
│   └── project-scan-report.json         # État workflow scan
│
├── 📁 .claude/                          # Claude Code configuration
│   ├── README.md                        # Documentation Claude
│   └── 📁 skills/                       # Claude Agent Skills
│       ├── README.md
│       ├── nutrition-analyzer/
│       ├── recipe-generator/
│       ├── test-writer/
│       └── ...
│
├── 📁 _bmad/                            # BMAD workflows
│   └── 📁 bmm/
│       ├── config.yaml                  # Config BMAD
│       └── workflows/
│
├── 📁 .github/                          # CI/CD
│   └── 📁 workflows/
│       └── deploy-backend.yml           # Auto-deploy backend
│
├── 📁 scripts/                          # Scripts utilitaires
├── 📁 logo/                             # Assets logo
├── CLAUDE.md                            # 🔥 Point d'entrée principal
├── docker-compose.yml                   # Orchestration Docker (dev)
├── .env.docker                          # Env vars Docker
├── .gitignore                           # Git ignore rules
└── README.md                            # (À créer si besoin)
```

---

## 🔑 Répertoires Critiques

### Frontend Critical Paths
| Répertoire | Rôle | Importance |
|------------|------|------------|
| `src/pages/` | Routes/pages principales | ⭐⭐⭐⭐⭐ |
| `src/components/` | Composants UI réutilisables | ⭐⭐⭐⭐⭐ |
| `src/services/` | API clients | ⭐⭐⭐⭐⭐ |
| `src/i18n/locales/` | Traductions 7 langues | ⭐⭐⭐⭐ |
| `src/store/` | State management global | ⭐⭐⭐⭐ |
| `src/hooks/` | Custom React hooks | ⭐⭐⭐ |

### Backend Critical Paths
| Répertoire | Rôle | Importance |
|------------|------|------------|
| `app/api/v1/` | Endpoints API REST | ⭐⭐⭐⭐⭐ |
| `app/models/` | Schéma base de données | ⭐⭐⭐⭐⭐ |
| `app/agents/` | Système multi-agents IA | ⭐⭐⭐⭐⭐ |
| `app/services/` | Logique métier | ⭐⭐⭐⭐ |
| `app/schemas/` | Validation Pydantic | ⭐⭐⭐⭐ |
| `alembic/versions/` | Migrations DB | ⭐⭐⭐⭐ |

---

## 🎯 Points d'Entrée

### Frontend
- **Dev** : `src/main.tsx` → React.createRoot
- **Build** : `vite build` → `dist/`
- **Routing** : `App.tsx` (React Router v6)

### Backend
- **Dev** : `app/main.py` → FastAPI app
- **Production** : Gunicorn + Uvicorn workers
- **Migrations** : `alembic upgrade head`

---

## 🔗 Points d'Intégration

### Frontend → Backend
```
src/services/api.ts (Axios)
    ↓ HTTP/REST
backend/app/api/v1/ (FastAPI)
    ↓ SQLAlchemy async
PostgreSQL Database
```

### Multi-parts Communication
```
frontend/ (React SPA)
    ↓ HTTPS (port 443)
backend/ (FastAPI API)
    ↓ PostgreSQL protocol
Fly Postgres (managed)
    ↓ Redis protocol
Redis Cache (Fly.io)
```

---

## 📦 Fichiers de Configuration Clés

### Racine
- `CLAUDE.md` - Documentation principale (18KB) **← Point d'entrée**
- `docker-compose.yml` - Orchestration locale
- `.gitignore` - Règles Git

### Frontend
- `package.json` - Dépendances npm, scripts
- `vite.config.ts` - Configuration Vite
- `vitest.config.ts` - Configuration tests
- `tsconfig.json` - Configuration TypeScript strict
- `tailwind.config.js` - Configuration Tailwind CSS
- `fly.toml` - Déploiement Fly.io

### Backend
- `requirements.txt` - Dépendances Python
- `alembic.ini` - Configuration migrations
- `fly.toml` - Déploiement Fly.io
- `Dockerfile` - Image Docker

---

## 🚀 Commandes Principales

### Frontend
```bash
cd frontend
npm install              # Installer dépendances
npm run dev              # Serveur dev (port 5173)
npm run build            # Build production
npm test                 # Lancer tests Vitest
npm run test:coverage    # Coverage tests
```

### Backend
```bash
cd backend
pip install -r requirements.txt    # Installer dépendances
alembic upgrade head               # Appliquer migrations
uvicorn app.main:app --reload      # Serveur dev (port 8000)
pytest                             # Lancer tests
```

### Déploiement
```bash
fly deploy -c backend/fly.toml     # Déployer backend
fly deploy -c frontend/fly.toml    # Déployer frontend
```

---

*Document généré automatiquement par le workflow document-project*
