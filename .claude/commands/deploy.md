# Déploiement CI/CD

Pipeline de déploiement complet NutriProfile avec tests automatisés, déploiement et Git automation.

## Usage

```bash
/deploy                    # Déploiement fullstack (frontend + backend)
/deploy frontend           # Frontend uniquement (Cloudflare Pages)
/deploy backend            # Backend uniquement (Fly.io)
/deploy --skip-tests       # Sauter les tests (urgence)
/deploy --dry              # Simulation sans déploiement réel
```

## Pipeline CI/CD Complet

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PHASE 1: VALIDATION (parallèle)                             │
│  ├─ [test-runner] Frontend tests (npm test)                  │
│  ├─ [test-runner] Backend tests (pytest)                     │
│  └─ [security-auditor] Security scan                         │
│                                                              │
│  PHASE 2: BUILD (parallèle)                                  │
│  ├─ [deploy-frontend] npm run build                          │
│  └─ [deploy-backend] Verify Dockerfile & fly.toml            │
│                                                              │
│  PHASE 3: DEPLOY BACKEND                                     │
│  ├─ [deploy-backend] Migrations (alembic upgrade head)       │
│  ├─ [deploy-backend] flyctl deploy                           │
│  └─ [deploy-backend] Health check                            │
│                                                              │
│  PHASE 4: DEPLOY FRONTEND                                    │
│  ├─ [deploy-frontend] wrangler pages deploy                  │
│  └─ [deploy-frontend] Health check                           │
│                                                              │
│  PHASE 5: POST-DEPLOY                                        │
│  ├─ [git-automation] Create git tag                          │
│  ├─ [git-automation] Commit + Push                           │
│  └─ [git-automation] Create PR (optionnel)                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Agents Impliqués

| Agent | Rôle |
|-------|------|
| `test-runner` | Exécute tests frontend (Vitest) et backend (pytest) |
| `security-auditor` | Vérifie vulnérabilités et secrets exposés |
| `deploy-backend` | Déploie sur Fly.io avec migrations |
| `deploy-frontend` | Déploie sur Cloudflare Pages |
| `git-automation` | Commit, push, tags, PR |

## Commandes par Cible

### Frontend (Cloudflare Pages)

```bash
# Tests
cd frontend && npm test -- --run

# Build
cd frontend && npm run build

# Deploy
npx wrangler pages deploy dist --project-name=nutriprofile

# Verify
curl -I https://nutriprofile.pages.dev
```

### Backend (Fly.io)

```bash
# Tests
cd backend && pytest --cov=app

# Migrations
cd backend && alembic upgrade head

# Deploy
"C:\Users\badre zouiri\.fly\bin\flyctl.exe" deploy -c backend/fly.toml --strategy immediate

# Verify
curl https://nutriprofile-api.fly.dev/health
```

## Prérequis

### Outils Installés
- [ ] Node.js 18+
- [ ] Python 3.11+
- [ ] Fly CLI (`flyctl`)
- [ ] Wrangler CLI (`npx wrangler`)
- [ ] Git

### Authentification
- [ ] `fly auth login`
- [ ] `wrangler login`
- [ ] `gh auth login` (pour PR)

### Secrets Configurés

**Fly.io:**
```bash
flyctl secrets list -a nutriprofile-api
# DATABASE_URL, JWT_SECRET, HUGGINGFACE_TOKEN
# LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_WEBHOOK_SECRET
```

**Cloudflare:**
```bash
# Variables d'environnement dans le dashboard ou wrangler.toml
```

## Checklist Pré-Déploiement

### Tests
- [ ] `npm test` passe (frontend)
- [ ] `pytest` passe (backend)
- [ ] Coverage >= 80%

### Code Quality
- [ ] Pas d'erreurs TypeScript
- [ ] Pas de console.log/debugger
- [ ] i18n complet (7 langues)
- [ ] Responsive vérifié

### Sécurité
- [ ] Pas de secrets dans le code
- [ ] Pas de vulnérabilités critiques
- [ ] CORS configuré correctement

## Rollback

### Backend (Fly.io)

```bash
# Lister les versions
flyctl releases list -a nutriprofile-api

# Rollback vers version précédente
flyctl deploy --image <previous-image>

# Rollback migration
cd backend && alembic downgrade -1
```

### Frontend (Cloudflare)

```bash
# Via le dashboard Cloudflare Pages
# Deployments > Select previous > Rollback
```

## Monitoring Post-Déploiement

```bash
# Logs backend
flyctl logs -a nutriprofile-api

# Status
flyctl status -a nutriprofile-api

# Métriques
# Dashboard Fly.io et Cloudflare
```

## Cible de ce Déploiement

$ARGUMENTS
