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