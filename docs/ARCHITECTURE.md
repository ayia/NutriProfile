# Architecture NutriProfile

## Vue d'ensemble

Application web nutritionnelle avec analyse IA multi-modèles, gamification et système freemium.

## Diagramme Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              UTILISATEUR                                     │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React/Vite)                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  Home   │ │Dashboard│ │ Vision  │ │ Recipes │ │Tracking │ │Settings │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ Zustand Store   │  │  React Query    │  │     i18n        │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (FastAPI)                                    │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                           API v1 Endpoints                            │   │
│  │  /auth  /users  /profiles  /vision  /recipes  /tracking  /dashboard  │   │
│  │  /coaching  /health  /subscriptions (à implémenter)                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                  │                                           │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                   │
│  │   Services    │  │   Schemas     │  │    Models     │                   │
│  │  (Business)   │  │  (Pydantic)   │  │ (SQLAlchemy)  │                   │
│  └───────────────┘  └───────────────┘  └───────────────┘                   │
│                                  │                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      SYSTÈME MULTI-AGENTS                             │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │   │
│  │  │ Profiling  │  │   Vision   │  │   Recipe   │  │   Coach    │      │   │
│  │  │   Agent    │  │   Agent    │  │   Agent    │  │   Agent    │      │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘      │   │
│  │                        │                                              │   │
│  │              ┌─────────────────────┐                                  │   │
│  │              │  Consensus Validator │                                 │   │
│  │              └─────────────────────┘                                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│      PostgreSQL           │   │   Hugging Face API        │
│      (Fly Postgres)       │   │   (BLIP-2, LLaVA,         │
│                           │   │    Mistral, Llama)        │
└───────────────────────────┘   └───────────────────────────┘
```

## Backend (FastAPI)

```
backend/
├── app/
│   ├── main.py              # Point d'entrée FastAPI, middleware CORS
│   ├── config.py            # Configuration pydantic-settings
│   ├── database.py          # Session SQLAlchemy async
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py      # JWT login/register/refresh
│   │       ├── users.py     # CRUD utilisateurs
│   │       ├── profiles.py  # Profil nutritionnel, BMR/TDEE
│   │       ├── vision.py    # Analyse photo repas
│   │       ├── recipes.py   # Génération recettes IA
│   │       ├── tracking.py  # Activité, poids, objectifs
│   │       ├── dashboard.py # Stats, achievements, streaks
│   │       ├── coaching.py  # Coach IA, tips, challenges
│   │       └── health.py    # Health check Fly.io
│   ├── models/
│   │   ├── user.py          # User, authentification
│   │   ├── profile.py       # Profile nutritionnel
│   │   ├── food_log.py      # FoodLog, FoodItem, DailyNutrition
│   │   ├── recipe.py        # Recipe, FavoriteRecipe, RecipeHistory
│   │   ├── activity.py      # ActivityLog, WeightLog, Goal
│   │   └── gamification.py  # Achievement, Streak, Notification, UserStats
│   ├── schemas/             # Schémas Pydantic (request/response)
│   ├── services/            # Logique métier
│   └── agents/
│       ├── base.py          # BaseAgent abstract class
│       ├── orchestrator.py  # Coordination multi-agents
│       ├── consensus.py     # Validation consensus multi-modèles
│       ├── profiling.py     # Agent profilage
│       ├── vision.py        # Agent vision (BLIP-2, LLaVA)
│       ├── recipe.py        # Agent recettes (Mistral, Llama)
│       └── coach.py         # Agent coaching
├── alembic/                 # Migrations DB (6 principales)
├── tests/
├── Dockerfile
├── fly.toml
└── requirements.txt
```

## Frontend (React)

```
frontend/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx           # Landing page
│   │   ├── LoginPage.tsx          # Connexion
│   │   ├── RegisterPage.tsx       # Inscription
│   │   ├── ForgotPasswordPage.tsx # Reset password (UI)
│   │   ├── OnboardingPage.tsx     # Wizard 5 étapes
│   │   ├── MainDashboardPage.tsx  # Dashboard principal
│   │   ├── VisionPage.tsx         # Analyse photo + historique
│   │   ├── RecipesPage.tsx        # Génération recettes
│   │   ├── TrackingPage.tsx       # Activité + poids
│   │   └── SettingsPage.tsx       # Paramètres compte
│   ├── components/
│   │   ├── auth/                  # Composants authentification
│   │   ├── dashboard/             # Widgets dashboard
│   │   ├── onboarding/            # Steps wizard
│   │   ├── vision/                # Upload, résultats, logs
│   │   ├── recipes/               # Cards, générateur
│   │   ├── tracking/              # Forms activité, graphiques
│   │   ├── layout/                # Header, Nav, Footer
│   │   └── ui/                    # Composants shadcn/ui
│   ├── services/
│   │   └── api.ts                 # Axios instance, interceptors
│   ├── store/
│   │   └── authStore.ts           # Zustand auth state
│   ├── hooks/                     # Custom React hooks
│   ├── types/                     # TypeScript interfaces
│   └── i18n/
│       ├── locales/
│       │   ├── en.json            # Traductions anglais
│       │   └── fr.json            # Traductions français
│       └── index.ts               # Configuration i18next
├── public/
├── Dockerfile
├── fly.toml
└── package.json
```

## Modèles de Données

### User & Profile
```
User
├── id, email, hashed_password
├── name, language_preference
├── subscription_tier (à ajouter: free/premium/pro)
└── created_at, updated_at

