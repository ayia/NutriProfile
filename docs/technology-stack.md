# Stack Technologique - NutriProfile

**Date de génération** : 2026-01-27
**Parties analysées** : 2 (Frontend + Backend)

---

## 🎨 Frontend - Application Web React

### Informations Générales
- **Type de projet** : Web Application (SPA)
- **Langage principal** : TypeScript
- **Framework** : React 18.2.0
- **Build Tool** : Vite 5.0.12
- **Pattern architectural** : Component-Based Architecture

### Stack Technique Détaillée

#### Core Technologies
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Runtime** | React | 18.2.0 | Framework UI moderne avec hooks et concurrent mode |
| **Langage** | TypeScript | 5.3.3 | Type safety et meilleure DX |
| **Build Tool** | Vite | 5.0.12 | Build ultra-rapide avec HMR, ESM natif |
| **Package Manager** | npm | - | Gestion des dépendances standard |

#### UI & Styling
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **CSS Framework** | Tailwind CSS | 3.4.1 | Utility-first CSS, responsive design |
| **PostCSS** | PostCSS | 8.4.33 | Processing CSS avec autoprefixer |
| **Autoprefixer** | Autoprefixer | 10.4.17 | Compatibilité cross-browser |
| **Icons** | Lucide React | 0.312.0 | Bibliothèque d'icônes moderne |
| **Utilities** | clsx | 2.1.0 | Gestion conditionnelle de classes CSS |
| **Utilities** | tailwind-merge | 2.2.0 | Fusion intelligente de classes Tailwind |
| **Utilities** | class-variance-authority | 0.7.0 | Variantes de composants type-safe |
| **Notifications** | Sonner | 2.0.7 | Toast notifications élégantes |

#### State Management & Data Fetching
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Server State** | React Query (@tanstack) | 5.17.9 | Gestion async data, cache, mutations |
| **Client State** | Zustand | 4.4.7 | State management léger et performant |
| **Local Database** | Dexie | 4.2.1 | IndexedDB wrapper pour offline storage |

#### Routing & Navigation
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Router** | React Router DOM | 6.21.2 | Routing déclaratif pour SPA |
| **Onboarding** | React Joyride | 2.9.3 | Guided tours pour nouveaux utilisateurs |

#### Forms & Validation
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Forms** | React Hook Form | 7.49.3 | Gestion performante des formulaires |

#### Internationalisation (i18n)
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **i18n Core** | i18next | 25.7.3 | Framework i18n complet |
| **React Integration** | react-i18next | 16.5.0 | Hooks React pour i18n |
| **Backend Loader** | i18next-http-backend | 3.0.2 | Chargement asynchrone des traductions |
| **Language Detection** | i18next-browser-languagedetector | 8.2.0 | Détection automatique de la langue |

**Langues supportées** : FR, EN, DE, ES, PT, ZH, AR (7 langues)

#### HTTP Client
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **HTTP Client** | Axios | 1.6.5 | Client HTTP avec interceptors |

#### Testing
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Test Runner** | Vitest | 1.2.1 | Test runner rapide compatible Vite |
| **Testing Library** | React Testing Library | 14.1.2 | Tests comportementaux des composants |
| **DOM Testing** | @testing-library/jest-dom | 6.2.0 | Matchers Jest pour le DOM |
| **User Events** | @testing-library/user-event | 14.5.2 | Simulation interactions utilisateur |
| **Coverage** | @vitest/coverage-v8 | 1.2.1 | Couverture de code avec V8 |
| **UI** | @vitest/ui | 1.2.1 | Interface graphique pour Vitest |
| **DOM Environment** | jsdom | 23.2.0 | Environnement DOM pour tests |

#### Development Tools
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Linting** | ESLint | 8.56.0 | Linting code JavaScript/TypeScript |
| **TS ESLint Parser** | @typescript-eslint/parser | 6.19.0 | Parser TypeScript pour ESLint |
| **TS ESLint Plugin** | @typescript-eslint/eslint-plugin | 6.19.0 | Règles TypeScript |
| **React Hooks Plugin** | eslint-plugin-react-hooks | 4.6.0 | Validation des hooks React |
| **React Refresh Plugin** | eslint-plugin-react-refresh | 0.4.5 | HMR pour React |

#### Build & Deployment
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Vite Plugin** | @vitejs/plugin-react | 4.2.1 | Plugin React pour Vite |
| **PWA** | vite-plugin-pwa | 1.2.0 | Progressive Web App support |
| **Image Optimization** | Sharp | 0.34.5 | Optimisation d'images |

