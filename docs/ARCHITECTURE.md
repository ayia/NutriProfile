# Architecture NutriProfile

## Vue d'ensemble

Application web nutritionnelle avec analyse IA multi-modèles.

## Backend (FastAPI)
```
backend/
├── app/
│   ├── main.py              # Point d'entrée FastAPI
│   ├── config.py            # Configuration pydantic-settings
│   ├── database.py          # Session SQLAlchemy
│   ├── api/v1/              # Routes par domaine
│   ├── models/              # Modèles SQLAlchemy
│   ├── schemas/             # Schémas Pydantic
│   ├── services/            # Logique métier
│   ├── agents/              # Système multi-agents
│   ├── llm/                 # Intégration Hugging Face
│   └── tasks/               # Tâches async (Celery/ARQ)
├── alembic/                 # Migrations
├── tests/
├── Dockerfile
└── fly.toml
```

## Frontend (React)
```
frontend/
├── src/
│   ├── components/          # Composants UI
│   ├── pages/               # Pages principales
│   ├── hooks/               # Custom hooks
│   ├── services/            # Appels API
│   ├── store/               # État Zustand
│   └── types/               # Types TypeScript
├── Dockerfile
└── fly.toml
```

## Flux de données

1. Utilisateur → Frontend React
2. Frontend → API FastAPI
3. API → Orchestrateur Agents
4. Orchestrateur → Multiples LLM Hugging Face
5. Validateur Consensus → Résultat fusionné
6. Résultat → Utilisateur