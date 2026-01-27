# Structure du Projet NutriProfile

**Date de génération** : 2026-01-27
**Type de repository** : Multi-Part
**Nombre de parties** : 2

---

## Vue d'Ensemble

NutriProfile est une application web de profilage nutritionnel avec une architecture **client-serveur** moderne, composée de deux parties distinctes :

1. **Frontend** - Application web React avec TypeScript
2. **Backend** - API REST Python FastAPI

---

## Partie 1 : Frontend 🎨

### Métadonnées
- **ID de partie** : `frontend`
- **Type de projet** : `web`
- **Chemin racine** : `C:\Users\BadreZOUIRI\Desktop\bz\NutriProfile\frontend`
- **Langage principal** : TypeScript
- **Framework** : React 18.2.0

### Stack Technique
| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Runtime | React | 18.2.0 |
| Langage | TypeScript | (configuré) |
| Build Tool | Vite | (configuré) |
| Styling | Tailwind CSS | (configuré) |
| State Management | React Query | ^5.17.9 |
| Routing | React Router | (v6) |
| HTTP Client | Axios | ^1.6.5 |
| Internationalisation | i18next + react-i18next | ^25.7.3 / ^16.5.0 |
| Forms | React Hook Form | ^7.49.3 |
| Icons | Lucide React | ^0.312.0 |
| Testing | Vitest | (configuré) |
| UI Components | Custom (shadcn/ui style) | - |

### Architecture Pattern
- **Pattern** : Component-Based Architecture (React)
- **State Management** : React Query pour données serveur + React Context/Hooks pour état local
- **Routing** : Basé sur les pages (React Router v6)
- **Styling** : Utility-First CSS (Tailwind)

---

## Partie 2 : Backend ⚙️

### Métadonnées
- **ID de partie** : `backend`
- **Type de projet** : `backend`
- **Chemin racine** : `C:\Users\BadreZOUIRI\Desktop\bz\NutriProfile\backend`
- **Langage principal** : Python
- **Framework** : FastAPI 0.109.0

### Stack Technique
| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Runtime | Python | 3.11+ |
| Framework | FastAPI | 0.109.0 |
| Server | Uvicorn | 0.27.0 |
| Production Server | Gunicorn | 21.2.0 |
| ORM | SQLAlchemy | 2.0.25 (async) |
| Database Driver | asyncpg (PostgreSQL) | 0.29.0 |
| Migrations | Alembic | 1.13.1 |
| Validation | Pydantic | 2.5.3 |
| Authentication | python-jose + passlib | 3.3.0 / 1.7.4 |
| Caching | Redis | 5.0.1 |
| Rate Limiting | SlowAPI | 0.1.9 |
| Logging | Structlog | 24.1.0 |
| ML/AI | Hugging Face Hub | >=0.20.0 |
| ML/AI | Transformers | >=4.36.0 |
| ML/AI | Sentence Transformers | >=2.3.0 |
| HTTP Client | HTTPX | 0.26.0 |
| Testing | pytest + pytest-asyncio | 7.4.4 / 0.23.3 |
| PDF Generation | ReportLab | 4.0.8 |

### Architecture Pattern
- **Pattern** : Layered Architecture (API-centric)
- **API Style** : RESTful API
- **Database** : PostgreSQL (async operations)
- **Authentication** : JWT-based
- **Caching** : Redis
- **Architecture** : Async/await patterns

---

## Déploiement

### Backend
- **Plateforme** : Fly.io
- **Configuration** : `backend/fly.toml`
- **Docker** : `backend/Dockerfile`

### Frontend
- **Plateforme** : Fly.io / Cloudflare Pages
- **Configuration** : `frontend/fly.toml`
- **Docker** : `frontend/Dockerfile`
- **Server** : Nginx (pour servir les fichiers statiques)

---

## Fichiers de Configuration Racine

- `docker-compose.yml` - Orchestration Docker pour développement local
- `.env.docker` - Variables d'environnement Docker
- `CLAUDE.md` - Documentation principale du projet
- `.gitignore` - Règles Git
- `_bmad/` - Configuration BMAD pour workflows
- `docs/` - Documentation du projet

---

## Résumé

**Repository Type** : Multi-Part (2 parties)
**Architecture globale** : Client-Server (SPA + REST API)
**Communication** : HTTP/REST (Axios → FastAPI)
**Base de données** : PostgreSQL
**Caching** : Redis
**Déploiement** : Fly.io (Backend + Frontend)

---

*Document généré automatiquement par le workflow document-project*
