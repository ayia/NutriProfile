# NutriProfile

Application web de profilage nutritionnel avec architecture multi-agents LLM.

## Stack Technique

- Backend : Python 3.11+, FastAPI, SQLAlchemy 2.0, Alembic
- Frontend : React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Base de données : PostgreSQL (Fly Postgres), Redis (Fly Redis)
- IA : Hugging Face Hub, LangChain/LangGraph, multi-agents avec consensus
- Déploiement : Fly.io exclusivement

## Règles Critiques

- TOUJOURS utiliser Pydantic pour les schémas avant de coder
- TOUJOURS créer les tests unitaires avec chaque fonctionnalité
- JAMAIS de code sans type hints Python
- JAMAIS déployer sans health check endpoint
- Chaque agent LLM doit avoir un fallback et un score de confiance

## Commandes

- `cd backend && uvicorn app.main:app --reload` : Serveur dev
- `cd frontend && npm run dev` : Frontend dev  
- `fly deploy` : Déploiement production
- `alembic upgrade head` : Migrations DB

## Structure Projet

Voir @docs/ARCHITECTURE.md pour l'architecture complète.
Voir @docs/AGENTS.md pour le système multi-agents.

## Workflow

1. Lire le Plan.md avant toute implémentation
2. Créer schéma Pydantic → modèle SQLAlchemy → endpoint → test
3. Mettre à jour Plan.md après chaque phase complétée
4. Demander validation avant de passer à la phase suivante