Profile
├── user_id (FK)
├── age, gender, height, weight
├── activity_level, fitness_goal
├── diet_type, allergies[]
├── bmr, tdee, daily_calories
├── protein_target, carbs_target, fat_target
└── health_conditions, medications
```

### Food & Nutrition
```
FoodLog
├── user_id, meal_type, image_url
├── detected_items[], user_corrections[]
├── total_calories, total_protein, etc.
└── confidence_score, created_at

DailyNutrition
├── user_id, date
├── target_*, actual_*
└── water_intake
```

### Activity & Goals
```
ActivityLog
├── user_id, activity_type
├── duration, intensity, distance
├── calories_burned, calories_source
└── heart_rate_avg, steps

WeightLog
├── user_id, weight
├── body_fat_percentage
└── muscle_mass

Goal
├── user_id, goal_type
├── target_value, current_value
├── period (daily/weekly/monthly)
└── is_completed
```

### Gamification
```
Achievement (20+ badges)
├── user_id, achievement_type
├── unlocked_at

Streak
├── user_id, streak_type
├── current_count, longest_count
├── last_activity_date

UserStats
├── user_id, xp, level (1-50)
├── total_meals_logged
├── total_recipes_generated
└── total_activities_logged
```

## Flux de Données

### Analyse Photo Repas
```
1. User upload photo → Frontend compresse image
2. POST /api/v1/vision/analyze avec image base64
3. Backend → Vision Agent → BLIP-2 + LLaVA en parallèle
4. Consensus Validator → Intersection détections
5. Estimation nutritionnelle → Création FoodLog
6. Response avec aliments détectés + confiance
7. User peut corriger → PATCH /api/v1/vision/logs/{id}
```

### Génération Recette
```
1. User saisit ingrédients + préférences
2. POST /api/v1/recipes/generate
3. Backend charge profil utilisateur (allergies, objectifs)
4. Recipe Agent → Mistral + Llama + Mixtral
5. Consensus → Fusion recettes, moyenne temps
6. Calcul nutrition par portion
7. Sauvegarde Recipe + RecipeHistory
8. Response avec recette + instructions
```

## Sécurité

- JWT tokens (access: 30min, refresh: 7 jours)
- Password hashing bcrypt
- CORS configuré pour domaines autorisés
- Rate limiting sur endpoints sensibles
- Validation Pydantic sur toutes les entrées
- HTTPS obligatoire en production

## Déploiement (Fly.io)

```yaml
# backend/fly.toml
app = "nutriprofile-api"
primary_region = "cdg"

[env]
  DATABASE_URL = "postgres://..."

[http_service]
  internal_port = 8000
  force_https = true

[[services.http_checks]]
  path = "/health"
```

## Métriques & Monitoring

- Health check: `/health` et `/api/v1/health`
- Logs Fly.io: `fly logs -a nutriprofile-api`
- Métriques: PostHog (gratuit <1M events)
- Erreurs: Sentry (optionnel)
