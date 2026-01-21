# Fix Bug - Workflow Complet

Corrige un bug dans NutriProfile avec workflow automatisé complet:
**Debug → Fix → Test → Commit → Push**

## Workflow Automatique

```
┌─────────────────────────────────────────────────────────────┐
│                    FIX WORKFLOW COMPLET                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PHASE 1: INVESTIGATION                                      │
│  ├─ [debugger] Reproduire le bug                             │
│  ├─ [debugger] Identifier cause racine                       │
│  └─ [debugger] Lister fichiers affectés                      │
│                                                              │
│  PHASE 2: FIX                                                │
│  ├─ [error-fixer] Implémenter la correction                  │
│  ├─ [test-writer] Ajouter test de régression                 │
│  └─ [i18n-manager] Ajouter traductions si nécessaire         │
│                                                              │
│  PHASE 3: VALIDATION                                         │
│  ├─ [test-runner] npm test (frontend)                        │
│  ├─ [test-runner] pytest (backend)                           │
│  └─ [code-reviewer] Vérifier qualité du fix                  │
│                                                              │
│  PHASE 4: GIT AUTOMATION                                     │
│  ├─ [git-automation] git add fichiers modifiés               │
│  ├─ [git-automation] git commit -m "fix(scope): description" │
│  └─ [git-automation] git push origin main                    │
│                                                              │
│  PHASE 5: DEPLOY (optionnel, si --deploy)                    │
│  ├─ [deploy-backend] Si backend affecté                      │
│  └─ [deploy-frontend] Si frontend affecté                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Usage

```bash
/fix [description du bug]              # Fix complet avec commit+push
/fix [description] --no-push           # Fix sans push (commit local)
/fix [description] --deploy            # Fix + déploiement auto
/fix [description] --dry               # Simulation sans modifications
```

## Agents Invoqués Automatiquement

| Phase | Agent | Action |
|-------|-------|--------|
| Investigation | `debugger` | Analyse cause racine |
| Investigation | `error-fixer` | Plan de correction |
| Fix | `frontend-expert` / `api-designer` | Implémentation |
| Fix | `test-writer` | Test de régression |
| Validation | `test-runner` | Exécution tests |
| Git | `git-automation` | Commit + push |
| Deploy | `deploy-frontend` / `deploy-backend` | Si --deploy |

## Format du Commit Automatique

```
fix(<scope>): <description courte>

- Cause racine: <explication>
- Fichiers modifiés: <liste>
- Test ajouté: <nom du test>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Scopes Disponibles

| Scope | Description |
|-------|-------------|
| `vision` | Analyse photo IA |
| `recipes` | Génération recettes |
| `auth` | Authentification |
| `tracking` | Suivi activité/poids |
| `dashboard` | Tableau de bord |
| `i18n` | Traductions |
| `ui` | Composants UI |
| `api` | Endpoints backend |
| `db` | Base de données |

## Zones Communes de Bugs

### Frontend
- Cache React Query non invalidé après mutation
- State local pas synchronisé avec props
- i18n clé manquante (7 langues)
- Responsive overflow sur mobile (375px)
- Modal qui ne se ferme pas

### Backend
- Validation Pydantic incorrecte
- Requête SQL N+1
- Permission/ownership non vérifié
- Limite freemium non respectée
- Trial non pris en compte

### API
- CORS mal configuré
- JWT expiré pas géré
- Rate limiting trop strict

## Exemples

### Bug Simple
```
/fix le bouton Save est désactivé même quand le formulaire est valide
```

### Bug avec Contexte
```
/fix le cache des calories totales ne se met pas à jour après ajout d'un repas

Contexte:
- Page: Dashboard
- Après: ajout repas via VisionPage
- Attendu: calories recalculées
- Actuel: anciennes valeurs affichées
```

### Bug + Deploy
```
/fix erreur 500 sur /api/v1/recipes/generate --deploy
```

## Instructions pour Claude

Quand cette commande est invoquée:

1. **TOUJOURS** investiguer avant de fixer (lire les fichiers concernés)
2. **TOUJOURS** ajouter un test de régression
3. **TOUJOURS** exécuter les tests après le fix
4. **TOUJOURS** commiter avec le format conventionnel
5. **TOUJOURS** pusher sauf si --no-push
6. Si --deploy, déployer après le push

## Bug à Fixer

$ARGUMENTS
