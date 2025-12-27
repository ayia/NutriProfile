---
paths: backend/**/*.py
---

# Règles Backend Python

## Conventions

- Utiliser async/await pour tous les endpoints
- Injection de dépendances via FastAPI Depends
- Gestion d'erreurs avec HTTPException personnalisées
- Logging structuré avec structlog
- Type hints obligatoires sur toutes les fonctions

## Structure des fichiers

- `app/api/v1/` : Routes par domaine
- `app/models/` : Modèles SQLAlchemy
- `app/schemas/` : Schémas Pydantic (request/response séparés)
- `app/services/` : Logique métier
- `app/agents/` : Agents LLM multi-modèles

## Patterns obligatoires

- Repository pattern pour l'accès données
- Service layer entre routes et repositories
- Schémas séparés : UserCreate, UserUpdate, UserResponse
- Toujours valider avec Pydantic avant traitement

## Monétisation (Lemon Squeezy)

- Vérifier limites tier AVANT chaque action limitée
- Incrémenter usage APRÈS succès de l'action
- Retourner HTTP 429 avec détails si limite atteinte
- Endpoints concernés: /vision/analyze, /recipes/generate, /coaching/*

```python
# Pattern pour endpoint avec limite
async def endpoint_with_limit(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    sub_service = SubscriptionService(db)
    allowed, used, limit = await sub_service.check_limit(
        current_user.id, "action_name"
    )
    if not allowed:
        raise HTTPException(status_code=429, detail={...})

    # ... logique ...

    await sub_service.increment_usage(current_user.id, "action_name")
```

## Webhooks

- Toujours vérifier signature HMAC
- Logger tous les événements reçus
- Retourner 200 même si événement non géré