### Architecture Frontend

**Pattern** : Component-Based Architecture (React)

**Structure des dossiers** :
```
frontend/src/
├── App.tsx                 # Composant racine
├── main.tsx                # Point d'entrée
├── components/             # Composants réutilisables
├── pages/                  # Pages/routes
├── services/               # API clients et services
├── store/                  # Zustand stores
├── hooks/                  # Custom React hooks
├── i18n/                   # Traductions (7 langues)
├── lib/                    # Utilitaires
├── types/                  # Types TypeScript
├── data/                   # Données statiques
└── test/                   # Configuration tests
```

**Patterns clés** :
- ✅ **Composition de composants** : Composants fonctionnels avec hooks
- ✅ **State management hybride** : React Query (server state) + Zustand (client state)
- ✅ **Code splitting** : Lazy loading avec React.lazy
- ✅ **Type safety** : TypeScript strict mode
- ✅ **Responsive design** : Mobile-first avec Tailwind breakpoints
- ✅ **Internationalisation** : 7 langues avec i18next
- ✅ **Offline support** : PWA + Dexie (IndexedDB)

---

## ⚙️ Backend - API REST FastAPI

### Informations Générales
- **Type de projet** : Backend API
- **Langage principal** : Python 3.11+
- **Framework** : FastAPI 0.109.0
- **Pattern architectural** : Layered Architecture (API-centric)
- **Architecture async** : asyncio + async/await patterns

### Stack Technique Détaillée

#### Core Framework
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Web Framework** | FastAPI | 0.109.0 | Framework async moderne, OpenAPI auto, validation Pydantic |
| **ASGI Server** | Uvicorn | 0.27.0 | Serveur ASGI performant avec support asyncio |
| **Production Server** | Gunicorn | 21.2.0 | WSGI server pour production avec workers |

#### Database & ORM
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **ORM** | SQLAlchemy | 2.0.25 | ORM Python avec support async complet |
| **PostgreSQL Driver** | asyncpg | 0.29.0 | Driver async haute performance pour PostgreSQL |
| **SQLite Driver** | aiosqlite | 0.19.0 | Driver async SQLite (dev/test) |
| **Migrations** | Alembic | 1.13.1 | Migrations de schéma de base de données |

#### Validation & Configuration
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Validation** | Pydantic | 2.5.3 | Validation de données avec type hints |
| **Settings** | Pydantic Settings | 2.1.0 | Gestion de configuration avec validation |
| **Email Validation** | email-validator | 2.1.0 | Validation des adresses email |

#### Authentication & Security
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **JWT** | python-jose | 3.3.0 | Génération et validation de tokens JWT |
| **Password Hashing** | passlib | 1.7.4 | Hashing sécurisé des mots de passe |
| **Bcrypt** | bcrypt | 4.0.1 | Algorithme bcrypt pour hashing |
| **Multipart** | python-multipart | 0.0.6 | Support upload de fichiers |

#### Caching & Performance
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Cache** | Redis | 5.0.1 | Cache distribué, sessions, queues |
| **Rate Limiting** | SlowAPI | 0.1.9 | Rate limiting pour endpoints API |

#### Machine Learning & AI
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **ML Hub** | Hugging Face Hub | >=0.20.0 | Accès aux modèles Hugging Face |
| **Transformers** | Transformers | >=4.36.0 | Modèles de vision (BLIP-2, LLaVA) |
| **Embeddings** | Sentence Transformers | >=2.3.0 | Embeddings sémantiques multilingues |
| **ML Utilities** | scikit-learn | >=1.3.0 | Utilitaires ML (preprocessing, métriques) |

**Note** : PyTorch et NumPy sont installés automatiquement comme dépendances de sentence-transformers

#### HTTP Client & Utilities
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **HTTP Client** | HTTPX | 0.26.0 | Client HTTP async moderne |
| **Logging** | Structlog | 24.1.0 | Logging structuré pour observabilité |

#### PDF Generation
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **PDF Generation** | ReportLab | 4.0.8 | Génération de rapports PDF |

#### Testing
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Test Framework** | pytest | 7.4.4 | Framework de test Python |
| **Async Testing** | pytest-asyncio | 0.23.3 | Support asyncio pour pytest |

### Architecture Backend

**Pattern** : Layered Architecture (API-centric)

