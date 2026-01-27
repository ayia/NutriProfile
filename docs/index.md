# Documentation NutriProfile - Master Index

**Date de génération** : 2026-01-27
**Version** : 1.0.0
**Type de projet** : Multi-Part (Frontend React + Backend FastAPI)

---

## 🎯 Vue d'Ensemble

NutriProfile est une **application web de profilage nutritionnel** avec analyse IA multi-modèles, gamification et système freemium.

### Informations Rapides

- **Architecture** : Client-Server (SPA React + REST API FastAPI)
- **Parties** : 2 (Frontend + Backend)
- **Langages** : TypeScript (Frontend), Python (Backend)
- **Base de données** : PostgreSQL
- **Déploiement** : Fly.io
- **Monétisation** : Lemon Squeezy (Free/Premium/Pro)
- **i18n** : 7 langues (FR/EN/DE/ES/PT/ZH/AR)

---

## 📚 Navigation Rapide

### 🚀 Démarrage Rapide
- **[CLAUDE.md](../CLAUDE.md)** - 🔥 **Point d'entrée principal** pour développeurs
- **[QUICK_START.md](./QUICK_START.md)** - Guide de démarrage rapide

### 📖 Documentation Technique
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture technique détaillée
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Guide de développement complet
- **[API.md](./API.md)** - Documentation API endpoints

### 🏗️ Structure du Projet
- **[project-structure.md](./project-structure.md)** - Vue d'ensemble de la structure
- **[source-tree-analysis.md](./source-tree-analysis.md)** - Arborescence complète annotée
- **[technology-stack.md](./technology-stack.md)** - Stack technique détaillée

---

## 🎨 Frontend - Application Web React

### Informations Générales
- **Type** : Web Application (SPA)
- **Framework** : React 18.2.0 + TypeScript 5.3.3
- **Build Tool** : Vite 5.0.12
- **Pattern** : Component-Based Architecture

