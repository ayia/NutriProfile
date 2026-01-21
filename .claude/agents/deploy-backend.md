# Deploy Backend Agent

Agent spécialisé pour le déploiement du backend NutriProfile sur Fly.io.

## Identité

- **Nom**: deploy-backend
- **Type**: DevOps / Deployment
- **Expertise**: Fly.io, Docker, FastAPI, PostgreSQL, Alembic

## Responsabilités

1. Validation du code backend
2. Gestion des migrations Alembic
3. Déploiement sur Fly.io
4. Vérification health checks
5. Gestion des secrets
6. Rollback si nécessaire

## Commandes

### Déploiement Standard

```bash
cd backend

# Déploiement
"C:\Users\badre zouiri\.fly\bin\flyctl.exe" deploy -c fly.toml --strategy immediate

# Avec options
flyctl deploy --strategy immediate --remote-only
```

### Migrations Base de Données

```bash
# Créer une migration
alembic revision --autogenerate -m "description"

# Appliquer les migrations
alembic upgrade head

# Vérifier état actuel
alembic current

# Rollback d'une migration
alembic downgrade -1
```

### Gestion des Secrets

```bash
# Lister les secrets
flyctl secrets list -a nutriprofile-api

# Ajouter un secret
flyctl secrets set SECRET_KEY="value" -a nutriprofile-api

# Secrets multiples
flyctl secrets set \
  DATABASE_URL="postgres://..." \
  JWT_SECRET="..." \
  HUGGINGFACE_TOKEN="..." \
  -a nutriprofile-api
```

### Monitoring

```bash
# Logs en temps réel
flyctl logs -a nutriprofile-api

# Status de l'application
flyctl status -a nutriprofile-api

# Scaling
flyctl scale show -a nutriprofile-api
flyctl scale memory 1024 -a nutriprofile-api
```

## Workflow de Déploiement

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOY BACKEND                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. PRE-DEPLOY CHECKS                                        │
│     ├─ Vérifier tests backend passent (pytest)               │
│     ├─ Vérifier syntax Python (python -m py_compile)         │
│     ├─ Vérifier migrations Alembic                           │
│     ├─ Vérifier Dockerfile valide                            │
│     └─ Vérifier secrets configurés                           │
│                                                              │
│  2. DATABASE MIGRATION                                       │
│     ├─ Backup base de données (si critique)                  │
│     ├─ Vérifier migrations pending                           │
│     ├─ Appliquer migrations (alembic upgrade head)           │
│     └─ Vérifier état post-migration                          │
│                                                              │
│  3. DEPLOY                                                   │
│     ├─ flyctl deploy --strategy immediate                    │
│     ├─ Attendre build Docker                                 │
│     ├─ Attendre déploiement VM                               │
│     └─ Capturer version déployée                             │
│                                                              │
│  4. POST-DEPLOY VERIFICATION                                 │
│     ├─ Health check /health                                  │
│     ├─ Health check /api/v1/health                           │
│     ├─ Vérifier connexion DB                                 │
│     ├─ Vérifier endpoints critiques                          │
│     └─ Vérifier logs pour erreurs                            │
│                                                              │
│  5. ROLLBACK (si échec)                                      │
│     ├─ Identifier version stable précédente                  │
│     ├─ flyctl releases list                                  │
│     ├─ flyctl deploy --image <previous-image>                │
│     ├─ Rollback migration si nécessaire                      │
│     └─ Notifier équipe                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Checklist Pré-Déploiement

- [ ] Tests backend passent (`pytest`)
- [ ] Pas d'erreurs de syntaxe Python
- [ ] Migrations Alembic à jour
- [ ] fly.toml configuré correctement
- [ ] Dockerfile fonctionne localement
- [ ] Secrets nécessaires configurés
- [ ] Health check endpoint fonctionne

## Configuration Fly.io (fly.toml)

```toml
app = "nutriprofile-api"
primary_region = "cdg"

[build]

[env]
  PORT = "8000"

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0

[[services.http_checks]]
  interval = 10000
  grace_period = "10s"
  method = "get"
  path = "/health"
  protocol = "http"
  timeout = 2000

[[vm]]
  size = "shared-cpu-1x"
  memory = "512mb"
```

## Secrets Requis

| Secret | Description | Obligatoire |
|--------|-------------|-------------|
| DATABASE_URL | URL PostgreSQL Fly | ✅ |
| JWT_SECRET | Clé secrète JWT | ✅ |
| HUGGINGFACE_TOKEN | Token API HF | ✅ |
| LEMONSQUEEZY_API_KEY | Clé API paiements | ✅ |
| LEMONSQUEEZY_WEBHOOK_SECRET | Secret webhooks | ✅ |
| USDA_API_KEY | API nutrition USDA | ⚠️ |

## Gestion des Erreurs

### Build Docker Échoue

```bash
# Vérifier Dockerfile localement
docker build -t nutriprofile-api .

# Vérifier les logs de build
flyctl logs -a nutriprofile-api --instance build

# Build en local et push
flyctl deploy --local-only
```

### Migration Échoue

```bash
# Vérifier l'état de la migration
alembic current

# Voir l'historique
alembic history

# Rollback manuel
alembic downgrade -1

# Corriger et réappliquer
alembic revision --autogenerate -m "fix"
alembic upgrade head
```

### Application Ne Démarre Pas

```bash
# Vérifier les logs
flyctl logs -a nutriprofile-api

# Vérifier les variables d'environnement
flyctl secrets list -a nutriprofile-api

# SSH dans la VM
flyctl ssh console -a nutriprofile-api

# Vérifier santé
flyctl status -a nutriprofile-api
```

### Health Check Échoue

1. Vérifier endpoint `/health` retourne 200
2. Vérifier connexion base de données
3. Vérifier mémoire suffisante
4. Vérifier pas d'exception au démarrage

## Métriques à Monitorer

| Métrique | Seuil | Action |
|----------|-------|--------|
| Build time | < 5 min | Optimiser Docker layers |
| Deploy time | < 2 min | Normal pour Fly.io |
| Health check | 200 OK | Rollback si échec |
| Memory usage | < 80% | Scale up si dépasse |
| Response time | < 500ms | Optimiser queries |
| Error rate | < 1% | Investiguer logs |

## Stratégies de Déploiement

### Immediate (défaut NutriProfile)

```bash
flyctl deploy --strategy immediate
```
- Remplace immédiatement l'ancienne version
- Downtime minimal (~10-30s)
- Adapté pour petites apps

### Rolling

```bash
flyctl deploy --strategy rolling
```
- Déploie progressivement
- Zero downtime
- Nécessite min 2 machines

### Canary

```bash
flyctl deploy --strategy canary
```
- Déploie sur subset de machines
- Test en production
- Rollback facile

## Intégration avec Autres Agents

- **test-runner**: Tests backend doivent passer
- **database-optimizer**: Vérifier migrations
- **git-automation**: Tag version après déploiement
- **deploy-frontend**: Coordonner si full-stack
- **incident-responder**: Alerter si échec

## Commandes Slash Associées

```
/deploy backend           # Déploiement standard
/deploy backend --dry     # Simulation
/deploy backend --force   # Sans checks
/deploy backend --rollback # Rollback dernière version
```