**Structure des dossiers** :
```
backend/app/
├── main.py                 # Point d'entrée FastAPI
├── config.py               # Configuration Pydantic
├── database.py             # Setup SQLAlchemy async
├── api/                    # Endpoints API REST
│   └── v1/                 # API version 1
│       ├── auth.py         # Authentification JWT
│       ├── users.py        # CRUD utilisateurs
│       ├── profiles.py     # Profils nutritionnels
│       ├── vision.py       # Analyse photo repas
│       ├── recipes.py      # Génération recettes
│       ├── tracking.py     # Activité, poids
│       ├── dashboard.py    # Stats, achievements
│       └── coaching.py     # Coach IA
├── models/                 # Modèles SQLAlchemy
│   ├── user.py
│   ├── profile.py
│   ├── food_log.py
│   ├── recipe.py
│   ├── activity.py
│   └── gamification.py
├── schemas/                # Schémas Pydantic (DTO)
├── services/               # Logique métier
├── agents/                 # Agents IA multi-modèles
│   ├── base.py
│   ├── orchestrator.py
│   ├── consensus.py
│   ├── vision.py           # BLIP-2, LLaVA
│   ├── recipe.py           # Mistral, Llama, Mixtral
│   ├── coach.py
│   └── profiling.py
├── core/                   # Core utilities
├── i18n/                   # Traductions backend
├── llm/                    # Clients LLM
└── tasks/                  # Background tasks
```

**Patterns clés** :
- ✅ **Architecture en couches** : API → Services → Models
- ✅ **Async/await** : Async I/O pour performance
- ✅ **Type safety** : Pydantic pour validation
- ✅ **Multi-agents IA** : Vision, Recipe, Coach agents avec consensus
- ✅ **JWT Authentication** : Tokens sécurisés
- ✅ **Rate limiting** : Protection endpoints sensibles
- ✅ **Caching** : Redis pour performance
- ✅ **Migrations** : Alembic pour évolution schéma
- ✅ **Logging structuré** : Structlog pour observabilité

---

## 🔗 Intégration Frontend ↔ Backend

### Communication
- **Protocol** : HTTP/HTTPS (REST API)
- **Client** : Axios (Frontend)
- **Server** : FastAPI (Backend)
- **Format** : JSON
- **Authentication** : JWT Bearer tokens

### Flux de données
```
Frontend (React)
    ↓ (HTTP Request avec Axios)
Backend API (FastAPI)
    ↓ (SQL via SQLAlchemy async)
PostgreSQL Database
    ↑ (Response JSON)
Frontend (React Query cache)
```

### Endpoints principaux
- `POST /api/v1/auth/login` - Authentification
- `POST /api/v1/auth/register` - Inscription
- `GET /api/v1/profiles/me` - Profil utilisateur
- `POST /api/v1/vision/analyze` - Analyse photo repas
- `POST /api/v1/recipes/generate` - Génération recette IA
- `GET /api/v1/dashboard/stats` - Statistiques utilisateur

---

## 🚀 Déploiement

### Backend
- **Plateforme** : Fly.io
- **Configuration** : `backend/fly.toml`
- **Container** : Docker (`backend/Dockerfile`)
- **Base de données** : Fly Postgres (managed PostgreSQL)
- **Cache** : Redis (Fly.io addon)
- **Health check** : `/health` endpoint

### Frontend
- **Plateforme** : Fly.io / Cloudflare Pages
- **Configuration** : `frontend/fly.toml`
- **Container** : Docker + Nginx (`frontend/Dockerfile`)
- **CDN** : Cloudflare (si Cloudflare Pages)
- **SSL** : Automatique

### CI/CD
- **GitHub Actions** : `.github/workflows/deploy-backend.yml`
- **Trigger** : Push sur branche `main`

---

## 📊 Résumé

### Frontend
- **Framework** : React 18.2 + TypeScript 5.3
- **Build** : Vite 5.0
- **State** : React Query + Zustand
- **UI** : Tailwind CSS
- **i18n** : 7 langues
- **Tests** : Vitest

### Backend
- **Framework** : FastAPI 0.109 + Python 3.11+
- **Database** : PostgreSQL + SQLAlchemy 2.0 (async)
- **Cache** : Redis
- **Auth** : JWT
- **ML/AI** : Hugging Face (BLIP-2, LLaVA, Mistral, Llama)
- **Tests** : pytest

---

*Document généré automatiquement par le workflow document-project*
