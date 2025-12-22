# Plan de Développement NutriProfile

## Phase 1 : Fondations ✅

- [x] Structure projet backend/frontend
- [x] Configuration Fly.io (fly.toml, Dockerfile)
- [x] Authentification JWT (register, login, token)
- [x] Modèle User + schémas Pydantic
- [x] Health check endpoint

## Phase 2 : Système LLM ✅

- [x] Client Hugging Face Inference API
- [x] Registre des modèles avec métadonnées
- [x] Classe abstraite BaseAgent
- [x] Orchestrateur principal
- [x] Validateur de consensus

## Phase 3 : Onboarding ✅

- [x] Wizard questionnaire multi-étapes
- [x] Calcul BMR/TDEE
- [x] Génération profil nutritionnel
- [x] Stockage sécurisé données santé

## Phase 4 : Recettes ✅

- [x] Agent recettes avec multi-modèles
- [x] Endpoint génération recettes
- [x] Interface affichage recettes
- [x] Système favoris

## Phase 5 : Vision ✅

- [x] Agent vision multi-modèles
- [x] Endpoint analyse photo
- [x] Interface capture/upload photo
- [x] Affichage résultats avec corrections

## Phase 6 : Suivi ✅

- [x] Journal repas quotidien
- [x] Logging activités
- [x] Graphiques progression

## Phase 7 : Dashboard & Coaching ✅

- [x] Tableau de bord principal
- [x] Agent coach
- [x] Notifications
- [x] Gamification

## Notes de progression

### Phase 1 - Complétée le 21/12/2024

**Backend créé avec :**
- FastAPI + SQLAlchemy 2.0 async
- Authentification JWT complète (register/login)
- Modèle User avec schémas Pydantic
- Health check endpoint `/health`
- Alembic configuré pour migrations
- Structure : `app/{api,models,schemas,services,agents,llm,tasks}`
- Dockerfile + fly.toml configurés

**Frontend créé avec :**
- React 18 + TypeScript + Vite
- Tailwind CSS configuré
- React Query pour les requêtes
- Zustand pour le state management
- Pages : Home, Login, Register, Dashboard
- Composants : Button, Input, Layout, Header
- Dockerfile + nginx + fly.toml configurés

### Phase 2 - Complétée le 21/12/2024

**Système LLM créé avec :**
- `app/llm/client.py` : Client Hugging Face Inference API avec retry et gestion du loading
- `app/llm/models.py` : Registre des modèles (Mistral, Llama, Mixtral, BLIP-2, LLaVA)
- `app/agents/base.py` : Classe abstraite BaseAgent avec process, fallback, multi-model
- `app/agents/orchestrator.py` : Orchestrateur pour coordonner les agents
- `app/agents/consensus.py` : Validateur de consensus multi-modèles

**Modèles configurés :**
- Texte : Mistral-7B, Llama-3-70B, Mixtral-8x7B, Zephyr-7B (fallback)
- Vision : BLIP-2, LLaVA 1.5

**Stratégies de consensus :**
- Recettes : intersection des ingrédients + moyenne des temps
- Vision : intersection des détections + moyenne des quantités
- Nutrition : moyenne pondérée avec exclusion des outliers

### Phase 3 - Complétée le 21/12/2024

**Backend Onboarding :**
- `app/models/profile.py` : Modèle Profile avec enums (Gender, ActivityLevel, Goal, DietType)
- `app/schemas/profile.py` : Schémas Pydantic par étape + validation
- `app/services/nutrition.py` : Service calcul BMR/TDEE (Mifflin-St Jeor)
- `app/agents/profiling.py` : Agent de profilage avec recommandations IA
- `app/api/v1/profiles.py` : Endpoints CRUD + analyse IA
- `alembic/versions/002_create_profiles_table.py` : Migration

**Frontend Onboarding :**
- Wizard 5 étapes avec progress bar
- Step1: Infos de base (âge, genre, taille, poids)
- Step2: Activité et objectifs
- Step3: Préférences alimentaires et allergies
- Step4: Informations de santé
- Step5: Résumé avec preview des calculs nutritionnels
- Dashboard adaptatif (CTA onboarding si pas de profil)

**Calculs nutritionnels :**
- BMR via formule Mifflin-St Jeor
- TDEE avec multiplicateurs d'activité
- Macros adaptées selon l'objectif (perte, maintien, prise)

### Phase 4 - Complétée le 21/12/2024

**Backend Recettes :**
- `app/agents/recipe.py` : RecipeAgent avec prompts par régime/objectif, fallback déterministe
- `app/models/recipe.py` : Modèles Recipe, FavoriteRecipe, RecipeHistory
- `app/schemas/recipe.py` : Schémas génération, réponse, favoris, historique
- `app/api/v1/recipes.py` : Endpoints génération, historique, favoris (CRUD)
- `alembic/versions/003_create_recipes_tables.py` : Migration

**Frontend Recettes :**
- `RecipesPage.tsx` : Page principale avec onglets (Générer, Historique, Favoris)
- `RecipeGenerator.tsx` : Formulaire génération avec sélection repas, ingrédients, temps, portions
- `RecipeCard.tsx` : Carte recette avec infos nutritionnelles, ingrédients, instructions, favoris
- `recipeApi.ts` : Service API recettes
- `types/recipe.ts` : Types TypeScript

