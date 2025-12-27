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
