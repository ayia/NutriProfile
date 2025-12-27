---
paths: fly.toml, Dockerfile, .github/workflows/**
---

# Déploiement Fly.io

## Configuration obligatoire

Backend : minimum 512MB RAM pour tâches IA
Health check : endpoint /health requis
Variables : toutes les clés API en secrets Fly

## Dockerfile Backend

Base : python:3.11-slim
Utiliser : uvicorn avec workers Gunicorn en prod
Port : 8080

## Services Fly.io

- fly postgres create : Base de données
- fly redis create : Cache et queues
- fly secrets set : Variables d'environnement

## CI/CD

GitHub Actions → fly deploy sur push main
Tests obligatoires avant déploiement

## Secrets Monétisation (Lemon Squeezy)

```bash
# Configurer les secrets pour le paiement
fly secrets set LEMONSQUEEZY_API_KEY=xxx -a nutriprofile-api
fly secrets set LEMONSQUEEZY_WEBHOOK_SECRET=xxx -a nutriprofile-api
fly secrets set LEMONSQUEEZY_STORE_ID=xxx -a nutriprofile-api

# Variant IDs des produits
fly secrets set LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID=xxx -a nutriprofile-api
fly secrets set LEMONSQUEEZY_PREMIUM_YEARLY_VARIANT_ID=xxx -a nutriprofile-api
fly secrets set LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=xxx -a nutriprofile-api
fly secrets set LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID=xxx -a nutriprofile-api
```

## Webhook URL

Configurer dans Lemon Squeezy dashboard :
`https://nutriprofile-api.fly.dev/api/v1/webhooks/lemonsqueezy`