**Fonctionnalités :**
- Génération IA basée sur profil utilisateur (régime, allergies, objectifs)
- Ajout/retrait ingrédients disponibles
- Sélection type de repas (petit-déjeuner, déjeuner, dîner, snack)
- Score de confiance IA affiché
- Système favoris avec notes et rating
- Historique des recettes générées

### Phase 5 - Complétée le 21/12/2024

**Backend Vision :**
- `app/agents/vision.py` : VisionAgent avec détection aliments, estimation portions, table nutritionnelle de référence
- `app/models/food_log.py` : Modèles FoodLog, FoodItem, DailyNutrition
- `app/schemas/food_log.py` : Schémas analyse image, logs, items, résumé journalier
- `app/api/v1/vision.py` : Endpoints analyse, CRUD logs/items, résumé journalier, eau
- `alembic/versions/004_create_food_logs_tables.py` : Migration

**Frontend Vision :**
- `VisionPage.tsx` : Page avec onglets (Scanner, Aujourd'hui, Historique)
- `ImageUploader.tsx` : Composant upload/capture avec compression, drag & drop
- `AnalysisResult.tsx` : Affichage résultats avec édition inline des valeurs
- `FoodLogCard.tsx` : Carte repas avec détails et actions
- `visionApi.ts` : Service API vision avec helpers compression
- `types/foodLog.ts` : Types TypeScript

**Fonctionnalités :**
- Capture photo ou import galerie
- Compression automatique des images
- Analyse IA multi-modèles (BLIP-2, LLaVA)
- Détection aliments avec confiance
- Correction manuelle des valeurs
- Journal repas avec totaux journaliers
- Barres de progression objectifs
- Suivi hydratation

### Phase 6 - Complétée le 21/12/2024

**Backend Suivi :**
- `app/models/activity.py` : Modèles ActivityLog, WeightLog, Goal avec calcul calories MET
- `app/schemas/activity.py` : Schémas activités, poids, objectifs, statistiques
- `app/api/v1/tracking.py` : Endpoints CRUD activités/poids/objectifs + statistiques
- `alembic/versions/005_create_activity_tables.py` : Migration

**Frontend Suivi :**
- `TrackingPage.tsx` : Page avec onglets (Vue d'ensemble, Activités, Poids, Objectifs)
- `ProgressChart.tsx` : Graphique SVG de progression (calories, poids, activité)
- `ActivityForm.tsx` : Formulaire ajout activité avec types et intensité
- `WeightForm.tsx` : Formulaire pesée avec masse grasse/musculaire
- `GoalCard.tsx` : Carte objectif avec barre de progression
- `trackingApi.ts` : Service API suivi
- `types/tracking.ts` : Types TypeScript

**Fonctionnalités :**
- Suivi activités physiques avec 12 types (course, vélo, musculation, etc.)
- Calcul automatique calories brûlées via MET
- Historique de poids avec évolution
- Objectifs personnalisés (quotidien, hebdomadaire, mensuel)
- Graphiques de progression sur 7/14/30 jours
- Statistiques journalières et hebdomadaires
- Répartition des activités

### Phase 7 - Complétée le 21/12/2024

**Backend Dashboard & Coaching :**
- `app/agents/coach.py` : CoachAgent avec conseils personnalisés basés sur stats utilisateur
- `app/models/gamification.py` : Modèles Achievement, Streak, Notification, UserStats avec système XP/niveaux
- `app/schemas/dashboard.py` : Schémas dashboard complet avec stats rapides, coach, notifications
- `app/api/v1/dashboard.py` : Endpoints dashboard, coach, notifications, achievements, streaks
- `alembic/versions/006_create_gamification_tables.py` : Migration

**Frontend Dashboard :**
- `MainDashboardPage.tsx` : Dashboard principal avec vue d'ensemble complète
- `CoachCard.tsx` : Affichage conseils coach IA avec priorité et score confiance
- `StatsRing.tsx` : Anneaux de progression circulaires SVG
- `LevelProgress.tsx` : Affichage niveau et barre XP avec titres
- `NotificationBell.tsx` : Cloche notifications avec dropdown et compteur
- `dashboardApi.ts` : Service API dashboard
- `types/dashboard.ts` : Types TypeScript avec STREAK_LABELS, LEVEL_TITLES

**Fonctionnalités :**
- Dashboard principal avec stats du jour (calories, protéines, eau, activité)
- Agent coach IA avec conseils personnalisés selon objectifs et progression
- Système de gamification : XP, niveaux (1-50), titres progressifs
- 20+ achievements débloquables (repas, recettes, streaks, photos)
- Streaks pour encourager la régularité (repas, hydratation, activité)
- Notifications temps réel (achievements, conseils, rappels)
- Vue séries en cours et records personnels
- Actions rapides vers les autres sections

---

## Commandes de lancement

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8080

# Frontend
cd frontend
npm install
npm run dev
```