### Documentation Frontend
- **[ui-component-inventory-frontend.md](./ui-component-inventory-frontend.md)** - Inventaire complet des 74 composants UI
- **[technology-stack.md#frontend](./technology-stack.md#frontend)** - Stack technique frontend

### Structure Frontend
```
frontend/src/
├── pages/              # 11 pages/routes
├── components/         # 74 composants (auth, dashboard, vision, recipes, etc.)
├── services/           # API clients (Axios)
├── store/              # Zustand stores
├── hooks/              # Custom React hooks
├── i18n/locales/       # Traductions (7 langues)
└── test/               # Tests Vitest
```

### Technologies Clés Frontend
- **UI** : React 18.2, TypeScript, Tailwind CSS
- **State** : React Query (server state) + Zustand (client state)
- **Routing** : React Router v6
- **i18n** : i18next (7 langues)
- **Tests** : Vitest + React Testing Library
- **PWA** : Service Workers + Offline support

---

## ⚙️ Backend - API REST FastAPI

### Informations Générales
- **Type** : Backend API
- **Framework** : FastAPI 0.109.0 + Python 3.11+
- **Pattern** : Layered Architecture (API-centric)
- **Database** : PostgreSQL + SQLAlchemy 2.0 (async)

### Documentation Backend
- **[api-contracts-backend.md](./api-contracts-backend.md)** - **97 endpoints API** documentés
- **[data-models-backend.md](./data-models-backend.md)** - **7 modules, 16+ tables** documentés
- **[AGENTS.md](./AGENTS.md)** - Système multi-agents IA
- **[technology-stack.md#backend](./technology-stack.md#backend)** - Stack technique backend

### Structure Backend
```
backend/app/
├── api/v1/             # 97 endpoints API REST
├── models/             # 7 modules SQLAlchemy (16+ tables)
├── schemas/            # Pydantic validation schemas
├── services/           # Logique métier
├── agents/             # Multi-agents IA (BLIP-2, LLaVA, Mistral, Llama)
├── core/               # Security, exceptions
└── llm/                # Clients LLM (Hugging Face)
```

### Technologies Clés Backend
- **API** : FastAPI, Uvicorn, Gunicorn
- **ORM** : SQLAlchemy 2.0 (async), asyncpg
- **Auth** : JWT (python-jose), bcrypt
- **Cache** : Redis
- **ML/IA** : Hugging Face, Transformers, Sentence Transformers
- **Tests** : pytest

---

## 🔗 Intégration Frontend ↔ Backend

### Communication
- **Protocol** : HTTP/REST (HTTPS en production)
- **Client** : Axios (Frontend)
- **Server** : FastAPI (Backend)
- **Format** : JSON
- **Auth** : JWT Bearer tokens

### Endpoints Principaux
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/v1/auth/login` | POST | Authentification JWT |
| `/api/v1/vision/analyze` | POST | Analyse photo repas (IA) |
| `/api/v1/recipes/generate` | POST | Génération recette (IA) |
| `/api/v1/dashboard/stats` | GET | Statistiques utilisateur |
| `/api/v1/subscriptions/status` | GET | Statut abonnement |

**Documentation complète** : [api-contracts-backend.md](./api-contracts-backend.md)

---

## 🤖 Système Multi-Agents IA

### Architecture IA
```
Orchestrateur
    ├── Vision Agent (BLIP-2 + LLaVA)
    ├── Recipe Agent (Mistral + Llama + Mixtral)
    ├── Coach Agent (Mistral + Llama)
    └── Profiling Agent (calculs BMR/TDEE)
        ↓
Consensus Validator (fusion résultats)
```

### Fonctionnalités IA
- ✅ **Analyse photo repas** : Détection aliments multi-modèles (BLIP-2, LLaVA)
- ✅ **Génération recettes** : Consensus 3 modèles (Mistral, Llama, Mixtral)
- ✅ **Coach IA** : Conseils personnalisés basés sur historique
- ✅ **Calculs nutritionnels** : BMR/TDEE (Mifflin-St Jeor)

**Documentation complète** : [AGENTS.md](./AGENTS.md)

---

## 💳 Système de Monétisation

### Modèle Freemium + Trial
- **Trial** : 14 jours Premium GRATUIT à l'inscription
- **Free** : 3 analyses/jour, 2 recettes/semaine
- **Premium** : Illimité analyses, 10 recettes/semaine - **5€/mois**
- **Pro** : Tout illimité + export PDF + plans repas - **10€/mois**

### Plateforme de Paiement
- **Provider** : Lemon Squeezy (Merchant of Record)
- **Webhooks** : Gestion lifecycle abonnements
- **Sécurité** : HMAC-SHA256 signature validation

**Documentation complète** : [MONETIZATION_IMPLEMENTATION.md](./MONETIZATION_IMPLEMENTATION.md)

---

## 🌍 Internationalisation (i18n)

### Langues Supportées (7)
| Code | Langue | Direction | Status |
|------|--------|-----------|--------|
| fr | Français | LTR | ✅ Complet |
| en | Anglais | LTR | ✅ Complet |
| de | Allemand | LTR | ✅ Complet |
| es | Espagnol | LTR | ✅ Complet |
| pt | Portugais | LTR | ✅ Complet |
| zh | Chinois | LTR | ✅ Complet |
| ar | Arabe | RTL | ✅ Complet |

### Implementation
- **Frontend** : i18next + react-i18next
- **Backend** : Traductions JSON
- **Namespaces** : 15+ namespaces (common, auth, vision, recipes, etc.)

**Documentation complète** : [I18N_PLAN.md](./I18N_PLAN.md)

---

## 🚀 Déploiement

### Environnements

| Environnement | Backend | Frontend | Database |
|---------------|---------|----------|----------|
| **Production** | Fly.io | Fly.io / Cloudflare Pages | Fly Postgres |
| **Staging** | - | - | - |
| **Development** | Local (uvicorn) | Local (vite) | Docker PostgreSQL |

### CI/CD
- **GitHub Actions** : `.github/workflows/deploy-backend.yml`
- **Trigger** : Push sur branche `main`
- **Process** : Build → Test → Deploy Fly.io

### Health Checks
- **Backend** : `GET /health`
- **Frontend** : Service Worker health
- **Database** : Connection pooling status

---

## 🧪 Tests & Qualité

### Frontend
- **Framework** : Vitest + React Testing Library
- **Coverage** : 80%+ statements/functions/lines, 75%+ branches
- **Tests** : 51 tests (unitaires + intégration)
- **Commande** : `npm test`

### Backend
- **Framework** : pytest + pytest-asyncio
- **Coverage** : À implémenter
- **Tests** : Tests API, models, services
- **Commande** : `pytest`

---

## 📋 Documentation Existante

### Documentation Principale (15 fichiers)
- ✅ [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture technique
- ✅ [API.md](./API.md) - Documentation API
- ✅ [AGENTS.md](./AGENTS.md) - Système multi-agents
- ✅ [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Guide développement
- ✅ [QUICK_START.md](./QUICK_START.md) - Démarrage rapide
- ✅ [MONETIZATION_IMPLEMENTATION.md](./MONETIZATION_IMPLEMENTATION.md) - Monétisation
- ✅ [I18N_PLAN.md](./I18N_PLAN.md) - Internationalisation
- ✅ [PERFORMANCE_OPTIMIZATIONS.md](./PERFORMANCE_OPTIMIZATIONS.md) - Optimisations
- ✅ [FEATURE_TEMPLATE.md](./FEATURE_TEMPLATE.md) - Template features
- ✅ [EXAMPLE_VISION_FOOD_EDITING.md](./EXAMPLE_VISION_FOOD_EDITING.md) - Exemple implémentation
- ✅ [NUTRITION_RESEARCH_REPORT.md](./NUTRITION_RESEARCH_REPORT.md) - Recherche nutrition
- ✅ [VOICE_LOGGING.md](./VOICE_LOGGING.md) - Logging vocal
- ✅ [QA_TEST_REPORT.md](./QA_TEST_REPORT.md) - Rapport QA
- ✅ [ISSUES_TRACKING.md](./ISSUES_TRACKING.md) - Tracking problèmes
- ✅ [README.md](./README.md) - Vue d'ensemble

### Documentation Backend Spécifique (4 fichiers)
- ✅ [backend/DOCKER_EMBEDDINGS.md](../backend/DOCKER_EMBEDDINGS.md) - Docker embeddings
- ✅ [backend/EMBEDDINGS_SUCCESS_REPORT.md](../backend/EMBEDDINGS_SUCCESS_REPORT.md) - Rapport embeddings
- ✅ [backend/MULTILINGUAL_SEARCH_README.md](../backend/MULTILINGUAL_SEARCH_README.md) - Recherche multilingue
- ✅ [backend/QA_REPORT.md](../backend/QA_REPORT.md) - QA backend

### Documentation Générée (Ce Scan) (8 fichiers)
- ✅ [project-structure.md](./project-structure.md) - Structure projet
- ✅ [project-parts.json](./project-parts.json) - Métadonnées parties
- ✅ [technology-stack.md](./technology-stack.md) - Stack technique
- ✅ [api-contracts-backend.md](./api-contracts-backend.md) - Contrats API (97 endpoints)
- ✅ [data-models-backend.md](./data-models-backend.md) - Modèles données (16+ tables)
- ✅ [ui-component-inventory-frontend.md](./ui-component-inventory-frontend.md) - Inventaire UI (74 composants)
- ✅ [source-tree-analysis.md](./source-tree-analysis.md) - Arborescence complète
- ✅ [existing-documentation-inventory.md](./existing-documentation-inventory.md) - Inventaire docs

**Total : 27 fichiers de documentation**

---

## 🎓 Pour les Nouveaux Développeurs

### Parcours Recommandé

1. **Commencer ici** : [CLAUDE.md](../CLAUDE.md) - Point d'entrée principal
2. **Quick Start** : [QUICK_START.md](./QUICK_START.md) - Setup environnement
3. **Architecture** : [ARCHITECTURE.md](./ARCHITECTURE.md) - Comprendre le système
4. **Dev Guide** : [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Standards et workflow
5. **API** : [api-contracts-backend.md](./api-contracts-backend.md) - Endpoints disponibles

### Commandes Essentielles

```bash
# Setup
git clone <repo>
cd NutriProfile

# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload  # http://localhost:8000

# Tests
cd frontend && npm test
cd backend && pytest
```

---

## 🔍 Recherche dans la Documentation

### Par Catégorie

**Architecture & Design**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Vue système globale
- [AGENTS.md](./AGENTS.md) - Architecture multi-agents IA

**API & Contrats**
- [api-contracts-backend.md](./api-contracts-backend.md) - 97 endpoints documentés
- [API.md](./API.md) - Documentation API complète

**Données & Modèles**
- [data-models-backend.md](./data-models-backend.md) - 16+ tables PostgreSQL
- [technology-stack.md](./technology-stack.md) - Technologies utilisées

**UI & Frontend**
- [ui-component-inventory-frontend.md](./ui-component-inventory-frontend.md) - 74 composants
- [source-tree-analysis.md](./source-tree-analysis.md) - Structure complète

**Business & Monétisation**
- [MONETIZATION_IMPLEMENTATION.md](./MONETIZATION_IMPLEMENTATION.md) - Système paiements

**Développement**
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Guide complet
- [FEATURE_TEMPLATE.md](./FEATURE_TEMPLATE.md) - Template features

---

## 📊 Statistiques du Projet

### Code
- **Composants Frontend** : 74
- **Endpoints API** : 97
- **Tables DB** : 16+
- **Modèles IA** : 5 (BLIP-2, LLaVA, Mistral, Llama, Mixtral)

### Documentation
- **Fichiers totaux** : 27
- **Documentation existante** : 21
- **Documentation générée** : 8
- **Langues i18n** : 7

### Tests
- **Tests Frontend** : 51
- **Coverage Frontend** : 80%+

---

## 🆘 Support & Ressources

### Documentation Claude Code
- [.claude/README.md](../.claude/README.md) - Configuration Claude Code
- [.claude/skills/README.md](../.claude/skills/README.md) - Claude Agent Skills

### Liens Externes
- **Fly.io** : https://fly.io/apps/nutriprofile-api
- **Lemon Squeezy** : Dashboard abonnements
- **Hugging Face** : https://huggingface.co/ (modèles IA)

---

## 📝 Notes Importantes

### ⚠️ Règles Critiques
- ✅ **TOUJOURS** utiliser Pydantic pour schémas avant de coder
- ✅ **TOUJOURS** créer tests unitaires avec chaque feature
- ✅ **JAMAIS** de code sans type hints Python
- ✅ **JAMAIS** déployer sans health check
- ✅ **TOUJOURS** internationaliser les textes (7 langues)
- ✅ **TOUJOURS** vérifier les limites freemium côté backend

### 🎯 Workflow Trial
1. Inscription → 14 jours Premium GRATUIT automatique
2. Pendant trial → Accès complet features Premium
3. Après 14 jours → Retombe sur Free (limites)
4. Upgrade possible à tout moment via Lemon Squeezy

---

## 🔄 Mises à Jour

**Dernière mise à jour** : 2026-01-27
**Par** : Document Project Workflow (BMAD)
**Version** : 1.0.0

Pour mettre à jour cette documentation, relancer le workflow :
```bash
/bmad-bmm-document-project
```

---

**👨‍💻 Développé avec ❤️ par l'équipe NutriProfile**

*Cette documentation a été générée automatiquement par le workflow document-project.*
*Master index pour AI-assisted development.*
