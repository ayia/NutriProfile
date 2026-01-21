# NutriProfile Claude Code Configuration

Ce dossier contient la configuration complète de **Claude Code** pour NutriProfile, basée sur les standards:
- [Claude Agent Skills](https://github.com/anthropics/skills) - Standard ouvert Anthropic
- [Claude Cowork](https://claude.com/blog/skills) - Agent desktop Anthropic
- [Claude-flow](https://github.com/ruvnet/claude-flow) - Multi-agent orchestration
- [Claude-Code-Workflow](https://github.com/catlog22/Claude-Code-Workflow) - JSON-driven workflows

## Structure

```
.claude/
├── agents/              # 30+ agents spécialisés
├── commands/            # 10 commandes slash
├── workflows/           # 4 workflows JSON-driven (incluant CI/CD)
├── skills/              # 11 skills (voir skills/README.md)
└── settings.json        # Configuration Claude Code
```

## Agents Disponibles (30+)

### Domaine Application
| Agent | Description |
|-------|-------------|
| `frontend-expert` | React, TypeScript, Tailwind, React Query |
| `react-state-expert` | State management, hooks, synchronisation |
| `i18n-manager` | Traductions 7 langues |
| `responsive-auditor` | Mobile-first, breakpoints |

### Backend & API
| Agent | Description |
|-------|-------------|
| `api-designer` | REST API, FastAPI, Pydantic |
| `database-optimizer` | PostgreSQL, SQLAlchemy, queries |
| `security-auditor` | OWASP, RGPD, authentication |

### DevOps & Infra
| Agent | Description |
|-------|-------------|
| `deployment-manager` | Fly.io, Cloudflare, CI/CD |
| `devops-resolver` | Infrastructure, monitoring |
| `incident-responder` | Production issues, outages |

### CI/CD & Automation (NOUVEAU)
| Agent | Description |
|-------|-------------|
| `deploy-frontend` | Cloudflare Pages, Wrangler, builds React/Vite |
| `deploy-backend` | Fly.io, Docker, Alembic migrations |
| `test-runner` | Tests automatisés Vitest + pytest, coverage |
| `git-automation` | Commits, push, branches, Pull Requests |

### Quality & Testing
| Agent | Description |
|-------|-------------|
| `test-writer` | Vitest, pytest, coverage 80%+ |
| `debugger` | Error analysis, troubleshooting |
| `error-fixer` | Autonomous error detection/fix |
| `code-reviewer` | Code quality, best practices |

### Business & Product
| Agent | Description |
|-------|-------------|
| `product-manager` | Product strategy, roadmap |
| `business-analyst` | Metrics, KPIs, analytics |
| `ux-researcher` | User research, design |
| `seo-specialist` | SEO, web visibility |

### Research & Docs
| Agent | Description |
|-------|-------------|
| `research-analyst` | Market research, competitive analysis |
| `documentation-writer` | Technical docs, README |
| `prompt-engineer` | LLM prompts, AI features |

### Orchestration
| Agent | Description |
|-------|-------------|
| `orchestrator` | Master coordinator, task routing |

## Commandes Slash

| Commande | Description | Usage |
|----------|-------------|-------|
| `/new-feature` | Implémenter nouvelle feature | `/new-feature dark mode toggle` |
| `/debug` | Debugger un problème | `/debug login not working` |
| `/test` | Écrire des tests | `/test EditFoodItemModal` |
| `/deploy` | Déployer en production | `/deploy backend` |
| `/translate` | Ajouter traductions | `/translate "Save changes"` |
| `/review` | Code review | `/review src/components/vision/` |
| `/fix` | Corriger un bug | `/fix modal overflow on mobile` |
| `/security` | Audit sécurité | `/security auth endpoints` |
| `/responsive` | Audit responsive | `/responsive VisionPage` |
| `/analyze` | Analyser du code | `/analyze recipe generation` |

## Workflows JSON-Driven

### feature-workflow.json
Workflow complet pour implémenter une nouvelle fonctionnalité:
- Phase 1: Analysis & Planning (orchestrator)
- Phase 2: Backend Implementation (api-designer, database-optimizer)
- Phase 3: Frontend Implementation (frontend-expert, i18n-manager)
- Phase 4: Quality Assurance (test-writer, code-reviewer, security-auditor)
- Phase 5: Documentation (documentation-writer)

### bugfix-workflow.json
Workflow pour corriger un bug:
- Phase 1: Investigation (debugger, error-fixer)
- Phase 2: Fix Implementation
- Phase 3: Verification (test-writer, code-reviewer)
- Phase 4: Documentation

### deploy-workflow.json
Workflow de déploiement production:
- Phase 1: Pre-deployment checks (tests, security, build)
- Phase 2: Backend deployment (Fly.io)
- Phase 3: Frontend deployment (Cloudflare)
- Phase 4: Post-deployment verification

### cicd-workflow.json (NOUVEAU)
Pipeline CI/CD complet automatisé:
- Phase 1: Validation (tests frontend/backend en parallèle, security audit)
- Phase 2: Build (frontend build, backend Docker verification)
- Phase 3: Deploy Backend (migrations, Fly.io deploy, health check)
- Phase 4: Deploy Frontend (Cloudflare Pages, health check)
- Phase 5: Post-Deploy (git tag, commit, push, PR optionnel)

**Agents utilisés**: `test-runner`, `security-auditor`, `deploy-frontend`, `deploy-backend`, `git-automation`

## Comment Utiliser

### 1. Agents (automatique)
Claude Code sélectionne automatiquement l'agent approprié:
```
Vous: "Fix the responsive issue on mobile"
Claude: [Utilise responsive-auditor] Je vais analyser...
```

### 2. Commandes Slash
Invoquez directement une commande:
```
/new-feature user profile export
/test ProfilePage
/deploy --target backend
```

### 3. Workflows
Les workflows sont exécutés automatiquement pour les tâches complexes.
L'orchestrator coordonne les différents agents selon le workflow approprié.

## Architecture Hybride

Cette configuration combine 3 approches:

### 1. Claude-flow Style (Multi-Agent Orchestration)
- Orchestrator coordonne 25+ agents spécialisés
- Routing intelligent basé sur le type de tâche
- Exécution parallèle quand possible
- Consensus pour décisions critiques

### 2. Claude-Code-Workflow Style (JSON-Driven)
- Workflows définis en JSON avec phases et tâches
- Variables et conditions dynamiques
- Validation et rollback automatiques
- Dépendances entre tâches

### 3. Claude Skills (Anthropic Standard)
- Skills SKILL.md avec frontmatter YAML
- Progressive disclosure (charge selon besoin)
- Permissions par skill
- Compatible avec Claude.ai, Claude Code, API

## Avantages

1. **Productivité**: Tâches complexes automatisées
2. **Qualité**: Standards enforced (tests, i18n, responsive)
3. **Consistance**: Même workflow pour tous les devs
4. **Documentation**: Contexte préservé dans les agents
5. **Évolutivité**: Facile d'ajouter agents/workflows

## Personnalisation

### Ajouter un Agent
1. Créer `.claude/agents/mon-agent.md`
2. Suivre le format avec frontmatter YAML
3. L'agent sera auto-découvert

### Ajouter une Commande
1. Créer `.claude/commands/ma-commande.md`
2. Utiliser `$ARGUMENTS` pour les paramètres
3. Disponible via `/ma-commande`

### Ajouter un Workflow
1. Créer `.claude/workflows/mon-workflow.json`
2. Définir phases, tasks, agents
3. Ajouter conditions et validation

## Références

- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [Claude Cowork Blog](https://claude.com/blog/skills)
- [Claude-flow GitHub](https://github.com/ruvnet/claude-flow)
- [Claude-Code-Workflow](https://github.com/catlog22/Claude-Code-Workflow)
- [Boris Cherny Workflow](https://venturebeat.com/technology/the-creator-of-claude-code-just-revealed-his-workflow-and-developers-are)

## Pipeline CI/CD Automatisé

Le nouveau workflow CI/CD permet un déploiement complet avec une seule commande:

```bash
/deploy                    # Fullstack (frontend + backend)
/deploy frontend           # Frontend uniquement
/deploy backend            # Backend uniquement
```

### Flux Complet

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE                            │
├─────────────────────────────────────────────────────────────┤
│  TESTS          →  BUILD           →  DEPLOY      →  GIT    │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐   ┌─────┐ │
│  │ Vitest   │      │ npm build│      │ Fly.io   │   │ tag │ │
│  │ pytest   │      │ Docker   │      │ Cloudflr │   │commit│ │
│  │ security │      │ verify   │      │ health   │   │ push│ │
│  └──────────┘      └──────────┘      └──────────┘   └─────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Agents CI/CD

| Agent | Fichier | Fonction |
|-------|---------|----------|
| `deploy-frontend` | [agents/deploy-frontend.md](agents/deploy-frontend.md) | Cloudflare Pages |
| `deploy-backend` | [agents/deploy-backend.md](agents/deploy-backend.md) | Fly.io + migrations |
| `test-runner` | [agents/test-runner.md](agents/test-runner.md) | Vitest + pytest |
| `git-automation` | [agents/git-automation.md](agents/git-automation.md) | Commits, push, PR |

---

**Dernière mise à jour**: Janvier 2026
**Version**: 2.1.0 (+ CI/CD Pipeline Automation)
