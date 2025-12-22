---
paths: backend/**/*.py
---

# Règles Backend Python

## Conventions

- Utiliser async/await pour tous les endpoints
- Injection de dépendances via FastAPI Depends
- Gestion d'erreurs avec HTTPException personnalisées
- Logging structuré avec structlog

## Structure des fichiers

- `app/api/v1/` : Routes par domaine
- `app/models/` : Modèles SQLAlchemy
- `app/schemas/` : Schémas Pydantic (request/response séparés)
- `app/services/` : Logique métier
- `app/agents/` : Agents LLM

## Patterns obligatoires

- Repository pattern pour l'accès données
- Service layer entre routes et repositories
- Schémas séparés : UserCreate, UserUpdate, UserResponse